-- ============================================
-- SEED DATA PRODUCTION - THE PARFUMERIEE
-- ============================================
-- Description: Données de démarrage pour la production
-- Usage: Exécuter après avoir appliqué production_schema.sql
-- Date: 2026-01-16
-- ============================================

-- ============================================
-- PARTIE 1: NETTOYAGE (Optionnel)
-- ============================================
-- Décommentez ces lignes si vous voulez réinitialiser les données
-- DELETE FROM public.product_tags;
-- DELETE FROM public.product_categories;
-- DELETE FROM public.orders;
-- DELETE FROM public.wishlist;
-- DELETE FROM public.products;
-- DELETE FROM public.tags;
-- DELETE FROM public.categories;

-- ============================================
-- PARTIE 2: CATÉGORIES
-- ============================================

INSERT INTO public.categories (name, slug, description) VALUES
('CP KING ÉDITION', 'cp-king-edition', 'Collection premium avec les meilleures créations'),
('CP PARIS', 'cp-paris', 'Collection parisienne accessible'),
('NOTE 33', 'note-33', 'Collection signature avec notes olfactives uniques'),
('CASABLANCA', 'casablanca', 'Collection luxe inspirée de Casablanca')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- PARTIE 3: TAGS
-- ============================================

INSERT INTO public.tags (name, slug) VALUES
('BEST SELLER', 'best-seller'),
('NOUVEAU', 'nouveau'),
('MIXTE', 'mixte'),
('HOMME', 'homme'),
('FEMME', 'femme')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- PARTIE 4: PRODUITS
-- ============================================
-- Note: Les prix sont en CENTIMES (100 = 1€)
-- Status: 'published' pour que les produits soient visibles

-- COLLECTION: CP PARIS (Prix: 10.00 € = 1000 centimes)
INSERT INTO public.products (name, slug, brand, collection, price, stock, category, status, description) VALUES
('Coco Vanille Mancera', 'coco-vanille-mancera', 'Mancera', 'CP PARIS', 1000, 5, 'Unisexe', 'published', 'Une fragrance gourmande aux notes de noix de coco et vanille'),
('Crème Brûlée Khalil', 'creme-brulee-khalil', 'Khalil', 'CP PARIS', 1000, 4, 'Unisexe', 'published', 'Un parfum gourmand aux notes de crème brûlée'),
('Khamrah de Dubai', 'khamrah-de-dubai', 'Lattafa', 'CP PARIS', 1000, 4, 'Unisexe', 'published', 'Une fragrance orientale aux notes épicées'),
('Majestic Aisha', 'majestic-aisha', 'Lattafa', 'CP PARIS', 1000, 4, 'Unisexe', 'published', 'Un parfum majestueux aux notes florales'),
('Oud Intense', 'oud-intense', 'Lattafa', 'CP PARIS', 1000, 4, 'Unisexe', 'published', 'Un oud intense et envoûtant'),
('Oud Madawi', 'oud-madawi', 'Lattafa', 'CP PARIS', 1000, 4, 'Unisexe', 'published', 'Un oud authentique du Moyen-Orient'),
('Infini - Immensité LV', 'infini-immensite-lv', 'Louis Vuitton', 'CP PARIS', 1000, 2, 'Unisexe', 'published', 'Une interprétation de l''immensité'),
('Musc Blanc - Création', 'musc-blanc-creation', 'Création', 'CP PARIS', 1000, 3, 'Unisexe', 'published', 'Un musc blanc pur et délicat'),
('Bois d''Argent 2004 Dior', 'bois-dargent-2004-dior', 'Dior', 'CP PARIS', 1000, 3, 'Unisexe', 'published', 'Un bois précieux aux notes irisées'),
('Kryptonite Absolu Khalil T', 'kryptonite-absolu-khalil-t', 'Khalil', 'CP PARIS', 1000, 3, 'Unisexe', 'published', 'Une fragrance intense et puissante'),
('Yum Boujee Marshmallow Kayali', 'yum-boujee-marshmallow-kayali', 'Kayali', 'CP PARIS', 1000, 3, 'Unisexe', 'published', 'Un parfum gourmand aux notes de marshmallow'),
('Rose Vanille Mancera', 'rose-vanille-mancera', 'Mancera', 'CP PARIS', 1000, 3, 'Unisexe', 'published', 'Une rose délicate mariée à la vanille'),
('Sucre Noir Arte Profumi', 'sucre-noir-arte-profumi', 'Arte Profumi', 'CP PARIS', 1000, 3, 'Unisexe', 'published', 'Un sucre noir envoûtant'),
('Blanche Bête Liquide Imaginaire', 'blanche-bete-liquide-imaginaire', 'Liquides Imaginaires', 'CP PARIS', 1000, 2, 'Unisexe', 'published', 'Une fragrance onirique et mystérieuse'),
('Savane - Dior Intense', 'savane-dior-intense', 'Dior', 'CP PARIS', 1000, 2, 'Unisexe', 'published', 'Une interprétation intense de la savane'),
('Mula Mula Bryan', 'mula-mula-bryan', 'Bryan', 'CP PARIS', 1000, 2, 'Unisexe', 'published', 'Une fragrance audacieuse'),
('Rouge Trafalgar Dior', 'rouge-trafalgar-dior', 'Dior', 'CP PARIS', 1000, 2, 'Unisexe', 'published', 'Un rouge intense et élégant'),
('Yara - Lattafa', 'yara-lattafa', 'Lattafa', 'CP PARIS', 1000, 2, 'Femme', 'published', 'Une fragrance douce et fruitée'),
('Kirke - Tiziana Terenzi', 'kirke-tiziana-terenzi', 'Tiziana Terenzi', 'CP PARIS', 1000, 1, 'Unisexe', 'published', 'Une fragrance mythologique envoûtante')
ON CONFLICT (slug) DO NOTHING;

