# PRD: Imanisa Finance v2.0

## Vision

**Imanisa Finance** est une application de gestion patrimoniale familiale complète, permettant de suivre l'ensemble des actifs (comptes bancaires, investissements, immobilier, crypto) et passifs (crédits) de plusieurs membres d'une famille, avec synchronisation automatique des données depuis les sources bancaires.

## Objectifs

1. **Centralisation** : Vue unifiée de tout le patrimoine familial
2. **Automatisation** : Synchronisation automatique des soldes et transactions
3. **Analyse** : Suivi de performance, évolution du patrimoine, catégorisation des dépenses
4. **Fiabilité** : Données précises, import robuste, gestion des erreurs

## Utilisateurs

| Utilisateur | Description | Besoins |
|-------------|-------------|---------|
| Mathieu | Gestionnaire principal | Accès complet, configuration, import |
| Ninon | Co-gestionnaire | Vue patrimoine, transactions |
| Famille | Membres (Isaac, Joint, SCI) | Vue filtrée par propriétaire |

---

# EPIC 1: Infrastructure & Qualité

## US-001: Refactoring de la structure de données des comptes

**As a** développeur
**I want** une structure de données cohérente pour les comptes
**So that** le code soit maintenable et les données fiables

### Acceptance Criteria
- [ ] Tous les comptes utilisent le format `{source}-{accountNumber}` pour l'ID
- [ ] La colonne `source` est renseignée pour toutes les transactions
- [ ] Les comptes CE utilisent `bank_id = 'CE_PERSO'` ou `'CE_SCI'`
- [ ] Migration des données existantes sans perte
- [ ] Tests unitaires pour les repositories

### Technical Notes
- Sources: CE_PERSO, CE_SCI, BINANCE, BOURSE_DIRECT, REVOLUT
- Pattern ID: `{source.toLowerCase()}-{accountNumber}`

---

## US-002: Tests automatisés et CI/CD

**As a** développeur
**I want** une suite de tests et un pipeline CI
**So that** les régressions soient détectées avant merge

### Acceptance Criteria
- [ ] Configuration Vitest pour tests unitaires
- [ ] Tests pour les parsers CSV (CE, Binance, Revolut)
- [ ] Tests pour les calculs de P&L
- [ ] Tests pour les repositories SQLite
- [ ] GitHub Actions workflow pour CI
- [ ] Coverage report minimum 60%

### Quality Gates
```bash
bun run test
bun run typecheck
bun run lint
```

---

## US-003: Logging et monitoring

**As a** administrateur
**I want** des logs structurés et du monitoring
**So that** je puisse diagnostiquer les problèmes

### Acceptance Criteria
- [ ] Logger centralisé avec niveaux (debug, info, warn, error)
- [ ] Logs structurés JSON en production
- [ ] Contexte de requête (request ID, user ID)
- [ ] Rotation des logs (7 jours)
- [ ] Endpoint `/api/health` enrichi avec métriques

---

# EPIC 2: Synchronisation Bancaire

## US-010: Amélioration du scraper Caisse d'Épargne

**As a** utilisateur
**I want** une synchronisation CE fiable et automatique
**So that** mes comptes soient toujours à jour

### Acceptance Criteria
- [ ] Téléchargement CSV automatique (au lieu du parsing HTML)
- [ ] Détection du fichier téléchargé dans ~/Downloads
- [ ] Parser CSV robuste avec toutes les colonnes CE
- [ ] Gestion 2FA avec notification Telegram et retry auto
- [ ] Historique jusqu'à 2 ans disponible
- [ ] Fallback sur HTML si CSV échoue

### Technical Notes
- Format CSV CE: `Date de comptabilisation;Libelle simplifie;...;Debit;Credit;...`
- Fichiers nommés: `{accountNumber}_{startDate}_{endDate}.csv`

---

## US-011: Synchronisation multi-comptes CE

**As a** utilisateur
**I want** synchroniser tous mes comptes CE en une fois
**So that** je n'aie pas à lancer plusieurs syncs manuels

