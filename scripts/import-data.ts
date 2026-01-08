import { readFileSync, existsSync } from 'fs';
import Database from 'better-sqlite3';
import * as XLSX from 'xlsx';

const DB_PATH = './data/imanisa.db';
const DOWNLOADS_PATH = '/Users/fr162241/Downloads';

const FILES = {
	CE_PERSO: `${DOWNLOADS_PATH}/04396923205_01092025_08012026.csv`,
	CE_LIVRET_A: `${DOWNLOADS_PATH}/00396923289_01092025_08012026.csv`,
	CE_JOINT: `${DOWNLOADS_PATH}/04402691469_01042025_08012026.csv`,
	CE_SCI: `${DOWNLOADS_PATH}/operations_01082025_08012026.csv`,
	CM_COMPTES: `${DOWNLOADS_PATH}/comptes.xlsx`,
	BOURSE_DIRECT: `${DOWNLOADS_PATH}/508TI00083452745EUR-1_8_2026, 8_02_58 PM.xlsx`,
	BINANCE: `${DOWNLOADS_PATH}/Binance-Fiat-Buy-History-202601081907(UTC+1)_6bf3af60.xlsx`
};

const OWNER_IDS = {
	MATHIEU: 'owner-mathieu',
	NINON: 'owner-ninon',
	JOINT: 'owner-joint',
	SCI: 'owner-sci-imanisa'
};

const ACCOUNT_IDS = {
	CE_PERSO: 'acc-ce-courant-mathieu',
	CE_LIVRET_A: 'acc-ce-livreta-mathieu',
	CE_JOINT: 'acc-ce-joint',
	CE_SCI: 'acc-ce-sci',
	CM_PERSO: 'acc-cm-courant-mathieu',
	PEA: 'acc-pea-bd',
	AV_LINXEA: 'acc-av-linxea',
	CRYPTO: 'acc-crypto-binance'
};

function initDb(): Database.Database {
	const db = new Database(DB_PATH);
	
	db.exec(`
		CREATE TABLE IF NOT EXISTS owners (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			type TEXT NOT NULL,
			created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
		);
		
		CREATE TABLE IF NOT EXISTS accounts (
			id TEXT PRIMARY KEY,
			owner_id TEXT,
			name TEXT NOT NULL,
			account_number TEXT,
			bank TEXT NOT NULL,
			type TEXT NOT NULL,
			balance REAL DEFAULT 0,
			currency TEXT DEFAULT 'EUR',
			created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
		);
		
		CREATE TABLE IF NOT EXISTS transactions (
			id TEXT PRIMARY KEY,
			account_id TEXT NOT NULL,
			date TEXT NOT NULL,
			description TEXT NOT NULL,
			amount REAL NOT NULL,
			type TEXT NOT NULL,
			category TEXT,
			imported_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
		);
		
		CREATE TABLE IF NOT EXISTS positions (
			id TEXT PRIMARY KEY,
			account_id TEXT NOT NULL,
			name TEXT NOT NULL,
			isin TEXT,
			ticker TEXT,
			asset_type TEXT NOT NULL,
			quantity REAL NOT NULL,
			pru REAL NOT NULL,
			current_price REAL,
			fees_total REAL DEFAULT 0,
			created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
		);
		
		CREATE TABLE IF NOT EXISTS properties (
			id TEXT PRIMARY KEY,
			owner_id TEXT NOT NULL,
			name TEXT NOT NULL,
			address TEXT,
			city TEXT,
			purchase_price REAL,
			current_value REAL,
			purchase_date TEXT,
			created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
		);
		
		CREATE TABLE IF NOT EXISTS loans (
			id TEXT PRIMARY KEY,
			owner_id TEXT NOT NULL,
			property_id TEXT,
			name TEXT NOT NULL,
			bank TEXT NOT NULL,
			type TEXT DEFAULT 'mortgage',
			initial_amount REAL NOT NULL,
			remaining_amount REAL NOT NULL,
			rate REAL NOT NULL,
			monthly_payment REAL NOT NULL,
			start_date TEXT,
			end_date TEXT,
			created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
		);
		
		CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id);
		CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
		CREATE INDEX IF NOT EXISTS idx_positions_account ON positions(account_id);
	`);
	
	return db;
}

