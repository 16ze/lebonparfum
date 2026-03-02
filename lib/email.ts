import { render } from "@react-email/components";
import { Resend } from "resend";
import LowStockAlert from "@/emails/LowStockAlert";
import OrderConfirmation from "@/emails/OrderConfirmation";
import { SITE_CONFIG } from "@/lib/site.config";

/**
 * Configuration Resend
 *
 * Variables d'environnement requises :
 * - RESEND_API_KEY   : Clé API Resend
 * - RESEND_FROM_EMAIL: Email expéditeur (ex: "THE PARFUMERIEE <noreply@domain.com>")
 * - ADMIN_EMAIL      : Email admin pour notifications internes
 * - CONTACT_EMAIL    : Email de contact affiché dans les emails (optionnel)
 *
 * Le nom de la marque (SITE_NAME) et l'URL (SITE_URL) viennent de lib/site.config.ts.
 */

const resend = new Resend(process.env.RESEND_API_KEY);

// Config — dérivée de SITE_CONFIG (lib/site.config.ts)
const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || `${SITE_CONFIG.name} <onboarding@resend.dev>`;
const ADMIN_EMAIL = SITE_CONFIG.contact.adminEmail;
const SITE_NAME = SITE_CONFIG.name;
const SITE_URL = SITE_CONFIG.url;
const CONTACT_EMAIL = SITE_CONFIG.contact.email;

// Types
interface OrderItem {
  product_name: string;
  product_slug?: string;
  quantity: number;
  price_at_time: number;
  image_url?: string;
}

interface ShippingAddress {
  first_name: string;
  last_name: string;
  address: string;
  postal_code: string;
  city: string;
  country: string;
  phone?: string;
}

interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  totalAmount: number; // en centimes
  shippingAddress?: ShippingAddress;
  trackingNumber?: string;
  trackingUrl?: string;
}

/**
 * Template HTML de base - Style Byredo minimaliste
 */
function baseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${SITE_NAME}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      background-color: #ffffff;
      color: #000000;
      line-height: 1.6;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .header {
      text-align: center;
      padding-bottom: 40px;
      border-bottom: 1px solid #000000;
      margin-bottom: 40px;
    }
    .logo {
      font-size: 24px;
      font-weight: 700;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: #000000;
      text-decoration: none;
    }
    .content {
      padding: 0;
    }
    h1 {
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      margin: 0 0 30px 0;
    }
    p {
      font-size: 14px;
      margin: 0 0 20px 0;
      color: #333333;
    }
    .order-table {
      width: 100%;
      border-collapse: collapse;
      margin: 30px 0;
    }
    .order-table th {
      text-align: left;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #666666;
      padding: 10px 0;
      border-bottom: 1px solid #e5e5e5;
    }
    .order-table td {
      padding: 15px 0;
      border-bottom: 1px solid #e5e5e5;
      font-size: 14px;
      vertical-align: top;
    }
    .order-table .product-name {
      font-weight: 600;
    }
    .order-table .quantity {
      color: #666666;
      font-size: 12px;
    }
    .order-table .price {
      text-align: right;
      font-weight: 600;
    }
    .total-row {
      border-top: 2px solid #000000;
      margin-top: 20px;
      padding-top: 20px;
    }
    .total-row td {
      border: none;
      font-weight: 700;
      font-size: 16px;
    }
    .address-box {
      background-color: #f8f8f8;
      padding: 20px;
      margin: 30px 0;
    }
    .address-box h3 {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      margin: 0 0 15px 0;
      color: #666666;
    }
    .address-box p {
      margin: 0;
      font-size: 14px;
      line-height: 1.8;
    }
    .button {
      display: inline-block;
      background-color: #000000;
      color: #ffffff !important;
      text-decoration: none;
      padding: 15px 40px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      margin: 20px 0;
    }
    .footer {
      border-top: 1px solid #000000;
      margin-top: 40px;
      padding-top: 40px;
      text-align: center;
    }
    .footer p {
      font-size: 11px;
      color: #666666;
      letter-spacing: 0.05em;
    }
    .footer a {
      color: #000000;
      text-decoration: none;
    }
    .tracking-box {
      background-color: #000000;
      color: #ffffff;
      padding: 25px;
      text-align: center;
      margin: 30px 0;
    }
    .tracking-box h3 {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      margin: 0 0 10px 0;
      color: #888888;
    }
    .tracking-box .number {
      font-size: 18px;
      font-weight: 700;
      letter-spacing: 0.1em;
      margin: 0;
    }
    .status-badge {
      display: inline-block;
      padding: 8px 16px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      border: 1px solid currentColor;
    }
    .status-paid { color: #22c55e; }
    .status-shipped { color: #3b82f6; }
    .status-delivered { color: #000000; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <a href="${SITE_URL}" class="logo">${SITE_NAME}</a>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>Des questions ? Contactez-nous à <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></p>
      <p style="margin-top: 20px;">&copy; ${new Date().getFullYear()} ${SITE_NAME}. Tous droits réservés.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Formate un prix en euros
 */
function formatPrice(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

/**
 * Génère le tableau des produits commandés
 */
function generateOrderItemsTable(items: OrderItem[], totalAmount: number): string {
  const itemsRows = items
    .map(
      (item) => `
    <tr>
      <td>
        <span class="product-name">${item.product_name}</span><br>
        <span class="quantity">Quantité : ${item.quantity}</span>
      </td>
      <td class="price">${formatPrice(item.price_at_time * item.quantity)}</td>
    </tr>
  `
    )
    .join("");

  return `
    <table class="order-table">
      <thead>
        <tr>
          <th>Produit</th>
          <th style="text-align: right;">Prix</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
        <tr class="total-row">
          <td>Total</td>
          <td class="price">${formatPrice(totalAmount)}</td>
        </tr>
      </tbody>
    </table>
  `;
}

/**
 * Génère le bloc adresse de livraison
 */
function generateAddressBlock(address: ShippingAddress): string {
  return `
    <div class="address-box">
      <h3>Adresse de livraison</h3>
      <p>
        ${address.first_name} ${address.last_name}<br>
        ${address.address}<br>
        ${address.postal_code} ${address.city}<br>
        ${address.country}
        ${address.phone ? `<br>Tél : ${address.phone}` : ""}
      </p>
    </div>
  `;
}

// ============================================
// EMAIL 1 : Confirmation de commande → Client (React Email)
// ============================================
export async function sendOrderConfirmation(data: OrderEmailData): Promise<{ success: boolean; error?: string }> {
  const { orderId, customerName, customerEmail, items, totalAmount } = data;

  console.log("📧 [sendOrderConfirmation] Début - Paramètres reçus:", {
    orderId,
    customerName,
    customerEmail: customerEmail || "VIDE",
    itemsCount: items.length,
    totalAmount,
    hasResendKey: !!process.env.RESEND_API_KEY,
    nodeEnv: process.env.NODE_ENV,
  });

  // Vérifier que l'email client est fourni
  if (!customerEmail || customerEmail.trim() === "") {
    console.error("❌ [sendOrderConfirmation] Email client manquant ou vide");
    return { success: false, error: "Email client manquant" };
  }

  // Déterminer l'email destinataire (DEV → ADMIN_EMAIL, PROD → customerEmail)
  const IS_DEV = process.env.NODE_ENV === "development";
  const recipientEmail = IS_DEV
    ? process.env.ADMIN_EMAIL || "delivered@resend.dev"
    : customerEmail;

  if (IS_DEV) {
    console.log("📧 [DEV MODE] Email serait envoyé à:", customerEmail);
    console.log("📧 [DEV MODE] Email envoyé à (test):", recipientEmail);
  }

  // Vérifier que Resend est configuré
  if (!process.env.RESEND_API_KEY) {
    console.warn("⚠️ [RESEND] RESEND_API_KEY non configuré - Email non envoyé");
    console.log("📧 [MOCK] Email de confirmation:", {
      to: customerEmail,
      orderId,
      customerName,
      totalAmount: totalAmount / 100,
    });
    return { success: true }; // Retourner success pour ne pas bloquer le flow
  }

  try {
    // Rendre le template React Email en HTML
    const emailHtml = await render(
      OrderConfirmation({
        customerName,
        orderId,
        totalAmount,
        items: items.map((item) => ({
          product_name: item.product_name,
          quantity: item.quantity,
          price_at_time: item.price_at_time,
          image_url: item.image_url,
        })),
        siteUrl: SITE_URL,
        siteName: SITE_NAME,
      })
    );

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: recipientEmail,
      subject: `Confirmation de votre commande #${orderId.slice(0, 8).toUpperCase()}`,
      html: emailHtml,
    });

    if (error) {
      console.error("❌ [RESEND] Erreur envoi email confirmation:", error);
      return { success: false, error: error.message };
    }

    console.log(`✅ [RESEND] Email confirmation envoyé à: ${recipientEmail}${IS_DEV ? ` (dev mode, original: ${customerEmail})` : ""}`);
    return { success: true };
  } catch (err: any) {
    console.error("❌ [RESEND] Exception envoi email:", err);
    return { success: false, error: err.message };
  }
}

// ============================================
// EMAIL 2 : Nouvelle commande → Admin
// ============================================
export async function sendNewOrderNotificationToAdmin(data: OrderEmailData): Promise<{ success: boolean; error?: string }> {
  const { orderId, customerName, customerEmail, items, totalAmount, shippingAddress } = data;

  console.log("📧 [sendNewOrderNotificationToAdmin] Début - Paramètres reçus:", {
    orderId,
    customerName,
    customerEmail: customerEmail || "VIDE",
    itemsCount: items.length,
    totalAmount,
    hasShippingAddress: !!shippingAddress,
    adminEmail: ADMIN_EMAIL,
    hasResendKey: !!process.env.RESEND_API_KEY,
  });

  // Vérifier que Resend est configuré
  if (!process.env.RESEND_API_KEY) {
    console.warn("⚠️ [RESEND] RESEND_API_KEY non configuré - Email admin non envoyé");
    console.log("📧 [MOCK] Email notification admin:", {
      to: ADMIN_EMAIL,
      orderId,
      customerName,
      totalAmount: totalAmount / 100,
    });
    return { success: true }; // Retourner success pour ne pas bloquer le flow
  }

  const content = `
    <h1>Nouvelle commande reçue</h1>
    <p><span class="status-badge status-paid">Payée</span></p>

    <p><strong>Commande :</strong> #${orderId.slice(0, 8).toUpperCase()}</p>
    <p><strong>Client :</strong> ${customerName} (${customerEmail})</p>
    <p><strong>Montant :</strong> ${formatPrice(totalAmount)}</p>

    ${generateOrderItemsTable(items, totalAmount)}

    ${shippingAddress ? generateAddressBlock(shippingAddress) : ""}

    <center>
      <a href="${SITE_URL}/admin/orders/${orderId}" class="button">Voir la commande</a>
    </center>
  `;

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `🛒 Nouvelle commande #${orderId.slice(0, 8).toUpperCase()} - ${formatPrice(totalAmount)}`,
      html: baseTemplate(content),
    });

    if (error) {
      console.error("❌ [RESEND] Erreur envoi email admin:", error);
      return { success: false, error: error.message };
    }

    console.log("✅ [RESEND] Email nouvelle commande envoyé à admin:", ADMIN_EMAIL);
    return { success: true };
  } catch (err: any) {
    console.error("❌ [RESEND] Exception envoi email admin:", err);
    return { success: false, error: err.message };
  }
}