### Acceptance Criteria
- [ ] Endpoint `/api/scraper/ce-perso/sync-all`
- [ ] Sync séquentiel de tous les comptes configurés dans constants.ts
- [ ] Rapport de sync par compte (succès/échec/transactions)
- [ ] Skip des comptes déjà synchronisés récemment (< 1h)
- [ ] Notification Telegram avec résumé global

---

## US-012: Import CSV manuel amélioré

**As a** utilisateur
**I want** importer des CSV manuellement via l'interface
**So that** je puisse rattraper l'historique ou importer d'autres banques

### Acceptance Criteria
- [ ] Page `/import` avec drag & drop de fichiers
- [ ] Détection automatique du type de fichier (CE, Revolut, etc.)
- [ ] Preview des transactions avant import
- [ ] Sélection du compte cible
- [ ] Rapport d'import (nouvelles, doublons, erreurs)
- [ ] Support multi-fichiers

---

## US-013: Synchronisation Binance améliorée

**As a** utilisateur
**I want** un P&L Binance précis et complet
**So that** je connaisse ma performance crypto réelle

### Acceptance Criteria
- [ ] Import automatique de l'historique Convert (30 derniers jours)
- [ ] Import des achats par carte (Fiat Payments)
- [ ] Import des trades C2C
- [ ] Import des récompenses Simple Earn
- [ ] Calcul du PRU par asset avec FIFO
- [ ] Affichage P&L réalisé vs non réalisé

---

# EPIC 3: Interface Utilisateur

## US-020: Dashboard redesign

**As a** utilisateur
**I want** un dashboard clair et informatif
**So that** je comprenne ma situation financière en un coup d'œil

### Acceptance Criteria
- [ ] KPIs en haut: Patrimoine net, variation période, cash disponible
- [ ] Graphique évolution patrimoine (responsive, touch-friendly)
- [ ] Répartition par classe d'actifs (doughnut)
- [ ] Répartition par propriétaire (si multi-owner actif)
- [ ] Top 5 plus/moins values positions
- [ ] Prochaines échéances (crédits, récurrents)

---

## US-021: Page Comptes améliorée

**As a** utilisateur
**I want** voir tous mes comptes avec leurs détails
**So that** je puisse suivre chaque compte individuellement

### Acceptance Criteria
- [ ] Liste des comptes groupés par banque
- [ ] Solde actuel + variation depuis dernier sync
- [ ] Indicateur de fraîcheur des données (last sync)
- [ ] Bouton sync individuel par compte
- [ ] Accès rapide aux transactions du compte
- [ ] Total par type (courant, épargne, investissement)

---

## US-022: Page Transactions avec filtres avancés

**As a** utilisateur
**I want** explorer mes transactions avec des filtres puissants
**So that** je puisse analyser mes dépenses

### Acceptance Criteria
- [ ] Filtres: période, compte, catégorie, montant min/max, recherche texte
- [ ] Tri: date, montant, catégorie
- [ ] Pagination performante (50 par page)
- [ ] Export CSV filtré
- [ ] Édition de catégorie inline
- [ ] Marquage récurrent (détection automatique + manuel)

---

## US-023: Page Investissements avec P&L détaillé

**As a** utilisateur
**I want** voir mes positions avec leur performance
**So that** je suive mes investissements

### Acceptance Criteria
- [ ] Liste positions groupées par type (Actions, ETF, Crypto, Fonds)
- [ ] Pour chaque position: quantité, PRU, prix actuel, valeur, P&L €, P&L %
- [ ] Graphique répartition du portefeuille
- [ ] Historique des ordres par position
- [ ] Refresh prix manuel
- [ ] Total portefeuille avec P&L global

---

## US-024: Page Crédits avec simulation

**As a** utilisateur
**I want** gérer mes crédits et simuler des remboursements
**So that** j'optimise mon endettement

### Acceptance Criteria
- [ ] Liste des crédits avec détails (taux, mensualité, restant)
- [ ] Tableau d'amortissement interactif
- [ ] Simulation remboursement anticipé
- [ ] Calcul économie d'intérêts
- [ ] Graphique évolution capital restant dû
- [ ] Alerte échéances à venir

