/**
 * Script de Seed - Injection du catalogue de parfums dans Supabase
 *
 * Usage:
 *   npx tsx scripts/seed.ts
 *
 * Prérequis:
 *   - Variables d'environnement SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY configurées
 */

import { createClient } from "@supabase/supabase-js";

/**
 * Fonction pour générer un slug à partir d'un nom
 * Ex: "4 BLACK OP" -> "4-black-op"
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Données du catalogue client
 */
const CATALOGUE = [
  // COLLECTION : CP King Édition (Prix: 15.00)
  {
    name: "4 BLACK OP",
    collection: "CP King Édition",
    price: 15.0,
    category: "Unisexe",
  },
  {
    name: "4 TOBACCO VANILLE",
    collection: "CP King Édition",
    price: 15.0,
    category: "Unisexe",
  },
  {
    name: "4 BOIS INTENSE",
    collection: "CP King Édition",
    price: 15.0,
    category: "Unisexe",
  },
  {
    name: "3 BLEU",
    collection: "CP King Édition",
    price: 15.0,
    category: "Unisexe",
  },
  {
    name: "3 COCO VANILLE",
    collection: "CP King Édition",
    price: 15.0,
    category: "Unisexe",
  },
  {
    name: "2 SULTAN",
    collection: "CP King Édition",
    price: 15.0,
    category: "Unisexe",
  },
  {
    name: "2 AISHA",
    collection: "CP King Édition",
    price: 15.0,
    category: "Unisexe",
  },
  {
    name: "2 BACCARAT",
    collection: "CP King Édition",
    price: 15.0,
    category: "Unisexe",
  },
  {
    name: "1 KIRKE",
    collection: "CP King Édition",
    price: 15.0,
    category: "Unisexe",
  },
  {
    name: "1 ULTRA",
    collection: "CP King Édition",
    price: 15.0,
    category: "Unisexe",
  },
  {
    name: "1 MOULA",
    collection: "CP King Édition",
    price: 15.0,
    category: "Unisexe",
  },
  {
    name: "1 KRYPTO",
    collection: "CP King Édition",
    price: 15.0,
    category: "Unisexe",
  },

  // COLLECTION : CP Paris (Prix: 10.00)
  {
    name: "5 COCO VANILLE",
    collection: "CP Paris",
    price: 10.0,
    category: "Unisexe",
  },
  {
    name: "4 CRÈME BRÛLÉE",
    collection: "CP Paris",
    price: 10.0,
    category: "Unisexe",
  },
  {
    name: "4 KHAMRAH",
    collection: "CP Paris",
    price: 10.0,
    category: "Unisexe",
  },
  {
    name: "4 AISHA",
    collection: "CP Paris",
    price: 10.0,
    category: "Unisexe",
  },
  {
    name: "4 OUD INTENSE",
    collection: "CP Paris",
    price: 10.0,
    category: "Unisexe",
  },
  {
    name: "4 MADAWI",
    collection: "CP Paris",
    price: 10.0,
    category: "Unisexe",
  },
  {
    name: "2 INFINI",
    collection: "CP Paris",
    price: 10.0,
    category: "Unisexe",
  },
  {
    name: "3 MUSC BLANC",
    collection: "CP Paris",
    price: 10.0,
    category: "Unisexe",
  },
  {
    name: "3 BOIS",
    collection: "CP Paris",
    price: 10.0,
    category: "Unisexe",
  },
  {
    name: "3 CRYPTO",
    collection: "CP Paris",
    price: 10.0,
    category: "Unisexe",
  },
  {
    name: "3 MARSHMALLOW",
    collection: "CP Paris",
    price: 10.0,
    category: "Unisexe",
  },
  {
    name: "3 ROSE VANILLE",
    collection: "CP Paris",
    price: 10.0,
    category: "Unisexe",
  },
  {
    name: "3 SUCRE NOIR",
    collection: "CP Paris",
    price: 10.0,
    category: "Unisexe",
  },
  {
    name: "2 BLANCHE B",
    collection: "CP Paris",
    price: 10.0,
    category: "Unisexe",
  },
  {
    name: "2 SAVANE",
    collection: "CP Paris",
    price: 10.0,
    category: "Unisexe",
  },
  {
    name: "2 MOULA",
    collection: "CP Paris",
    price: 10.0,
    category: "Unisexe",
  },
  {
    name: "2 ROUGE",
    collection: "CP Paris",
    price: 10.0,
    category: "Unisexe",
  },
  {
    name: "2 YARA",
    collection: "CP Paris",
    price: 10.0,
    category: "Unisexe",
  },
  {
    name: "1 KIRKE",
    collection: "CP Paris",
    price: 10.0,
    category: "Unisexe",
  },

  // COLLECTION : Note 33 (Prix: 20.00)
  {
    name: "NOTE 33 - AMBER & SPICY",
    collection: "Note 33",
    price: 20.0,
    category: "Homme",
  },
  {
    name: "NOTE 33 - IRIS & WOODY",
    collection: "Note 33",
    price: 20.0,
    category: "Homme",
  },
  {
    name: "NOTE 33 - MUSC & FLOWER",
    collection: "Note 33",
    price: 20.0,
    category: "Femme",
  },
  {
    name: "NOTE 33 - KISS ME",
    collection: "Note 33",
    price: 20.0,
    category: "Femme",
  },
  {
    name: "NOTE 33 - SENSUEL ORKIDÉ",
    collection: "Note 33",
    price: 20.0,
    category: "Femme",
  },

  // COLLECTION : Casablanca (Prix: 30.00)
  {
    name: "CASABLANCA - PARIS (Santal de Paris)",
    collection: "Casablanca",
    price: 30.0,
    category: "Unisexe",
  },
  {
    name: "CASABLANCA - PASSION (Passion Riviera)",
    collection: "Casablanca",
    price: 30.0,
    category: "Unisexe",
  },
  {
    name: "CASABLANCA - CRÈME BRÛLÉE",
    collection: "Casablanca",
    price: 30.0,
    category: "Unisexe",
  },
  {
    name: "CASABLANCA - MARSHMALLOW",
    collection: "Casablanca",
    price: 30.0,
    category: "Unisexe",
  },
  {
    name: "CASABLANCA - CRYPTO",
    collection: "Casablanca",
    price: 30.0,
    category: "Unisexe",
  },
];

