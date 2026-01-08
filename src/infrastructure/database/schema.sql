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
-- REAL ESTATE & LOANS
-- =====================================================

-- Biens immobiliers
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

-- Emprunts (liés à un bien immobilier optionnellement)
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

-- Tableau d'amortissement
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
-- INVESTMENTS
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
