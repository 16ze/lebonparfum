"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * createClient - Crée un client Supabase pour les Client Components
 *
 * Utilisation :
 *   const supabase = createClient();
 *   const { data } = await supabase.from('products').select('*');
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

