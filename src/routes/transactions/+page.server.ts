import type { PageServerLoad } from './$types';
import { execute } from '@infrastructure/database/turso';

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
	const page = parseInt(url.searchParams.get('page') || '1', 10);
	const limit = 50;
	const offset = (page - 1) * limit;

	try {
		const currentMonth = new Date().toISOString().slice(0, 7);

		const [ownersResult, accountsResult, totalCountResult, transactionsResult, monthlyTransactionsResult] = await Promise.all([
			execute('SELECT * FROM owners'),
			execute('SELECT * FROM accounts'),
			execute('SELECT COUNT(*) as count FROM transactions'),
			execute('SELECT * FROM transactions ORDER BY date DESC LIMIT ? OFFSET ?', [limit, offset]),
			execute(`SELECT * FROM transactions WHERE date LIKE ? || '%'`, [currentMonth])
		]);

		const owners = ownersResult.rows as unknown as Owner[];
		const ownerMap = new Map(owners.map((o) => [o.id, o]));
		const accounts = accountsResult.rows as unknown as Account[];
		const totalCountRow = totalCountResult.rows[0] as unknown as { count: number };
		const totalCount = totalCountRow.count;
		const totalPages = Math.ceil(totalCount / limit);
		const transactions = transactionsResult.rows as unknown as Transaction[];
		const monthlyTransactions = monthlyTransactionsResult.rows as unknown as Transaction[];

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
};
