# PRD: imanisa-finance - Self-Hosting & Automated Data Scraping

## 1. Overview

### 1.1 Problem Statement
L'application imanisa-finance nécessite actuellement une mise à jour manuelle des données financières chaque mois via import CSV. Cette tâche répétitive est chronophage et source d'erreurs.

### 1.2 Solution
Implémenter un système de scraping automatisé via Docker pour récupérer les données des différentes plateformes financières, avec notifications Telegram pour le suivi.

### 1.3 Users
- Utilisateur principal : Toi et ta femme
- Usage : Consultation du patrimoine familial (comptes bancaires, investissements, prêts immobiliers)

---

## 2. Goals & Success Metrics

### 2.1 Goals
1. **Automatisation** : Réduire le temps de mise à jour manuelle de ~30min/mois à ~0
2. **Fiabilité** : Système de retry et notifications pour garantir la fraîcheur des données
3. **Flexibilité** : Déploiement Docker agnostique (VPS, Raspberry Pi, PC local)

### 2.2 Success Metrics
| Metric | Target |
|--------|--------|
| Temps de mise à jour manuelle | < 5 min/mois (intervention 2FA uniquement) |
| Taux de succès des scrapes | > 90% |
| Freshness des données | < 7 jours de retard max |

---

## 3. Scope

### 3.1 In Scope (MVP) - Binance uniquement
- [x] Configuration Docker pour déploiement agnostique
- [x] Scraper Binance (via API officielle)
- [x] Déclenchement manuel via UI
- [x] Cron job automatique configurable
- [x] Notifications Telegram (succès/échec)
- [ ] Dashboard affichant la date de dernière mise à jour par source
- [x] Système de retry (3 tentatives max)
- [x] Setup Telegram Bot (guide inclus)

### 3.2 Phase 2 - Caisse d'Épargne
- [ ] Scraper Caisse d'Épargne Perso (Playwright)
- [ ] Scraper Caisse d'Épargne SCI (login séparé)
- [ ] Gestion auth mixte (parfois validation mobile requise)
- [ ] Notification "🔐 Validation manuelle requise" + retry auto

### 3.3 Phase 3 (Post-MVP)
- [ ] Scraper Bourse Direct (PEA)
- [ ] Scraper Linxea (Assurance Vie)
- [ ] Scraper CIC
- [ ] Scraper Crédit Mutuel

### 3.4 Out of Scope
- Application mobile native
- Multi-tenancy / autres utilisateurs
- Synchronisation temps réel
- Hébergement Freebox Pop (non supporté)

---

## 4. Technical Architecture

### 4.1 Deployment (Docker Agnostique)

```
┌─────────────────────────────────────────┐
│        Host (VPS / RPi / PC)            │
│  ┌─────────────────────────────────┐    │
│  │     Docker Container            │    │
│  │  ┌───────────┐ ┌─────────────┐  │    │
│  │  │ SvelteKit │ │  Scraper    │  │    │
│  │  │   App     │ │  Service    │  │    │
│  │  └───────────┘ └─────────────┘  │    │
│  │        │              │         │    │
│  │  ┌─────┴──────────────┴─────┐   │    │
│  │  │     SQLite Database      │   │    │
│  │  └──────────────────────────┘   │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
         │
         ▼
   Telegram Bot API
```

### 4.2 Tech Stack
| Component | Technology |
|-----------|------------|
| App | SvelteKit (existant) |
| Scraper MVP | Node.js + Binance API |
| Scraper Phase 2 | Node.js + Playwright |
| Database | SQLite (existant) |
| Container | Docker + docker-compose |
| Scheduler | node-cron |
| Notifications | Telegram Bot API |
| Credentials | Variables d'environnement (fichier `.env`) |
| **Tests E2E** | **agent-browser (Vercel Labs)** |

---

## 5. Validation & Testing Strategy

### 5.1 Approche de Validation avec agent-browser

Tous les tests E2E sont réalisés via **agent-browser** (CLI de Vercel Labs) au lieu de Playwright natif.

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Scénario de    │ -> │  Claude         │ -> │  agent-browser  │
│  test (PRD)     │    │  exécute via    │    │  pilote le      │
│                 │    │  CLI            │    │  navigateur     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 5.2 Critères de Validation

Un test E2E est **validé** quand les 3 conditions sont remplies :

| Critère | Description |
|---------|-------------|
| ✅ **Visuel OK** | L'interface affiche l'état attendu (vérifiable via snapshot agent-browser) |
| ✅ **API OK** | Les endpoints renvoient les données correctes |
| ✅ **Comportement OK** | Le flux utilisateur se déroule sans erreur |

### 5.3 agent-browser - Référence

**Installation :**
```bash
npm install -g @anthropic-ai/agent-browser
```

**Commandes principales :**
| Commande | Description |
|----------|-------------|
| `ab navigate <url>` | Naviguer vers une URL |
| `ab snapshot` | Capture l'arbre d'accessibilité de la page |
| `ab click <ref>` | Cliquer sur un élément par son ref |
| `ab type <ref> <text>` | Saisir du texte dans un champ |
| `ab screenshot [path]` | Prendre une capture d'écran |

