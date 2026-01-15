import { ImageResponse } from "next/og";
import { SITE_CONFIG } from "@/lib/metadata";

/**
 * Open Graph Image - Page d'accueil
 *
 * Génère une image OG 1200x630px pour le partage sur réseaux sociaux
 * Style minimaliste Byredo : fond blanc, texte noir, très épuré
 */

export const runtime = "edge";
export const alt = SITE_CONFIG.name;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
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
        }}
      >
        {/* Logo / Titre principal */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: "72px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#000000",
              margin: 0,
              marginBottom: "24px",
            }}
          >
            {SITE_CONFIG.name}
          </h1>

          <p
            style={{
              fontSize: "28px",
              fontWeight: 400,
              letterSpacing: "0.05em",
              color: "#666666",
              margin: 0,
              maxWidth: "800px",
              lineHeight: 1.4,
            }}
          >
            {SITE_CONFIG.tagline}
          </p>
        </div>

        {/* Bordure fine en bas (signature Byredo) */}
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
