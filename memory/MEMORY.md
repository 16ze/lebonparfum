# Le Bon Parfum — Mémoire Projet

## Stack
Next.js 16 (App Router, Turbopack), TypeScript strict, Tailwind CSS, Supabase, Stripe, GSAP + Lenis, Resend, Upstash Redis, Sentry.

## Conventions clés
- Style Byredo : noir/blanc, flat, 1px borders, uppercase tracking, zero box-shadow
- `clsx` + `tailwind-merge` pour classes conditionnelles
- GSAP avec `gsap.context()` obligatoire pour cleanup React
- Server Components par défaut

## Worktree
- Worktree : `.claude/worktrees/loving-wilson` → branch `claude/loving-wilson`
- `node_modules` dans le repo principal `/Users/bryandev/Documents/lebonparfum/`
- `.env.local` : symlink vers le repo principal (créé lors du fix des erreurs)
- `turbopack.root` pointe vers `../../..` (repo principal) dans `next.config.ts`
- `middleware.ts` renommé `proxy.ts` (convention Next.js 16)

## TODO — À faire (priorité)
1. ✅ **Stripe montant côté serveur** — 100% server-side confirmé. `/api/confirm-order` (dead code dangereux) supprimé. `country` hardcode corrigé dans `PaymentForm.tsx`. `Map<string,any>` → typé dans webhook.
2. 🟠 **Upstash Redis ENOTFOUND** — l'instance `eminent-horse-27385.upstash.io` ne répond plus. Recréer sur upstash.com et mettre à jour `.env.local` avec les nouvelles URLs. Nécessaire pour le rate limiting en production multi-instance.
3. ✅ **npm audit** — 0 vulnérabilités après `npm audit fix` + `npm audit fix --force`. `@react-email/components` mis à jour 0.0.28→1.0.8. `@react-email/html` (inutilisé) supprimé. Templates email adaptés (style array → spread).
4. ✅ **CSP audit** — `next.config.ts` mis à jour : `default-src 'self'`, `unsafe-eval` dev-only, `blob:` img-src, `q.stripe.com` connect-src, `worker-src`, Permissions-Policy modernisée.
5. ✅ **Dependabot** — `.github/dependabot.yml` créé : scan npm hebdomadaire (lundi 08h Paris), groupes par écosystème (next, react, supabase, stripe, sentry, react-email, animation, dev-tooling). Major bumps ignorés automatiquement.

## Corrections appliquées (session 2026-02-27)
- Symlink `.env.local` worktree → repo principal
- `next.config.ts` : `images.qualities: [75, 90]`, `allowedDevOrigins`, `turbopack.root`, suppression `disableLogger` (deprecated Sentry)
- `middleware.ts` → `proxy.ts`, fonction `middleware` → `proxy`
- `utils/supabase/server.ts` : guard explicite env vars avec message clair
- `proxy.ts` : erreurs réseau Upstash (`ENOTFOUND`) silencieuses via flag module-level `upstashWarningLogged`