// ============================================
// EMAIL 3 : Expédition → Client
// ============================================
export async function sendShippingConfirmationEmail(data: OrderEmailData): Promise<{ success: boolean; error?: string }> {
  const { orderId, customerName, customerEmail, items, totalAmount, shippingAddress, trackingNumber, trackingUrl } = data;

  const trackingBlock = trackingNumber
    ? `
    <div class="tracking-box">
      <h3>Numéro de suivi</h3>
      <p class="number">${trackingNumber}</p>
      ${trackingUrl ? `<a href="${trackingUrl}" class="button" style="margin-top: 15px; background-color: #ffffff; color: #000000 !important;">Suivre mon colis</a>` : ""}
    </div>
  `
    : "";

  const content = `
    <h1>Votre commande est en route</h1>
    <p>Bonjour ${customerName},</p>
    <p>Bonne nouvelle ! Votre commande <strong>#${orderId.slice(0, 8).toUpperCase()}</strong> a été expédiée.</p>

    ${trackingBlock}

    ${generateOrderItemsTable(items, totalAmount)}

    ${shippingAddress ? generateAddressBlock(shippingAddress) : ""}

    <p>Votre colis devrait arriver sous 2-4 jours ouvrés.</p>

    <center>
      <a href="${SITE_URL}/account/orders" class="button">Mes commandes</a>
    </center>
  `;

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: customerEmail,
      subject: `📦 Votre commande #${orderId.slice(0, 8).toUpperCase()} est en route - ${SITE_NAME}`,
      html: baseTemplate(content),
    });

    if (error) {
      console.error("❌ [RESEND] Erreur envoi email expédition:", error);
      return { success: false, error: error.message };
    }

    console.log("✅ [RESEND] Email expédition envoyé à:", customerEmail);
    return { success: true };
  } catch (err: any) {
    console.error("❌ [RESEND] Exception envoi email expédition:", err);
    return { success: false, error: err.message };
  }
}

// ============================================
// EMAIL 4 : Alerte Stock Faible → Admin (React Email)
// ============================================
interface LowStockProduct {
  name: string;
  stock: number;
}

export async function sendLowStockAlert(
  products: LowStockProduct[]
): Promise<{ success: boolean; error?: string }> {
  // Vérifier que Resend est configuré
  if (!process.env.RESEND_API_KEY) {
    console.warn("⚠️ [RESEND] RESEND_API_KEY non configuré - Email alerte stock non envoyé");
    console.log("📧 [MOCK] Alerte stock faible:", {
      products: products.map((p) => `${p.name} (${p.stock} unités)`),
    });
    return { success: true }; // Retourner success pour ne pas bloquer le flow
  }

  try {
    // Rendre le template React Email en HTML
    const emailHtml = await render(
      LowStockAlert({
        products,
        siteUrl: SITE_URL,
        siteName: SITE_NAME,
      })
    );

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `⚠️ Alerte stock faible - ${products.length} produit${products.length > 1 ? "s" : ""} en stock critique`,
      html: emailHtml,
    });

    if (error) {
      console.error("❌ [RESEND] Erreur envoi email alerte stock:", error);
      return { success: false, error: error.message };
    }

    console.log(`✅ [RESEND] Email alerte stock envoyé à admin pour ${products.length} produit(s)`);
    return { success: true };
  } catch (err: any) {
    console.error("❌ [RESEND] Exception envoi email alerte stock:", err);
    return { success: false, error: err.message };
  }
}

// Export des types pour utilisation externe
export type { OrderEmailData, OrderItem, ShippingAddress, LowStockProduct };
