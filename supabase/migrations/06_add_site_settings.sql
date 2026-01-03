-- Migration: Ajouter table site_settings pour les paramètres du site
-- Description: Stocke les liens réseaux sociaux et autres paramètres globaux

CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Trigger pour updated_at
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON site_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insérer les valeurs par défaut pour les réseaux sociaux
INSERT INTO site_settings (setting_key, setting_value) VALUES
  ('social_instagram', ''),
  ('social_facebook', ''),
  ('social_twitter', ''),
  ('social_tiktok', ''),
  ('social_youtube', '')
ON CONFLICT (setting_key) DO NOTHING;

-- RLS : Seuls les admins peuvent modifier
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read site settings"
ON site_settings FOR SELECT
TO public
USING (true);

CREATE POLICY "Admin can update site settings"
ON site_settings FOR UPDATE
TO authenticated
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
);

-- Commentaire
COMMENT ON TABLE site_settings IS 'Paramètres globaux du site (réseaux sociaux, etc.)';
