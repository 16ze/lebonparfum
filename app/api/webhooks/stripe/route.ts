import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import type { StripeMetadataCart, OrderItem } from "@/types/payment";

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
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("❌ Erreur de vérification de signature:", err);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    console.log("✅ Webhook Stripe reçu:", event.type);

    // Gérer l'événement payment_intent.succeeded
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      console.log("💰 Paiement réussi:", {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        metadata: paymentIntent.metadata,
      });

      // Créer la commande dans Supabase
      await createOrderFromPaymentIntent(paymentIntent);
    }

    // Retourner 200 pour confirmer la réception
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("❌ Erreur dans le webhook Stripe:", error);
    return NextResponse.json(
      { error: "Webhook error" },
      { status: 500 }
    );
  }
}

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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase configuration manquante");
  }

  // Créer un client Supabase avec Service Role (bypass RLS)
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // 1. Récupérer les items du panier depuis les metadata
  const cartItemsJson = paymentIntent.metadata.cart_items;
  if (!cartItemsJson) {
    throw new Error("cart_items manquant dans les metadata");
  }

  const cartItems: StripeMetadataCart[] = JSON.parse(cartItemsJson);

  // 2. Récupérer les IDs des produits
  const productIds = cartItems.map((item) => item.id);

  // Récupérer les produits depuis Supabase (par slug ET par id)
  const [slugResults, idResults] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, slug, price, image_url")
      .in("slug", productIds),
    supabase
      .from("products")
      .select("id, name, slug, price, image_url")
      .in("id", productIds),
  ]);

  // Fusionner les résultats
  const productsMap = new Map<string, any>();
  slugResults.data?.forEach((product) => {
    productsMap.set(product.id, product);
  });
  idResults.data?.forEach((product) => {
    productsMap.set(product.id, product);
  });

  const products = Array.from(productsMap.values());

  if (!products || products.length === 0) {
    throw new Error("Aucun produit trouvé pour cette commande");
  }

  // Créer un map pour accès rapide aux produits
  const productMapById = new Map<string, typeof products[0]>();
  const productMapBySlug = new Map<string, typeof products[0]>();

  products.forEach((p) => {
    productMapById.set(p.id, p);
    productMapBySlug.set(p.slug, p);
  });

  // 3. Construire les order_items
  const orderItems: OrderItem[] = [];
  const stockUpdates: { id: string; quantity: number }[] = [];

  for (const item of cartItems) {
    const product = productMapById.get(item.id) || productMapBySlug.get(item.id);

    if (!product) {
      console.error(`⚠️ Produit introuvable: ${item.id}`);
      continue;
    }

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

  // 4. Calculer les montants
  const subtotalCents = orderItems.reduce(
    (sum, item) => sum + item.price_at_time * item.quantity,
    0
  );

  const shippingFeeCents =
    subtotalCents < 10000 ? 500 : 0; // 5€ si < 100€

  const totalAmountCents = subtotalCents + shippingFeeCents;

  // 5. Créer la commande dans Supabase
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      stripe_payment_id: paymentIntent.id,
      user_id: null, // TODO: Récupérer l'user_id si connecté
      amount: totalAmountCents,
      status: "paid",
      items: orderItems, // ← CORRECTION: items au lieu de order_items
      shipping_address: null, // TODO: Ajouter l'adresse de livraison depuis les metadata
    })
    .select()
    .single();

  if (orderError) {
    console.error("❌ Erreur lors de la création de la commande:", orderError);
    throw new Error(`Échec création commande: ${orderError.message}`);
  }

  console.log("✅ Commande créée:", order.id);

  // 6. Décrémenter le stock de chaque produit
  for (const update of stockUpdates) {
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
      console.log(`✅ Stock décrémenté pour ${update.id} (-${update.quantity})`);
    }
  }

  console.log("🎉 Commande traitée avec succès:", {
    orderId: order.id,
    paymentIntentId: paymentIntent.id,
    totalAmount: totalAmountCents / 100,
    itemsCount: orderItems.length,
  });
}