-- COLLECTION: CP KING ÉDITION (Prix: 15.00 € = 1500 centimes)
INSERT INTO public.products (name, slug, brand, collection, price, stock, category, status, description) VALUES
('4 BLACK OP', '4-black-op', 'CP King', 'CP KING ÉDITION', 1500, 4, 'Unisexe', 'published', 'Une interprétation audacieuse et mystérieuse. Des notes de café noir adoucies par la vanille et la fleur d''oranger.'),
('4 TOBACCO VANILLE', '4-tobacco-vanille', 'CP King', 'CP KING ÉDITION', 1500, 4, 'Unisexe', 'published', 'Un accord chaleureux entre le tabac et la vanille, créant une fragrance gourmande et enveloppante.'),
('4 BOIS INTENSE', '4-bois-intense', 'CP King', 'CP KING ÉDITION', 1500, 4, 'Unisexe', 'published', 'Un bois intense et profond'),
('3 BLEU', '3-bleu', 'CP King', 'CP KING ÉDITION', 1500, 3, 'Unisexe', 'published', 'Une fragrance fraîche et marine'),
('3 COCO VANILLE', '3-coco-vanille', 'CP King', 'CP KING ÉDITION', 1500, 3, 'Unisexe', 'published', 'Une combinaison exotique de noix de coco et de vanille, créant une fragrance tropicale et gourmande.'),
('2 SULTAN', '2-sultan', 'CP King', 'CP KING ÉDITION', 1500, 2, 'Unisexe', 'published', 'Une fragrance royale et opulente'),
('2 AISHA', '2-aisha', 'CP King', 'CP KING ÉDITION', 1500, 2, 'Unisexe', 'published', 'Une fragrance élégante et raffinée'),
('2 BACCARAT', '2-baccarat', 'CP King', 'CP KING ÉDITION', 1500, 2, 'Unisexe', 'published', 'Une fragrance cristalline et précieuse'),
('1 KIRKE', '1-kirke', 'CP King', 'CP KING ÉDITION', 1500, 1, 'Unisexe', 'published', 'Une fragrance mythologique envoûtante'),
('1 ULTRA', '1-ultra', 'CP King', 'CP KING ÉDITION', 1500, 1, 'Unisexe', 'published', 'Une fragrance ultime et intense'),
('1 MOULA', '1-moula', 'CP King', 'CP KING ÉDITION', 1500, 1, 'Unisexe', 'published', 'Une fragrance audacieuse et puissante'),
('1 KRYPTO', '1-krypto', 'CP King', 'CP KING ÉDITION', 1500, 1, 'Unisexe', 'published', 'Une fragrance mystérieuse et intense')
ON CONFLICT (slug) DO NOTHING;

