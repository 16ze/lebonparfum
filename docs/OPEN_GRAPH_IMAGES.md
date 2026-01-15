# Open Graph Images - Guide de Création

## 📋 État Actuel

Les metadata Open Graph sont configurées dans `lib/metadata.ts` et référencent :
- `/og-image.jpg` (1200x630px) - Image principale pour Facebook, LinkedIn
- `/twitter-image.jpg` (1200x630px) - Image pour Twitter Cards

## 🎨 Spécifications Techniques

### Dimensions Requises

- **Open Graph (Facebook, LinkedIn)** : 1200x630px (ratio 1.91:1)
- **Twitter Card** : 1200x630px (ratio 1.91:1) ou 1200x600px
- **Format** : JPG ou PNG
- **Taille max** : 8MB (recommandé < 200KB pour performance)

### Style Byredo (Référence Visuelle)

Les images doivent respecter l'identité visuelle du site :

- **Couleurs** : Noir (#000000) et Blanc (#FFFFFF) uniquement
- **Typographie** : Sans-Serif géométrique (Inter, Helvetica, Manrope)
- **Style** : Minimalisme brutaliste, clinique
- **Texte** : Uppercase avec `letter-spacing` prononcé
- **Formes** : Angles droits, pas de border-radius
- **Ombres** : Aucune ombre portée (flat design)

## 🛠️ Options de Création

### Option 1 : Images Statiques (Recommandé pour MVP)

Créer manuellement deux images dans `/public` :

1. **`/public/og-image.jpg`** (1200x630px)
   - Logo "Le Bon Parfum" centré
   - Tagline : "PARFUMS DE NICHE & COLLECTIONS EXCLUSIVES"
   - Fond blanc ou noir selon le style

2. **`/public/twitter-image.jpg`** (1200x630px)
   - Même design que og-image.jpg
   - Peut être identique ou légèrement adapté pour Twitter

**Outils recommandés** :
- Figma / Sketch (design)
- Photoshop / GIMP (export)
- Canva (alternative rapide)

### Option 2 : Génération Dynamique avec @vercel/og

Next.js supporte la génération dynamique d'images Open Graph via `@vercel/og`.

**Installation** :
```bash
pnpm add @vercel/og
```

**Création de l'API Route** : `app/og/route.tsx`

```tsx
import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title') || 'Le Bon Parfum';
    const description = searchParams.get('description') || 'Parfums de Niche & Collections Exclusives';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#FFFFFF',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          <div
            style={{
              fontSize: 60,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#000000',
              marginBottom: 20,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 24,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              color: '#666666',
            }}
          >
            {description}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
```

**Mise à jour de `lib/metadata.ts`** :
```ts
openGraph: {
  images: [
    {
      url: `${SITE_CONFIG.url}/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`,
      width: 1200,
      height: 630,
      alt: title,
    },
  ],
}
```

### Option 3 : Images Dynamiques par Page

Pour des images personnalisées par produit/catégorie :

1. Créer un dossier `/public/og/`
2. Générer des images pour chaque produit/catégorie importante
3. Utiliser l'image du produit comme base pour l'OG image

## ✅ Checklist de Déploiement

- [ ] Créer `/public/og-image.jpg` (1200x630px)
- [ ] Créer `/public/twitter-image.jpg` (1200x630px)
- [ ] Tester avec [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [ ] Tester avec [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [ ] Vérifier le chargement rapide (< 200KB)
- [ ] Valider l'accessibilité (contraste texte/fond)

## 🔍 Validation

### Facebook Sharing Debugger
1. Aller sur https://developers.facebook.com/tools/debug/
2. Entrer l'URL de votre site
3. Cliquer sur "Scrape Again" pour forcer le refresh du cache

### Twitter Card Validator
1. Aller sur https://cards-dev.twitter.com/validator
2. Entrer l'URL de votre site
3. Vérifier l'aperçu de la card

## 📝 Notes

- Les réseaux sociaux mettent en cache les images OG. Utiliser leurs outils de debug pour forcer le refresh.
- Les images doivent être accessibles publiquement (pas de protection par authentification).
- Pour les pages produits, on peut utiliser l'image du produit comme base pour l'OG image.
