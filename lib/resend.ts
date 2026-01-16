import { render } from "@react-email/components";
import { Resend } from "resend";
import OrderConfirmationTemplate from "@/emails/OrderConfirmationTemplate";

/**
 * Configuration Resend avec React Email
 *
 * Variables d'environnement requises :
 * - RESEND_API_KEY : Clé API Resend
 * - RESEND_FROM_EMAIL : Email expéditeur (ex: "Le Bon Parfum <noreply@lebonparfum.com>")
 * - ADMIN_EMAIL : Email admin pour notifications
 * - NODE_ENV : "development" ou "production"
 */

const resend = new Resend(process.env.RESEND_API_KEY);

// Config
const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "Le Bon Parfum <onboarding@resend.dev>";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@lebonparfum.com";
const SITE_NAME = "THE PARFUMERIEE";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://lebonparfum.com";
const IS_DEV = process.env.NODE_ENV === "development";

// Types
interface OrderItem {
  product_name: string;
  quantity: number;
  price_at_time: number; // en centimes
  image_url?: string;
}

interface OrderDetails {
  customerName: string;
  orderId: string;
  totalAmount: number; // en centimes
  items: OrderItem[];
}

/**
 * Envoie un email de confirmation de commande au client
 *
 * En mode développement :
 * - Si RESEND_API_KEY n'est pas configuré, log uniquement
 * - Sinon, envoie à 'delivered@resend.dev' (adresse de test Resend)
 *   ou à l'email admin pour éviter les blocages
 */
export async function sendOrderConfirmationEmail(
  email: string,
  orderDetails: OrderDetails
): Promise<{ success: boolean; error?: string }> {
  const { customerName, orderId, totalAmount, items } = orderDetails;

  // En mode dev, utiliser une adresse de test
  const recipientEmail = IS_DEV
    ? process.env.ADMIN_EMAIL || "delivered@resend.dev"
    : email;

  if (IS_DEV) {
    console.log("📧 [DEV MODE] Email serait envoyé à:", email);
    console.log("📧 [DEV MODE] Email envoyé à (test):", recipientEmail);
  }

  // Vérifier que Resend est configuré
  if (!process.env.RESEND_API_KEY) {
    console.warn(
      "⚠️ [RESEND] RESEND_API_KEY non configuré - Email non envoyé"
    );
    console.log("📧 [MOCK] Email de confirmation:", {
      to: email,
      orderId,
      customerName,
      totalAmount: totalAmount / 100,
    });
    return { success: true }; // Retourner success pour ne pas bloquer le flow
  }

  try {
    // Rendre le template React Email en HTML
    const emailHtml = await render(
      OrderConfirmationTemplate({
        customerName,
        orderId,
        totalAmount,
        items,
        siteUrl: SITE_URL,
      })
    );

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: recipientEmail,
      subject: `Confirmation de commande #${orderId.slice(0, 8).toUpperCase()} - ${SITE_NAME}`,
      html: emailHtml,
    });

    if (error) {
      console.error("❌ [RESEND] Erreur envoi email confirmation:", error);
      return { success: false, error: error.message };
    }

    console.log(
      `✅ [RESEND] Email confirmation envoyé à: ${recipientEmail}${IS_DEV ? ` (dev mode, original: ${email})` : ""}`
    );
    return { success: true };
  } catch (err: any) {
    console.error("❌ [RESEND] Exception envoi email:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Export des constantes pour utilisation externe
 */
export { FROM_EMAIL, ADMIN_EMAIL, SITE_NAME, SITE_URL };
