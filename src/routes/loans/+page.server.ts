import type { PageServerLoad } from './$types';
import { execute } from '@infrastructure/database/turso';

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
	try {
		const [ownersResult, loansResult, propertiesResult] = await Promise.all([
			execute('SELECT * FROM owners'),
			execute('SELECT * FROM loans ORDER BY remaining_amount DESC'),
			execute('SELECT * FROM properties')
		]);

		const owners = ownersResult.rows as unknown as Owner[];
		const ownerMap = new Map(owners.map((o) => [o.id, o]));
		const loans = loansResult.rows as unknown as Loan[];
		const properties = propertiesResult.rows as unknown as Property[];
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
	} catch {
		return {
			user: locals.user,
			loans: [],
			properties: [],
			totalDebt: 0,
			totalMonthlyPayment: 0
		};
	}
};
