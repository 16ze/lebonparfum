import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/utils/supabase/server";
import type { PaymentCartItem } from "@/types/payment";

/**
 * Route API : Confirmation de commande et décrémentation du stock
 *
 * SÉCURITÉ CRITIQUE :
 * - Vérifie avec Stripe que le paiement a réellement réussi
 * - Ne décrémente le stock QUE si le paiement est confirmé
 *
 * @route POST /api/confirm-order
 * @body { paymentIntentId: string, items: PaymentCartItem[] }
 * @returns { success: boolean, message?: string }
 */
export async function POST(request: NextRequest) {
  try {
    // Vérification de la clé Stripe secrète
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      console.error("❌ STRIPE_SECRET_KEY manquante");
      return NextResponse.json(
        { error: "Configuration serveur incomplète" },
        { status: 500 }
      );
    }

    // Initialisation de Stripe
    const stripe = new Stripe(stripeSecretKey);

    // Récupération du body
    const body = await request.json();
    const { paymentIntentId, items } = body as {
      paymentIntentId: string;
      items: PaymentCartItem[];
    };

    // Validation des données
    if (!paymentIntentId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Données invalides" },
        { status: 400 }
      );
    }

    // **SÉCURITÉ : Vérifier que le paiement a réellement réussi**
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      console.error(`❌ Paiement non réussi. Status: ${paymentIntent.status}`);
      return NextResponse.json(
        { error: "Le paiement n'a pas été confirmé" },
        { status: 400 }
      );
    }

    // Si le paiement est confirmé, décrémenter le stock
    const supabase = createClient();

    // Pour chaque item, décrémenter le stock
    // On utilise une boucle pour traiter chaque item individuellement et gérer les erreurs
    const results = await Promise.allSettled(
      items.map(async (item) => {
        // On peut utiliser soit l'id (UUID) soit le slug comme identifiant
        // On essaie d'abord par slug (le plus commun), puis par id
        const { data: productBySlug } = await supabase
          .from("products")
          .select("id, slug, stock")
          .eq("slug", item.id)
          .maybeSingle(); // maybeSingle retourne null au lieu d'erreur si pas trouvé

        let product = productBySlug;

        // Si pas trouvé par slug, essayer par id (UUID)
        if (!product) {
          const { data: productById } = await supabase
            .from("products")
            .select("id, slug, stock")
            .eq("id", item.id)
            .maybeSingle();
          product = productById || null;
        }

        if (!product) {
          throw new Error(`Produit ${item.id} introuvable`);
        }

        // Vérifier que le stock est suffisant (sécurité supplémentaire)
        const currentStock = product.stock ?? 0;
        if (currentStock < item.quantity) {
          throw new Error(
            `Stock insuffisant pour ${item.id} (demandé: ${item.quantity}, disponible: ${currentStock})`
          );
        }

        // Décrémenter le stock (en s'assurant qu'il ne devienne pas négatif)
        const newStock = Math.max(0, currentStock - item.quantity);

        const { error: updateError } = await supabase
          .from("products")
          .update({ stock: newStock })
          .eq("id", product.id);

        if (updateError) {
          throw new Error(`Erreur lors de la mise à jour du stock: ${updateError.message}`);
        }

        return { productId: product.id, itemId: item.id, success: true };
      })
    );

    // Vérifier s'il y a des erreurs
    const errors = results.filter((r) => r.status === "rejected");
    if (errors.length > 0) {
      console.error("❌ Erreurs lors de la mise à jour du stock:", errors);
      // On retourne quand même un succès partiel, car le paiement est confirmé
      // Mais on log les erreurs pour debug
      return NextResponse.json(
        {
          success: true,
          message: "Commande confirmée, mais certaines mises à jour de stock ont échoué",
          errors: errors.map((e) =>
            e.status === "rejected" ? e.reason?.message || "Erreur inconnue" : null
          ),
        },
        { status: 200 }
      );
    }

    // Tout s'est bien passé
    return NextResponse.json(
      {
        success: true,
        message: "Commande confirmée et stock mis à jour",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Erreur lors de la confirmation de commande:", error);

    // Si c'est une erreur Stripe, on la retourne
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Erreur générique
    return NextResponse.json(
      {
        error: "Erreur serveur lors de la confirmation de commande",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}

