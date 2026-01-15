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

interface CategoryDB {
	id: string;
	name: string;
	icon: string;
	color: string;
	parent_id: string | null;
}

interface CategoryAssignmentDB {
	transaction_id: string;
	category_id: string;
	source: 'bank' | 'auto' | 'manual';
	confidence: number;
}

export interface CategoryOption {
	id: string;
	name: string;
	icon: string;
	color: string;
	parent_id: string | null;
	children?: CategoryOption[];
}

export interface TransactionCategoryInfo {
	category: CategoryOption | null;
	source: 'bank' | 'auto' | 'manual' | null;
}

export const load: PageServerLoad = async ({ locals, url }) => {
	const page = parseInt(url.searchParams.get('page') || '1', 10);
	const uncategorizedOnly = url.searchParams.get('uncategorized') === 'true';
	const limit = 50;
	const offset = (page - 1) * limit;

	try {
		const currentMonth = new Date().toISOString().slice(0, 7);

		// Build transaction query with optional uncategorized filter
		let transactionsQuery: string;
		let countQuery: string;

		if (uncategorizedOnly) {
			// Transactions NOT in transaction_categories
			transactionsQuery = `
				SELECT t.* FROM transactions t
				LEFT JOIN transaction_categories tc ON t.id = tc.transaction_id
				WHERE tc.transaction_id IS NULL
				ORDER BY t.date DESC LIMIT ? OFFSET ?
			`;
			countQuery = `
				SELECT COUNT(*) as count FROM transactions t
				LEFT JOIN transaction_categories tc ON t.id = tc.transaction_id
				WHERE tc.transaction_id IS NULL
			`;
		} else {
			transactionsQuery = 'SELECT * FROM transactions ORDER BY date DESC LIMIT ? OFFSET ?';
			countQuery = 'SELECT COUNT(*) as count FROM transactions';
		}

		const [
			ownersResult,
			accountsResult,
			totalCountResult,
			transactionsResult,
			monthlyTransactionsResult,
			categoriesResult,
			assignmentsResult
		] = await Promise.all([
			execute('SELECT * FROM owners'),
			execute('SELECT * FROM accounts'),
			execute(countQuery),
			execute(transactionsQuery, [limit, offset]),
			execute(`SELECT * FROM transactions WHERE date LIKE ? || '%'`, [currentMonth]),
			execute('SELECT id, name, icon, color, parent_id FROM categories'),
			execute('SELECT transaction_id, category_id, source, confidence FROM transaction_categories')
		]);

		const owners = ownersResult.rows as unknown as Owner[];
		const ownerMap = new Map(owners.map((o) => [o.id, o]));
		const accounts = accountsResult.rows as unknown as Account[];
		const totalCountRow = totalCountResult.rows[0] as unknown as { count: number };
		const totalCount = totalCountRow.count;
		const totalPages = Math.ceil(totalCount / limit);
		const transactions = transactionsResult.rows as unknown as Transaction[];
		const monthlyTransactions = monthlyTransactionsResult.rows as unknown as Transaction[];

		// Build categories map and hierarchical list
		const categoriesDB = categoriesResult.rows as unknown as CategoryDB[];
		const categoriesMap = new Map<string, CategoryOption>();

		for (const cat of categoriesDB) {
			categoriesMap.set(cat.id, {
				id: cat.id,
				name: cat.name,
				icon: cat.icon,
				color: cat.color,
				parent_id: cat.parent_id,
				children: []
			});
		}

		// Build hierarchy
		const rootCategories: CategoryOption[] = [];
		for (const cat of categoriesMap.values()) {
			if (cat.parent_id) {
				const parent = categoriesMap.get(cat.parent_id);
				if (parent && parent.children) {
					parent.children.push(cat);
				}
			} else {
				rootCategories.push(cat);
			}
		}

		// Sort categories alphabetically
		rootCategories.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
		for (const cat of categoriesMap.values()) {
			if (cat.children) {
				cat.children.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
			}
		}

		// Build assignments map
		const assignmentsDB = assignmentsResult.rows as unknown as CategoryAssignmentDB[];
		const assignmentsMap = new Map<string, { categoryId: string; source: 'bank' | 'auto' | 'manual' }>();
		for (const assignment of assignmentsDB) {
			assignmentsMap.set(assignment.transaction_id, {
				categoryId: assignment.category_id,
				source: assignment.source
			});
		}

		const monthlyIncome = monthlyTransactions
			.filter((t) => t.type === 'income')
			.reduce((sum, t) => sum + t.amount, 0);

		const monthlyExpense = monthlyTransactions
			.filter((t) => t.type === 'expense')
			.reduce((sum, t) => sum + t.amount, 0);

		const transactionsWithOwner = transactions.map((tx) => {
			const account = accounts.find((a) => a.id === tx.account_id);
			const assignment = assignmentsMap.get(tx.id);
			const categoryInfo: TransactionCategoryInfo = {
				category: assignment ? categoriesMap.get(assignment.categoryId) ?? null : null,
				source: assignment?.source ?? null
			};

			return {
				...tx,
				owner_id: account?.owner_id,
				owner: account ? ownerMap.get(account.owner_id) : undefined,
				accountName: account?.name,
				bank: account?.bank,
				categoryInfo
			};
		});

		// Count uncategorized for display
		const uncategorizedCountResult = await execute(`
			SELECT COUNT(*) as count FROM transactions t
			LEFT JOIN transaction_categories tc ON t.id = tc.transaction_id
			WHERE tc.transaction_id IS NULL
		`);
		const uncategorizedCount = (uncategorizedCountResult.rows[0] as unknown as { count: number }).count;

		return {
			user: locals.user,
			transactions: transactionsWithOwner,
			totalCount,
			page,
			totalPages,
			monthlyIncome,
			monthlyExpense,
			monthlyBalance: monthlyIncome - monthlyExpense,
			categories: rootCategories,
			uncategorizedOnly,
			uncategorizedCount
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
			monthlyBalance: 0,
			categories: [],
			uncategorizedOnly: false,
			uncategorizedCount: 0
		};
	}
};
