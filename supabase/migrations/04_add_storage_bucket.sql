-- =====================================================
-- Migration 04: Storage Bucket pour images produits
-- =====================================================
-- Objectif: Créer un bucket public pour stocker les images produits
-- Seuls les admins peuvent upload, tout le monde peut lire

-- Créer le bucket product-images (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Admin peut uploader des images
CREATE POLICY "Admin can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images' AND
  (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true))
);

-- Policy: Public peut voir les images
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- Policy: Admin peut supprimer des images
CREATE POLICY "Admin can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images' AND
  (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true))
);

-- Policy: Admin peut mettre à jour les images
CREATE POLICY "Admin can update product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images' AND
  (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true))
);
