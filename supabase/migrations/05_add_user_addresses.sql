-- =====================================================
-- Migration 05: Table adresses utilisateur
-- =====================================================
-- Objectif: Permettre aux clients de gérer plusieurs adresses de livraison

-- Créer table user_addresses
CREATE TABLE IF NOT EXISTS user_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT DEFAULT 'France' NOT NULL,
  is_default BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Index pour performance (requêtes par user_id fréquentes)
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_addresses_default ON user_addresses(user_id, is_default);

-- Activer RLS
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;

-- Policy: Les users peuvent voir leurs propres adresses
CREATE POLICY "Users can view their own addresses"
ON user_addresses FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Les users peuvent insérer leurs propres adresses
CREATE POLICY "Users can insert their own addresses"
ON user_addresses FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Les users peuvent mettre à jour leurs propres adresses
CREATE POLICY "Users can update their own addresses"
ON user_addresses FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Les users peuvent supprimer leurs propres adresses
CREATE POLICY "Users can delete their own addresses"
ON user_addresses FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Fonction trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_user_addresses_updated_at
BEFORE UPDATE ON user_addresses
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour s'assurer qu'un seul is_default par user
CREATE OR REPLACE FUNCTION ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE user_addresses
    SET is_default = false
    WHERE user_id = NEW.user_id AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour is_default unique
CREATE TRIGGER ensure_single_default_address_trigger
BEFORE INSERT OR UPDATE ON user_addresses
FOR EACH ROW
EXECUTE FUNCTION ensure_single_default_address();