function seedOwners(db: Database.Database) {
	const insert = db.prepare('INSERT OR REPLACE INTO owners (id, name, type) VALUES (?, ?, ?)');
	insert.run(OWNER_IDS.MATHIEU, 'Mathieu Bourmaud', 'person');
	insert.run(OWNER_IDS.NINON, 'Ninon Loquet', 'person');
	insert.run(OWNER_IDS.JOINT, 'Mathieu & Ninon', 'joint');
	insert.run(OWNER_IDS.SCI, 'SCI IMANISA', 'sci');
	console.log('✅ Owners créés');
}

function seedAccounts(db: Database.Database) {
	const insert = db.prepare(`
		INSERT OR REPLACE INTO accounts (id, owner_id, name, account_number, bank, type, balance)
		VALUES (?, ?, ?, ?, ?, ?, ?)
	`);
	
	insert.run(ACCOUNT_IDS.CE_PERSO, OWNER_IDS.MATHIEU, 'Compte Courant', '04396923205', 'Caisse d\'Épargne', 'checking', 5098.13);
	insert.run(ACCOUNT_IDS.CE_LIVRET_A, OWNER_IDS.MATHIEU, 'Livret A', '00396923289', 'Caisse d\'Épargne', 'savings', 6525.03);
	insert.run(ACCOUNT_IDS.CM_PERSO, OWNER_IDS.MATHIEU, 'Compte Courant CM', '00021665904', 'Crédit Mutuel', 'checking', 458.18);
	insert.run(ACCOUNT_IDS.CE_JOINT, OWNER_IDS.JOINT, 'Compte Joint', '04402691469', 'Caisse d\'Épargne', 'checking', 0);
	insert.run(ACCOUNT_IDS.CE_SCI, OWNER_IDS.SCI, 'Compte SCI', null, 'Caisse d\'Épargne', 'checking', 0);
	insert.run(ACCOUNT_IDS.PEA, OWNER_IDS.MATHIEU, 'PEA', '508TI00083452745EUR', 'Bourse Direct', 'pea', 5604.77);
	insert.run(ACCOUNT_IDS.AV_LINXEA, OWNER_IDS.MATHIEU, 'Assurance Vie', 'P54215638', 'Linxea', 'assurance_vie', 360.18);
	insert.run(ACCOUNT_IDS.CRYPTO, OWNER_IDS.MATHIEU, 'Crypto', '783955343', 'Binance', 'crypto', 0);
	
	console.log('✅ Comptes créés');
}

function seedProperties(db: Database.Database) {
	const insert = db.prepare(`
		INSERT OR REPLACE INTO properties (id, owner_id, name, address, city, purchase_price, current_value, purchase_date)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)
	`);
	
	insert.run('prop-appart-2021', OWNER_IDS.MATHIEU, 'Appartement 2021', null, null, 392621, 400000, '2021-01-01');
	insert.run('prop-sci-imanisa', OWNER_IDS.SCI, 'Appartement Rueil', '21 rue Gustave Charpentier', 'Rueil-Malmaison', 610000, 610000, '2025-10-15');
	
	console.log('✅ Biens immobiliers créés');
}

function seedLoans(db: Database.Database) {
	const insert = db.prepare(`
		INSERT OR REPLACE INTO loans (id, owner_id, property_id, name, bank, type, initial_amount, remaining_amount, rate, monthly_payment, start_date, end_date)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`);
	
	insert.run('loan-modulimmo', OWNER_IDS.MATHIEU, 'prop-appart-2021', 'Prêt MODULIMMO', 'Crédit Mutuel', 'mortgage', 392621, 331994.82, 1.09, 1495.73, '2021-01-01', '2046-09-05');
	insert.run('loan-sci-ce', OWNER_IDS.SCI, 'prop-sci-imanisa', 'Prêt SCI', 'Caisse d\'Épargne', 'mortgage', 360824.30, 359237.84, 3.15, 1739.35, '2025-10-12', '2050-11-05');
	insert.run('loan-sci-familial', OWNER_IDS.SCI, 'prop-sci-imanisa', 'Prêt Familial Erwan', 'Erwan Loquet', 'family', 200000, 200000, 0, 0, '2026-01-01', '2043-08-05');
	
	console.log('✅ Emprunts créés');
}

