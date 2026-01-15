import { ImageResponse } from "next/og";
import { createBuildClient } from "@/utils/supabase/build";
import { SITE_CONFIG } from "@/lib/metadata";

/**
 * Open Graph Image Dynamique - Pages Produits
 *
 * Génère une image OG personnalisée pour chaque produit
 * Affiche : nom du produit, marque, prix
 * Style minimaliste Byredo
 */

export const runtime = "edge";
export const alt = "Produit";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = createBuildClient();

  // Récupérer les infos du produit
  const { data: product } = await supabase
    .from("products")
    .select("name, brand, price")
    .eq("slug", slug)
    .single();

  if (!product) {
    // Fallback si produit non trouvé
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#ffffff",
          }}
        >
          <h1
            style={{
              fontSize: "48px",
              color: "#000000",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            Produit non trouvé
          </h1>
        </div>
      ),
      { ...size }
    );
  }

  // Formater le prix
  const formattedPrice = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(Number(product.price) / 100);

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff",
          padding: "80px",
          position: "relative",
        }}
      >
        {/* Logo site en haut */}
        <div
          style={{
            position: "absolute",
            top: "60px",
            left: "80px",
            fontSize: "18px",
            fontWeight: 500,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#000000",
          }}
        >
          {SITE_CONFIG.name}
        </div>

        {/* Contenu principal centré */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            maxWidth: "900px",
          }}
        >
          {/* Marque */}
          <p
            style={{
              fontSize: "24px",
              fontWeight: 400,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#666666",
              margin: 0,
              marginBottom: "16px",
            }}
          >
            {product.brand}
          </p>

          {/* Nom du produit */}
          <h1
            style={{
              fontSize: "64px",
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "#000000",
              margin: 0,
              marginBottom: "32px",
              lineHeight: 1.1,
            }}
          >
            {product.name}
          </h1>

          {/* Prix */}
          <p
            style={{
              fontSize: "32px",
              fontWeight: 500,
              color: "#000000",
              margin: 0,
            }}
          >
            {formattedPrice}
          </p>
        </div>

        {/* Bordure fine en bas */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "80px",
            right: "80px",
            height: "1px",
            backgroundColor: "#000000",
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
