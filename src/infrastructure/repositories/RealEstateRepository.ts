import { eq, sql } from 'drizzle-orm';
import { getDb, schema } from '@infrastructure/database/drizzle';
import type {
	Entity,
	EntityShare,
	Property,
	PropertyOwnership,
	Loan,
	LoanResponsibility,
	PropertyCharge,
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

function mapEntityRow(row: typeof schema.entities.$inferSelect): Entity {
	return {
		id: row.id,
		name: row.name,
		type: row.type as EntityType,
		email: row.email,
		color: row.color,
		legalName: row.legalName,
		siren: row.siren,
		rcs: row.rcs,
		shareCapital: row.shareCapital,
		creationDate: row.creationDate,
		address: row.address,
		taxRegime: row.taxRegime,
		createdAt: row.createdAt ?? ''
	};
}

function mapEntityShareRow(row: typeof schema.entityShares.$inferSelect): EntityShare {
	return {
		id: row.id,
		sciId: row.sciId,
		holderId: row.holderId,
		sharesCount: row.sharesCount,
		percentage: row.percentage,
		createdAt: row.createdAt ?? ''
	};
}

function mapPropertyRow(row: typeof schema.reProperties.$inferSelect): Property {
	return {
		id: row.id,
		name: row.name,
		type: row.type as PropertyType,
		category: row.category as PropertyCategory,
		address: row.address,
		city: row.city,
		postalCode: row.postalCode,
		country: row.country ?? 'France',
		surfaceM2: row.surfaceM2,
		rooms: row.rooms,
		floor: row.floor,
		dpeRating: row.dpeRating as DPERating | null,
		coproName: row.coproName,
		coproLots: row.coproLots ? JSON.parse(row.coproLots) : null,
		coproTantiemes: row.coproTantiemes,
		syndicName: row.syndicName,
		purchaseDate: row.purchaseDate,
		purchasePrice: row.purchasePrice,
		notaryFees: row.notaryFees,
		agencyFees: row.agencyFees,
		renovationCosts: row.renovationCosts,
		estimatedValue: row.estimatedValue,
		estimatedValueDate: row.estimatedValueDate,
		isRented: row.isRented === 1,
		monthlyRent: row.monthlyRent,
		tenantName: row.tenantName,
		leaseStartDate: row.leaseStartDate,
		annualCoproCharges: row.annualCoproCharges,
		annualPropertyTax: row.annualPropertyTax,
		createdAt: row.createdAt ?? '',
		updatedAt: row.updatedAt ?? ''
	};
}

function mapPropertyOwnershipRow(row: typeof schema.propertyOwnership.$inferSelect): PropertyOwnership {
	return {
		id: row.id,
		propertyId: row.propertyId,
		entityId: row.entityId,
		percentage: row.percentage,
		acquisitionDate: row.acquisitionDate,
		acquisitionType: row.acquisitionType as AcquisitionType | null,
		contribution: row.contribution,
		createdAt: row.createdAt ?? ''
	};
}

function mapLoanRow(row: typeof schema.reLoans.$inferSelect): Loan {
	return {
		id: row.id,
		name: row.name,
		propertyId: row.propertyId,
		bankName: row.bankName,
		loanNumber: row.loanNumber,
		principalAmount: row.principalAmount,
		interestRate: row.interestRate,
		durationMonths: row.durationMonths,
		startDate: row.startDate,
		endDate: row.endDate,
		monthlyPayment: row.monthlyPayment,
		insuranceRate: row.insuranceRate,
		insuranceMonthly: row.insuranceMonthly,
		currentBalance: row.currentBalance,
		currentBalanceDate: row.currentBalanceDate,
		linkedAccountId: row.linkedAccountId,
		createdAt: row.createdAt ?? '',
		updatedAt: row.updatedAt ?? ''
	};
}

function mapLoanResponsibilityRow(row: typeof schema.loanResponsibility.$inferSelect): LoanResponsibility {
	return {
		id: row.id,
		loanId: row.loanId,
		entityId: row.entityId,
		percentage: row.percentage,
		createdAt: row.createdAt ?? ''
	};
}

function mapPropertyChargeRow(row: typeof schema.propertyCharges.$inferSelect): PropertyCharge {
	return {
		id: row.id,
		propertyId: row.propertyId,
		type: row.type as ChargeType,
		name: row.name,
		amount: row.amount,
		frequency: row.frequency as ChargeFrequency,
		createdAt: row.createdAt ?? ''
	};
}

// =====================================================
// Entity Operations
// =====================================================

export async function getAllEntities(): Promise<Entity[]> {
	const db = await getDb();
	const result = await db.select().from(schema.entities).orderBy(schema.entities.name);
	return result.map(mapEntityRow);
}

export async function getEntityById(id: string): Promise<Entity | null> {
	const db = await getDb();
	const result = await db.select().from(schema.entities).where(eq(schema.entities.id, id)).limit(1);
	const row = result[0];
	return row ? mapEntityRow(row) : null;
}

export async function getEntitiesByType(type: EntityType): Promise<Entity[]> {
	const db = await getDb();
	const result = await db
		.select()
		.from(schema.entities)
		.where(eq(schema.entities.type, type))
		.orderBy(schema.entities.name);
	return result.map(mapEntityRow);
}

export async function createEntity(entity: Omit<Entity, 'createdAt'>): Promise<void> {
	const db = await getDb();
	await db.insert(schema.entities).values({
		id: entity.id,
		name: entity.name,
		type: entity.type,
		email: entity.email,
		color: entity.color,
		legalName: entity.legalName,
		siren: entity.siren,
		rcs: entity.rcs,
		shareCapital: entity.shareCapital,
		creationDate: entity.creationDate,
		address: entity.address,
		taxRegime: entity.taxRegime
	});
}

export async function updateEntity(id: string, entity: Partial<Entity>): Promise<void> {
	const db = await getDb();
	const updates: Partial<typeof schema.entities.$inferInsert> = {};

	if (entity.name !== undefined) updates.name = entity.name;
	if (entity.email !== undefined) updates.email = entity.email;
	if (entity.color !== undefined) updates.color = entity.color;
	if (entity.legalName !== undefined) updates.legalName = entity.legalName;
	if (entity.siren !== undefined) updates.siren = entity.siren;
	if (entity.rcs !== undefined) updates.rcs = entity.rcs;
	if (entity.shareCapital !== undefined) updates.shareCapital = entity.shareCapital;
	if (entity.address !== undefined) updates.address = entity.address;
	if (entity.taxRegime !== undefined) updates.taxRegime = entity.taxRegime;

	if (Object.keys(updates).length === 0) return;

	await db.update(schema.entities).set(updates).where(eq(schema.entities.id, id));
}

export async function deleteEntity(id: string): Promise<void> {
	const db = await getDb();
	await db.delete(schema.entities).where(eq(schema.entities.id, id));
}

// =====================================================
// Entity Share Operations
// =====================================================

export async function getEntitySharesBySci(sciId: string): Promise<EntityShare[]> {
	const db = await getDb();
	const result = await db
		.select()
		.from(schema.entityShares)
		.where(eq(schema.entityShares.sciId, sciId));
	return result.map(mapEntityShareRow);
}

export async function createEntityShare(share: Omit<EntityShare, 'createdAt'>): Promise<void> {
	const db = await getDb();
	await db.insert(schema.entityShares).values({
		id: share.id,
		sciId: share.sciId,
		holderId: share.holderId,
		sharesCount: share.sharesCount,
		percentage: share.percentage
	});
}

export async function deleteEntityShare(id: string): Promise<void> {
	const db = await getDb();
	await db.delete(schema.entityShares).where(eq(schema.entityShares.id, id));
}

// =====================================================
// Property Operations
// =====================================================

export async function getAllProperties(): Promise<Property[]> {
	const db = await getDb();
	const result = await db.select().from(schema.reProperties).orderBy(schema.reProperties.name);
	return result.map(mapPropertyRow);
}

export async function getPropertyById(id: string): Promise<Property | null> {
	const db = await getDb();
	const result = await db
		.select()
		.from(schema.reProperties)
		.where(eq(schema.reProperties.id, id))
		.limit(1);
	const row = result[0];
	return row ? mapPropertyRow(row) : null;
}

export async function createProperty(property: Omit<Property, 'createdAt' | 'updatedAt'>): Promise<void> {
	const db = await getDb();
	await db.insert(schema.reProperties).values({
		id: property.id,
		name: property.name,
		type: property.type,
		category: property.category,
		address: property.address,
		city: property.city,
		postalCode: property.postalCode,
		country: property.country,
		surfaceM2: property.surfaceM2,
		rooms: property.rooms,
		floor: property.floor,
		dpeRating: property.dpeRating,
		coproName: property.coproName,
		coproLots: property.coproLots ? JSON.stringify(property.coproLots) : null,
		coproTantiemes: property.coproTantiemes,
		syndicName: property.syndicName,
		purchaseDate: property.purchaseDate,
		purchasePrice: property.purchasePrice,
		notaryFees: property.notaryFees,
		agencyFees: property.agencyFees,
		renovationCosts: property.renovationCosts,
		estimatedValue: property.estimatedValue,
		estimatedValueDate: property.estimatedValueDate,
		isRented: property.isRented ? 1 : 0,
		monthlyRent: property.monthlyRent,
		tenantName: property.tenantName,
		leaseStartDate: property.leaseStartDate,
		annualCoproCharges: property.annualCoproCharges,
		annualPropertyTax: property.annualPropertyTax
	});
}

export async function updateProperty(id: string, property: Partial<Property>): Promise<void> {
	const db = await getDb();
	const updates: Record<string, unknown> = {};

	if (property.name !== undefined) updates.name = property.name;
	if (property.estimatedValue !== undefined) updates.estimatedValue = property.estimatedValue;
	if (property.estimatedValueDate !== undefined) updates.estimatedValueDate = property.estimatedValueDate;
	if (property.isRented !== undefined) updates.isRented = property.isRented ? 1 : 0;
	if (property.monthlyRent !== undefined) updates.monthlyRent = property.monthlyRent;
	if (property.tenantName !== undefined) updates.tenantName = property.tenantName;
	if (property.annualCoproCharges !== undefined) updates.annualCoproCharges = property.annualCoproCharges;
	if (property.annualPropertyTax !== undefined) updates.annualPropertyTax = property.annualPropertyTax;

	if (Object.keys(updates).length === 0) return;

	updates.updatedAt = sql`datetime('now')`;
	await db.update(schema.reProperties).set(updates).where(eq(schema.reProperties.id, id));
}

export async function deleteProperty(id: string): Promise<void> {
	const db = await getDb();
	await db.delete(schema.reProperties).where(eq(schema.reProperties.id, id));
}

// =====================================================
// Property Ownership Operations
// =====================================================

export async function getPropertyOwnership(propertyId: string): Promise<PropertyOwnership[]> {
	const db = await getDb();
	const result = await db
		.select()
		.from(schema.propertyOwnership)
		.where(eq(schema.propertyOwnership.propertyId, propertyId));
	return result.map(mapPropertyOwnershipRow);
}

export async function createPropertyOwnership(ownership: Omit<PropertyOwnership, 'createdAt'>): Promise<void> {
	const db = await getDb();
	await db.insert(schema.propertyOwnership).values({
		id: ownership.id,
		propertyId: ownership.propertyId,
		entityId: ownership.entityId,
		percentage: ownership.percentage,
		acquisitionDate: ownership.acquisitionDate,
		acquisitionType: ownership.acquisitionType,
		contribution: ownership.contribution
	});
}

export async function deletePropertyOwnership(id: string): Promise<void> {
	const db = await getDb();
	await db.delete(schema.propertyOwnership).where(eq(schema.propertyOwnership.id, id));
}

// =====================================================
// Loan Operations
// =====================================================

export async function getAllLoans(): Promise<Loan[]> {
	const db = await getDb();
	const result = await db.select().from(schema.reLoans).orderBy(schema.reLoans.name);
	return result.map(mapLoanRow);
}

export async function getLoanById(id: string): Promise<Loan | null> {
	const db = await getDb();
	const result = await db.select().from(schema.reLoans).where(eq(schema.reLoans.id, id)).limit(1);
	const row = result[0];
	return row ? mapLoanRow(row) : null;
}

export async function getLoanByPropertyId(propertyId: string): Promise<Loan | null> {
	const db = await getDb();
	const result = await db
		.select()
		.from(schema.reLoans)
		.where(eq(schema.reLoans.propertyId, propertyId))
		.limit(1);
	const row = result[0];
	return row ? mapLoanRow(row) : null;
}

export async function createLoan(loan: Omit<Loan, 'createdAt' | 'updatedAt'>): Promise<void> {
	const db = await getDb();
	await db.insert(schema.reLoans).values({
		id: loan.id,
		name: loan.name,
		propertyId: loan.propertyId,
		bankName: loan.bankName,
		loanNumber: loan.loanNumber,
		principalAmount: loan.principalAmount,
		interestRate: loan.interestRate,
		durationMonths: loan.durationMonths,
		startDate: loan.startDate,
		endDate: loan.endDate,
		monthlyPayment: loan.monthlyPayment,
		insuranceRate: loan.insuranceRate,
		insuranceMonthly: loan.insuranceMonthly,
		currentBalance: loan.currentBalance,
		currentBalanceDate: loan.currentBalanceDate,
		linkedAccountId: loan.linkedAccountId
	});
}

export async function updateLoanBalance(id: string, balance: number, date: string): Promise<void> {
	const db = await getDb();
	await db
		.update(schema.reLoans)
		.set({
			currentBalance: balance,
			currentBalanceDate: date,
			updatedAt: sql`datetime('now')`
		})
		.where(eq(schema.reLoans.id, id));
}

export async function deleteLoan(id: string): Promise<void> {
	const db = await getDb();
	await db.delete(schema.reLoans).where(eq(schema.reLoans.id, id));
}

// =====================================================
// Loan Responsibility Operations
// =====================================================

export async function getLoanResponsibility(loanId: string): Promise<LoanResponsibility[]> {
	const db = await getDb();
	const result = await db
		.select()
		.from(schema.loanResponsibility)
		.where(eq(schema.loanResponsibility.loanId, loanId));
	return result.map(mapLoanResponsibilityRow);
}

export async function createLoanResponsibility(responsibility: Omit<LoanResponsibility, 'createdAt'>): Promise<void> {
	const db = await getDb();
	await db.insert(schema.loanResponsibility).values({
		id: responsibility.id,
		loanId: responsibility.loanId,
		entityId: responsibility.entityId,
		percentage: responsibility.percentage
	});
}

export async function deleteLoanResponsibility(id: string): Promise<void> {
	const db = await getDb();
	await db.delete(schema.loanResponsibility).where(eq(schema.loanResponsibility.id, id));
}

// =====================================================
// Property Charges Operations
// =====================================================

export async function getPropertyCharges(propertyId: string): Promise<PropertyCharge[]> {
	const db = await getDb();
	const result = await db
		.select()
		.from(schema.propertyCharges)
		.where(eq(schema.propertyCharges.propertyId, propertyId));
	return result.map(mapPropertyChargeRow);
}

export async function createPropertyCharge(charge: Omit<PropertyCharge, 'createdAt'>): Promise<void> {
	const db = await getDb();
	await db.insert(schema.propertyCharges).values({
		id: charge.id,
		propertyId: charge.propertyId,
		type: charge.type,
		name: charge.name,
		amount: charge.amount,
		frequency: charge.frequency
	});
}

export async function deletePropertyCharge(id: string): Promise<void> {
	const db = await getDb();
	await db.delete(schema.propertyCharges).where(eq(schema.propertyCharges.id, id));
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
	const db = await getDb();

	// Total value from all properties
	const valueResult = await db
		.select({ total: sql<number>`COALESCE(SUM(${schema.reProperties.estimatedValue}), 0)` })
		.from(schema.reProperties);
	const totalValue = valueResult[0]?.total ?? 0;

	// Total debt from all loans
	const debtResult = await db
		.select({ total: sql<number>`COALESCE(SUM(${schema.reLoans.currentBalance}), 0)` })
		.from(schema.reLoans);
	const totalDebt = debtResult[0]?.total ?? 0;

	// Property count
	const countResult = await db
		.select({ count: sql<number>`COUNT(*)` })
		.from(schema.reProperties);
	const propertyCount = countResult[0]?.count ?? 0;

	return {
		totalValue,
		totalDebt,
		netEquity: totalValue - totalDebt,
		propertyCount
	};
}