**Workflow de test :**
1. Claude lit le scénario de test dans ce PRD
2. Claude exécute les commandes `agent-browser` via CLI
3. Claude valide les 3 critères (visuel, API, comportement)
4. La feature est marquée comme validée ou non

---

## 6. Functional Requirements

### 6.1 Scraper - Binance (API) - MVP
| ID | Requirement | Priority |
|----|-------------|----------|
| BIN-1 | Authentification via API Key + Secret | P0 |
| BIN-2 | Récupération balances Spot | P0 |
| BIN-3 | Récupération balances Earn/Staking | P1 |
| BIN-4 | Conversion en EUR (via prix spot) | P0 |
| BIN-5 | Export format compatible CSV existant | P0 |

### 6.2 Scraper - Caisse d'Épargne (Phase 2)
| ID | Requirement | Priority |
|----|-------------|----------|
| CE-1 | Login automatique (identifiant + mot de passe) | P0 |
| CE-2 | Gestion clavier virtuel (si présent) | P0 |
| CE-3 | Gestion auth mixte : détection validation mobile requise | P0 |
| CE-4 | Notification Telegram "🔐 Validation manuelle requise pour CE" | P0 |
| CE-5 | Retry automatique après 2-3 min post-validation | P0 |
| CE-6 | **2 comptes séparés** : CE Perso + CE SCI (logins différents) | P0 |

### 6.3 Notifications & Retry
| ID | Requirement | Priority |
|----|-------------|----------|
| NOT-1 | Bot Telegram dédié pour notifications | P0 |
| NOT-2 | Notification succès avec récap des montants | P0 |
| NOT-3 | Notification échec après 3 tentatives | P0 |
| RET-1 | 3 tentatives max, délai : 5min, 15min, 30min | P0 |

---

## 7. User Stories & Scénarios de Test

### 7.1 MVP - Binance

#### US-1 : Synchronisation automatique Binance
**User Story :** En tant qu'utilisateur, je veux que mes données Binance soient récupérées automatiquement chaque semaine afin de ne pas avoir à exporter manuellement.

**Scénario de test agent-browser :**
```
PRÉCONDITIONS:
- L'application est démarrée sur http://localhost:5173
- Les variables BINANCE_API_KEY et BINANCE_API_SECRET sont configurées
- Le cron est configuré pour s'exécuter

ÉTAPES:
1. Naviguer vers http://localhost:5173
2. Vérifier que le dashboard affiche les données Binance
3. Vérifier dans les logs que le cron s'est exécuté

RÉSULTAT ATTENDU:
- ✅ Visuel : Le dashboard affiche les balances Binance avec montants en EUR
- ✅ API : GET /api/health retourne { "lastSync": { "binance": "<date récente>" } }
- ✅ Comportement : Notification Telegram reçue avec récap des montants
```

---

#### US-2 : Synchronisation manuelle Binance
**User Story :** En tant qu'utilisateur, je veux pouvoir déclencher manuellement une synchronisation Binance depuis l'UI afin de forcer une mise à jour quand j'en ai besoin.

**Scénario de test agent-browser :**
```
PRÉCONDITIONS:
- L'application est démarrée sur http://localhost:5173
- Les credentials Binance sont configurés

ÉTAPES:
1. Naviguer vers http://localhost:5173
2. Prendre un snapshot pour identifier le bouton "Sync Binance"
3. Cliquer sur le bouton de synchronisation
4. Attendre le feedback visuel (spinner/loading)
5. Attendre la fin de la synchronisation

RÉSULTAT ATTENDU:
- ✅ Visuel : Bouton "Sync" visible, spinner pendant le chargement, confirmation après
- ✅ API : POST /api/scraper/binance/sync retourne { "success": true, "balances": [...] }
- ✅ Comportement : Les données affichées sont mises à jour, notification Telegram reçue
```

---

#### US-3 : Indicateur de fraîcheur des données
**User Story :** En tant qu'utilisateur, je veux voir la date de dernière mise à jour de chaque source afin de savoir si mes données sont à jour.

**Scénario de test agent-browser :**
```
PRÉCONDITIONS:
- L'application est démarrée sur http://localhost:5173
- Au moins une synchronisation Binance a été effectuée

ÉTAPES:
1. Naviguer vers http://localhost:5173
2. Prendre un snapshot de la page
3. Identifier l'indicateur "Last sync" pour Binance

RÉSULTAT ATTENDU:
- ✅ Visuel : Indicateur "Last sync: X days ago" ou "Last sync: aujourd'hui" visible
- ✅ API : GET /api/health retourne les dates de dernière synchronisation
- ✅ Comportement : Si > 7 jours, alerte visuelle (couleur orange/rouge)
```

---

#### US-4 : Notification d'échec
**User Story :** En tant qu'utilisateur, je veux être notifié sur Telegram en cas d'échec de synchronisation afin de pouvoir intervenir si nécessaire.

