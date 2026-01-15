import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getPropertiesWithLoans } from '@infrastructure/repositories/RealEstateRepository';

export const GET: RequestHandler = async () => {
	const properties = await getPropertiesWithLoans();

	return json(
		properties.map((p) => ({
			id: p.id,
			name: p.name,
			type: p.type,
			category: p.category,
			address: p.address,
			city: p.city,
			postal_code: p.postalCode,
			surface_m2: p.surfaceM2,
			rooms: p.rooms,
			dpe_rating: p.dpeRating,
			estimated_value: p.estimatedValue,
			purchase_price: p.purchasePrice,
			is_rented: p.isRented,
			monthly_rent: p.monthlyRent,
			loan: p.loan
				? {
						id: p.loan.id,
						name: p.loan.name,
						bank_name: p.loan.bankName,
						principal_amount: p.loan.principalAmount,
						interest_rate: p.loan.interestRate,
						monthly_payment: p.loan.monthlyPayment,
						current_balance: p.loan.currentBalance
					}
				: null
		}))
	);
};
