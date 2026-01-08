# 🔧 Correction : Command Line Tools obsolètes

## ❌ Problème rencontré

Lors de l'installation de Stripe CLI, vous avez rencontré l'erreur :

```
Error: Your Command Line Tools are too outdated.
Update them from Software Update in System Settings.
```

## ✅ Solution

Les Command Line Tools Xcode doivent être mis à jour avant d'installer Stripe CLI.

### Option 1 : Via System Settings (Recommandé)

1. **Ouvrez System Settings** (Réglages Système)
2. Allez dans **General** (Général) > **Software Update** (Mise à jour logicielle)
3. Installez toutes les mises à jour disponibles
4. Redémarrez si demandé

### Option 2 : Réinstallation complète

Si l'option 1 ne fonctionne pas, réinstallez les Command Line Tools :

```bash
sudo rm -rf /Library/Developer/CommandLineTools
sudo xcode-select --install
```

Une fenêtre s'ouvrira pour télécharger et installer les outils.

### Option 3 : Téléchargement manuel

1. Allez sur : https://developer.apple.com/download/all/
2. Recherchez : **"Command Line Tools for Xcode 26.0"**
3. Téléchargez et installez le package `.dmg`

---

## 🔄 Après la mise à jour

Une fois les Command Line Tools mis à jour, relancez :

```bash
./scripts/install-stripe.sh
```

Ou installez directement :

```bash
brew install stripe/stripe-cli/stripe
```

---

## 🚀 Script d'aide

Un script est disponible pour vous guider :

```bash
./scripts/update-xcode-tools.sh
```

Ce script vous donnera des instructions détaillées selon votre situation.

---

## ✅ Vérification

Pour vérifier que les outils sont à jour :

```bash
xcode-select -p
```

Cela devrait afficher le chemin vers les outils installés.