**Scénario de test agent-browser :**
```
PRÉCONDITIONS:
- L'application est démarrée
- Les credentials Binance sont INVALIDES (pour forcer l'échec)
- Le bot Telegram est configuré

ÉTAPES:
1. Appeler POST /api/scraper/binance/sync
2. Attendre les 3 tentatives de retry
3. Vérifier la notification Telegram

RÉSULTAT ATTENDU:
- ✅ Visuel : Message d'erreur affiché dans l'UI (si applicable)
- ✅ API : POST /api/scraper/binance/sync retourne { "success": false, "error": "..." }
- ✅ Comportement : Notification Telegram reçue avec détail de l'erreur après 3 échecs
```

---

### 7.2 Phase 2 - Caisse d'Épargne

#### US-5 : Synchronisation CE Perso et SCI
**User Story :** En tant qu'utilisateur, je veux que mes comptes CE Perso et CE SCI soient synchronisés automatiquement afin d'avoir une vue consolidée de mon patrimoine.

**Scénario de test agent-browser :**
```
PRÉCONDITIONS:
- L'application est démarrée
- Les credentials CE Perso et CE SCI sont configurés

ÉTAPES:
1. Naviguer vers http://localhost:5173
2. Déclencher la synchronisation CE Perso
3. Déclencher la synchronisation CE SCI
4. Vérifier les données affichées

RÉSULTAT ATTENDU:
- ✅ Visuel : Les comptes CE Perso et CE SCI apparaissent séparément dans le dashboard
- ✅ API : Les endpoints retournent les soldes des deux comptes
- ✅ Comportement : Deux notifications Telegram distinctes (une par compte)
```

---

#### US-6 : Notification validation mobile requise
**User Story :** En tant qu'utilisateur, je veux être notifié quand une validation mobile est requise afin de pouvoir débloquer le scraper rapidement.

**Scénario de test agent-browser :**
```
PRÉCONDITIONS:
- L'application est démarrée
- Le scraper CE détecte une demande de validation mobile

ÉTAPES:
1. Déclencher la synchronisation CE
2. Observer le comportement quand la validation mobile est demandée

RÉSULTAT ATTENDU:
- ✅ Visuel : Message "Validation mobile requise" dans l'UI
- ✅ API : Status "pending_2fa" retourné par l'endpoint
- ✅ Comportement : Notification Telegram "🔐 Validation manuelle requise pour CE"
```

---

#### US-7 : Retry automatique après validation mobile
**User Story :** En tant qu'utilisateur, je veux que le scraper retry automatiquement après ma validation mobile afin de ne pas avoir à relancer manuellement.

**Scénario de test agent-browser :**
```
PRÉCONDITIONS:
- Le scraper CE est en attente de validation mobile
- L'utilisateur a validé sur son mobile

ÉTAPES:
1. Simuler la validation mobile
2. Attendre le retry automatique (2-3 min)
3. Vérifier le succès de la synchronisation

RÉSULTAT ATTENDU:
- ✅ Visuel : Les données CE sont mises à jour dans le dashboard
- ✅ API : Sync réussie après le retry
- ✅ Comportement : Notification Telegram de succès avec récap des montants
```

---

## 8. Implementation Phases

### Phase 1: Infrastructure (MVP Foundation)
- [x] Configuration Docker & docker-compose
- [x] Setup Telegram Bot
- [x] Endpoint API pour trigger manuel
- [ ] UI : bouton refresh + indicateur freshness

### Phase 2: Binance Scraper (MVP)
- [x] Intégration API Binance (read-only)
- [x] Récupération balances Spot + Earn
- [x] Conversion EUR + Export CSV
- [x] Cron job automatique

### Phase 3: Caisse d'Épargne Scraper
- [ ] Setup Playwright dans Docker
- [ ] Gestion login + auth mixte
- [ ] Support 2 comptes : CE Perso + CE SCI

---

## 9. Guides Setup

### 9.1 Création Bot Telegram
1. Chercher `@BotFather` sur Telegram
2. Envoyer `/newbot` et suivre les instructions
3. Copier le token → `TELEGRAM_BOT_TOKEN`
4. Récupérer le chat_id via `https://api.telegram.org/bot<TOKEN>/getUpdates`

### 9.2 Variables d'environnement (.env)
```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
BINANCE_API_KEY=your_api_key_here
BINANCE_API_SECRET=your_api_secret_here
SCRAPER_CRON="0 8 5 * *"
```

### 9.3 Installation agent-browser (Tests E2E)
```bash
# Installation globale
npm install -g @anthropic-ai/agent-browser

# Démarrer le daemon
ab daemon

# Vérifier l'installation
ab navigate http://localhost:5173
ab snapshot
```

---

## 10. Decisions Log
| Decision | Rationale |
|----------|-----------|
| Hébergement agnostique | Freebox Pop ne supporte pas les VMs |
| MVP = Binance uniquement | API stable, valide l'infra d'abord |
| 2 comptes CE séparés | Logins différents Perso/SCI |
| Credentials en .env | Simple, standard pour usage personnel |
| **Tests E2E via agent-browser** | CLI optimisé pour agents IA, remplace Playwright pour les tests |
| **Scénarios de test dans le PRD** | Centralisation de la documentation et des critères d'acceptance |