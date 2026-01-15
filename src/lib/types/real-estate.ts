// =====================================================
// Real Estate Module Types
// =====================================================

// Entity types
export type EntityType = 'person' | 'sci' | 'joint';

export interface Entity {
	id: string;
	name: string;
	type: EntityType;
	email: string | null;
	color: string | null;
	// SCI-specific fields
	legalName: string | null;
	siren: string | null;
	rcs: string | null;
	shareCapital: number | null;
	creationDate: string | null;
	address: string | null;
	taxRegime: string | null;
	createdAt: string;
}

export interface EntityShare {
	id: string;
	sciId: string;
	holderId: string;
	sharesCount: number;
	percentage: number;
	createdAt: string;
}

// Property types
export type PropertyType = 'apartment' | 'house' | 'parking' | 'land' | 'commercial';
export type PropertyCategory =
	| 'primary_residence'
	| 'rental_furnished'
	| 'rental_unfurnished'
	| 'secondary'
	| 'sci';
export type DPERating = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

export interface Property {
	id: string;
	name: string;
	type: PropertyType;
	category: PropertyCategory;
	// Location
	address: string;
	city: string | null;
	postalCode: string | null;
	country: string;
	// Characteristics
	surfaceM2: number | null;
	rooms: number | null;
	floor: number | null;
	dpeRating: DPERating | null;
	// Copropriete
	coproName: string | null;
	coproLots: string[] | null;
	coproTantiemes: number | null;
	syndicName: string | null;
	// Acquisition
	purchaseDate: string | null;
	purchasePrice: number | null;
	notaryFees: number | null;
	agencyFees: number | null;
	renovationCosts: number | null;
	// Current value
	estimatedValue: number | null;
	estimatedValueDate: string | null;
	// Rental
	isRented: boolean;
	monthlyRent: number | null;
	tenantName: string | null;
	leaseStartDate: string | null;
	// Annual charges
	annualCoproCharges: number | null;
	annualPropertyTax: number | null;
	// Timestamps
	createdAt: string;
	updatedAt: string;
}

// Property ownership types
export type AcquisitionType = 'purchase' | 'inheritance' | 'donation' | 'partition';

export interface PropertyOwnership {
	id: string;
	propertyId: string;
	entityId: string;
	percentage: number;
	acquisitionDate: string | null;
	acquisitionType: AcquisitionType | null;
	contribution: number | null;
	createdAt: string;
}

// Loan types
export interface Loan {
	id: string;
	name: string;
	propertyId: string | null;
	bankName: string;
	loanNumber: string | null;
	// Loan parameters
	principalAmount: number;
	interestRate: number;
	durationMonths: number;
	startDate: string;
	endDate: string | null;
	monthlyPayment: number;
	// Insurance
	insuranceRate: number | null;
	insuranceMonthly: number | null;
	// Current state
	currentBalance: number | null;
	currentBalanceDate: string | null;
	// Linked account
	linkedAccountId: string | null;
	// Timestamps
	createdAt: string;
	updatedAt: string;
}

export interface LoanResponsibility {
	id: string;
	loanId: string;
	entityId: string;
	percentage: number;
	createdAt: string;
}

// Property charges types
export type ChargeType = 'copro' | 'tax' | 'insurance' | 'maintenance' | 'other';
export type ChargeFrequency = 'monthly' | 'quarterly' | 'annual';

export interface PropertyCharge {
	id: string;
	propertyId: string;
	type: ChargeType;
	name: string;
	amount: number;
	frequency: ChargeFrequency;
	createdAt: string;
}

// =====================================================
// Database Row Types (for repository mapping)
// =====================================================

export interface EntityRow {
	id: string;
	name: string;
	type: string;
	email: string | null;
	color: string | null;
	legal_name: string | null;
	siren: string | null;
	rcs: string | null;
	share_capital: number | null;
	creation_date: string | null;
	address: string | null;
	tax_regime: string | null;
	created_at: string;
}

export interface EntityShareRow {
	id: string;
	sci_id: string;
	holder_id: string;
	shares_count: number;
	percentage: number;
	created_at: string;
}

export interface PropertyRow {
	id: string;
	name: string;
	type: string;
	category: string;
	address: string;
	city: string | null;
	postal_code: string | null;
	country: string;
	surface_m2: number | null;
	rooms: number | null;
	floor: number | null;
	dpe_rating: string | null;
	copro_name: string | null;
	copro_lots: string | null;
	copro_tantiemes: number | null;
	syndic_name: string | null;
	purchase_date: string | null;
	purchase_price: number | null;
	notary_fees: number | null;
	agency_fees: number | null;
	renovation_costs: number | null;
	estimated_value: number | null;
	estimated_value_date: string | null;
	is_rented: number;
	monthly_rent: number | null;
	tenant_name: string | null;
	lease_start_date: string | null;
	annual_copro_charges: number | null;
	annual_property_tax: number | null;
	created_at: string;
	updated_at: string;
}

export interface PropertyOwnershipRow {
	id: string;
	property_id: string;
	entity_id: string;
	percentage: number;
	acquisition_date: string | null;
	acquisition_type: string | null;
	contribution: number | null;
	created_at: string;
}

export interface LoanRow {
	id: string;
	name: string;
	property_id: string | null;
	bank_name: string;
	loan_number: string | null;
	principal_amount: number;
	interest_rate: number;
	duration_months: number;
	start_date: string;
	end_date: string | null;
	monthly_payment: number;
	insurance_rate: number | null;
	insurance_monthly: number | null;
	current_balance: number | null;
	current_balance_date: string | null;
	linked_account_id: string | null;
	created_at: string;
	updated_at: string;
}

export interface LoanResponsibilityRow {
	id: string;
	loan_id: string;
	entity_id: string;
	percentage: number;
	created_at: string;
}

export interface PropertyChargeRow {
	id: string;
	property_id: string;
	type: string;
	name: string;
	amount: number;
	frequency: string;
	created_at: string;
}

// =====================================================
// Composite/Summary Types
// =====================================================

export interface PropertyWithLoan extends Property {
	loan: Loan | null;
}

export interface PropertyWithDetails extends Property {
	loan: Loan | null;
	owners: Array<PropertyOwnership & { entity: Entity }>;
	charges: PropertyCharge[];
}

export interface RealEstateSummary {
	totalValue: number;
	totalDebt: number;
	netEquity: number;
	propertyCount: number;
}
