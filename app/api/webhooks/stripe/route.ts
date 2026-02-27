import {
  sendLowStockAlert,
  sendNewOrderNotificationToAdmin,
  sendOrderConfirmation,
} from "@/lib/email";
import type { OrderItem, StripeMetadataCart } from "@/types/payment";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

/**
 * Webhook Stripe - Gestion des événements de paiement
 *
 * SÉCURITÉ CRITIQUE :
 * - Vérifie la signature Stripe pour éviter les appels frauduleux
 * - Utilise le Service Role Key de Supabase (bypass RLS)
 * - Crée la commande uniquement si le paiement est réussi
 * - Décrémente le stock de manière atomique
 *
 * @route POST /api/webhooks/stripe
 * @body Raw body de Stripe (nécessaire pour la vérification de signature)
 * @returns 200 OK si traité, 400/500 sinon
 */

/**
 * IMPORTANT : Désactiver le parsing du body par Next.js
 * Stripe nécessite le raw body pour vérifier la signature
 */
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  console.log("🔔 ========== WEBHOOK STRIPE REÇU ==========");
  console.log("⏰ Timestamp:", new Date().toISOString());

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // Vérifications des variables d'environnement
  if (!stripeSecretKey) {
    console.error("❌ STRIPE_SECRET_KEY manquante");
    return NextResponse.json({ error: "Configuration error" }, { status: 500 });
  }

  if (!webhookSecret) {
    console.error("❌ STRIPE_WEBHOOK_SECRET manquante");
    return NextResponse.json({ error: "Configuration error" }, { status: 500 });
  }

  console.log("✅ Variables d'environnement présentes:", {
    hasStripeKey: !!stripeSecretKey,
    hasWebhookSecret: !!webhookSecret,
    webhookSecretPreview: webhookSecret
      ? `${webhookSecret.substring(0, 10)}...`
      : "manquant",
  });

  const stripe = new Stripe(stripeSecretKey);

  try {
    // Récupérer le raw body et la signature
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      console.error("❌ Signature Stripe manquante");
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    // Vérifier la signature du webhook (SÉCURITÉ)
    let event: Stripe.Event;
    try {
      console.log("🔐 Vérification signature webhook...");
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log("✅ Signature vérifiée avec succès");
    } catch (err) {
      console.error("❌ Erreur de vérification de signature:", err);
      if (err instanceof Error) {
        console.error("Détails erreur signature:", {
          message: err.message,
          name: err.name,
        });
      }
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    console.log("✅ Webhook Stripe reçu:", {
      type: event.type,
      id: event.id,
      created: event.created,
    });

    // Gérer l'événement payment_intent.succeeded
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      console.log("💰 ========== PAYMENT_INTENT.SUCCEEDED ==========");
      console.log("💰 Paiement réussi:", {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        amount_euros: (paymentIntent.amount / 100).toFixed(2),
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        hasShipping: !!paymentIntent.shipping,
        receiptEmail: paymentIntent.receipt_email,
      });

      console.log("📋 Metadata du PaymentIntent:", {
        keys: Object.keys(paymentIntent.metadata),
        metadata: paymentIntent.metadata,
        hasCartItems: !!paymentIntent.metadata.cart_items,
        hasUserId: !!paymentIntent.metadata.user_id,
        hasCustomerEmail: !!paymentIntent.metadata.customer_email,
      });

      // Vérifier l'idempotence AVANT de créer la commande
      console.log("🔍 ========== VÉRIFICATION IDEMPOTENCE ==========");
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (supabaseUrl && supabaseServiceKey) {
        const supabaseCheck = createClient(supabaseUrl, supabaseServiceKey);
        const { data: existingOrder } = await supabaseCheck
          .from("orders")
          .select("id, stripe_payment_id")
          .eq("stripe_payment_id", paymentIntent.id)
          .maybeSingle();

        if (existingOrder) {
          console.log("⚠️ ========== COMMANDE DÉJÀ EXISTANTE ==========");
          console.log("⚠️ Commande déjà créée:", {
            orderId: existingOrder.id,
            stripePaymentId: existingOrder.stripe_payment_id,
          });
          console.log("✅ Webhook traité (idempotence) - Retour 200 OK");
          // Retourner 200 OK pour indiquer à Stripe que l'événement a été traité
          return NextResponse.json({ received: true, duplicate: true });
        }
        console.log("✅ Aucune commande existante - Création autorisée");
      }

      // Créer la commande dans Supabase
      console.log("📦 ========== DÉBUT CRÉATION COMMANDE ==========");
      try {
        await createOrderFromPaymentIntent(paymentIntent);
        console.log("✅ ========== COMMANDE CRÉÉE AVEC SUCCÈS ==========");
      } catch (orderError) {
        console.error("❌ ========== ERREUR CRÉATION COMMANDE ==========");
        console.error(
          "❌ Erreur lors de la création de la commande:",
          orderError
        );
        if (orderError instanceof Error) {
          console.error("❌ Détails erreur:", {
            message: orderError.message,
            name: orderError.name,
            stack: orderError.stack,
          });
        }
        // On ne fait pas échouer le webhook (Stripe considère que c'est traité)
        // Mais on log l'erreur pour debug
        // TODO: En production, envoyer une alerte (email, Slack, etc.)
      }
    } else {
      console.log("ℹ️ Type d'événement non géré:", event.type);
      console.log("ℹ️ Détails événement:", {
        type: event.type,
        id: event.id,
        created: event.created,
      });
    }

    // Retourner 200 pour confirmer la réception
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("❌ Erreur dans le webhook Stripe:", error);
    if (error instanceof Error) {
      console.error("Détails erreur webhook:", {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
    }
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}

/**
 * Fonction utilitaire pour ajouter une pause (éviter Rate Limit Resend)
 */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Créer une commande dans Supabase à partir d'un Payment Intent réussi
 *
 * Étapes :
 * 1. Récupérer les items du panier depuis les metadata
 * 2. Récupérer les infos produits depuis Supabase
 * 3. Créer l'enregistrement de commande (orders)
 * 4. Créer les items de commande (order_items)
 * 5. Décrémenter le stock de chaque produit
 */
async function createOrderFromPaymentIntent(
  paymentIntent: Stripe.PaymentIntent
) {
  console.log("🔧 Début createOrderFromPaymentIntent...");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log("🔍 Vérification configuration Supabase:", {
    hasUrl: !!supabaseUrl,
    hasServiceKey: !!supabaseServiceKey,
    url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : "manquant",
  });

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ Configuration Supabase manquante:", {
      url: !!supabaseUrl,
      serviceKey: !!supabaseServiceKey,
    });
    throw new Error("Supabase configuration manquante");
  }

  // Créer un client Supabase avec Service Role (bypass RLS)
  console.log("🔌 Création client Supabase avec Service Role...");
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  console.log("✅ Client Supabase créé");

  // 1. Récupérer les items du panier depuis les metadata
  console.log("📋 ========== ÉTAPE 1: RÉCUPÉRATION ITEMS ==========");
  console.log("📋 Récupération des items depuis metadata...");
  const cartItemsJson = paymentIntent.metadata.cart_items;
  console.log("🔍 Metadata cart_items:", {
    present: !!cartItemsJson,
    length: cartItemsJson?.length || 0,
    preview: cartItemsJson ? cartItemsJson.substring(0, 200) + "..." : "null",
  });

  if (!cartItemsJson) {
    console.error("❌ cart_items manquant dans les metadata du PaymentIntent");
    console.error(
      "📋 Metadata disponibles:",
      Object.keys(paymentIntent.metadata)
    );
    console.error(
      "📋 Toutes les metadata:",
      JSON.stringify(paymentIntent.metadata, null, 2)
    );
    throw new Error("cart_items manquant dans les metadata");
  }

  let cartItems: StripeMetadataCart[];
  try {
    cartItems = JSON.parse(cartItemsJson);
    console.log("✅ Items parsés avec succès:", {
      count: cartItems.length,
      items: cartItems.map((i) => ({ id: i.id, qty: i.qty })),
    });
  } catch (parseError) {
    console.error("❌ Erreur lors du parsing de cart_items:", parseError);
    console.error("❌ Contenu brut:", cartItemsJson);
    throw new Error(
      `Erreur parsing cart_items: ${
        parseError instanceof Error ? parseError.message : "Unknown error"
      }`
    );
  }

  // Récupérer le user_id depuis les metadata (si présent)
  const userId =
    paymentIntent.metadata.user_id === "guest"
      ? null
      : paymentIntent.metadata.user_id || null;

  // Récupérer l'email client (priorité: receipt_email > metadata)
  const customerEmail =
    paymentIntent.receipt_email ||
    paymentIntent.metadata.customer_email ||
    null;

  // Récupérer le nom client (priorité: shipping.name > metadata)
  const customerName =
    paymentIntent.shipping?.name ||
    paymentIntent.metadata.customer_name ||
    null;

  console.log("👤 Informations utilisateur:", {
    userId: userId || "invité",
    customerEmail: customerEmail || "non fourni",
    customerName: customerName || "non fourni",
  });

  // Récupérer l'adresse de livraison depuis Stripe
  const shippingAddress = paymentIntent.shipping
    ? {
        first_name: paymentIntent.shipping.name?.split(" ")[0] || "",
        last_name:
          paymentIntent.shipping.name?.split(" ").slice(1).join(" ") || "",
        address: paymentIntent.shipping.address?.line1 || "",
        city: paymentIntent.shipping.address?.city || "",
        postal_code: paymentIntent.shipping.address?.postal_code || "",
        country: paymentIntent.shipping.address?.country || "",
        phone: paymentIntent.shipping.phone || "",
        email: paymentIntent.receipt_email || "",
      }
    : null;

  console.log("📦 Traitement commande:", {
    paymentIntentId: paymentIntent.id,
    userId: userId || "invité",
    itemsCount: cartItems.length,
    hasShippingAddress: !!shippingAddress,
  });

  if (shippingAddress) {
    console.log("📍 Adresse de livraison récupérée:", shippingAddress);
  } else {
    console.warn("⚠️ Aucune adresse de livraison fournie");
  }

  // 2. Récupérer les IDs des produits
  console.log("🔍 ========== ÉTAPE 2: RÉCUPÉRATION PRODUITS ==========");
  const productIds = cartItems.map((item) => item.id);
  console.log("🔍 IDs produits à rechercher:", productIds);

  // Récupérer les produits depuis Supabase (par slug ET par id)
  console.log("🔍 Requête Supabase pour récupérer les produits...");
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

  console.log("📊 Résultats requêtes Supabase:", {
    slugResultsCount: slugResults.data?.length || 0,
    slugResultsError: slugResults.error?.message || null,
    idResultsCount: idResults.data?.length || 0,
    idResultsError: idResults.error?.message || null,
  });

  // Fusionner les résultats
  type WebhookProduct = NonNullable<typeof slugResults.data>[0];
  const productsMap = new Map<string, WebhookProduct>();
  slugResults.data?.forEach((product) => {
    productsMap.set(product.id, product);
  });
  idResults.data?.forEach((product) => {
    productsMap.set(product.id, product);
  });

  const products = Array.from(productsMap.values());

  console.log("✅ Produits récupérés:", {
    count: products.length,
    products: products.map((p) => ({ id: p.id, name: p.name, price: p.price })),
  });

  if (!products || products.length === 0) {
    console.error("❌ Aucun produit trouvé pour cette commande");
    console.error("❌ IDs recherchés:", productIds);
    throw new Error("Aucun produit trouvé pour cette commande");
  }

  // Créer un map pour accès rapide aux produits
  const productMapById = new Map<string, (typeof products)[0]>();
  const productMapBySlug = new Map<string, (typeof products)[0]>();

  products.forEach((p) => {
    productMapById.set(p.id, p);
    productMapBySlug.set(p.slug, p);
  });

  // 3. Construire les order_items
  console.log("📦 ========== ÉTAPE 3: CONSTRUCTION ORDER_ITEMS ==========");
  const orderItems: OrderItem[] = [];
  const stockUpdates: { id: string; quantity: number }[] = [];

  for (const item of cartItems) {
    const product =
      productMapById.get(item.id) || productMapBySlug.get(item.id);

    if (!product) {
      console.error(`⚠️ Produit introuvable: ${item.id}`);
      console.error(
        `⚠️ Produits disponibles:`,
        Array.from(productMapById.keys())
      );
      continue;
    }

    console.log(`✅ Produit trouvé: ${product.name} (${item.qty}x)`);

    orderItems.push({
      product_id: product.id,
      product_name: product.name,
      product_slug: product.slug,
      quantity: item.qty,
      price_at_time: product.price, // Prix en centimes
      image_url: product.image_url,
    });

    stockUpdates.push({
      id: product.id,
      quantity: item.qty,
    });
  }

  console.log("✅ Order items construits:", {
    count: orderItems.length,
    items: orderItems.map((i) => ({
      name: i.product_name,
      qty: i.quantity,
      price: i.price_at_time,
    })),
  });

  // 4. Calculer les montants
  const subtotalCents = orderItems.reduce(
    (sum, item) => sum + item.price_at_time * item.quantity,
    0
  );

  const shippingFeeCents = subtotalCents < 10000 ? 500 : 0; // 5€ si < 100€

  const totalAmountCents = subtotalCents + shippingFeeCents;

  // 5. Créer la commande dans Supabase
  console.log("💾 ========== ÉTAPE 5: CRÉATION COMMANDE ==========");
  console.log("💾 Insertion commande dans Supabase...");
  console.log("📦 Données commande:", {
    stripe_payment_id: paymentIntent.id,
    user_id: userId || "invité",
    amount: totalAmountCents,
    amount_euros: (totalAmountCents / 100).toFixed(2),
    itemsCount: orderItems.length,
    hasShippingAddress: !!shippingAddress,
    subtotal: subtotalCents,
    shippingFee: shippingFeeCents,
  });

  const orderData = {
    stripe_payment_id: paymentIntent.id,
    user_id: userId, // ✅ Utiliser le user_id récupéré des metadata (null pour invité)
    amount: totalAmountCents,
    status: "paid" as const,
    items: orderItems,
    shipping_address: shippingAddress, // ✅ Sauvegarder l'adresse de livraison
    customer_email: customerEmail, // ✅ Snapshot email client (pour invités)
    customer_name: customerName, // ✅ Snapshot nom client (pour invités)
  };

  console.log("📤 Données à insérer dans orders:", {
    ...orderData,
    items: orderData.items.map((i) => ({
      name: i.product_name,
      qty: i.quantity,
    })),
  });

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert(orderData)
    .select()
    .single();

  if (orderError) {
    // Si l'erreur est due à la contrainte unique (doublon), c'est OK (idempotence)
    if (
      orderError.code === "23505" &&
      orderError.message.includes("stripe_payment_id")
    ) {
      console.log(
        "⚠️ ========== DOUBLON DÉTECTÉ (CONTRAINTE UNIQUE) =========="
      );
      console.log(
        "⚠️ Commande déjà existante avec ce stripe_payment_id:",
        paymentIntent.id
      );
      console.log(
        "✅ Webhook traité (idempotence) - Commande ignorée (déjà créée)"
      );
      // Ne pas throw, la fonction retourne normalement (le webhook principal gère le 200 OK)
      return;
    }

    console.error("❌ ========== ERREUR CRÉATION COMMANDE ==========");
    console.error("❌ Erreur lors de la création de la commande:", orderError);
    console.error("❌ Détails erreur Supabase:", {
      message: orderError.message,
      details: orderError.details,
      hint: orderError.hint,
      code: orderError.code,
    });
    console.error("❌ Données tentées:", JSON.stringify(orderData, null, 2));
    throw new Error(`Échec création commande: ${orderError.message}`);
  }

  console.log("✅ ========== COMMANDE CRÉÉE DANS SUPABASE ==========");
  console.log("✅ Commande créée:", {
    id: order.id,
    stripe_payment_id: order.stripe_payment_id,
    amount: order.amount,
    amount_euros: (order.amount / 100).toFixed(2),
    status: order.status,
    user_id: order.user_id || "invité",
  });

  // 6. Envoyer les emails (confirmation client + notification admin)
  console.log("📧 ========== ENVOI EMAILS ==========");
  console.log("📧 DEBUG - État des variables email:", {
    customerEmail: customerEmail || "VIDE/NULL",
    customerName: customerName || "VIDE/NULL",
    hasCustomerEmail: !!customerEmail,
    receipt_email: paymentIntent.receipt_email || "VIDE",
    metadata_customer_email: paymentIntent.metadata.customer_email || "VIDE",
  });
  
  // Préparer les données pour les emails
  const emailData = {
    orderId: order.id,
    customerName: customerName || "Client",
    customerEmail: customerEmail || "",
    items: orderItems.map((item) => ({
      product_name: item.product_name,
      product_slug: item.product_slug,
      quantity: item.quantity,
      price_at_time: item.price_at_time,
      image_url: item.image_url,
    })),
    totalAmount: totalAmountCents,
    shippingAddress: shippingAddress || undefined,
  };

  // Email de confirmation au client (si email disponible)
  if (customerEmail && customerEmail.trim() !== "") {
    try {
      console.log("📧 ========== ENVOI EMAIL CONFIRMATION CLIENT ==========");
      console.log("📧 Email client:", customerEmail);
      console.log("📧 Nom client:", customerName || "Client");
      console.log("📧 Commande:", order.id);
      
      const emailResult = await sendOrderConfirmation({
        orderId: order.id,
        customerName: customerName || "Client",
        customerEmail: customerEmail,
        items: orderItems.map((item) => ({
          product_name: item.product_name,
          product_slug: item.product_slug,
          quantity: item.quantity,
          price_at_time: item.price_at_time,
          image_url: item.image_url,
        })),
        totalAmount: totalAmountCents,
        shippingAddress: shippingAddress || undefined,
      });
      
      if (emailResult.success) {
        console.log("✅ Email confirmation client envoyé avec succès");
        console.log("📧 Email envoyé !");
      } else {
        console.error("❌ Erreur envoi email confirmation client:", emailResult.error);
        console.error("❌ Email non envoyé à :", customerEmail);
        // On continue quand même (la commande est créée, le paiement reste valide)
      }
    } catch (err) {
      console.error("❌ Exception lors de l'envoi email confirmation client:", err);
      console.error("❌ Email non envoyé à :", customerEmail);
      // On continue quand même (la commande est créée, le paiement reste valide)
    }
  } else {
    console.warn("⚠️ Pas d'email client disponible - Email confirmation non envoyé");
    console.warn("⚠️ customerEmail:", customerEmail);
    console.warn("⚠️ receipt_email:", paymentIntent.receipt_email);
    console.warn("⚠️ metadata.customer_email:", paymentIntent.metadata.customer_email);
  }

  // Pause pour éviter le Rate Limit Resend (tier gratuit: max 2 req/s)
  await sleep(1000);
  console.log("⏳ Pause de 1s avant envoi email admin...");

  // Email de notification à l'admin (TOUJOURS envoyé, même si pas d'email client)
  try {
    console.log("📧 ========== ENVOI EMAIL NOTIFICATION ADMIN ==========");
    console.log("📧 Admin email:", process.env.ADMIN_EMAIL || "NON CONFIGURÉ");
    console.log("📧 Données email:", {
      orderId: emailData.orderId,
      customerName: emailData.customerName,
      customerEmail: emailData.customerEmail || "NON FOURNI",
      itemsCount: emailData.items.length,
      totalAmount: emailData.totalAmount,
    });
    
    const adminEmailResult = await sendNewOrderNotificationToAdmin(emailData);
    if (adminEmailResult.success) {
      console.log("✅ Email notification admin envoyé avec succès");
    } else {
      console.error("❌ Erreur envoi email notification admin:", adminEmailResult.error);
      console.error("❌ Détails erreur:", JSON.stringify(adminEmailResult, null, 2));
      // On continue quand même (la commande est créée)
    }
  } catch (err) {
    console.error("❌ Exception lors de l'envoi email notification admin:", err);
    if (err instanceof Error) {
      console.error("❌ Stack trace:", err.stack);
    }
    // On continue quand même
  }

  // 7. Décrémenter le stock de chaque produit et détecter les stocks faibles
  console.log("📦 ========== DÉCRÉMENTATION STOCK & DÉTECTION ALERTES ==========");
  const lowStockItems: { name: string; stock: number }[] = [];

  for (const update of stockUpdates) {
    // Récupérer le stock actuel avant décrémentation
    const { data: productBefore } = await supabase
      .from("products")
      .select("name, stock")
      .eq("id", update.id)
      .single();

    if (!productBefore) {
      console.error(`⚠️ Produit introuvable: ${update.id}`);
      continue;
    }

    // Décrémenter le stock avec la RPC
    const { error: stockError } = await supabase.rpc("decrement_stock", {
      product_id: update.id,
      quantity: update.quantity,
    });

    if (stockError) {
      console.error(
        `⚠️ Erreur lors de la décrémentation du stock pour ${update.id}:`,
        stockError
      );
      // On continue quand même (la commande est déjà créée)
    } else {
      // Calculer le nouveau stock
      const newStock = productBefore.stock - update.quantity;
      console.log(
        `✅ Stock décrémenté pour ${productBefore.name} (${update.id}) - Ancien: ${productBefore.stock}, Nouveau: ${newStock}`
      );

      // Vérifier si le stock est critique (<= 3)
      if (newStock <= 3) {
        console.log(
          `⚠️ ALERTE: Stock faible détecté pour ${productBefore.name} (${newStock} unité${newStock > 1 ? "s" : ""})`
        );
        lowStockItems.push({
          name: productBefore.name,
          stock: newStock,
        });
      }
    }
  }

  // 7.5. Envoyer l'email d'alerte stock faible si nécessaire
  if (lowStockItems.length > 0) {
    // Pause pour éviter le Rate Limit Resend (tier gratuit: max 2 req/s)
    await sleep(1000);
    console.log("⏳ Pause de 1s avant envoi email alerte stock...");
    
    try {
      console.log("📧 ========== ENVOI ALERTE STOCK FAIBLE ==========");
      console.log(`📧 ${lowStockItems.length} produit(s) en stock critique`);
      
      const alertResult = await sendLowStockAlert(lowStockItems);
      if (alertResult.success) {
        console.log(`✅ Email alerte stock envoyé pour ${lowStockItems.length} produit(s)`);
      } else {
        console.error("❌ Erreur envoi email alerte stock:", alertResult.error);
        // On continue quand même
      }
    } catch (err) {
      console.error("❌ Exception lors de l'envoi email alerte stock:", err);
      // On continue quand même
    }
  }

  // 8. Attribuer des points de fidélité si l'utilisateur est connecté
  if (order.user_id) {
    try {
      const { error: loyaltyError } = await supabase.rpc(
        "add_loyalty_points_from_order",
        {
          p_user_id: order.user_id,
          p_order_id: order.id,
          p_amount: totalAmountCents,
        }
      );

      if (loyaltyError) {
        console.error("⚠️ Erreur attribution points:", loyaltyError.message);
        // On continue quand même (la commande est créée)
      } else {
        const pointsEarned = Math.floor(totalAmountCents / 10);
        console.log(`🎁 Points de fidélité attribués: ${pointsEarned} points`);

        // 9. Créer une notification pour informer l'utilisateur
        await supabase.from("notifications").insert({
          user_id: order.user_id,
          type: "order_status",
          title: "Commande confirmée",
          message: `Votre commande de ${(totalAmountCents / 100).toFixed(
            2
          )}€ a été confirmée. Vous avez gagné ${pointsEarned} points de fidélité !`,
          link: `/account/orders`,
          is_read: false,
        });

        console.log("📬 Notification de commande envoyée");
      }
    } catch (err) {
      console.error("⚠️ Erreur lors de l'attribution des points:", err);
      // On continue quand même
    }
  }

  console.log("🎉 Commande traitée avec succès:", {
    orderId: order.id,
    paymentIntentId: paymentIntent.id,
    totalAmount: totalAmountCents / 100,
    itemsCount: orderItems.length,
  });
}
