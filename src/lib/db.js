import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || join(__dirname, '../../data/imanisa.db');

let db = null;

export function getDb() {
    if (!db) {
        db = new Database(DB_PATH);
        db.pragma('journal_mode = WAL');
        db.pragma('foreign_keys = ON');
        const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
        db.exec(schema);
    }
    return db;
}

export function createUser(user) {
    return getDb().prepare(`
        INSERT INTO users (id, email, name, picture)
        VALUES (@id, @email, @name, @picture)
        ON CONFLICT(email) DO UPDATE SET
            name = @name,
            picture = @picture
    `).run(user);
}

export function getUserByEmail(email) {
    return getDb().prepare('SELECT * FROM users WHERE email = ?').get(email);
}

export function getUserById(id) {
    return getDb().prepare('SELECT * FROM users WHERE id = ?').get(id);
}

export function createSession(session) {
    return getDb().prepare(`
        INSERT INTO sessions (id, user_id, expires_at)
        VALUES (@id, @user_id, @expires_at)
    `).run(session);
}

export function getSession(id) {
    return getDb().prepare(`
        SELECT s.*, u.email, u.name, u.picture
        FROM sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.id = ? AND s.expires_at > datetime('now')
    `).get(id);
}

export function deleteSession(id) {
    return getDb().prepare('DELETE FROM sessions WHERE id = ?').run(id);
}

export function deleteExpiredSessions() {
    return getDb().prepare("DELETE FROM sessions WHERE expires_at <= datetime('now')").run();
}

export function getBankAccounts(userId) {
    return getDb().prepare('SELECT * FROM bank_accounts WHERE user_id = ? ORDER BY institution, name').all(userId);
}

export function getBankAccount(id, userId) {
    return getDb().prepare('SELECT * FROM bank_accounts WHERE id = ? AND user_id = ?').get(id, userId);
}

export function getBankAccountByName(name, institution, userId) {
    return getDb().prepare('SELECT * FROM bank_accounts WHERE name = ? AND institution = ? AND user_id = ?').get(name, institution, userId);
}

export function upsertBankAccount(account) {
    return getDb().prepare(`
        INSERT INTO bank_accounts (id, user_id, name, institution, iban, currency, account_type, balance, last_import_at)
        VALUES (@id, @user_id, @name, @institution, @iban, @currency, @account_type, @balance, @last_import_at)
        ON CONFLICT(id) DO UPDATE SET
            name = @name,
            iban = @iban,
            currency = @currency,
            account_type = @account_type,
            balance = @balance,
            last_import_at = @last_import_at
    `).run(account);
}

export function updateBankAccountBalance(id, balance) {
    return getDb().prepare('UPDATE bank_accounts SET balance = ?, last_import_at = datetime("now") WHERE id = ?').run(balance, id);
}

export function getTransactions(accountId, limit = 100, offset = 0) {
    return getDb().prepare(`
        SELECT * FROM transactions 
        WHERE bank_account_id = ? 
        ORDER BY date DESC 
        LIMIT ? OFFSET ?
    `).all(accountId, limit, offset);
}

export function getRecentTransactions(userId, limit = 50) {
    return getDb().prepare(`
        SELECT t.*, ba.name as account_name, ba.institution
        FROM transactions t
        JOIN bank_accounts ba ON t.bank_account_id = ba.id
        WHERE ba.user_id = ?
        ORDER BY t.date DESC
        LIMIT ?
    `).all(userId, limit);
}

export function insertTransactions(transactions) {
    const stmt = getDb().prepare(`
        INSERT OR IGNORE INTO transactions (id, bank_account_id, date, amount, currency, description, category, counterparty, transaction_type)
        VALUES (@id, @bank_account_id, @date, @amount, @currency, @description, @category, @counterparty, @transaction_type)
    `);
    
    const insertMany = getDb().transaction((txns) => {
        for (const txn of txns) {
            stmt.run(txn);
        }
    });
    
    return insertMany(transactions);
}