function seedPositions(db: Database.Database) {
	const insert = db.prepare(`
		INSERT OR REPLACE INTO positions (id, account_id, name, isin, ticker, asset_type, quantity, pru, current_price, fees_total)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`);
	
	insert.run('pos-sp500', ACCOUNT_IDS.PEA, 'Amundi PEA S&P 500 UCITS ETF', 'FR0011871128', 'PE500.PA', 'etf', 108, 47.01319, 51.896, 0);
	insert.run('pos-msci-world', ACCOUNT_IDS.AV_LINXEA, 'Amundi MSCI World ETF', 'FR0010315770', 'CW8.PA', 'etf', 0.94, 314.95, 382.11, 0);
	insert.run('pos-btc', ACCOUNT_IDS.CRYPTO, 'Bitcoin', null, 'bitcoin', 'crypto', 0.00482, 85062.24, null, 9);
	insert.run('pos-eth', ACCOUNT_IDS.CRYPTO, 'Ethereum', null, 'ethereum', 'crypto', 0.23136, 3242.06, null, 15);
	
	console.log('✅ Positions créées');
}

function parseCSV(content: string, delimiter: string = ';'): string[][] {
	const lines = content.trim().split('\n');
	return lines.map(line => {
		const result: string[] = [];
		let current = '';
		let inQuotes = false;
		
		for (const char of line) {
			if (char === '"') {
				inQuotes = !inQuotes;
			} else if (char === delimiter && !inQuotes) {
				result.push(current.trim());
				current = '';
			} else {
				current += char;
			}
		}
		result.push(current.trim());
		return result;
	});
}

function parseAmount(value: string): number {
	if (!value) return 0;
	const cleaned = value.replace(/\s/g, '').replace(',', '.').replace(/[^0-9.-]/g, '');
	return parseFloat(cleaned) || 0;
}