-- COLLECTION: NOTE 33 (Prix: 20.00 € = 2000 centimes)
INSERT INTO public.products (name, slug, brand, collection, price, stock, category, status, description) VALUES
('NOTE 33 - AMBER & SPICY', 'note-33-amber-spicy', 'Note 33', 'NOTE 33', 2000, 5, 'Homme', 'published', 'Une fragrance ambrée et épicée pour homme'),
('NOTE 33 - IRIS & WOODY', 'note-33-iris-woody', 'Note 33', 'NOTE 33', 2000, 1, 'Homme', 'published', 'Une fragrance irisée et boisée pour homme'),
('NOTE 33 - MUSC & FLOWER', 'note-33-musc-flower', 'Note 33', 'NOTE 33', 2000, 1, 'Femme', 'published', 'Une fragrance musquée et florale pour femme'),
('NOTE 33 - KISS ME', 'note-33-kiss-me', 'Note 33', 'NOTE 33', 2000, 1, 'Femme', 'published', 'Une fragrance sensuelle et envoûtante'),
('NOTE 33 - SENSUEL ORKIDÉ', 'note-33-sensuel-orkide', 'Note 33', 'NOTE 33', 2000, 1, 'Femme', 'published', 'Une fragrance sensuelle aux notes d''orchidée')
ON CONFLICT (slug) DO NOTHING;

-- COLLECTION: CASABLANCA (Prix: 30.00 € = 3000 centimes)
INSERT INTO public.products (name, slug, brand, collection, price, stock, category, status, description) VALUES
('CASABLANCA - PARIS (Santal de Paris)', 'casablanca-paris-santal-de-paris', 'Casablanca', 'CASABLANCA', 3000, 1, 'Unisexe', 'published', 'Un santal parisien raffiné'),
('CASABLANCA - PASSION (Passion Riviera)', 'casablanca-passion-passion-riviera', 'Casablanca', 'CASABLANCA', 3000, 3, 'Unisexe', 'published', 'Une passion riviera envoûtante'),
('CASABLANCA - CRÈME BRÛLÉE', 'casablanca-creme-brulee', 'Casablanca', 'CASABLANCA', 3000, 2, 'Unisexe', 'published', 'Une crème brûlée gourmande et raffinée'),
('CASABLANCA - MARSHMALLOW (Yum Boujee)', 'casablanca-marshmallow-yum-boujee', 'Casablanca', 'CASABLANCA', 3000, 1, 'Unisexe', 'published', 'Un marshmallow délicat et gourmand'),
('CASABLANCA - CRYPTO', 'casablanca-crypto', 'Casablanca', 'CASABLANCA', 3000, 3, 'Unisexe', 'published', 'Une fragrance cryptique et mystérieuse')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- PARTIE 5: LIAISONS PRODUITS ↔ CATÉGORIES
-- ============================================

-- Lier les produits CP PARIS à la catégorie "CP PARIS"
INSERT INTO public.product_categories (product_id, category_id)
SELECT p.id, c.id
FROM public.products p
CROSS JOIN public.categories c
WHERE p.collection = 'CP PARIS' AND c.slug = 'cp-paris'
ON CONFLICT DO NOTHING;

-- Lier les produits CP KING ÉDITION à la catégorie "CP KING ÉDITION"
INSERT INTO public.product_categories (product_id, category_id)
SELECT p.id, c.id
FROM public.products p
CROSS JOIN public.categories c
WHERE p.collection = 'CP KING ÉDITION' AND c.slug = 'cp-king-edition'
ON CONFLICT DO NOTHING;

-- Lier les produits NOTE 33 à la catégorie "NOTE 33"
INSERT INTO public.product_categories (product_id, category_id)
SELECT p.id, c.id
FROM public.products p
CROSS JOIN public.categories c
WHERE p.collection = 'NOTE 33' AND c.slug = 'note-33'
ON CONFLICT DO NOTHING;

-- Lier les produits CASABLANCA à la catégorie "CASABLANCA"
INSERT INTO public.product_categories (product_id, category_id)
SELECT p.id, c.id
FROM public.products p
CROSS JOIN public.categories c
WHERE p.collection = 'CASABLANCA' AND c.slug = 'casablanca'
ON CONFLICT DO NOTHING;

-- ============================================
-- PARTIE 6: LIAISONS PRODUITS ↔ TAGS
-- ============================================

-- Tag "BEST SELLER" sur les produits les plus vendus
INSERT INTO public.product_tags (product_id, tag_id)
SELECT p.id, t.id
FROM public.products p
CROSS JOIN public.tags t
WHERE t.slug = 'best-seller'
  AND p.slug IN (
    'coco-vanille-mancera',
    '4-black-op',
    'creme-brulee-khalil',
    'note-33-amber-spicy',
    'casablanca-paris-santal-de-paris'
  )
