import { createClient } from "@supabase/supabase-js";

/**
 * createBuildClient - Crée un client Supabase pour le build (generateStaticParams, etc.)
 *
 * Cette fonction ne doit être utilisée QUE dans des contextes sans requête
 * (generateStaticParams, generateMetadata, etc.)
 *
 * Utilisation :
 *   const supabase = createBuildClient();
 *   const { data } = await supabase.from('products').select('*');
 */
export function createBuildClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}


