-- =====================================================
-- MIGRATION 001: Real Estate Module
-- =====================================================
-- Adds comprehensive real estate tracking with:
-- - Entities (persons, SCI, joint ownership)
-- - Entity shares (SCI capital distribution)
-- - Properties (detailed property information)
-- - Property ownership (ownership percentages)
-- - Loans (detailed loan tracking)
-- - Loan responsibility (who is responsible for loan)
-- - Property charges (recurring expenses)
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

-- Real estate properties (enhanced from existing properties table)
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
    copro_lots TEXT, -- JSON array
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
-- INDEXES
-- =====================================================

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