ON CONFLICT DO NOTHING;

-- Tag "NOUVEAU" sur les nouveaux produits
INSERT INTO public.product_tags (product_id, tag_id)
SELECT p.id, t.id
FROM public.products p
CROSS JOIN public.tags t
WHERE t.slug = 'nouveau'
  AND p.slug IN (
    'note-33-kiss-me',
    'note-33-sensuel-orkide',
    'casablanca-marshmallow-yum-boujee'
  )
ON CONFLICT DO NOTHING;

-- Tag "MIXTE" sur les produits unisexes
INSERT INTO public.product_tags (product_id, tag_id)
SELECT p.id, t.id
FROM public.products p
CROSS JOIN public.tags t
WHERE t.slug = 'mixte' AND p.category = 'Unisexe'
ON CONFLICT DO NOTHING;

-- Tag "HOMME" sur les produits homme
INSERT INTO public.product_tags (product_id, tag_id)
SELECT p.id, t.id
FROM public.products p
CROSS JOIN public.tags t
WHERE t.slug = 'homme' AND p.category = 'Homme'
ON CONFLICT DO NOTHING;

-- Tag "FEMME" sur les produits femme
INSERT INTO public.product_tags (product_id, tag_id)
SELECT p.id, t.id
FROM public.products p
CROSS JOIN public.tags t
WHERE t.slug = 'femme' AND p.category = 'Femme'
ON CONFLICT DO NOTHING;

-- ============================================
-- PARTIE 7: VÉRIFICATIONS
-- ============================================

-- Vérifier le nombre de produits par collection
DO $$
DECLARE
  cp_paris_count INTEGER;
  cp_king_count INTEGER;
  note33_count INTEGER;
  casablanca_count INTEGER;
  categories_count INTEGER;
  tags_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO cp_paris_count FROM products WHERE collection = 'CP PARIS';
  SELECT COUNT(*) INTO cp_king_count FROM products WHERE collection = 'CP KING ÉDITION';
  SELECT COUNT(*) INTO note33_count FROM products WHERE collection = 'NOTE 33';
  SELECT COUNT(*) INTO casablanca_count FROM products WHERE collection = 'CASABLANCA';
  SELECT COUNT(*) INTO categories_count FROM categories;
  SELECT COUNT(*) INTO tags_count FROM tags;
  
  RAISE NOTICE '✅ Seed data inséré avec succès !';
  RAISE NOTICE '📦 Produits CP PARIS: %', cp_paris_count;
  RAISE NOTICE '📦 Produits CP KING ÉDITION: %', cp_king_count;
  RAISE NOTICE '📦 Produits NOTE 33: %', note33_count;
  RAISE NOTICE '📦 Produits CASABLANCA: %', casablanca_count;
  RAISE NOTICE '📂 Catégories: %', categories_count;
  RAISE NOTICE '🏷️ Tags: %', tags_count;
END $$;

-- ============================================
-- REQUÊTES DE VÉRIFICATION (Optionnel)
-- ============================================
-- 
-- Pour vérifier les données insérées, exécutez :
--
-- -- Voir tous les produits avec leurs catégories
-- SELECT p.name, p.collection, p.price, p.stock, p.status,
--        array_agg(DISTINCT c.name) as categories,
--        array_agg(DISTINCT t.name) as tags
-- FROM products p
-- LEFT JOIN product_categories pc ON p.id = pc.product_id
-- LEFT JOIN categories c ON pc.category_id = c.id
-- LEFT JOIN product_tags pt ON p.id = pt.product_id
-- LEFT JOIN tags t ON pt.tag_id = t.id
-- GROUP BY p.id, p.name, p.collection, p.price, p.stock, p.status
-- ORDER BY p.collection, p.name;
--
-- -- Compter les produits par collection
-- SELECT collection, COUNT(*) as count, SUM(stock) as total_stock
-- FROM products
-- GROUP BY collection
-- ORDER BY collection;
--
-- -- Voir les catégories et leurs produits
-- SELECT c.name as category, COUNT(pc.product_id) as products_count
-- FROM categories c
-- LEFT JOIN product_categories pc ON c.id = pc.category_id
-- GROUP BY c.id, c.name
-- ORDER BY c.name;
--
-- ============================================
-- FIN DU SEED DATA
-- ============================================
