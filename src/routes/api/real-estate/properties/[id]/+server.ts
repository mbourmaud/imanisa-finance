import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getPropertyWithDetails } from '@infrastructure/repositories/RealEstateRepository';

export const GET: RequestHandler = async ({ params }) => {
	const property = await getPropertyWithDetails(params.id);

	if (!property) {
		throw error(404, 'Property not found');
	}

	return json({
		id: property.id,
		name: property.name,
		type: property.type,
		category: property.category,
		// Location
		address: property.address,
		city: property.city,
		postal_code: property.postalCode,
		country: property.country,
		// Characteristics
		surface_m2: property.surfaceM2,
		rooms: property.rooms,
		floor: property.floor,
		dpe_rating: property.dpeRating,
		// Copropriete
		copro_name: property.coproName,
		copro_lots: property.coproLots,
		copro_tantiemes: property.coproTantiemes,
		syndic_name: property.syndicName,
		// Acquisition
		purchase_date: property.purchaseDate,
		purchase_price: property.purchasePrice,
		notary_fees: property.notaryFees,
		agency_fees: property.agencyFees,
		renovation_costs: property.renovationCosts,
		// Current value
		estimated_value: property.estimatedValue,
		estimated_value_date: property.estimatedValueDate,
		// Rental
		is_rented: property.isRented,
		monthly_rent: property.monthlyRent,
		tenant_name: property.tenantName,
		lease_start_date: property.leaseStartDate,
		// Annual charges
		annual_copro_charges: property.annualCoproCharges,
		annual_property_tax: property.annualPropertyTax,
		// Loan details
		loan: property.loan
			? {
					id: property.loan.id,
					name: property.loan.name,
					bank_name: property.loan.bankName,
					loan_number: property.loan.loanNumber,
					principal_amount: property.loan.principalAmount,
					interest_rate: property.loan.interestRate,
					duration_months: property.loan.durationMonths,
					start_date: property.loan.startDate,
					end_date: property.loan.endDate,
					monthly_payment: property.loan.monthlyPayment,
					insurance_rate: property.loan.insuranceRate,
					insurance_monthly: property.loan.insuranceMonthly,
					current_balance: property.loan.currentBalance,
					current_balance_date: property.loan.currentBalanceDate
				}
			: null,
		// Owners
		owners: property.owners.map((o) => ({
			id: o.id,
			percentage: o.percentage,
			acquisition_date: o.acquisitionDate,
			acquisition_type: o.acquisitionType,
			contribution: o.contribution,
			entity: {
				id: o.entity.id,
				name: o.entity.name,
				type: o.entity.type,
				color: o.entity.color
			}
		})),
		// Charges
		charges: property.charges.map((c) => ({
			id: c.id,
			type: c.type,
			name: c.name,
			amount: c.amount,
			frequency: c.frequency
		}))
	});
};