---

## US-025: Page Immobilier

**As a** utilisateur
**I want** suivre mes biens immobiliers
**So that** je connaisse la valeur de mon patrimoine immo

### Acceptance Criteria
- [ ] Liste des biens avec valeur estimée
- [ ] Lien avec crédit associé
- [ ] Calcul rendement locatif (si applicable)
- [ ] Historique des valeurs estimées
- [ ] Formulaire ajout/édition bien
- [ ] Photo du bien (optionnel)

---

# EPIC 4: Analyse & Reporting

## US-030: Catégorisation automatique des transactions

**As a** utilisateur
**I want** que mes transactions soient catégorisées automatiquement
**So that** je n'aie pas à le faire manuellement

### Acceptance Criteria
- [ ] Règles de catégorisation par mot-clé (configurable)
- [ ] Apprentissage des corrections manuelles
- [ ] Catégories hiérarchiques (Alimentation > Supermarché)
- [ ] Import/export des règles
- [ ] Suggestions de catégorie si incertain
- [ ] Batch re-catégorisation

---

## US-031: Budget mensuel

**As a** utilisateur
**I want** définir et suivre un budget mensuel
**So that** je contrôle mes dépenses

### Acceptance Criteria
- [ ] Définition budget par catégorie
- [ ] Vue comparaison budget vs réel
- [ ] Alertes dépassement (Telegram + in-app)
- [ ] Graphique barres budget/réel par catégorie
- [ ] Report du non-consommé (optionnel)
- [ ] Historique des mois précédents

---

## US-032: Rapport patrimonial PDF

**As a** utilisateur
**I want** générer un rapport PDF de mon patrimoine
**So that** je puisse l'archiver ou le partager

### Acceptance Criteria
- [ ] Sélection de la période
- [ ] Sections: Synthèse, Comptes, Investissements, Immobilier, Crédits
- [ ] Graphiques inclus (évolution, répartition)
- [ ] Format A4, design professionnel
- [ ] Génération côté serveur (puppeteer ou similaire)
- [ ] Téléchargement depuis l'interface

---

## US-033: Snapshots patrimoine automatiques

**As a** utilisateur
**I want** un historique de mon patrimoine
**So that** je puisse voir son évolution dans le temps

### Acceptance Criteria
- [ ] Snapshot quotidien automatique (cron)
- [ ] Stockage dans `net_worth_snapshots`
- [ ] Granularité: jour, semaine, mois, année
- [ ] Agrégation intelligente (garder jour pour 30j, semaine pour 1an, mois après)
- [ ] API pour récupérer l'historique avec période

---

# EPIC 5: Notifications & Automatisation

## US-040: Centre de notifications in-app

**As a** utilisateur
**I want** voir les notifications dans l'application
**So that** je n'aie pas besoin de Telegram

### Acceptance Criteria
- [ ] Table `notifications` en base
- [ ] Types: sync, alerte, info
- [ ] Icône avec badge dans la navbar
- [ ] Liste des notifications récentes
- [ ] Marquer comme lu
- [ ] Paramètres de notification par type

---

## US-041: Scheduler configurable

**As a** utilisateur
**I want** configurer les synchronisations automatiques
**So that** elles s'exécutent quand je veux

### Acceptance Criteria
- [ ] Page `/settings/scheduler`
- [ ] Configuration cron par source (CE, Binance, Prix)
- [ ] Activation/désactivation par source
- [ ] Historique des exécutions
- [ ] Prochaine exécution prévue
- [ ] Bouton "Exécuter maintenant"

---

## US-042: Alertes personnalisées

**As a** utilisateur
**I want** définir des alertes sur mon patrimoine
**So that** je sois notifié des événements importants

### Acceptance Criteria
- [ ] Alerte solde compte < seuil
- [ ] Alerte variation patrimoine > X%
- [ ] Alerte prix crypto atteint cible
- [ ] Alerte échéance crédit proche
- [ ] Alerte dépense inhabituelle
- [ ] Canal: Telegram et/ou in-app

---

# EPIC 6: Multi-utilisateur & Sécurité

