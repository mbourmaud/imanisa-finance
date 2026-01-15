import { execute } from '@infrastructure/database/turso';
import type {
	Entity,
	EntityRow,
	EntityShare,
	EntityShareRow,
	Property,
	PropertyRow,
	PropertyOwnership,
	PropertyOwnershipRow,
	Loan,
	LoanRow,
	LoanResponsibility,
	LoanResponsibilityRow,
	PropertyCharge,
	PropertyChargeRow,
	PropertyWithLoan,
	PropertyWithDetails,
	RealEstateSummary,
	EntityType,
	PropertyType,
	PropertyCategory,
	DPERating,
	AcquisitionType,
	ChargeType,
	ChargeFrequency
} from '@lib/types/real-estate';

// =====================================================
// Row to Domain Mappers
// =====================================================

function mapEntityRow(row: EntityRow): Entity {
	return {
		id: row.id,
		name: row.name,
		type: row.type as EntityType,
		email: row.email,
		color: row.color,
		legalName: row.legal_name,
		siren: row.siren,
		rcs: row.rcs,
		shareCapital: row.share_capital,
		creationDate: row.creation_date,
		address: row.address,
		taxRegime: row.tax_regime,
		createdAt: row.created_at
	};
}

function mapEntityShareRow(row: EntityShareRow): EntityShare {
	return {
		id: row.id,
		sciId: row.sci_id,
		holderId: row.holder_id,
		sharesCount: row.shares_count,
		percentage: row.percentage,
		createdAt: row.created_at
	};
}

function mapPropertyRow(row: PropertyRow): Property {
	return {
		id: row.id,
		name: row.name,
		type: row.type as PropertyType,
		category: row.category as PropertyCategory,
		address: row.address,
		city: row.city,
		postalCode: row.postal_code,
		country: row.country,
		surfaceM2: row.surface_m2,
		rooms: row.rooms,
		floor: row.floor,
		dpeRating: row.dpe_rating as DPERating | null,
		coproName: row.copro_name,
		coproLots: row.copro_lots ? JSON.parse(row.copro_lots) : null,
		coproTantiemes: row.copro_tantiemes,
		syndicName: row.syndic_name,
		purchaseDate: row.purchase_date,
		purchasePrice: row.purchase_price,
		notaryFees: row.notary_fees,
		agencyFees: row.agency_fees,
		renovationCosts: row.renovation_costs,
		estimatedValue: row.estimated_value,
		estimatedValueDate: row.estimated_value_date,
		isRented: row.is_rented === 1,
		monthlyRent: row.monthly_rent,
		tenantName: row.tenant_name,
		leaseStartDate: row.lease_start_date,
		annualCoproCharges: row.annual_copro_charges,
		annualPropertyTax: row.annual_property_tax,
		createdAt: row.created_at,
		updatedAt: row.updated_at
	};
}

function mapPropertyOwnershipRow(row: PropertyOwnershipRow): PropertyOwnership {
	return {
		id: row.id,
		propertyId: row.property_id,
		entityId: row.entity_id,
		percentage: row.percentage,
		acquisitionDate: row.acquisition_date,
		acquisitionType: row.acquisition_type as AcquisitionType | null,
		contribution: row.contribution,
		createdAt: row.created_at
	};
}

function mapLoanRow(row: LoanRow): Loan {
	return {
		id: row.id,
		name: row.name,
		propertyId: row.property_id,
		bankName: row.bank_name,
		loanNumber: row.loan_number,
		principalAmount: row.principal_amount,
		interestRate: row.interest_rate,
		durationMonths: row.duration_months,
		startDate: row.start_date,
		endDate: row.end_date,
		monthlyPayment: row.monthly_payment,
		insuranceRate: row.insurance_rate,
		insuranceMonthly: row.insurance_monthly,
		currentBalance: row.current_balance,
		currentBalanceDate: row.current_balance_date,
		linkedAccountId: row.linked_account_id,
		createdAt: row.created_at,
		updatedAt: row.updated_at
	};
}

function mapLoanResponsibilityRow(row: LoanResponsibilityRow): LoanResponsibility {
	return {
		id: row.id,
		loanId: row.loan_id,
		entityId: row.entity_id,
		percentage: row.percentage,
		createdAt: row.created_at
	};
}

function mapPropertyChargeRow(row: PropertyChargeRow): PropertyCharge {
	return {
		id: row.id,
		propertyId: row.property_id,
		type: row.type as ChargeType,
		name: row.name,
		amount: row.amount,
		frequency: row.frequency as ChargeFrequency,
		createdAt: row.created_at
	};
}

