-- =====================================================
-- IMANISA FINANCE - Database Schema
-- =====================================================

-- Owners: personnes physiques, comptes joints, SCI
CREATE TABLE IF NOT EXISTS owners (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('person', 'joint', 'sci')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Users (pour auth, lié à un owner)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    owner_id TEXT,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (owner_id) REFERENCES owners(id)
);

-- Banks/Institutions (CE, CM, Bourse Direct, Binance, etc.)
CREATE TABLE IF NOT EXISTS banks (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    template TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Accounts (comptes courants, livrets, PEA, crypto wallets)
CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    bank_id TEXT NOT NULL,
    owner_id TEXT,
    name TEXT NOT NULL,
    account_number TEXT,
    type TEXT NOT NULL,
    asset_category TEXT NOT NULL DEFAULT 'LIQUIDITY',
    balance REAL NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'EUR',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (bank_id) REFERENCES banks(id) ON DELETE CASCADE,
    FOREIGN KEY (owner_id) REFERENCES owners(id)
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    account_id TEXT NOT NULL,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    currency TEXT NOT NULL DEFAULT 'EUR',
    description TEXT NOT NULL,
    description_clean TEXT,
    date TEXT NOT NULL,
    value_date TEXT,
    category TEXT,
    subcategory TEXT,
    reference TEXT,
    is_recurring INTEGER DEFAULT 0,
    imported_at TEXT NOT NULL,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

-- =====================================================
-- REAL ESTATE & LOANS (Legacy - kept for compatibility)
-- =====================================================

-- Biens immobiliers (legacy)
CREATE TABLE IF NOT EXISTS properties (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL,
    name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    postal_code TEXT,
    surface_m2 REAL,
    purchase_price REAL,
    purchase_date TEXT,
    notary_fees REAL,
    current_value REAL,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES owners(id)
);

-- Emprunts (legacy)
CREATE TABLE IF NOT EXISTS loans (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL,
    property_id TEXT,
    name TEXT NOT NULL,
    bank TEXT NOT NULL,
    loan_number TEXT,
    type TEXT NOT NULL DEFAULT 'mortgage' CHECK (type IN ('mortgage', 'consumer', 'family', 'other')),
    initial_amount REAL NOT NULL,
    remaining_amount REAL NOT NULL,
    rate REAL NOT NULL,
    monthly_payment REAL NOT NULL,
    insurance_monthly REAL DEFAULT 0,
    start_date TEXT,
    end_date TEXT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES owners(id),
    FOREIGN KEY (property_id) REFERENCES properties(id)
);

-- Tableau d'amortissement (legacy)
CREATE TABLE IF NOT EXISTS loan_schedule (
    id TEXT PRIMARY KEY,
    loan_id TEXT NOT NULL,
    date TEXT NOT NULL,
    payment REAL NOT NULL,
    principal REAL NOT NULL,
    interest REAL NOT NULL,
    insurance REAL DEFAULT 0,
    remaining REAL NOT NULL,
    FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE
);

-- =====================================================
-- REAL ESTATE MODULE (Enhanced)
-- =====================================================

-- Entities: personnes physiques, SCI, indivision
CREATE TABLE IF NOT EXISTS entities (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('person', 'sci', 'joint')),
    email TEXT,
    color TEXT,
    -- SCI-specific fields
    legal_name TEXT,
    siren TEXT,
    rcs TEXT,
    share_capital REAL,
    creation_date TEXT,
    address TEXT,
    tax_regime TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Entity shares (SCI capital distribution)
CREATE TABLE IF NOT EXISTS entity_shares (
    id TEXT PRIMARY KEY,
    sci_id TEXT NOT NULL,
    holder_id TEXT NOT NULL,
    shares_count INTEGER NOT NULL,
    percentage REAL NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (sci_id) REFERENCES entities(id) ON DELETE CASCADE,
    FOREIGN KEY (holder_id) REFERENCES entities(id) ON DELETE CASCADE
);

-- Real estate properties (enhanced)
CREATE TABLE IF NOT EXISTS re_properties (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('apartment', 'house', 'parking', 'land', 'commercial')),
    category TEXT NOT NULL CHECK (category IN ('primary_residence', 'rental_furnished', 'rental_unfurnished', 'secondary', 'sci')),

    -- Location
    address TEXT NOT NULL,
    city TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'France',

    -- Characteristics
    surface_m2 REAL,
    rooms INTEGER,
    floor INTEGER,
    dpe_rating TEXT CHECK (dpe_rating IN ('A','B','C','D','E','F','G')),

    -- Copropriete (condominium)
    copro_name TEXT,
    copro_lots TEXT,
    copro_tantiemes INTEGER,
    syndic_name TEXT,

    -- Acquisition
    purchase_date TEXT,
    purchase_price REAL,
    notary_fees REAL,
    agency_fees REAL,
    renovation_costs REAL,

    -- Current value
    estimated_value REAL,
    estimated_value_date TEXT,

    -- Rental
    is_rented INTEGER DEFAULT 0,
    monthly_rent REAL,
    tenant_name TEXT,
    lease_start_date TEXT,

    -- Annual charges
    annual_copro_charges REAL,
    annual_property_tax REAL,

    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Property ownership (who owns what percentage)
CREATE TABLE IF NOT EXISTS property_ownership (
    id TEXT PRIMARY KEY,
    property_id TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    percentage REAL NOT NULL DEFAULT 100,
    acquisition_date TEXT,
    acquisition_type TEXT CHECK (acquisition_type IN ('purchase', 'inheritance', 'donation', 'partition')),
    contribution REAL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (property_id) REFERENCES re_properties(id) ON DELETE CASCADE,
    FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE
);

-- Real estate loans (enhanced)
CREATE TABLE IF NOT EXISTS re_loans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    property_id TEXT,
    bank_name TEXT NOT NULL,
    loan_number TEXT,

    -- Loan parameters
    principal_amount REAL NOT NULL,
    interest_rate REAL NOT NULL,
    duration_months INTEGER NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT,
    monthly_payment REAL NOT NULL,

    -- Insurance
    insurance_rate REAL,
    insurance_monthly REAL,

    -- Current state
    current_balance REAL,
    current_balance_date TEXT,

    -- Linked account for transaction matching
    linked_account_id TEXT,

    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (property_id) REFERENCES re_properties(id) ON DELETE SET NULL,
    FOREIGN KEY (linked_account_id) REFERENCES accounts(id) ON DELETE SET NULL
);