## US-050: Authentification améliorée

**As a** utilisateur
**I want** une authentification sécurisée
**So that** mes données soient protégées

### Acceptance Criteria
- [ ] Login par email/password avec hash bcrypt
- [ ] Session JWT avec refresh token
- [ ] Déconnexion sur tous les appareils
- [ ] Historique des connexions
- [ ] 2FA optionnel (TOTP)
- [ ] Rate limiting sur login

---

## US-051: Gestion des propriétaires

**As a** administrateur
**I want** gérer les propriétaires (membres famille)
**So that** je puisse attribuer les comptes correctement

### Acceptance Criteria
- [ ] Page `/settings/owners`
- [ ] CRUD propriétaire (nom, type, couleur)
- [ ] Attribution compte → propriétaire
- [ ] Attribution transaction → propriétaire (optionnel)
- [ ] Filtrage global par propriétaire conservé

---

# EPIC 7: Mobile & PWA

## US-060: Application PWA

**As a** utilisateur mobile
**I want** accéder à l'app depuis mon téléphone
**So that** je consulte mon patrimoine n'importe où

### Acceptance Criteria
- [ ] Manifest PWA complet
- [ ] Service worker pour cache offline
- [ ] Icônes pour iOS et Android
- [ ] Écran de splash
- [ ] Installation "Add to Home Screen"
- [ ] Push notifications (Web Push API)

---

## US-061: Interface responsive complète

**As a** utilisateur mobile
**I want** une interface adaptée au mobile
**So that** l'expérience soit agréable sur petit écran

### Acceptance Criteria
- [ ] Navigation bottom bar sur mobile
- [ ] Graphiques touch-friendly
- [ ] Tableaux scrollables horizontalement
- [ ] Pull-to-refresh sur les listes
- [ ] Swipe actions sur les transactions
- [ ] Modales full-screen sur mobile

---

# Priorisation

## Phase 1 - Fondations (Sprint 1-2)
- US-001: Refactoring structure données
- US-002: Tests et CI/CD
- US-010: Scraper CE amélioré
- US-020: Dashboard redesign

## Phase 2 - Core Features (Sprint 3-4)
- US-011: Sync multi-comptes CE
- US-012: Import CSV manuel
- US-021: Page Comptes
- US-022: Page Transactions

## Phase 3 - Investissements (Sprint 5-6)
- US-013: Sync Binance amélioré
- US-023: Page Investissements
- US-033: Snapshots automatiques

## Phase 4 - Analyse (Sprint 7-8)
- US-030: Catégorisation auto
- US-031: Budget mensuel
- US-024: Page Crédits

## Phase 5 - Polish (Sprint 9-10)
- US-040: Notifications in-app
- US-041: Scheduler configurable
- US-060: PWA
- US-061: Responsive

## Phase 6 - Avancé (Backlog)
- US-003: Logging monitoring
- US-025: Page Immobilier
- US-032: Rapport PDF
- US-042: Alertes personnalisées
- US-050: Auth améliorée
- US-051: Gestion propriétaires

---

# Quality Gates (pour chaque US)

```bash
# Avant de marquer une story comme complete:
bun run typecheck    # Pas d'erreurs TypeScript
bun run lint         # Pas d'erreurs ESLint
bun run test         # Tests passent
bun run build        # Build réussit
```

---

# Notes Techniques

## Stack
- **Frontend**: SvelteKit 5, Svelte 5 runes, TailwindCSS (à migrer)
- **Backend**: SvelteKit API routes, better-sqlite3
- **Scraping**: agent-browser (Playwright)
- **Notifications**: Telegram Bot API, Web Push
- **CI/CD**: GitHub Actions

## Contraintes
- Pas de framework CSS lourd (garder léger)
- SQLite uniquement (pas de migration vers Postgres prévue)
- Read-only pour APIs externes (Binance)
- Session browser persistante pour CE (éviter re-login)

## Patterns
- Domain-Driven Design pour le backend
- Repository pattern pour la persistence
- Result type pour la gestion d'erreurs
- Svelte 5 runes pour la réactivité