// =====================================================
// Entity Operations
// =====================================================

export async function getAllEntities(): Promise<Entity[]> {
	const result = await execute('SELECT * FROM entities ORDER BY name');
	return (result.rows as unknown as EntityRow[]).map(mapEntityRow);
}

export async function getEntityById(id: string): Promise<Entity | null> {
	const result = await execute('SELECT * FROM entities WHERE id = ?', [id]);
	const row = result.rows[0] as unknown as EntityRow | undefined;
	return row ? mapEntityRow(row) : null;
}

export async function getEntitiesByType(type: EntityType): Promise<Entity[]> {
	const result = await execute('SELECT * FROM entities WHERE type = ? ORDER BY name', [type]);
	return (result.rows as unknown as EntityRow[]).map(mapEntityRow);
}

export async function createEntity(entity: Omit<Entity, 'createdAt'>): Promise<void> {
	await execute(
		`INSERT INTO entities (id, name, type, email, color, legal_name, siren, rcs, share_capital, creation_date, address, tax_regime)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		[
			entity.id,
			entity.name,
			entity.type,
			entity.email,
			entity.color,
			entity.legalName,
			entity.siren,
			entity.rcs,
			entity.shareCapital,
			entity.creationDate,
			entity.address,
			entity.taxRegime
		]
	);
}

export async function updateEntity(id: string, entity: Partial<Entity>): Promise<void> {
	const fields: string[] = [];
	const values: (string | number | null)[] = [];

	if (entity.name !== undefined) {
		fields.push('name = ?');
		values.push(entity.name);
	}
	if (entity.email !== undefined) {
		fields.push('email = ?');
		values.push(entity.email);
	}
	if (entity.color !== undefined) {
		fields.push('color = ?');
		values.push(entity.color);
	}
	if (entity.legalName !== undefined) {
		fields.push('legal_name = ?');
		values.push(entity.legalName);
	}
	if (entity.siren !== undefined) {
		fields.push('siren = ?');
		values.push(entity.siren);
	}
	if (entity.rcs !== undefined) {
		fields.push('rcs = ?');
		values.push(entity.rcs);
	}
	if (entity.shareCapital !== undefined) {
		fields.push('share_capital = ?');
		values.push(entity.shareCapital);
	}
	if (entity.address !== undefined) {
		fields.push('address = ?');
		values.push(entity.address);
	}
	if (entity.taxRegime !== undefined) {
		fields.push('tax_regime = ?');
		values.push(entity.taxRegime);
	}

	if (fields.length === 0) return;

	values.push(id);
	await execute(`UPDATE entities SET ${fields.join(', ')} WHERE id = ?`, values);
}

export async function deleteEntity(id: string): Promise<void> {
	await execute('DELETE FROM entities WHERE id = ?', [id]);
}

// =====================================================
// Entity Share Operations
// =====================================================

export async function getEntitySharesBySci(sciId: string): Promise<EntityShare[]> {
	const result = await execute('SELECT * FROM entity_shares WHERE sci_id = ?', [sciId]);
	return (result.rows as unknown as EntityShareRow[]).map(mapEntityShareRow);
}

export async function createEntityShare(share: Omit<EntityShare, 'createdAt'>): Promise<void> {
	await execute(
		`INSERT INTO entity_shares (id, sci_id, holder_id, shares_count, percentage)
		VALUES (?, ?, ?, ?, ?)`,
		[share.id, share.sciId, share.holderId, share.sharesCount, share.percentage]
	);
}

export async function deleteEntityShare(id: string): Promise<void> {
	await execute('DELETE FROM entity_shares WHERE id = ?', [id]);
}

// =====================================================
// Property Operations
// =====================================================

export async function getAllProperties(): Promise<Property[]> {
	const result = await execute('SELECT * FROM re_properties ORDER BY name');
	return (result.rows as unknown as PropertyRow[]).map(mapPropertyRow);
}

export async function getPropertyById(id: string): Promise<Property | null> {
	const result = await execute('SELECT * FROM re_properties WHERE id = ?', [id]);
	const row = result.rows[0] as unknown as PropertyRow | undefined;
	return row ? mapPropertyRow(row) : null;
}

export async function createProperty(property: Omit<Property, 'createdAt' | 'updatedAt'>): Promise<void> {
	await execute(
		`INSERT INTO re_properties (
			id, name, type, category, address, city, postal_code, country,
			surface_m2, rooms, floor, dpe_rating, copro_name, copro_lots, copro_tantiemes, syndic_name,
			purchase_date, purchase_price, notary_fees, agency_fees, renovation_costs,
			estimated_value, estimated_value_date, is_rented, monthly_rent, tenant_name, lease_start_date,
			annual_copro_charges, annual_property_tax
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		[
			property.id,
			property.name,
			property.type,
			property.category,
			property.address,
			property.city,
			property.postalCode,
			property.country,
			property.surfaceM2,
			property.rooms,
			property.floor,
			property.dpeRating,
			property.coproName,
			property.coproLots ? JSON.stringify(property.coproLots) : null,
			property.coproTantiemes,
			property.syndicName,
			property.purchaseDate,
			property.purchasePrice,
			property.notaryFees,
			property.agencyFees,
			property.renovationCosts,
			property.estimatedValue,
			property.estimatedValueDate,
			property.isRented ? 1 : 0,
			property.monthlyRent,
			property.tenantName,
			property.leaseStartDate,
			property.annualCoproCharges,
			property.annualPropertyTax
		]
	);
}

export async function updateProperty(id: string, property: Partial<Property>): Promise<void> {
	const fields: string[] = [];
	const values: (string | number | null)[] = [];

	if (property.name !== undefined) {
		fields.push('name = ?');
		values.push(property.name);
	}
	if (property.estimatedValue !== undefined) {
		fields.push('estimated_value = ?');
		values.push(property.estimatedValue);
	}
	if (property.estimatedValueDate !== undefined) {
		fields.push('estimated_value_date = ?');
		values.push(property.estimatedValueDate);
	}
	if (property.isRented !== undefined) {
		fields.push('is_rented = ?');
		values.push(property.isRented ? 1 : 0);
	}
	if (property.monthlyRent !== undefined) {
		fields.push('monthly_rent = ?');
		values.push(property.monthlyRent);
	}
	if (property.tenantName !== undefined) {
		fields.push('tenant_name = ?');
		values.push(property.tenantName);
	}
	if (property.annualCoproCharges !== undefined) {
		fields.push('annual_copro_charges = ?');
		values.push(property.annualCoproCharges);
	}
	if (property.annualPropertyTax !== undefined) {
		fields.push('annual_property_tax = ?');
		values.push(property.annualPropertyTax);
	}

	if (fields.length === 0) return;

	fields.push('updated_at = datetime("now")');
	values.push(id);
	await execute(`UPDATE re_properties SET ${fields.join(', ')} WHERE id = ?`, values);
}

export async function deleteProperty(id: string): Promise<void> {
	await execute('DELETE FROM re_properties WHERE id = ?', [id]);
}

// =====================================================
// Property Ownership Operations
// =====================================================

export async function getPropertyOwnership(propertyId: string): Promise<PropertyOwnership[]> {
	const result = await execute('SELECT * FROM property_ownership WHERE property_id = ?', [propertyId]);
	return (result.rows as unknown as PropertyOwnershipRow[]).map(mapPropertyOwnershipRow);
}

export async function createPropertyOwnership(ownership: Omit<PropertyOwnership, 'createdAt'>): Promise<void> {
	await execute(
		`INSERT INTO property_ownership (id, property_id, entity_id, percentage, acquisition_date, acquisition_type, contribution)
		VALUES (?, ?, ?, ?, ?, ?, ?)`,
		[
			ownership.id,
			ownership.propertyId,
			ownership.entityId,
			ownership.percentage,
			ownership.acquisitionDate,
			ownership.acquisitionType,
			ownership.contribution
		]
	);
}

export async function deletePropertyOwnership(id: string): Promise<void> {
	await execute('DELETE FROM property_ownership WHERE id = ?', [id]);
}

// =====================================================
// Loan Operations
// =====================================================

export async function getAllLoans(): Promise<Loan[]> {
	const result = await execute('SELECT * FROM re_loans ORDER BY name');
	return (result.rows as unknown as LoanRow[]).map(mapLoanRow);
}

export async function getLoanById(id: string): Promise<Loan | null> {
	const result = await execute('SELECT * FROM re_loans WHERE id = ?', [id]);
	const row = result.rows[0] as unknown as LoanRow | undefined;
	return row ? mapLoanRow(row) : null;
}

export async function getLoanByPropertyId(propertyId: string): Promise<Loan | null> {
	const result = await execute('SELECT * FROM re_loans WHERE property_id = ?', [propertyId]);
	const row = result.rows[0] as unknown as LoanRow | undefined;
	return row ? mapLoanRow(row) : null;
}

export async function createLoan(loan: Omit<Loan, 'createdAt' | 'updatedAt'>): Promise<void> {
	await execute(
		`INSERT INTO re_loans (
			id, name, property_id, bank_name, loan_number,
			principal_amount, interest_rate, duration_months, start_date, end_date, monthly_payment,
			insurance_rate, insurance_monthly, current_balance, current_balance_date, linked_account_id
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		[
			loan.id,
			loan.name,
			loan.propertyId,
			loan.bankName,
			loan.loanNumber,
			loan.principalAmount,
			loan.interestRate,
			loan.durationMonths,
			loan.startDate,
			loan.endDate,
			loan.monthlyPayment,
			loan.insuranceRate,
			loan.insuranceMonthly,
			loan.currentBalance,
			loan.currentBalanceDate,
			loan.linkedAccountId
		]
	);
}

export async function updateLoanBalance(id: string, balance: number, date: string): Promise<void> {
	await execute(
		`UPDATE re_loans SET current_balance = ?, current_balance_date = ?, updated_at = datetime("now") WHERE id = ?`,
		[balance, date, id]
	);
}

export async function deleteLoan(id: string): Promise<void> {
	await execute('DELETE FROM re_loans WHERE id = ?', [id]);
}

// =====================================================
// Loan Responsibility Operations
// =====================================================

export async function getLoanResponsibility(loanId: string): Promise<LoanResponsibility[]> {
	const result = await execute('SELECT * FROM loan_responsibility WHERE loan_id = ?', [loanId]);
	return (result.rows as unknown as LoanResponsibilityRow[]).map(mapLoanResponsibilityRow);
}

export async function createLoanResponsibility(responsibility: Omit<LoanResponsibility, 'createdAt'>): Promise<void> {
	await execute(
		`INSERT INTO loan_responsibility (id, loan_id, entity_id, percentage)
		VALUES (?, ?, ?, ?)`,
		[responsibility.id, responsibility.loanId, responsibility.entityId, responsibility.percentage]
	);
}

export async function deleteLoanResponsibility(id: string): Promise<void> {
	await execute('DELETE FROM loan_responsibility WHERE id = ?', [id]);
}

// =====================================================
// Property Charges Operations
// =====================================================

export async function getPropertyCharges(propertyId: string): Promise<PropertyCharge[]> {
	const result = await execute('SELECT * FROM property_charges WHERE property_id = ?', [propertyId]);
	return (result.rows as unknown as PropertyChargeRow[]).map(mapPropertyChargeRow);
}

export async function createPropertyCharge(charge: Omit<PropertyCharge, 'createdAt'>): Promise<void> {
	await execute(
		`INSERT INTO property_charges (id, property_id, type, name, amount, frequency)
		VALUES (?, ?, ?, ?, ?, ?)`,
		[charge.id, charge.propertyId, charge.type, charge.name, charge.amount, charge.frequency]
	);
}

export async function deletePropertyCharge(id: string): Promise<void> {
	await execute('DELETE FROM property_charges WHERE id = ?', [id]);
}

// =====================================================
// Composite Queries
// =====================================================

export async function getPropertiesWithLoans(): Promise<PropertyWithLoan[]> {
	const properties = await getAllProperties();
	const result: PropertyWithLoan[] = [];

	for (const property of properties) {
		const loan = await getLoanByPropertyId(property.id);
		result.push({ ...property, loan });
	}

	return result;
}

export async function getPropertyWithDetails(id: string): Promise<PropertyWithDetails | null> {
	const property = await getPropertyById(id);
	if (!property) return null;

	const loan = await getLoanByPropertyId(id);
	const ownershipRows = await getPropertyOwnership(id);
	const charges = await getPropertyCharges(id);

	const owners = await Promise.all(
		ownershipRows.map(async (ownership) => {
			const entity = await getEntityById(ownership.entityId);
			return { ...ownership, entity: entity! };
		})
	);

	return {
		...property,
		loan,
		owners,
		charges
	};
}

export async function getRealEstateSummary(): Promise<RealEstateSummary> {
	// Total value from all properties
	const valueResult = await execute(
		'SELECT COALESCE(SUM(estimated_value), 0) as total FROM re_properties'
	);
	const totalValue = (valueResult.rows[0] as unknown as { total: number }).total;

	// Total debt from all loans
	const debtResult = await execute(
		'SELECT COALESCE(SUM(current_balance), 0) as total FROM re_loans'
	);
	const totalDebt = (debtResult.rows[0] as unknown as { total: number }).total;

	// Property count
	const countResult = await execute('SELECT COUNT(*) as count FROM re_properties');
	const propertyCount = (countResult.rows[0] as unknown as { count: number }).count;

	return {
		totalValue,
		totalDebt,
		netEquity: totalValue - totalDebt,
		propertyCount
	};
}
