# Templates Email React Email

Ce dossier contient les templates d'email utilisant React Email pour un rendu HTML optimisé.

## Installation

Pour utiliser les templates React Email, installez les dépendances suivantes :

```bash
npm install @react-email/components @react-email/html
```

## Structure

- `OrderConfirmationTemplate.tsx` : Template de confirmation de commande style Byredo

## Utilisation

Les templates sont utilisés via `lib/resend.ts` qui rend les composants React en HTML avant l'envoi via Resend.
