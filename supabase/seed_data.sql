-- ============================================
-- Seed Data - Catalogue THE PARFUMERIEE
-- ============================================
-- Description: Injection du catalogue complet avec gestion du stock
-- 
-- Instructions:
--   1. Ouvrez Supabase Dashboard > SQL Editor
--   2. Copiez-collez ce fichier complet
--   3. Exécutez la requête
-- ============================================

-- Nettoyer la table avant insertion (évite les doublons)
DELETE FROM public.products;

-- S'assurer que la colonne stock existe
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock integer DEFAULT 0;

-- ============================================
-- COLLECTION: CP PARIS (Prix: 10.00 €)
-- ============================================

INSERT INTO public.products (name, slug, collection, price, stock, category) VALUES
('Coco Vanille Mancera', 'coco-vanille-mancera', 'CP Paris', 10.00, 5, 'Unisexe'),
('Crème Brûlée Khalil', 'creme-brulee-khalil', 'CP Paris', 10.00, 4, 'Unisexe'),
('Khamrah de Dubai', 'khamrah-de-dubai', 'CP Paris', 10.00, 4, 'Unisexe'),
('Majestic Aisha', 'majestic-aisha', 'CP Paris', 10.00, 4, 'Unisexe'),
('Oud Intense', 'oud-intense', 'CP Paris', 10.00, 4, 'Unisexe'),
('Oud Madawi', 'oud-madawi', 'CP Paris', 10.00, 4, 'Unisexe'),
('Infini - Immensité LV', 'infini-immensite-lv', 'CP Paris', 10.00, 2, 'Unisexe'),
('Musc Blanc - Création', 'musc-blanc-creation', 'CP Paris', 10.00, 3, 'Unisexe'),
('Bois d''Argent 2004 Dior', 'bois-dargent-2004-dior', 'CP Paris', 10.00, 3, 'Unisexe'),
('Kryptonite Absolu Khalil T', 'kryptonite-absolu-khalil-t', 'CP Paris', 10.00, 3, 'Unisexe'),
('Yum Boujee Marshmallow Kayali', 'yum-boujee-marshmallow-kayali', 'CP Paris', 10.00, 3, 'Unisexe'),
('Rose Vanille Mancera', 'rose-vanille-mancera', 'CP Paris', 10.00, 3, 'Unisexe'),
('Sucre Noir Arte Profumi', 'sucre-noir-arte-profumi', 'CP Paris', 10.00, 3, 'Unisexe'),
('Blanche Bête Liquide Imaginaire', 'blanche-bete-liquide-imaginaire', 'CP Paris', 10.00, 2, 'Unisexe'),
('Savane - Dior Intense', 'savane-dior-intense', 'CP Paris', 10.00, 2, 'Unisexe'),
('Mula Mula Bryan', 'mula-mula-bryan', 'CP Paris', 10.00, 2, 'Unisexe'),
('Rouge Trafalgar Dior', 'rouge-trafalgar-dior', 'CP Paris', 10.00, 2, 'Unisexe'),
('Yara - Lattafa', 'yara-lattafa', 'CP Paris', 10.00, 2, 'Unisexe'),
('Kirke - Tiziana Terenzi', 'kirke-tiziana-terenzi', 'CP Paris', 10.00, 1, 'Unisexe');

-- ============================================
-- COLLECTION: CP KING ÉDITION (Prix: 15.00 €)
-- ============================================

INSERT INTO public.products (name, slug, collection, price, stock, category) VALUES
('4 BLACK OP', '4-black-op', 'CP King Édition', 15.00, 4, 'Unisexe'),
('4 TOBACCO VANILLE', '4-tobacco-vanille', 'CP King Édition', 15.00, 4, 'Unisexe'),
('4 BOIS INTENSE', '4-bois-intense', 'CP King Édition', 15.00, 4, 'Unisexe'),
('3 BLEU', '3-bleu', 'CP King Édition', 15.00, 3, 'Unisexe'),
('3 COCO VANILLE', '3-coco-vanille', 'CP King Édition', 15.00, 3, 'Unisexe'),
('2 SULTAN', '2-sultan', 'CP King Édition', 15.00, 2, 'Unisexe'),
('2 AISHA', '2-aisha', 'CP King Édition', 15.00, 2, 'Unisexe'),
('2 BACCARAT', '2-baccarat', 'CP King Édition', 15.00, 2, 'Unisexe'),
('1 KIRKE', '1-kirke', 'CP King Édition', 15.00, 1, 'Unisexe'),
('1 ULTRA', '1-ultra', 'CP King Édition', 15.00, 1, 'Unisexe'),
('1 MOULA', '1-moula', 'CP King Édition', 15.00, 1, 'Unisexe'),
('1 KRYPTO', '1-krypto', 'CP King Édition', 15.00, 1, 'Unisexe');

-- ============================================
-- COLLECTION: NOTE 33 (Prix: 20.00 €)
-- ============================================

INSERT INTO public.products (name, slug, collection, price, stock, category) VALUES
('NOTE 33 - AMBER & SPICY', 'note-33-amber-spicy', 'Note 33', 20.00, 5, 'Homme'),
('NOTE 33 - IRIS & WOODY', 'note-33-iris-woody', 'Note 33', 20.00, 1, 'Homme'),
('NOTE 33 - MUSC & FLOWER', 'note-33-musc-flower', 'Note 33', 20.00, 1, 'Femme'),
('NOTE 33 - KISS ME', 'note-33-kiss-me', 'Note 33', 20.00, 1, 'Femme'),
('NOTE 33 - SENSUEL ORKIDÉ', 'note-33-sensuel-orkide', 'Note 33', 20.00, 1, 'Femme');

-- ============================================
-- COLLECTION: CASABLANCA (Prix: 30.00 €)
-- ============================================

INSERT INTO public.products (name, slug, collection, price, stock, category) VALUES
('CASABLANCA - PARIS (Santal de Paris)', 'casablanca-paris-santal-de-paris', 'Casablanca', 30.00, 1, 'Unisexe'),
('CASABLANCA - PASSION (Passion Riviera)', 'casablanca-passion-passion-riviera', 'Casablanca', 30.00, 3, 'Unisexe'),
('CASABLANCA - CRÈME BRÛLÉE', 'casablanca-creme-brulee', 'Casablanca', 30.00, 2, 'Unisexe'),
('CASABLANCA - MARSHMALLOW (Yum Boujee)', 'casablanca-marshmallow-yum-boujee', 'Casablanca', 30.00, 1, 'Unisexe'),
('CASABLANCA - CRYPTO', 'casablanca-crypto', 'Casablanca', 30.00, 3, 'Unisexe');

-- ============================================
-- Vérification
-- ============================================
-- Pour vérifier que tout est bien inséré :
-- SELECT collection, COUNT(*) as count FROM public.products GROUP BY collection;
-- ============================================


