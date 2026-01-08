import type { PageServerLoad } from './$types';
import Database from 'better-sqlite3';

const DB_PATH = './data/imanisa.db';

interface Owner {
	id: string;
	name: string;
	type: string;
}

interface Account {
	id: string;
	owner_id: string;
	name: string;
	bank: string;
}

interface Transaction {
	id: string;
	account_id: string;
	date: string;
	description: string;
	amount: number;
	type: string;
	category: string | null;
}

export const load: PageServerLoad = async ({ locals, url }) => {
	let db: Database.Database | null = null;

	const page = parseInt(url.searchParams.get('page') || '1', 10);
	const limit = 50;
	const offset = (page - 1) * limit;

	try {
		db = new Database(DB_PATH, { readonly: true });
	} catch {
		return {
			user: locals.user,
			transactions: [],
			totalCount: 0,
			page,
			totalPages: 0,
			monthlyIncome: 0,
			monthlyExpense: 0,
			monthlyBalance: 0
		};
	}

	try {
		const owners = db.prepare('SELECT * FROM owners').all() as Owner[];
		const ownerMap = new Map(owners.map((o) => [o.id, o]));
		const accounts = db.prepare('SELECT * FROM accounts').all() as Account[];

		const totalCountResult = db.prepare('SELECT COUNT(*) as count FROM transactions').get() as {
			count: number;
		};
		const totalCount = totalCountResult.count;
		const totalPages = Math.ceil(totalCount / limit);

		const transactions = db
			.prepare(
				`
			SELECT * FROM transactions 
			ORDER BY date DESC
			LIMIT ? OFFSET ?
		`
			)
			.all(limit, offset) as Transaction[];

		const currentMonth = new Date().toISOString().slice(0, 7);
		const monthlyTransactions = db
			.prepare(
				`
			SELECT * FROM transactions 
			WHERE date LIKE ? || '%'
		`
			)
			.all(currentMonth) as Transaction[];

		const monthlyIncome = monthlyTransactions
			.filter((t) => t.type === 'income')
			.reduce((sum, t) => sum + t.amount, 0);

		const monthlyExpense = monthlyTransactions
			.filter((t) => t.type === 'expense')
			.reduce((sum, t) => sum + t.amount, 0);

		const transactionsWithOwner = transactions.map((tx) => {
			const account = accounts.find((a) => a.id === tx.account_id);
			return {
				...tx,
				owner_id: account?.owner_id,
				owner: account ? ownerMap.get(account.owner_id) : undefined,
				accountName: account?.name,
				bank: account?.bank
			};
		});

		return {
			user: locals.user,
			transactions: transactionsWithOwner,
			totalCount,
			page,
			totalPages,
			monthlyIncome,
			monthlyExpense,
			monthlyBalance: monthlyIncome - monthlyExpense
		};
	} finally {
		db?.close();
	}
};
