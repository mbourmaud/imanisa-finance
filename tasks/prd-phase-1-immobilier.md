# PRD Phase 0+1 : Fondations & Module Immobilier

## Vision

**Imanisa Finance** est une application de gestion patrimoniale familiale. Cette première phase pose les fondations techniques et implémente le module immobilier complet.

## Objectifs Phase 0+1

1. **Migrer vers Turso** pour permettre le déploiement sur Vercel
2. **Implémenter le module immobilier** avec suivi des biens, prêts et charges
3. **Intégrer les données réelles** (3 biens de Mathieu + SCI IMANISA)

---

# Phase 0 : Fondations Techniques

## US-000 : Migration SQLite → Turso

**En tant que** développeur
**Je veux** migrer la base de données vers Turso
**Afin de** pouvoir déployer sur Vercel

### Tâches
- [ ] Créer la base Turso (`turso db create imanisa-finance`)
- [ ] Installer `@libsql/client`, supprimer `better-sqlite3`
- [ ] Créer `src/infrastructure/database/turso.ts` avec client async
- [ ] Migrer tous les appels `db.prepare().all()` → `await db.execute()`
- [ ] Configurer variables d'environnement (`TURSO_URL`, `TURSO_AUTH_TOKEN`)
- [ ] Tester en local avec Turso
- [ ] Exporter données SQLite existantes et importer dans Turso

### Critères d'acceptation
- [ ] L'app fonctionne en local avec Turso
- [ ] Toutes les fonctionnalités existantes marchent (sync CE, Binance, dashboard)
- [ ] Variables d'env configurées pour dev et prod

---

## US-001 : Déploiement Vercel

**En tant que** utilisateur
**Je veux** accéder à l'application en ligne
**Afin de** consulter mon patrimoine depuis n'importe où

### Tâches
- [ ] Créer projet Vercel lié au repo GitHub
- [ ] Configurer variables d'environnement sur Vercel
- [ ] Configurer le build SvelteKit (`adapter-vercel`)
- [ ] Premier déploiement
- [ ] Configurer domaine personnalisé (optionnel)

### Critères d'acceptation
- [ ] L'app est accessible sur `*.vercel.app`
- [ ] Les données Turso sont accessibles depuis Vercel
- [ ] CI/CD : chaque push sur main déclenche un déploiement

---

# Phase 1 : Module Immobilier

## Modèle de données

### Entités (personnes, SCI)

```sql
CREATE TABLE entities (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('person', 'sci', 'joint')),
    email TEXT,
    color TEXT,
    -- Champs SCI
    legal_name TEXT,
    siren TEXT,
    rcs TEXT,
    share_capital REAL,
    creation_date TEXT,
    address TEXT,
    tax_regime TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);
```

**Données initiales :**
| id | name | type | email | color |
|----|------|------|-------|-------|
| mathieu | Mathieu | person | mathieu.bourmaud@gmail.com | yellow |
| ninon | Ninon | person | ninon-loquet@outlook.fr | pink |
| sci-imanisa | SCI IMANISA | sci | - | blue |

### Parts SCI

```sql
CREATE TABLE entity_shares (
    id TEXT PRIMARY KEY,
    sci_id TEXT NOT NULL REFERENCES entities(id),
    holder_id TEXT NOT NULL REFERENCES entities(id),
    shares_count INTEGER NOT NULL,
    percentage REAL NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
);
```

**Données SCI IMANISA :**
| sci_id | holder_id | shares_count | percentage |
|--------|-----------|--------------|------------|
| sci-imanisa | mathieu | 500 | 50 |
| sci-imanisa | ninon | 500 | 50 |

### Biens immobiliers