-- Loan responsibility (who is responsible for the loan)
CREATE TABLE IF NOT EXISTS loan_responsibility (
    id TEXT PRIMARY KEY,
    loan_id TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    percentage REAL NOT NULL DEFAULT 100,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (loan_id) REFERENCES re_loans(id) ON DELETE CASCADE,
    FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE
);

-- Property charges (recurring expenses)
CREATE TABLE IF NOT EXISTS property_charges (
    id TEXT PRIMARY KEY,
    property_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('copro', 'tax', 'insurance', 'maintenance', 'other')),
    name TEXT NOT NULL,
    amount REAL NOT NULL,
    frequency TEXT NOT NULL CHECK (frequency IN ('monthly', 'quarterly', 'annual')),
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (property_id) REFERENCES re_properties(id) ON DELETE CASCADE
);

-- =====================================================
-- IMPORT MODULE - Data Sources
-- =====================================================

-- Data sources (bank accounts for CSV import)
CREATE TABLE IF NOT EXISTS data_sources (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    owner_entity_id TEXT NOT NULL,
    linked_account_id TEXT,
    url TEXT NOT NULL,
    format TEXT NOT NULL,
    parser_key TEXT NOT NULL,
    last_sync_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (owner_entity_id) REFERENCES entities(id) ON DELETE CASCADE,
    FOREIGN KEY (linked_account_id) REFERENCES accounts(id) ON DELETE SET NULL
);

