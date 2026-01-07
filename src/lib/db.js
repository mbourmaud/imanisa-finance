import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || join(__dirname, '../../data/finary.db');

let db = null;

export function getDb() {
    if (!db) {
        db = new Database(DB_PATH);
        db.pragma('journal_mode = WAL');
        
        // Initialize schema if needed
        const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
        db.exec(schema);
    }
    return db;
}

// Bank Accounts
export function getBankAccounts() {
    return getDb().prepare('SELECT * FROM bank_accounts ORDER BY institution, name').all();
}

export function getBankAccount(id) {
    return getDb().prepare('SELECT * FROM bank_accounts WHERE id = ?').get(id);
}

export function upsertBankAccount(account) {
    const stmt = getDb().prepare(`
        INSERT INTO bank_accounts (id, name, institution, iban, currency, account_type, gocardless_account_id, gocardless_requisition_id)
        VALUES (@id, @name, @institution, @iban, @currency, @account_type, @gocardless_account_id, @gocardless_requisition_id)
        ON CONFLICT(id) DO UPDATE SET
            name = @name,
            iban = @iban,
            currency = @currency,
            account_type = @account_type,
            gocardless_account_id = @gocardless_account_id,
            gocardless_requisition_id = @gocardless_requisition_id
    `);
    return stmt.run(account);
}

export function updateBankAccountSync(id) {
    return getDb().prepare('UPDATE bank_accounts SET last_synced_at = datetime("now") WHERE id = ?').run(id);
}

// Transactions
export function getTransactions(accountId, limit = 100, offset = 0) {
    return getDb().prepare(`
        SELECT * FROM transactions 
        WHERE bank_account_id = ? 
        ORDER BY date DESC 
        LIMIT ? OFFSET ?
    `).all(accountId, limit, offset);
}

export function getRecentTransactions(limit = 50) {
    return getDb().prepare(`
        SELECT t.*, ba.name as account_name, ba.institution
        FROM transactions t
        JOIN bank_accounts ba ON t.bank_account_id = ba.id
        ORDER BY t.date DESC
        LIMIT ?
    `).all(limit);
}

export function insertTransactions(transactions) {
    const stmt = getDb().prepare(`
        INSERT OR IGNORE INTO transactions (id, bank_account_id, date, amount, currency, description, category, counterparty, transaction_type, raw_data)
        VALUES (@id, @bank_account_id, @date, @amount, @currency, @description, @category, @counterparty, @transaction_type, @raw_data)
    `);
    
    const insertMany = getDb().transaction((txns) => {
        for (const txn of txns) {
            stmt.run(txn);
        }
    });
    
    return insertMany(transactions);
}

// Investment Accounts
export function getInvestmentAccounts() {
    return getDb().prepare('SELECT * FROM investment_accounts ORDER BY institution, name').all();
}

export function createInvestmentAccount(account) {
    const stmt = getDb().prepare(`
        INSERT INTO investment_accounts (id, name, institution, account_type)
        VALUES (@id, @name, @institution, @account_type)
    `);
    return stmt.run(account);
}

// Positions
export function getPositions(accountId) {
    return getDb().prepare(`
        SELECT p.*, 
               (p.quantity * p.last_price) as market_value,
               (p.quantity * p.last_price) - (p.quantity * p.average_cost) as unrealized_pnl
        FROM positions p
        WHERE p.investment_account_id = ?
        ORDER BY (p.quantity * p.last_price) DESC
    `).all(accountId);
}

export function getAllPositions() {
    return getDb().prepare(`
        SELECT p.*, ia.name as account_name, ia.institution,
               (p.quantity * p.last_price) as market_value,
               (p.quantity * p.last_price) - (p.quantity * p.average_cost) as unrealized_pnl
        FROM positions p
        JOIN investment_accounts ia ON p.investment_account_id = ia.id
        ORDER BY (p.quantity * p.last_price) DESC
    `).all();
}

export function upsertPosition(position) {
    const stmt = getDb().prepare(`
        INSERT INTO positions (id, investment_account_id, symbol, name, quantity, average_cost, currency, asset_type, last_price, last_price_date)
        VALUES (@id, @investment_account_id, @symbol, @name, @quantity, @average_cost, @currency, @asset_type, @last_price, @last_price_date)
        ON CONFLICT(id) DO UPDATE SET
            quantity = @quantity,
            average_cost = @average_cost,
            last_price = @last_price,
            last_price_date = @last_price_date,
            updated_at = datetime("now")
    `);
    return stmt.run(position);
}

export function updatePositionPrice(symbol, price) {
    return getDb().prepare(`
        UPDATE positions 
        SET last_price = ?, last_price_date = date("now"), updated_at = datetime("now")
        WHERE symbol = ?
    `).run(price, symbol);
}

// Price History
export function insertPrice(symbol, date, price, source = 'yahoo') {
    return getDb().prepare(`
        INSERT OR REPLACE INTO price_history (symbol, date, price, source)
        VALUES (?, ?, ?, ?)
    `).run(symbol, date, price, source);
}

export function getPriceHistory(symbol, days = 30) {
    return getDb().prepare(`
        SELECT * FROM price_history 
        WHERE symbol = ? 
        ORDER BY date DESC 
        LIMIT ?
    `).all(symbol, days);
}

// Net Worth
export function getLatestNetWorth() {
    return getDb().prepare('SELECT * FROM net_worth_snapshots ORDER BY date DESC LIMIT 1').get();
}

export function getNetWorthHistory(days = 365) {
    return getDb().prepare(`
        SELECT * FROM net_worth_snapshots 
        ORDER BY date DESC 
        LIMIT ?
    `).all(days);
}

export function insertNetWorthSnapshot(snapshot) {
    return getDb().prepare(`
        INSERT OR REPLACE INTO net_worth_snapshots (date, bank_total, investment_total, total, breakdown)
        VALUES (@date, @bank_total, @investment_total, @total, @breakdown)
    `).run(snapshot);
}

// Calculate current totals
export function calculateTotals() {
    const bankTotal = getDb().prepare(`
        SELECT COALESCE(SUM(
            (SELECT amount FROM transactions WHERE bank_account_id = ba.id ORDER BY date DESC LIMIT 1)
        ), 0) as total
        FROM bank_accounts ba
    `).get()?.total || 0;
    
    const investmentTotal = getDb().prepare(`
        SELECT COALESCE(SUM(quantity * last_price), 0) as total
        FROM positions
        WHERE last_price IS NOT NULL
    `).get()?.total || 0;
    
    return {
        bank_total: bankTotal,
        investment_total: investmentTotal,
        total: bankTotal + investmentTotal
    };
}

// GoCardless Config
export function getGoCardlessConfig() {
    return getDb().prepare('SELECT * FROM gocardless_config WHERE id = 1').get();
}

export function saveGoCardlessConfig(config) {
    return getDb().prepare(`
        INSERT INTO gocardless_config (id, secret_id, secret_key, access_token, refresh_token, access_expires_at, refresh_expires_at)
        VALUES (1, @secret_id, @secret_key, @access_token, @refresh_token, @access_expires_at, @refresh_expires_at)
        ON CONFLICT(id) DO UPDATE SET
            secret_id = @secret_id,
            secret_key = @secret_key,
            access_token = @access_token,
            refresh_token = @refresh_token,
            access_expires_at = @access_expires_at,
            refresh_expires_at = @refresh_expires_at,
            updated_at = datetime("now")
    `).run(config);
}