```sql
CREATE TABLE properties (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('apartment', 'house', 'parking', 'land', 'commercial')),
    category TEXT NOT NULL CHECK (category IN ('primary_residence', 'rental_furnished', 'rental_unfurnished', 'secondary', 'sci')),

    -- Localisation
    address TEXT NOT NULL,
    city TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'France',

    -- Caractéristiques
    surface_m2 REAL,
    rooms INTEGER,
    floor INTEGER,
    dpe_rating TEXT CHECK (dpe_rating IN ('A','B','C','D','E','F','G')),

    -- Copropriété
    copro_name TEXT,
    copro_lots TEXT, -- JSON array
    copro_tantiemes INTEGER,
    syndic_name TEXT,

    -- Acquisition
    purchase_date TEXT,
    purchase_price REAL,
    notary_fees REAL,
    agency_fees REAL,
    renovation_costs REAL,

    -- Valeur actuelle
    estimated_value REAL,
    estimated_value_date TEXT,

    -- Location
    is_rented INTEGER DEFAULT 0,
    monthly_rent REAL,
    tenant_name TEXT,
    lease_start_date TEXT,

    -- Charges annuelles
    annual_copro_charges REAL,
    annual_property_tax REAL,

    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);
```

### Propriété des biens

```sql
CREATE TABLE property_ownership (
    id TEXT PRIMARY KEY,
    property_id TEXT NOT NULL REFERENCES properties(id),
    entity_id TEXT NOT NULL REFERENCES entities(id),
    percentage REAL NOT NULL DEFAULT 100,
    acquisition_date TEXT,
    acquisition_type TEXT CHECK (acquisition_type IN ('purchase', 'inheritance', 'donation', 'partition')),
    contribution REAL,
    created_at TEXT DEFAULT (datetime('now'))
);
```

### Prêts immobiliers

```sql
CREATE TABLE loans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    property_id TEXT REFERENCES properties(id),
    bank_name TEXT NOT NULL,
    loan_number TEXT,

    -- Paramètres
    principal_amount REAL NOT NULL,
    interest_rate REAL NOT NULL,
    duration_months INTEGER NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT,
    monthly_payment REAL NOT NULL,

    -- Assurance
    insurance_rate REAL,
    insurance_monthly REAL,

    -- État actuel
    current_balance REAL,
    current_balance_date TEXT,

    -- Compte lié pour matching
    linked_account_id TEXT,

    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);
```

### Responsabilité des prêts

```sql
CREATE TABLE loan_responsibility (
    id TEXT PRIMARY KEY,
    loan_id TEXT NOT NULL REFERENCES loans(id),
    entity_id TEXT NOT NULL REFERENCES entities(id),
    percentage REAL NOT NULL DEFAULT 100,
    created_at TEXT DEFAULT (datetime('now'))
);
```

### Charges récurrentes

```sql
CREATE TABLE property_charges (
    id TEXT PRIMARY KEY,
    property_id TEXT NOT NULL REFERENCES properties(id),
    type TEXT NOT NULL CHECK (type IN ('copro', 'tax', 'insurance', 'maintenance', 'other')),
    name TEXT NOT NULL,
    amount REAL NOT NULL,
    frequency TEXT NOT NULL CHECK (frequency IN ('monthly', 'quarterly', 'annual')),
    created_at TEXT DEFAULT (datetime('now'))
);
```

---

## US-010 : Schéma BDD Immobilier

**En tant que** développeur
**Je veux** créer les tables du module immobilier
**Afin de** stocker les données des biens et prêts

### Tâches
- [ ] Créer fichier migration `src/infrastructure/database/migrations/001_real_estate.sql`
- [ ] Exécuter la migration sur Turso
- [ ] Créer les types TypeScript correspondants
- [ ] Créer le repository `RealEstateRepository.ts`

### Critères d'acceptation
- [ ] Toutes les tables créées sur Turso
- [ ] Types TypeScript pour chaque entité
- [ ] CRUD basique fonctionnel

---

## US-011 : Import données Bien 1

**En tant que** utilisateur
**Je veux** voir mon premier bien dans l'application
**Afin de** valider que les données sont correctes

### Données à importer