-- =====================================================
-- INVESTMENT MODULE (Enhanced) - Sources, Positions, Transactions
-- =====================================================

-- Investment sources (brokers: Bourse Direct, Linxea, Binance, etc.)
CREATE TABLE IF NOT EXISTS investment_sources (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('pea', 'assurance_vie', 'crypto', 'cto')),
    owner_entity_id TEXT NOT NULL,
    url TEXT NOT NULL,
    format TEXT NOT NULL,
    parser_key TEXT NOT NULL CHECK (parser_key IN ('bourse_direct', 'linxea', 'binance')),
    last_sync_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (owner_entity_id) REFERENCES entities(id) ON DELETE CASCADE
);

-- Investment positions (portfolio snapshot)
CREATE TABLE IF NOT EXISTS investment_positions (
    id TEXT PRIMARY KEY,
    source_id TEXT NOT NULL,
    symbol TEXT NOT NULL,
    isin TEXT,
    quantity REAL NOT NULL,
    avg_buy_price REAL NOT NULL,
    current_price REAL NOT NULL,
    current_value REAL NOT NULL,
    gain_loss REAL NOT NULL,
    gain_loss_percent REAL NOT NULL,
    last_updated TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (source_id) REFERENCES investment_sources(id) ON DELETE CASCADE
);

-- Investment transactions (buy/sell history)
CREATE TABLE IF NOT EXISTS investment_transactions (
    id TEXT PRIMARY KEY,
    source_id TEXT NOT NULL,
    date TEXT NOT NULL,
    symbol TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('buy', 'sell')),
    quantity REAL NOT NULL,
    price_per_unit REAL NOT NULL,
    total_amount REAL NOT NULL,
    fee REAL NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (source_id) REFERENCES investment_sources(id) ON DELETE CASCADE
);

-- =====================================================
-- INVESTMENTS (Legacy - kept for compatibility)
-- =====================================================

-- Positions (ETF, actions, crypto, fonds)
CREATE TABLE IF NOT EXISTS positions (
    id TEXT PRIMARY KEY,
    account_id TEXT NOT NULL,
    name TEXT NOT NULL,
    isin TEXT,
    ticker TEXT,
    asset_type TEXT NOT NULL CHECK (asset_type IN ('etf', 'stock', 'crypto', 'fund', 'bond')),
    quantity REAL NOT NULL,
    pru REAL NOT NULL,
    current_price REAL,
    fees_total REAL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

-- Historique des ordres/achats
CREATE TABLE IF NOT EXISTS investment_orders (
    id TEXT PRIMARY KEY,
    position_id TEXT NOT NULL,
    date TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('buy', 'sell')),
    quantity REAL NOT NULL,
    price REAL NOT NULL,
    fees REAL DEFAULT 0,
    total REAL NOT NULL,
    FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE CASCADE
);

-- Prix historiques (pour cache)
CREATE TABLE IF NOT EXISTS price_history (
    id TEXT PRIMARY KEY,
    ticker TEXT NOT NULL,
    date TEXT NOT NULL,
    price REAL NOT NULL,
    source TEXT NOT NULL,
    UNIQUE(ticker, date)
);

-- =====================================================
-- ANALYTICS
-- =====================================================