function parseDate(dateStr: string): string {
	const [day, month, year] = dateStr.split('/');
	return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function importCaisseEpargneCSV(db: Database.Database, filePath: string, accountId: string) {
	if (!existsSync(filePath)) {
		console.log(`⚠️ Fichier non trouvé: ${filePath}`);
		return 0;
	}
	
	const content = readFileSync(filePath, 'utf-8');
	const rows = parseCSV(content, ';');
	
	if (rows.length < 2) return 0;
	
	// Detect CSV format based on header
	const header = rows[0];
	const isSCIFormat = header.includes('Pointage') && !header.includes('Categorie');
	
	// Column indices differ between personal CE accounts and SCI account
	// Personal CE: Date(0), Label(1), ..., Category(6), Subcategory(7), Debit(8), Credit(9)
	// SCI CE: Date(0), Label(1), ..., Type(4), Debit(5), Credit(6), DateOp(7), DateVal(8), Pointage(9)
	const cols = isSCIFormat 
		? { date: 0, label: 1, debit: 5, credit: 6, category: 4, minCols: 7 }
		: { date: 0, label: 1, debit: 8, credit: 9, category: 6, minCols: 10 };
	
	const insert = db.prepare(`
		INSERT OR IGNORE INTO transactions (id, account_id, date, description, amount, type, category)
		VALUES (?, ?, ?, ?, ?, ?, ?)
	`);
	
	let count = 0;
	for (let i = 1; i < rows.length; i++) {
		const row = rows[i];
		if (row.length < cols.minCols) continue;
		
		const dateStr = row[cols.date];
		const labelSimple = row[cols.label] || row[2] || '';
		const debitStr = row[cols.debit];
		const creditStr = row[cols.credit];
		const category = row[cols.category] || '';
		
		if (!dateStr) continue;
		
		const debit = parseAmount(debitStr);
		const credit = parseAmount(creditStr);
		if (!debit && !credit) continue;
		
		const amount = credit || Math.abs(debit);
		const type = credit ? 'income' : 'expense';
		const date = parseDate(dateStr);
		const id = `tx-${accountId}-${date}-${i}`;
		
		try {
			insert.run(id, accountId, date, labelSimple.trim(), amount, type, category || null);
			count++;
		} catch (e) {}
	}
	
	return count;
}

function importCreditMutuelXLSX(db: Database.Database, filePath: string, accountId: string) {
	if (!existsSync(filePath)) {
		console.log(`⚠️ Fichier non trouvé: ${filePath}`);
		return 0;
	}
	
	const buffer = readFileSync(filePath);
	const workbook = XLSX.read(buffer, { type: 'buffer' });
	
	const insert = db.prepare(`
		INSERT OR IGNORE INTO transactions (id, account_id, date, description, amount, type, category)
		VALUES (?, ?, ?, ?, ?, ?, ?)
	`);
	
	let count = 0;
	
	for (const sheetName of workbook.SheetNames) {
		if (!sheetName.startsWith('Cpt ')) continue;
		
		const sheet = workbook.Sheets[sheetName];
		const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
		
		for (let row = 5; row <= range.e.r; row++) {
			const dateCell = sheet[XLSX.utils.encode_cell({ r: row, c: 0 })];
			const descCell = sheet[XLSX.utils.encode_cell({ r: row, c: 2 })];
			const debitCell = sheet[XLSX.utils.encode_cell({ r: row, c: 3 })];
			const creditCell = sheet[XLSX.utils.encode_cell({ r: row, c: 4 })];
			
			if (!dateCell || !descCell) continue;
			
			let date: string;
			if (typeof dateCell.v === 'number') {
				const epoch = new Date(1899, 11, 30);
				const d = new Date(epoch.getTime() + dateCell.v * 86400000);
				date = d.toISOString().split('T')[0];
			} else {
				continue;
			}
			
			const description = String(descCell.v || '').trim();
			if (!description) continue;
			
			const debit = debitCell?.v ? Number(debitCell.v) : 0;
			const credit = creditCell?.v ? Number(creditCell.v) : 0;
			if (!debit && !credit) continue;
			
			const amount = credit || Math.abs(debit);
			const type = credit ? 'income' : 'expense';
			const id = `tx-${accountId}-${date}-${row}`;
			
			try {
				insert.run(id, accountId, date, description, amount, type, null);
				count++;
			} catch (e) {}
		}
	}
	
	return count;
}

function updateAccountBalance(db: Database.Database, accountId: string) {
	const result = db.prepare(`
		SELECT 
			COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) -
			COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as balance
		FROM transactions WHERE account_id = ?
	`).get(accountId) as { balance: number };
	
	db.prepare('UPDATE accounts SET balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
		.run(result.balance, accountId);
}

async function main() {
	console.log('🚀 Début de l\'import des données...\n');
	
	const db = initDb();
	
	seedOwners(db);
	seedAccounts(db);
	seedProperties(db);
	seedLoans(db);
	seedPositions(db);
	
	console.log('\n📥 Import des transactions...\n');
	
	let total = 0;
	
	let count = importCaisseEpargneCSV(db, FILES.CE_PERSO, ACCOUNT_IDS.CE_PERSO);
	console.log(`  CE Perso: ${count} transactions`);
	total += count;
	
	count = importCaisseEpargneCSV(db, FILES.CE_LIVRET_A, ACCOUNT_IDS.CE_LIVRET_A);
	console.log(`  CE Livret A: ${count} transactions`);
	total += count;
	
	count = importCaisseEpargneCSV(db, FILES.CE_JOINT, ACCOUNT_IDS.CE_JOINT);
	console.log(`  CE Joint: ${count} transactions`);
	total += count;
	
	count = importCaisseEpargneCSV(db, FILES.CE_SCI, ACCOUNT_IDS.CE_SCI);
	console.log(`  CE SCI: ${count} transactions`);
	total += count;
	
	count = importCreditMutuelXLSX(db, FILES.CM_COMPTES, ACCOUNT_IDS.CM_PERSO);
	console.log(`  CM Perso: ${count} transactions`);
	total += count;
	
	console.log(`\n✅ Total: ${total} transactions importées`);
	
	console.log('\n📊 Résumé des comptes:\n');
	
	const accounts = db.prepare('SELECT name, bank, balance FROM accounts ORDER BY bank, name').all() as Array<{name: string, bank: string, balance: number}>;
	for (const acc of accounts) {
		console.log(`  ${acc.bank} - ${acc.name}: ${acc.balance.toFixed(2)} €`);
	}
	
	const positions = db.prepare('SELECT name, quantity, pru FROM positions').all() as Array<{name: string, quantity: number, pru: number}>;
	console.log('\n📈 Positions:');
	for (const pos of positions) {
		console.log(`  ${pos.name}: ${pos.quantity} @ ${pos.pru.toFixed(2)} €`);
	}
	
	const loans = db.prepare('SELECT name, bank, remaining_amount, monthly_payment FROM loans').all() as Array<{name: string, bank: string, remaining_amount: number, monthly_payment: number}>;
	console.log('\n🏠 Emprunts:');
	for (const loan of loans) {
		console.log(`  ${loan.name} (${loan.bank}): ${loan.remaining_amount.toFixed(2)} € restant - ${loan.monthly_payment.toFixed(2)} €/mois`);
	}
	
	db.close();
	console.log('\n✅ Import terminé!');
}

main().catch(console.error);
