# YouNew — Boutique en ligne + Admin + Ozon Express

Boutique e-commerce (paiement à la livraison) pour vendre via les pubs Facebook / Instagram / TikTok,
avec un espace admin pour gérer les commandes et l'envoi automatique chez **Ozon Express**.

## Fonctionnalités

**Boutique (clients)**
- Collections (menu), fiches produits avec photos, tailles, couleurs, prix barré
- Formulaire de commande rapide en darija (nom, téléphone, ville, adresse) — pas de compte à créer
- Bouton WhatsApp flottant (0679061167) + page de remerciement avec confirmation WhatsApp
- Détection automatique de la source : Facebook, Instagram, TikTok, Google (utm_source / fbclid / referrer)

**Admin (`/admin`)**
- Commandes : filtres Aujourd'hui / Hier / 7 jours / Ce mois / Mois dernier / Tout
- Statistiques : total, en attente, confirmées, chez Ozon, livrées, taux de livraison, chiffre d'affaires
- Répartition par source (quelle pub ramène des commandes qui sont vraiment livrées)
- Changement de statut rapide, confirmation par WhatsApp en 1 clic, appel
- **Confirmer & envoyer à Ozon** en 1 clic → numéro de suivi automatique
- Mise à jour automatique des statuts depuis Ozon (Livrée, Retournée, Refusée...)
- Commande manuelle (clients WhatsApp / DM), produits, collections, numéros bloqués, anti-doublon

## Cycle d'une commande

`En attente` → (tu appelles/WhatsApp le client) → `Confirmée` → **Envoyer à Ozon** → `Envoyée à Ozon`
→ `En cours de livraison` → `Livrée` / `Refusée` / `Retournée`  (ou `Injoignable` / `Annulée` avant l'envoi)

## Installation

```bash
npm install
cp .env.example .env      # puis modifie les valeurs (mot de passe admin, clés Ozon...)
npm run setup             # crée la base de données + produits d'exemple
npm run dev               # http://localhost:3000  — admin : http://localhost:3000/admin
```

Production : `npm run build && npm start` (sur un VPS avec Node 20+, derrière Nginx + HTTPS).

## Ozon Express

1. Espace client Ozon Express → rubrique API → récupère **Customer ID** et **API Key**
2. Mets-les dans `.env` (`OZON_CUSTOMER_ID`, `OZON_API_KEY`) et redémarre
3. Cron toutes les heures : `GET https://ton-site.ma/api/ozon/sync?key=CRON_SECRET`

Tout le code Ozon est dans `lib/ozon.ts` (création de colis, suivi, liste des villes).
