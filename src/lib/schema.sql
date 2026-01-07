-- Finary Lite - Database Schema
-- SQLite database for personal finance tracking

-- Comptes bancaires (CE, CIC, Revolut via GoCardless)
CREATE TABLE IF NOT EXISTS bank_accounts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    institution TEXT NOT NULL,  -- 'caisse_epargne', 'cic', 'revolut'
    iban TEXT,
    currency TEXT DEFAULT 'EUR',
    account_type TEXT,  -- 'checking', 'savings', 'card'
    gocardless_account_id TEXT,
    gocardless_requisition_id TEXT,
    last_synced_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Transactions bancaires
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    bank_account_id TEXT NOT NULL,
    date TEXT NOT NULL,
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'EUR',
    description TEXT,
    category TEXT,
    counterparty TEXT,
    transaction_type TEXT,  -- 'debit', 'credit'
    raw_data TEXT,  -- JSON brut de GoCardless
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id)
);

-- Comptes d'investissement (Bourse Direct, Linxea - import manuel)
CREATE TABLE IF NOT EXISTS investment_accounts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    institution TEXT NOT NULL,  -- 'bourse_direct', 'linxea'
    account_type TEXT,  -- 'pea', 'cto', 'assurance_vie'
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Positions dans les comptes d'investissement
CREATE TABLE IF NOT EXISTS positions (
    id TEXT PRIMARY KEY,
    investment_account_id TEXT NOT NULL,
    symbol TEXT NOT NULL,  -- ISIN ou ticker
    name TEXT NOT NULL,
    quantity REAL NOT NULL,
    average_cost REAL,  -- Prix moyen d'achat
    currency TEXT DEFAULT 'EUR',
    asset_type TEXT,  -- 'stock', 'etf', 'fund', 'bond'
    last_price REAL,
    last_price_date TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (investment_account_id) REFERENCES investment_accounts(id)
);

-- Historique des prix (pour calculer les perfs)
CREATE TABLE IF NOT EXISTS price_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT NOT NULL,
    date TEXT NOT NULL,
    price REAL NOT NULL,
    currency TEXT DEFAULT 'EUR',
    source TEXT,  -- 'yahoo', 'boursorama', 'manual'
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(symbol, date)
);

-- Snapshots du patrimoine (pour graphiques historiques)
CREATE TABLE IF NOT EXISTS net_worth_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL UNIQUE,
    bank_total REAL DEFAULT 0,
    investment_total REAL DEFAULT 0,
    total REAL NOT NULL,
    breakdown TEXT,  -- JSON détaillé par compte
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Configuration GoCardless
CREATE TABLE IF NOT EXISTS gocardless_config (
    id INTEGER PRIMARY KEY CHECK (id = 1),  -- Une seule ligne
    secret_id TEXT,
    secret_key TEXT,
    access_token TEXT,
    refresh_token TEXT,
    access_expires_at TEXT,
    refresh_expires_at TEXT,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_positions_account ON positions(investment_account_id);
CREATE INDEX IF NOT EXISTS idx_price_history_symbol ON price_history(symbol);
CREATE INDEX IF NOT EXISTS idx_net_worth_date ON net_worth_snapshots(date);
