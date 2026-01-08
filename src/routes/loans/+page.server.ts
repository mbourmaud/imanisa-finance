import type { PageServerLoad } from './$types';
import Database from 'better-sqlite3';

const DB_PATH = './data/imanisa.db';

interface Owner {
	id: string;
	name: string;
	type: string;
}

interface Loan {
	id: string;
	owner_id: string;
	property_id: string | null;
	name: string;
	bank: string;
	type: string;
	initial_amount: number;
	remaining_amount: number;
	rate: number;
	monthly_payment: number;
	start_date: string | null;
	end_date: string | null;
}

interface Property {
	id: string;
	owner_id: string;
	name: string;
	address: string | null;
	city: string | null;
	purchase_price: number;
	current_value: number;
}

export const load: PageServerLoad = async ({ locals }) => {
	let db: Database.Database | null = null;

	try {
		db = new Database(DB_PATH, { readonly: true });
	} catch {
		return {
			user: locals.user,
			loans: [],
			properties: [],
			totalDebt: 0,
			totalMonthlyPayment: 0
		};
	}

	try {
		const owners = db.prepare('SELECT * FROM owners').all() as Owner[];
		const ownerMap = new Map(owners.map((o) => [o.id, o]));

		const loans = db.prepare('SELECT * FROM loans ORDER BY remaining_amount DESC').all() as Loan[];
		const properties = db.prepare('SELECT * FROM properties').all() as Property[];
		const propertyMap = new Map(properties.map((p) => [p.id, p]));

		const loansWithDetails = loans.map((loan) => {
			const progress = ((loan.initial_amount - loan.remaining_amount) / loan.initial_amount) * 100;
			const property = loan.property_id ? propertyMap.get(loan.property_id) : null;

			return {
				...loan,
				owner: ownerMap.get(loan.owner_id),
				property,
				progress,
				amountPaid: loan.initial_amount - loan.remaining_amount
			};
		});

		const totalDebt = loans.reduce((sum, l) => sum + l.remaining_amount, 0);
		const totalMonthlyPayment = loans.reduce((sum, l) => sum + l.monthly_payment, 0);
		const totalInitial = loans.reduce((sum, l) => sum + l.initial_amount, 0);

		return {
			user: locals.user,
			loans: loansWithDetails,
			properties,
			totalDebt,
			totalMonthlyPayment,
			totalInitial,
			globalProgress: totalInitial > 0 ? ((totalInitial - totalDebt) / totalInitial) * 100 : 0
		};
	} finally {
		db?.close();
	}
};