-- Snapshots patrimoine (pour graphiques évolution)
CREATE TABLE IF NOT EXISTS net_worth_snapshots (
    id TEXT PRIMARY KEY,
    owner_id TEXT,
    date TEXT NOT NULL,
    cash REAL DEFAULT 0,
    savings REAL DEFAULT 0,
    investments REAL DEFAULT 0,
    real_estate REAL DEFAULT 0,
    debts REAL DEFAULT 0,
    net_worth REAL NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Dépenses récurrentes identifiées
CREATE TABLE IF NOT EXISTS recurring_expenses (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL,
    account_id TEXT,
    name TEXT NOT NULL,
    amount REAL NOT NULL,
    frequency TEXT DEFAULT 'monthly' CHECK (frequency IN ('monthly', 'quarterly', 'yearly')),
    category TEXT,
    day_of_month INTEGER,
    is_active INTEGER DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES owners(id),
    FOREIGN KEY (account_id) REFERENCES accounts(id)
);

-- =====================================================
-- SCRAPER SYNC STATUS
-- =====================================================

-- Track sync status for each data source
CREATE TABLE IF NOT EXISTS sync_status (
    id TEXT PRIMARY KEY,
    source TEXT NOT NULL UNIQUE,
    last_sync_at TEXT,
    last_sync_status TEXT DEFAULT 'pending' CHECK (last_sync_status IN ('success', 'failure', 'pending', 'running')),
    last_error TEXT,
    next_sync_at TEXT,
    total_syncs INTEGER DEFAULT 0,
    successful_syncs INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_banks_user_id ON banks(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_bank_id ON accounts(bank_id);
CREATE INDEX IF NOT EXISTS idx_accounts_owner_id ON accounts(owner_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_loans_owner_id ON loans(owner_id);
CREATE INDEX IF NOT EXISTS idx_loans_property_id ON loans(property_id);
CREATE INDEX IF NOT EXISTS idx_positions_account_id ON positions(account_id);
CREATE INDEX IF NOT EXISTS idx_price_history_ticker ON price_history(ticker);
CREATE INDEX IF NOT EXISTS idx_net_worth_snapshots_date ON net_worth_snapshots(date);

-- Real Estate Module indexes
CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(type);
CREATE INDEX IF NOT EXISTS idx_entity_shares_sci_id ON entity_shares(sci_id);
CREATE INDEX IF NOT EXISTS idx_entity_shares_holder_id ON entity_shares(holder_id);
CREATE INDEX IF NOT EXISTS idx_re_properties_type ON re_properties(type);
CREATE INDEX IF NOT EXISTS idx_re_properties_category ON re_properties(category);
CREATE INDEX IF NOT EXISTS idx_property_ownership_property_id ON property_ownership(property_id);
CREATE INDEX IF NOT EXISTS idx_property_ownership_entity_id ON property_ownership(entity_id);
CREATE INDEX IF NOT EXISTS idx_re_loans_property_id ON re_loans(property_id);
CREATE INDEX IF NOT EXISTS idx_loan_responsibility_loan_id ON loan_responsibility(loan_id);
CREATE INDEX IF NOT EXISTS idx_loan_responsibility_entity_id ON loan_responsibility(entity_id);
CREATE INDEX IF NOT EXISTS idx_property_charges_property_id ON property_charges(property_id);

-- Import Module indexes
CREATE INDEX IF NOT EXISTS idx_data_sources_owner_entity_id ON data_sources(owner_entity_id);
CREATE INDEX IF NOT EXISTS idx_data_sources_parser_key ON data_sources(parser_key);
CREATE INDEX IF NOT EXISTS idx_data_sources_linked_account_id ON data_sources(linked_account_id);

-- Investment Module indexes
CREATE INDEX IF NOT EXISTS idx_investment_sources_owner_entity_id ON investment_sources(owner_entity_id);
CREATE INDEX IF NOT EXISTS idx_investment_sources_parser_key ON investment_sources(parser_key);
CREATE INDEX IF NOT EXISTS idx_investment_positions_source_id ON investment_positions(source_id);
CREATE INDEX IF NOT EXISTS idx_investment_positions_symbol ON investment_positions(symbol);
CREATE INDEX IF NOT EXISTS idx_investment_transactions_source_id ON investment_transactions(source_id);
CREATE INDEX IF NOT EXISTS idx_investment_transactions_date ON investment_transactions(date);
CREATE INDEX IF NOT EXISTS idx_investment_transactions_symbol ON investment_transactions(symbol);
