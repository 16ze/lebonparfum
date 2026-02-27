import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

/**
 * Template d'email d'alerte stock faible - Style Byredo
 * 
 * Design urgent mais propre : Rouge/Noir
 */

interface LowStockProduct {
  name: string;
  stock: number;
}

interface LowStockAlertProps {
  products: LowStockProduct[];
  siteUrl?: string;
}

export const LowStockAlert = ({
  products,
  siteUrl = "https://lebonparfum.com",
}: LowStockAlertProps) => {
  return (
    <Html>
      <Head />
      <Preview>{`Alerte stock faible - ${products.length} produit(s) en stock critique`}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={logo}>THE PARFUMERIEE</Heading>
          </Section>

          <Hr style={hr} />

          {/* Contenu principal */}
          <Section style={content}>
            <Heading style={h1}>⚠️ ALERTE STOCK FAIBLE</Heading>
            
            <Text style={text}>
              Les produits suivants ont atteint le seuil critique :
            </Text>

            {/* Liste des produits en stock faible */}
            <Section style={listSection}>
              {products.map((product, index) => (
                <div key={index} style={productItem}>
                  <Text style={productName}>
                    <strong>{product.name}</strong>
                  </Text>
                  <Text style={stockInfo}>
                    Stock restant : <strong style={stockCritical}>{product.stock} unité{product.stock > 1 ? "s" : ""}</strong>
                  </Text>
                </div>
              ))}
            </Section>

            <Text style={text}>
              Veuillez réapprovisionner ces produits rapidement pour éviter les ruptures de stock.
            </Text>

            {/* Bouton CTA */}
            <Section style={buttonSection}>
              <Link href={`${siteUrl}/admin/products`} style={button}>
                GÉRER LES STOCKS
              </Link>
            </Section>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              &copy; {new Date().getFullYear()} THE PARFUMERIEE. Tous droits
              réservés.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles - Minimalisme Byredo avec accent rouge pour l'urgence
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
  color: "#dc2626", // Rouge pour l'urgence
};

const text = {
  fontSize: "14px",
  lineHeight: "1.6",
  color: "#000000",
  margin: "0 0 20px 0",
};

const listSection = {
  margin: "30px 0",
  padding: "20px",
  backgroundColor: "#fef2f2", // Fond rouge très clair
  border: "1px solid #fecaca",
};

const productItem = {
  marginBottom: "20px",
  paddingBottom: "20px",
  borderBottom: "1px solid #fee2e2",
};

const productName = {
  fontWeight: "600",
  margin: "0 0 8px 0",
  fontSize: "14px",
  color: "#000000",
};

const stockInfo = {
  margin: "0",
  fontSize: "13px",
  color: "#666666",
};

const stockCritical = {
  color: "#dc2626", // Rouge pour le stock critique
  fontWeight: "700",
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
  margin: "0",
};

export default LowStockAlert;
