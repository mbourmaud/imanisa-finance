# 💰 Imanisa Finance

Un tracker de patrimoine personnel, sans fioritures. Auto-hébergé, open source, respectueux de ta vie privée.

## Fonctionnalités

- **Synchro bancaire automatique** via GoCardless (Caisse d'Épargne, CIC, Revolut)
- **Import CSV** pour Bourse Direct et Linxea
- **Prix en temps réel** via Yahoo Finance
- **Dashboard simple** avec vue globale du patrimoine
- **Historique** du patrimoine dans le temps

## Stack

- **Frontend**: SvelteKit 5
- **Backend**: SvelteKit (API routes)
- **Base de données**: SQLite (better-sqlite3)
- **Synchro bancaire**: GoCardless Bank Account Data API
- **Prix**: Yahoo Finance API (non officielle)

## Installation

### Prérequis

- Node.js 20+
- npm ou pnpm

### Setup

```bash
# Clone le repo
git clone git@github.com:YOUR_USERNAME/imanisa-finance.git
cd imanisa-finance

# Installe les dépendances
npm install

# Crée le dossier data
mkdir -p data

# Lance en dev
npm run dev
```

L'app sera accessible sur http://localhost:5173

### Configuration GoCardless

1. Crée un compte sur [GoCardless Bank Account Data](https://bankaccountdata.gocardless.com/) (gratuit, 50 connexions)
2. Va dans "User secrets" et génère une clé
3. Dans l'app, va dans ⚙️ Config et entre tes credentials
4. Connecte tes banques !

### Import des positions (Bourse Direct / Linxea)

1. Exporte tes positions en CSV depuis ton broker
2. Dans l'app, va dans 📥 Import CSV
3. Upload ton fichier, les positions sont importées automatiquement

## Synchronisation automatique (Cron)

Pour une synchro automatique, ajoute ces lignes à ton crontab (`crontab -e`) :

```cron
# Synchro bancaire tous les jours à 7h
0 7 * * * cd /path/to/imanisa-finance && node scripts/sync-banks.js >> /var/log/imanisa-sync.log 2>&1

# Mise à jour des prix tous les jours à 18h (après clôture)
0 18 * * 1-5 cd /path/to/imanisa-finance && node scripts/sync-prices.js >> /var/log/imanisa-prices.log 2>&1
```

## Déploiement en production

### Docker (recommandé)

La méthode la plus simple pour déployer l'application sur VPS, Raspberry Pi, ou PC local.

```bash
# Clone le repo
git clone git@github.com:YOUR_USERNAME/imanisa-finance.git
cd imanisa-finance

# Copie le fichier d'environnement
cp .env.example .env

# Configure tes variables d'environnement
nano .env

# Lance avec Docker Compose
docker compose up -d

# Vérifie les logs
docker compose logs -f
```

L'app sera accessible sur http://localhost:3000

#### Variables d'environnement Docker

| Variable | Description | Requis |
|----------|-------------|--------|
| `AUTH_SECRET` | Secret pour les sessions | ✅ |
| `PUBLIC_BASE_URL` | URL publique de l'app | ❌ (défaut: http://localhost:3000) |
| `TELEGRAM_BOT_TOKEN` | Token du bot Telegram | ❌ |
| `TELEGRAM_CHAT_ID` | ID du chat Telegram | ❌ |
| `BINANCE_API_KEY` | Clé API Binance | ❌ |
| `BINANCE_API_SECRET` | Secret API Binance | ❌ |
| `SCRAPER_CRON` | Planning du scraper (cron) | ❌ (défaut: 0 8 * * 1) |

#### Mise à jour

```bash
# Pull les derniers changements
git pull

# Rebuild et relance
docker compose up -d --build
```

#### Sauvegarde

Les données sont persistées dans le dossier `./data`. Pour sauvegarder :

```bash
# Sauvegarde la base de données
cp data/imanisa.db backup/imanisa-$(date +%Y%m%d).db
```

### Node.js (sans Docker)

```bash
# Build
npm run build

# Lance avec Node
node build

# Ou avec PM2
pm2 start build/index.js --name imanisa-finance
```

### Variables d'environnement

```bash
# Port (défaut: 3000)
PORT=3000

# Chemin de la base de données (défaut: ./data/imanisa.db)
DB_PATH=/path/to/imanisa.db
```

## Banques supportées

| Banque | Support | Historique |
|--------|---------|------------|
| Caisse d'Épargne Bretagne-Pays de Loire | ✅ GoCardless | 90 jours |
| CIC | ✅ GoCardless | 90 jours |
| Revolut | ✅ GoCardless | 730 jours |
| Bourse Direct | 📥 Import CSV | - |
| Linxea | 📥 Import CSV | - |

## Structure du projet

```
imanisa-finance/
├── src/
│   ├── lib/
│   │   ├── db.js           # Database utilities
│   │   ├── schema.sql      # SQLite schema
│   │   ├── gocardless.js   # GoCardless API client
│   │   ├── prices.js       # Yahoo Finance price fetching
│   │   └── csv-import.js   # CSV parsing for brokers
│   └── routes/
│       ├── +page.svelte    # Dashboard
│       ├── import/         # CSV import page
│       ├── settings/       # GoCardless config
│       └── api/            # API endpoints
├── scripts/
│   ├── sync-banks.js       # Cron script for bank sync
│   └── sync-prices.js      # Cron script for price updates
└── data/
    └── imanisa.db          # SQLite database
```

## API Endpoints

- `GET /api/dashboard` - Données complètes du dashboard
- `POST /api/sync` - Synchro manuelle des banques
- `GET /api/gocardless?action=institutions` - Liste des banques
- `GET /api/gocardless?action=connect&institution_id=XXX` - Lien de connexion
- `POST /api/import` - Import CSV (multipart/form-data)
- `POST /api/prices` - Mise à jour des prix
- `GET /api/prices?action=search&q=XXX` - Recherche de symbole

## Limitations

- Pas d'agrégation automatique pour Bourse Direct et Linxea (pas d'API disponible)
- GoCardless gratuit limité à 50 connexions
- Rafraîchissement GoCardless tous les 90 jours (il faut se reconnecter)
- Pas de multi-utilisateurs (c'est un outil perso !)

## Sécurité

- Toutes les données restent en local (SQLite)
- Les credentials GoCardless sont stockés dans la base
- **Ne pas exposer l'app sur Internet** sans authentification !

Pour ajouter une auth basique, tu peux utiliser un reverse proxy (nginx/Caddy) avec HTTP Basic Auth.

## Licence

MIT - Fais-en ce que tu veux !
