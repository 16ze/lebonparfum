import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/utils/supabase/server";
import type {
  PaymentCartItem,
  VerifiedCartItem,
  CreatePaymentIntentResponse,
  PaymentIntentError,
} from "@/types/payment";

/**
 * Route API : Création d'un Payment Intent Stripe
 * 
 * SÉCURITÉ CRITIQUE :
 * - Ne JAMAIS faire confiance aux prix envoyés par le frontend
 * - Toujours récupérer les prix depuis la base de données Supabase
 * - Valider l'existence et la disponibilité des produits
 * 
 * @route POST /api/create-payment-intent
 * @body { items: PaymentCartItem[] } - Liste des items (id, quantity uniquement)
 * @returns { clientSecret: string, amount: number, shippingFee: number }
 */
export async function POST(request: NextRequest) {
  console.log("🚀 [API] ========== DÉBUT REQUÊTE CREATE-PAYMENT-INTENT ==========");

  try {
    // Vérification de la clé Stripe secrète
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    console.log(`🔑 [API] STRIPE_SECRET_KEY présente: ${stripeSecretKey ? `✅ OUI (commence par: ${stripeSecretKey.substring(0, 7)}...)` : '❌ NON'}`);

    if (!stripeSecretKey) {
      console.error("❌ [API] STRIPE_SECRET_KEY manquante dans les variables d'environnement");
      return NextResponse.json<PaymentIntentError>(
        {
          error: "configuration_error",
          message: "Configuration serveur incomplète",
        },
        { status: 500 }
      );
    }

    // Initialisation de Stripe (utilise la version par défaut la plus récente)
    const stripe = new Stripe(stripeSecretKey);
    console.log("✅ [API] Stripe initialisé");

    // Récupération du body de la requête
    const body = await request.json();
    const { items } = body as { items: PaymentCartItem[] };
    console.log(`📦 [API] Items reçus:`, JSON.stringify(items, null, 2));

    // Validation des données reçues
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error("❌ [API] Panier vide ou invalide");
      return NextResponse.json<PaymentIntentError>(
        {
          error: "validation_error",
          message: "Le panier est vide",
        },
        { status: 400 }
      );
    }
    console.log(`✅ [API] Validation items OK (${items.length} items)`);

    // Validation de chaque item
    for (const item of items) {
      if (!item.id || typeof item.quantity !== "number" || item.quantity < 1) {
        return NextResponse.json<PaymentIntentError>(
          {
            error: "validation_error",
            message: "Format d'item invalide",
          },
          { status: 400 }
        );
      }
    }

    // Récupération du client Supabase pour vérifier les prix
    const supabase = await createClient();
    console.log("✅ [API] Client Supabase créé");

    // Récupérer les IDs des produits (peuvent être des slugs ou des UUIDs)
    const productIds = items.map((item) => item.id);
    console.log(`🔍 [API] Recherche produits par IDs:`, productIds);

    // **SÉCURITÉ : Récupérer les VRAIS prix depuis la base de données**
    // On fait deux requêtes : une par slug, une par id, puis on fusionne
    console.log("🔍 [API] Requête Supabase pour récupérer les produits...");
    const [slugResults, idResults] = await Promise.all([
      supabase
        .from("products")
        .select("id, name, slug, price, image_url, stock")
        .in("slug", productIds),
      supabase
        .from("products")
        .select("id, name, slug, price, image_url, stock")
        .in("id", productIds),
    ]);

    console.log("📊 [API] Résultats Supabase slugResults:", {
      data: slugResults.data?.length || 0,
      error: slugResults.error,
    });
    console.log("📊 [API] Résultats Supabase idResults:", {
      data: idResults.data?.length || 0,
      error: idResults.error,
    });

    // Fusionner les résultats (dédoublonné par id)
    type ProductFromDB = NonNullable<typeof slugResults.data>[0];
    const productsMap = new Map<string, ProductFromDB>();

    slugResults.data?.forEach((product) => {
      productsMap.set(product.id, product);
    });

    idResults.data?.forEach((product) => {
      productsMap.set(product.id, product);
    });

    const products = Array.from(productsMap.values());
    console.log(`✅ [API] Produits trouvés dans DB: ${products.length}`, products.map(p => ({ id: p.id, name: p.name, price: p.price })));

    if (!products || products.length === 0) {
      console.error("❌ [API] Aucun produit valide trouvé dans la base de données");
      return NextResponse.json<PaymentIntentError>(
        {
          error: "validation_error",
          message: "Aucun produit valide trouvé",
        },
        { status: 400 }
      );
    }

    // Créer un map pour accès rapide aux produits (par slug ET par id)
    const productMapById = new Map<string, typeof products[0]>();
    const productMapBySlug = new Map<string, typeof products[0]>();
    
    products.forEach((p) => {
      productMapById.set(p.id, p);
      productMapBySlug.set(p.slug, p);
    });

    // Construire les items vérifiés avec les VRAIS prix
    const verifiedItems: VerifiedCartItem[] = [];
    const missingIds: string[] = [];

    for (const item of items) {
      // Chercher le produit par id (UUID) ou par slug
      const product = productMapById.get(item.id) || productMapBySlug.get(item.id);
      
      if (!product) {
        missingIds.push(item.id);
        continue;
      }

      // Vérifier le stock disponible
      if (product.stock !== null && product.stock < item.quantity) {
        throw new Error(
          `Stock insuffisant pour ${product.name} (demandé: ${item.quantity}, disponible: ${product.stock})`
        );
      }

      verifiedItems.push({
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: Number(product.price) / 100, // Prix en euros (converti depuis centimes en DB)
        quantity: item.quantity,
        imageUrl: product.image_url,
      });
    }

    // Si des produits sont manquants, retourner une erreur
    if (missingIds.length > 0) {
      return NextResponse.json<PaymentIntentError>(
        {
          error: "validation_error",
          message: `Produits introuvables: ${missingIds.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Calcul du montant total des produits (en centimes)
    // Les prix sont déjà en euros, on multiplie par 100 pour Stripe
    const subtotalCents = Math.round(
      verifiedItems.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100
    );

    // Calcul des frais de livraison
    // Règle : 5€ si total < 100€, sinon offert
    const subtotalEuros = subtotalCents / 100;
    const SHIPPING_FEE_THRESHOLD = 100; // Seuil en euros
    const SHIPPING_FEE = 5; // Frais de livraison en euros

    const shippingFeeCents =
      subtotalEuros < SHIPPING_FEE_THRESHOLD
        ? Math.round(SHIPPING_FEE * 100)
        : 0;

    // Montant total (produits + livraison)
    const totalAmountCents = subtotalCents + shippingFeeCents;

    console.log("💰 [API] Calcul montants:", {
      subtotalCents,
      subtotalEuros,
      shippingFeeCents,
      shippingFeeEuros: shippingFeeCents / 100,
      totalAmountCents,
      totalAmountEuros: totalAmountCents / 100,
    });

    // Récupérer l'utilisateur connecté (si connecté) - réutilise le supabase déjà créé ligne 70
    const { data: { user } } = await supabase.auth.getUser();
    console.log(`👤 [API] Utilisateur: ${user ? `✅ Connecté (${user.id}, ${user.email})` : '❌ Non connecté (guest)'}`);

    // Préparer les metadata du panier pour Stripe
    // Format léger : [{ id, qty }, ...] en JSON string
    const cartMetadata = JSON.stringify(
      verifiedItems.map((i) => ({ 
        id: i.id, // Utiliser l'ID du produit vérifié (pas celui du frontend)
        qty: i.quantity 
      }))
    );

    console.log("📦 [API] Metadata du panier préparées:", {
      cartItemsCount: verifiedItems.length,
      cartMetadataPreview: cartMetadata.substring(0, 200) + "...",
    });

    // Créer les metadata COMPLÈTES pour Stripe
    const metadata: Record<string, string> = {
      // Métadonnées utiles pour le suivi
      items_count: verifiedItems.length.toString(),
      subtotal_euros: (subtotalCents / 100).toFixed(2),
      shipping_fee_euros: (shippingFeeCents / 100).toFixed(2),
      total_euros: (totalAmountCents / 100).toFixed(2),
      // Stockage du panier dans metadata (source de vérité pour la décrémentation)
      cart_items: cartMetadata,
      // Identifiant utilisateur (CRITIQUE pour lier la commande)
      user_id: user?.id || 'guest',
      // Email client (CRITIQUE pour les notifications et support)
      // Pour les guests, l'email réel est set via receipt_email lors de stripe.confirmPayment()
      customer_email: user?.email || 'guest',
    };

    console.log("📋 [API] Metadata complètes à envoyer à Stripe:", {
      ...metadata,
      cart_items: cartMetadata.substring(0, 100) + "...", // Aperçu seulement
    });

    // Création du Payment Intent Stripe
    console.log("📤 [API] ========== TENTATIVE CRÉATION STRIPE PAYMENT INTENT ==========");
    console.log("📤 [API] Paramètres envoyés à Stripe:", {
      amount: totalAmountCents,
      currency: "eur",
      automatic_payment_methods: { enabled: true },
      metadata,
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmountCents, // Montant en centimes
      currency: "eur",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata,
    });

    console.log("✅ [API] ========== PAYMENT INTENT CRÉÉ AVEC SUCCÈS ==========");
    console.log("✅ [API] Payment Intent détails:", {
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      client_secret: paymentIntent.client_secret ? `✅ Présent (${paymentIntent.client_secret.substring(0, 20)}...)` : "❌ Manquant",
    });

    // Retourner le clientSecret au frontend
    const response = {
      clientSecret: paymentIntent.client_secret || "",
      amount: totalAmountCents,
      shippingFee: shippingFeeCents,
    };
    console.log("📤 [API] ========== RÉPONSE ENVOYÉE AU FRONTEND ==========");
    console.log("📤 [API] Réponse:", response);

    return NextResponse.json<CreatePaymentIntentResponse>(response);
  } catch (error) {
    console.error("❌ [API] ========== ERREUR DANS CREATE-PAYMENT-INTENT ==========");
    console.error("❌ [API] Erreur capturée:", error);

    // Log détaillé pour le debugging
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    // Gestion des erreurs spécifiques
    if (error instanceof Error) {
      if (error.message.includes("Stock insuffisant")) {
        return NextResponse.json<PaymentIntentError>(
          {
            error: "stock_error",
            message: error.message,
          },
          { status: 400 }
        );
      }

      if (error.message.includes("Produit")) {
        return NextResponse.json<PaymentIntentError>(
          {
            error: "validation_error",
            message: error.message,
          },
          { status: 400 }
        );
      }

      // Retourner le message d'erreur exact pour le debugging
      return NextResponse.json<PaymentIntentError>(
        {
          error: "server_error",
          message: `Erreur: ${error.message}`,
        },
        { status: 500 }
      );
    }

    // Erreur générique
    return NextResponse.json<PaymentIntentError>(
      {
        error: "server_error",
        message: "Erreur serveur lors de la création du paiement",
      },
      { status: 500 }
    );
  }
}

