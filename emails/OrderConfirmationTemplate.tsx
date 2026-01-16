import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

/**
 * Template d'email de confirmation de commande - Style Byredo
 * 
 * Design minimaliste : Fond blanc, Texte noir, Police Sans-serif
 */

interface OrderItem {
  product_name: string;
  quantity: number;
  price_at_time: number; // en centimes
  image_url?: string;
}

interface OrderConfirmationTemplateProps {
  customerName: string;
  orderId: string;
  totalAmount: number; // en centimes
  items: OrderItem[];
  siteUrl?: string;
}

export const OrderConfirmationTemplate = ({
  customerName,
  orderId,
  totalAmount,
  items,
  siteUrl = "https://lebonparfum.com",
}: OrderConfirmationTemplateProps) => {
  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(cents / 100);
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.price_at_time * item.quantity,
    0
  );
  const shippingFee = subtotal < 10000 ? 500 : 0; // 5€ si < 100€

  return (
    <Html>
      <Head />
      <Preview>Confirmation de votre commande #{orderId.slice(0, 8).toUpperCase()}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo / Header */}
          <Section style={header}>
            <Heading style={logo}>THE PARFUMERIEE</Heading>
          </Section>

          <Hr style={hr} />

          {/* Contenu principal */}
          <Section style={content}>
            <Heading style={h1}>MERCI POUR VOTRE COMMANDE</Heading>
            
            <Text style={text}>
              Bonjour {customerName},
            </Text>

            <Text style={text}>
              Nous avons bien reçu votre commande{" "}
              <strong>#{orderId.slice(0, 8).toUpperCase()}</strong> et nous
              préparons vos articles avec soin.
            </Text>

            {/* Tableau des produits */}
            <Section style={tableSection}>
              <table style={table} cellPadding="0" cellSpacing="0">
                <thead>
                  <tr>
                    <th style={tableHeader}>Produit</th>
                    <th style={[tableHeader, tableHeaderRight]}>Prix</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td style={tableCell}>
                        <Text style={productName}>{item.product_name}</Text>
                        <Text style={quantity}>Quantité : {item.quantity}</Text>
                      </td>
                      <td style={[tableCell, tableCellRight]}>
                        <Text style={price}>
                          {formatPrice(item.price_at_time * item.quantity)}
                        </Text>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  {shippingFee > 0 && (
                    <tr>
                      <td style={tableCell}>
                        <Text style={label}>Frais de livraison</Text>
                      </td>
                      <td style={[tableCell, tableCellRight]}>
                        <Text style={price}>{formatPrice(shippingFee)}</Text>
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td style={[tableCell, totalCell]}>
                      <Text style={totalLabel}>Total</Text>
                    </td>
                    <td style={[tableCell, tableCellRight, totalCell]}>
                      <Text style={totalPrice}>{formatPrice(totalAmount)}</Text>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </Section>

            <Text style={text}>
              Vous recevrez un email avec les informations de suivi dès que
              votre colis sera expédié.
            </Text>

            {/* Bouton CTA */}
            <Section style={buttonSection}>
              <Link href={`${siteUrl}/account/orders`} style={button}>
                SUIVRE MA COMMANDE
              </Link>
            </Section>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Des questions ? Contactez-nous à{" "}
              <Link href="mailto:contact@lebonparfum.com" style={footerLink}>
                contact@lebonparfum.com
              </Link>
            </Text>
            <Text style={footerText}>
              &copy; {new Date().getFullYear()} THE PARFUMERIEE. Tous droits
              réservés.
            </Text>
            <Text style={footerText}>Paris</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles - Minimalisme Byredo
const main = {
  backgroundColor: "#ffffff",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "600px",
};

const header = {
  textAlign: "center" as const,
  paddingBottom: "40px",
  borderBottom: "1px solid #000000",
  marginBottom: "40px",
};

const logo = {
  fontSize: "24px",
  fontWeight: "700",
  letterSpacing: "0.2em",
  textTransform: "uppercase" as const,
  color: "#000000",
  margin: "0",
  padding: "0",
};

const hr = {
  borderColor: "#000000",
  borderWidth: "1px",
  borderStyle: "solid",
  margin: "40px 0",
};

const content = {
  padding: "0",
};

const h1 = {
  fontSize: "14px",
  fontWeight: "700",
  letterSpacing: "0.15em",
  textTransform: "uppercase" as const,
  margin: "0 0 30px 0",
  color: "#000000",
};

const text = {
  fontSize: "14px",
  lineHeight: "1.6",
  color: "#000000",
  margin: "0 0 20px 0",
};

const tableSection = {
  margin: "30px 0",
};

const table = {
  width: "100%",
  borderCollapse: "collapse" as const,
};

const tableHeader = {
  textAlign: "left" as const,
  fontSize: "10px",
  fontWeight: "700",
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
  color: "#666666",
  padding: "10px 0",
  borderBottom: "1px solid #e5e5e5",
};

const tableHeaderRight = {
  textAlign: "right" as const,
};

const tableCell = {
  padding: "15px 0",
  borderBottom: "1px solid #e5e5e5",
  fontSize: "14px",
  verticalAlign: "top" as const,
};

const tableCellRight = {
  textAlign: "right" as const,
};

const productName = {
  fontWeight: "600",
  margin: "0 0 5px 0",
  fontSize: "14px",
  color: "#000000",
};

const quantity = {
  color: "#666666",
  fontSize: "12px",
  margin: "0",
};

const price = {
  textAlign: "right" as const,
  fontWeight: "600",
  margin: "0",
  fontSize: "14px",
  color: "#000000",
};

const label = {
  margin: "0",
  fontSize: "14px",
  color: "#000000",
};

const totalCell = {
  borderTop: "2px solid #000000",
  paddingTop: "20px",
  borderBottom: "none",
};

const totalLabel = {
  fontWeight: "700",
  fontSize: "16px",
  margin: "0",
  color: "#000000",
};

const totalPrice = {
  fontWeight: "700",
  fontSize: "16px",
  margin: "0",
  color: "#000000",
  textAlign: "right" as const,
};

const buttonSection = {
  textAlign: "center" as const,
  margin: "30px 0",
};

const button = {
  display: "inline-block",
  backgroundColor: "#000000",
  color: "#ffffff",
  textDecoration: "none",
  padding: "15px 40px",
  fontSize: "11px",
  fontWeight: "700",
  letterSpacing: "0.15em",
  textTransform: "uppercase" as const,
  margin: "20px 0",
};

const footer = {
  borderTop: "1px solid #000000",
  marginTop: "40px",
  paddingTop: "40px",
  textAlign: "center" as const,
};

const footerText = {
  fontSize: "11px",
  color: "#666666",
  letterSpacing: "0.05em",
  margin: "0 0 10px 0",
};

const footerLink = {
  color: "#000000",
  textDecoration: "none",
};

export default OrderConfirmationTemplate;