export function getInvestmentAccounts(userId) {
    return getDb().prepare('SELECT * FROM investment_accounts WHERE user_id = ? ORDER BY institution, name').all(userId);
}

export function getInvestmentAccountByName(name, institution, userId) {
    return getDb().prepare('SELECT * FROM investment_accounts WHERE name = ? AND institution = ? AND user_id = ?').get(name, institution, userId);
}

export function createInvestmentAccount(account) {
    return getDb().prepare(`
        INSERT INTO investment_accounts (id, user_id, name, institution, account_type)
        VALUES (@id, @user_id, @name, @institution, @account_type)
    `).run(account);
}

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

export function getAllPositions(userId) {
    return getDb().prepare(`
        SELECT p.*, ia.name as account_name, ia.institution,
               (p.quantity * p.last_price) as market_value,
               (p.quantity * p.last_price) - (p.quantity * p.average_cost) as unrealized_pnl
        FROM positions p
        JOIN investment_accounts ia ON p.investment_account_id = ia.id
        WHERE ia.user_id = ?
        ORDER BY (p.quantity * p.last_price) DESC
    `).all(userId);
}

export function upsertPosition(position) {
    return getDb().prepare(`
        INSERT INTO positions (id, investment_account_id, symbol, name, quantity, average_cost, currency, asset_type, last_price, last_price_date)
        VALUES (@id, @investment_account_id, @symbol, @name, @quantity, @average_cost, @currency, @asset_type, @last_price, @last_price_date)
        ON CONFLICT(id) DO UPDATE SET
            quantity = @quantity,
            average_cost = @average_cost,
            last_price = @last_price,
            last_price_date = @last_price_date,
            updated_at = datetime("now")
    `).run(position);
}

export function updatePositionPrice(symbol, price) {
    return getDb().prepare(`
        UPDATE positions 
        SET last_price = ?, last_price_date = date("now"), updated_at = datetime("now")
        WHERE symbol = ?
    `).run(price, symbol);
}

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

export function getLatestNetWorth(userId) {
    return getDb().prepare('SELECT * FROM net_worth_snapshots WHERE user_id = ? ORDER BY date DESC LIMIT 1').get(userId);
}

export function getNetWorthHistory(userId, days = 365) {
    return getDb().prepare(`
        SELECT * FROM net_worth_snapshots 
        WHERE user_id = ?
        ORDER BY date DESC 
        LIMIT ?
    `).all(userId, days);
}

export function insertNetWorthSnapshot(snapshot) {
    return getDb().prepare(`
        INSERT INTO net_worth_snapshots (user_id, date, bank_total, investment_total, total, breakdown)
        VALUES (@user_id, @date, @bank_total, @investment_total, @total, @breakdown)
        ON CONFLICT(user_id, date) DO UPDATE SET
            bank_total = @bank_total,
            investment_total = @investment_total,
            total = @total,
            breakdown = @breakdown
    `).run(snapshot);
}

export function calculateTotals(userId) {
    const bankTotal = getDb().prepare(`
        SELECT COALESCE(SUM(balance), 0) as total
        FROM bank_accounts
        WHERE user_id = ?
    `).get(userId)?.total || 0;
    
    const investmentTotal = getDb().prepare(`
        SELECT COALESCE(SUM(p.quantity * p.last_price), 0) as total
        FROM positions p
        JOIN investment_accounts ia ON p.investment_account_id = ia.id
        WHERE ia.user_id = ? AND p.last_price IS NOT NULL
    `).get(userId)?.total || 0;
    
    return {
        bank_total: bankTotal,
        investment_total: investmentTotal,
        total: bankTotal + investmentTotal
    };
}

export function getAllUsers() {
    return getDb().prepare('SELECT id, email, name FROM users').all();
}

export function getAllPositionsForPriceUpdate() {
    return getDb().prepare(`
        SELECT DISTINCT symbol, name, currency 
        FROM positions
    `).all();
}