**Bien 1 - Locatif meublé Rueil :**
| Champ | Valeur |
|-------|--------|
| id | rueil-republique |
| name | Appartement République |
| type | apartment |
| category | rental_furnished |
| address | 67-73 avenue de la République |
| city | Rueil-Malmaison |
| postal_code | 92500 |
| surface_m2 | 63.45 |
| rooms | 4 |
| floor | 2 |
| dpe_rating | E |
| copro_name | Les Nouveaux Martinets |
| copro_lots | ["352", "383"] |
| syndic_name | Loiselet & Daigremont |
| purchase_date | 2021-09-10 |
| purchase_price | 375000 |
| estimated_value | 375000 |
| is_rented | 0 |
| annual_copro_charges | 2000 |

**Prêt associé :**
| Champ | Valeur |
|-------|--------|
| id | loan-rueil |
| name | Prêt Modulimmo Rueil |
| bank_name | Crédit Mutuel Challans |
| loan_number | 15519 39050 00025097901 |
| principal_amount | 392621 |
| interest_rate | 1.09 |
| duration_months | 300 |
| start_date | 2021-10-05 |
| end_date | 2046-09-05 |
| monthly_payment | 1495.73 |
| current_balance | 331994.82 |

**Propriété :** 100% Mathieu (depuis partition 13/05/2022)

### Tâches
- [ ] Script d'import des données
- [ ] Vérifier l'intégrité des données importées

---

## US-012 : Dashboard Patrimoine Immobilier

**En tant que** utilisateur
**Je veux** voir un résumé de mon patrimoine immobilier
**Afin de** connaître ma situation en un coup d'œil

### Maquette