/**
 * Fonction principale de seed
 */
async function seed() {
  // Vérification des variables d'environnement
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Erreur: Variables d'environnement manquantes");
    console.error(
      "   Veuillez définir SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY"
    );
    process.exit(1);
  }

  // Initialisation du client Supabase
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log("🌱 Début du seed de la base de données...\n");

  // Préparation des données avec slugs générés
  const productsToInsert = CATALOGUE.map((product) => ({
    name: product.name,
    slug: generateSlug(product.name),
    collection: product.collection,
    price: product.price,
    category: product.category,
    description: null, // À remplir plus tard
    image_url: null, // Placeholder pour l'instant
  }));

  console.log(`📦 Préparation de ${productsToInsert.length} produits...`);

  // Insertion par batch pour éviter les timeouts
  const batchSize = 10;
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < productsToInsert.length; i += batchSize) {
    const batch = productsToInsert.slice(i, i + batchSize);

    const { data, error } = await supabase
      .from("products")
      .insert(batch)
      .select();

    if (error) {
      console.error(`❌ Erreur lors de l'insertion du batch ${i / batchSize + 1}:`, error.message);
      errors += batch.length;
    } else {
      inserted += data?.length || 0;
      console.log(`✅ Batch ${i / batchSize + 1} inséré: ${data?.length || 0} produits`);
    }
  }

  console.log("\n📊 Résumé:");
  console.log(`   ✅ Produits insérés: ${inserted}`);
  if (errors > 0) {
    console.log(`   ❌ Erreurs: ${errors}`);
  }
  console.log("\n🎉 Seed terminé avec succès!");
}

// Exécution du script
seed().catch((error) => {
  console.error("❌ Erreur fatale:", error);
  process.exit(1);
});