```
┌─────────────────────────────────────────────────────────┐
│  PATRIMOINE IMMOBILIER                                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Valeur totale│  │ Dette totale │  │ Equity nette │  │
│  │   375 000 €  │  │   331 995 €  │  │    43 005 €  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                         │
│  MES BIENS                                              │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 🏠 Appartement République          375 000 €    │   │
│  │    Rueil-Malmaison • 63m² • Non loué            │   │
│  │    Prêt: 331 995 € restant (1 496 €/mois)       │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Tâches
- [ ] Créer route `/immobilier`
- [ ] Composant `RealEstateDashboard.svelte`
- [ ] Composant `PropertyCard.svelte`
- [ ] API `/api/real-estate/summary`
- [ ] API `/api/real-estate/properties`

### Critères d'acceptation
- [ ] Affiche valeur totale, dette, equity
- [ ] Liste tous les biens avec infos clés
- [ ] Clic sur un bien → page détail

---

## US-013 : Page Détail d'un Bien

**En tant que** utilisateur
**Je veux** voir tous les détails d'un bien
**Afin de** suivre son évolution

### Maquette

```
┌─────────────────────────────────────────────────────────┐
│  ← Retour    APPARTEMENT RÉPUBLIQUE                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  INFORMATIONS                          VALEUR           │
│  ─────────────                         ──────           │
│  67-73 av. de la République            Achat: 375 000 € │
│  92500 Rueil-Malmaison                 Actuel: 375 000 €│
│  63,45 m² • 4 pièces • 2ème étage      +/- : 0 €       │
│  DPE: E                                                 │
│                                                         │
│  PRÊT IMMOBILIER                                        │
│  ─────────────────                                      │
│  Crédit Mutuel Challans • 1,09%                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Emprunté      │ Remboursé    │ Restant          │   │
│  │ 392 621 €     │ 60 626 €     │ 331 995 €        │   │
│  └─────────────────────────────────────────────────┘   │
│  Mensualité: 1 495,73 € • Fin: sept. 2046              │
│                                                         │
│  [Voir tableau d'amortissement]                         │
│                                                         │
│  CHARGES ANNUELLES                                      │
│  ─────────────────                                      │
│  Copropriété: 2 000 €/an                               │
│  Taxe foncière: -                                       │
│                                                         │
│  PROPRIÉTÉ                                              │
│  ──────────                                             │
│  100% Mathieu (depuis 13/05/2022 - Partage)            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Tâches
- [ ] Créer route `/immobilier/[id]`
- [ ] Composant `PropertyDetail.svelte`
- [ ] Composant `LoanSummary.svelte`
- [ ] API `/api/real-estate/properties/[id]`

---

## US-014 : Tableau d'Amortissement

**En tant que** utilisateur
**Je veux** voir le tableau d'amortissement de mon prêt
**Afin de** comprendre la répartition capital/intérêts

### Fonctionnalités
- Calcul automatique depuis les paramètres du prêt (pas d'import PDF)
- Affichage mois par mois : date, capital, intérêts, restant
- Highlight du mois actuel
- Total intérêts payés / à payer

### Tâches
- [ ] Fonction `calculateAmortizationSchedule(loan)`
- [ ] Composant `AmortizationTable.svelte`
- [ ] Route `/immobilier/[id]/amortissement` ou modale

---

## US-015 : Collecte et Import Bien 2 & 3

**En tant que** utilisateur
**Je veux** ajouter mes autres biens
**Afin d'** avoir une vue complète de mon patrimoine

### Tâches
- [ ] Collecter données Bien 2 (locatif loué) avec l'utilisateur
- [ ] Collecter données Bien 3 (résidence principale) avec l'utilisateur
- [ ] Importer dans la base de données
- [ ] Vérifier l'affichage sur le dashboard

---

# Phases Futures (Backlog)

> Ces phases seront détaillées dans des PRD séparés après validation de la Phase 1.

## Phase 2 : Synchronisation Bancaire
- Stabiliser scraper CE existant
- Ajouter CIC, CM, Linxea, Bourse Direct, Revolut
- Matching transactions ↔ échéances prêts

## Phase 3 : Investissements
- Binance (crypto P&L)
- Bourse Direct (PEA, CTO)
- Linxea (Assurance-vie)
- Bricks (crowdfunding immo)

## Phase 4 : Budget & Catégorisation
- Vues Mathieu / Ninon / Famille
- Catégorisation automatique
- Budgets mensuels avec alertes

## Phase 5 : Polish & PWA
- Interface responsive mobile
- PWA avec notifications push
- Alertes personnalisées

---

# Informations Techniques

## Stack
- **Frontend:** SvelteKit 5, Svelte 5 runes, TailwindCSS
- **Backend:** SvelteKit API routes
- **Base de données:** Turso (LibSQL)
- **Hébergement:** Vercel
- **Scraping:** agent-browser (Playwright)

## Quality Gates

```bash
bun run typecheck    # Pas d'erreurs TypeScript
bun run lint         # Pas d'erreurs ESLint
bun run build        # Build réussit
```

---

# Données de référence

## SCI IMANISA
- **RCS:** 989 290 879 Nanterre
- **SIREN:** 989 290 879
- **Capital:** 1 000 €
- **Création:** 19/07/2025
- **Adresse:** 21 Rue Gustave Charpentier, 92500 Rueil-Malmaison
- **Régime fiscal:** IR
- **Durée:** 99 ans
- **Parts:** 500 Mathieu (50%) + 500 Ninon (50%)
- **Gérants:** Mathieu + Ninon

## Bien 1 - Appartement République (Rueil)
- **Adresse:** 67-73 avenue de la République, 92500 Rueil-Malmaison
- **Type:** Appartement 4 pièces
- **Surface:** 63,45 m² Carrez
- **Étage:** 2ème, Bâtiment XI, Escalier D
- **Lots copro:** 352 (appart) + 383 (cave)
- **Copropriété:** Les Nouveaux Martinets
- **Syndic:** Loiselet & Daigremont
- **DPE:** E (247 kWh/m²/an)
- **Achat:** 10/09/2021 pour 375 000 €
- **Propriété:** 100% Mathieu (partage 13/05/2022)
- **Valeur estimée:** 375 000 €
- **Statut:** Non loué (locatif meublé)
- **Charges copro:** ~2 000 €/an

### Prêt Bien 1
- **Banque:** Crédit Mutuel Challans
- **Type:** PRET MODULIMMO
- **Numéro:** 15519 39050 00025097901
- **Montant:** 392 621 €
- **Taux:** 1,09% fixe
- **Durée:** 300 mois (25 ans)
- **Mensualité:** 1 495,73 €
- **Début:** 05/10/2021
- **Fin:** 05/09/2046
- **CRD actuel:** 331 994,82 € (au 15/01/2026)
