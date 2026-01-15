import { sqliteTable, text, real, integer, index, primaryKey } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// =====================================================
// CORE MODULE - Owners, Users, Banks, Accounts, Transactions
// =====================================================

export const owners = sqliteTable('owners', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	type: text('type', { enum: ['person', 'joint', 'sci'] }).notNull(),
	createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP')
});

export const users = sqliteTable('users', {
	id: text('id').primaryKey(),
	ownerId: text('owner_id').references(() => owners.id),
	email: text('email').notNull().unique(),
	name: text('name').notNull(),
	avatarUrl: text('avatar_url'),
	createdAt: text('created_at').notNull()
});

export const banks = sqliteTable(
	'banks',
	{
		id: text('id').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		name: text('name').notNull(),
		template: text('template').notNull(),
		createdAt: text('created_at').notNull()
	},
	(table) => [index('idx_banks_user_id').on(table.userId)]
);

export const accounts = sqliteTable(
	'accounts',
	{
		id: text('id').primaryKey(),
		bankId: text('bank_id')
			.notNull()
			.references(() => banks.id, { onDelete: 'cascade' }),
		ownerId: text('owner_id').references(() => owners.id),
		name: text('name').notNull(),
		accountNumber: text('account_number'),
		type: text('type').notNull(),
		assetCategory: text('asset_category').notNull().default('LIQUIDITY'),
		balance: real('balance').notNull().default(0),
		currency: text('currency').notNull().default('EUR'),
		createdAt: text('created_at').notNull(),
		updatedAt: text('updated_at').notNull()
	},
	(table) => [
		index('idx_accounts_bank_id').on(table.bankId),
		index('idx_accounts_owner_id').on(table.ownerId)
	]
);

export const transactions = sqliteTable(
	'transactions',
	{
		id: text('id').primaryKey(),
		accountId: text('account_id')
			.notNull()
			.references(() => accounts.id, { onDelete: 'cascade' }),
		type: text('type').notNull(),
		amount: real('amount').notNull(),
		currency: text('currency').notNull().default('EUR'),
		description: text('description').notNull(),
		descriptionClean: text('description_clean'),
		date: text('date').notNull(),
		valueDate: text('value_date'),
		category: text('category'),
		subcategory: text('subcategory'),
		reference: text('reference'),
		isRecurring: integer('is_recurring').default(0),
		importedAt: text('imported_at').notNull()
	},
	(table) => [
		index('idx_transactions_account_id').on(table.accountId),
		index('idx_transactions_date').on(table.date)
	]
);

// =====================================================
// LEGACY REAL ESTATE & LOANS (kept for compatibility)
// =====================================================

export const legacyProperties = sqliteTable(
	'properties',
	{
		id: text('id').primaryKey(),
		ownerId: text('owner_id')
			.notNull()
			.references(() => owners.id),
		name: text('name').notNull(),
		address: text('address'),
		city: text('city'),
		postalCode: text('postal_code'),
		surfaceM2: real('surface_m2'),
		purchasePrice: real('purchase_price'),
		purchaseDate: text('purchase_date'),
		notaryFees: real('notary_fees'),
		currentValue: real('current_value'),
		notes: text('notes'),
		createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
		updatedAt: text('updated_at').notNull().default('CURRENT_TIMESTAMP')
	},
	(table) => [index('idx_properties_owner_id').on(table.ownerId)]
);

export const legacyLoans = sqliteTable(
	'loans',
	{
		id: text('id').primaryKey(),
		ownerId: text('owner_id')
			.notNull()
			.references(() => owners.id),
		propertyId: text('property_id').references(() => legacyProperties.id),
		name: text('name').notNull(),
		bank: text('bank').notNull(),
		loanNumber: text('loan_number'),
		type: text('type', { enum: ['mortgage', 'consumer', 'family', 'other'] })
			.notNull()
			.default('mortgage'),
		initialAmount: real('initial_amount').notNull(),
		remainingAmount: real('remaining_amount').notNull(),
		rate: real('rate').notNull(),
		monthlyPayment: real('monthly_payment').notNull(),
		insuranceMonthly: real('insurance_monthly').default(0),
		startDate: text('start_date'),
		endDate: text('end_date'),
		notes: text('notes'),
		createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
		updatedAt: text('updated_at').notNull().default('CURRENT_TIMESTAMP')
	},
	(table) => [
		index('idx_loans_owner_id').on(table.ownerId),
		index('idx_loans_property_id').on(table.propertyId)
	]
);

export const loanSchedule = sqliteTable('loan_schedule', {
	id: text('id').primaryKey(),
	loanId: text('loan_id')
		.notNull()
		.references(() => legacyLoans.id, { onDelete: 'cascade' }),
	date: text('date').notNull(),
	payment: real('payment').notNull(),
	principal: real('principal').notNull(),
	interest: real('interest').notNull(),
	insurance: real('insurance').default(0),
	remaining: real('remaining').notNull()
});

// =====================================================
// ENHANCED REAL ESTATE MODULE
// =====================================================

export const entities = sqliteTable(
	'entities',
	{
		id: text('id').primaryKey(),
		name: text('name').notNull(),
		type: text('type', { enum: ['person', 'sci', 'joint'] }).notNull(),
		email: text('email'),
		color: text('color'),
		// SCI-specific fields
		legalName: text('legal_name'),
		siren: text('siren'),
		rcs: text('rcs'),
		shareCapital: real('share_capital'),
		creationDate: text('creation_date'),
		address: text('address'),
		taxRegime: text('tax_regime'),
		createdAt: text('created_at').default("datetime('now')")
	},
	(table) => [index('idx_entities_type').on(table.type)]
);

export const entityShares = sqliteTable(
	'entity_shares',
	{
		id: text('id').primaryKey(),
		sciId: text('sci_id')
			.notNull()
			.references(() => entities.id, { onDelete: 'cascade' }),
		holderId: text('holder_id')
			.notNull()
			.references(() => entities.id, { onDelete: 'cascade' }),
		sharesCount: integer('shares_count').notNull(),
		percentage: real('percentage').notNull(),
		createdAt: text('created_at').default("datetime('now')")
	},
	(table) => [
		index('idx_entity_shares_sci_id').on(table.sciId),
		index('idx_entity_shares_holder_id').on(table.holderId)
	]
);

export const reProperties = sqliteTable(
	're_properties',
	{
		id: text('id').primaryKey(),
		name: text('name').notNull(),
		type: text('type', { enum: ['apartment', 'house', 'parking', 'land', 'commercial'] }).notNull(),
		category: text('category', {
			enum: ['primary_residence', 'rental_furnished', 'rental_unfurnished', 'secondary', 'sci']
		}).notNull(),
		// Location
		address: text('address').notNull(),
		city: text('city'),
		postalCode: text('postal_code'),
		country: text('country').default('France'),
		// Characteristics
		surfaceM2: real('surface_m2'),
		rooms: integer('rooms'),
		floor: integer('floor'),
		dpeRating: text('dpe_rating', { enum: ['A', 'B', 'C', 'D', 'E', 'F', 'G'] }),
		// Copropriete
		coproName: text('copro_name'),
		coproLots: text('copro_lots'),
		coproTantiemes: integer('copro_tantiemes'),
		syndicName: text('syndic_name'),
		// Acquisition
		purchaseDate: text('purchase_date'),
		purchasePrice: real('purchase_price'),
		notaryFees: real('notary_fees'),
		agencyFees: real('agency_fees'),
		renovationCosts: real('renovation_costs'),
		// Current value
		estimatedValue: real('estimated_value'),
		estimatedValueDate: text('estimated_value_date'),
		// Rental
		isRented: integer('is_rented').default(0),
		monthlyRent: real('monthly_rent'),
		tenantName: text('tenant_name'),
		leaseStartDate: text('lease_start_date'),
		// Annual charges
		annualCoproCharges: real('annual_copro_charges'),
		annualPropertyTax: real('annual_property_tax'),
		// Timestamps
		createdAt: text('created_at').default("datetime('now')"),
		updatedAt: text('updated_at').default("datetime('now')")
	},
	(table) => [
		index('idx_re_properties_type').on(table.type),
		index('idx_re_properties_category').on(table.category)
	]
);

export const propertyOwnership = sqliteTable(
	'property_ownership',
	{
		id: text('id').primaryKey(),
		propertyId: text('property_id')
			.notNull()
			.references(() => reProperties.id, { onDelete: 'cascade' }),
		entityId: text('entity_id')
			.notNull()
			.references(() => entities.id, { onDelete: 'cascade' }),
		percentage: real('percentage').notNull().default(100),
		acquisitionDate: text('acquisition_date'),
		acquisitionType: text('acquisition_type', {
			enum: ['purchase', 'inheritance', 'donation', 'partition']
		}),
		contribution: real('contribution'),
		createdAt: text('created_at').default("datetime('now')")
	},
	(table) => [
		index('idx_property_ownership_property_id').on(table.propertyId),
		index('idx_property_ownership_entity_id').on(table.entityId)
	]
);

export const reLoans = sqliteTable(
	're_loans',
	{
		id: text('id').primaryKey(),
		name: text('name').notNull(),
		propertyId: text('property_id').references(() => reProperties.id, { onDelete: 'set null' }),
		bankName: text('bank_name').notNull(),
		loanNumber: text('loan_number'),
		// Loan parameters
		principalAmount: real('principal_amount').notNull(),
		interestRate: real('interest_rate').notNull(),
		durationMonths: integer('duration_months').notNull(),
		startDate: text('start_date').notNull(),
		endDate: text('end_date'),
		monthlyPayment: real('monthly_payment').notNull(),
		// Insurance
		insuranceRate: real('insurance_rate'),
		insuranceMonthly: real('insurance_monthly'),
		// Current state
		currentBalance: real('current_balance'),
		currentBalanceDate: text('current_balance_date'),
		// Linked account
		linkedAccountId: text('linked_account_id').references(() => accounts.id, { onDelete: 'set null' }),
		// Timestamps
		createdAt: text('created_at').default("datetime('now')"),
		updatedAt: text('updated_at').default("datetime('now')")
	},
	(table) => [index('idx_re_loans_property_id').on(table.propertyId)]
);

export const loanResponsibility = sqliteTable(
	'loan_responsibility',
	{
		id: text('id').primaryKey(),
		loanId: text('loan_id')
			.notNull()
			.references(() => reLoans.id, { onDelete: 'cascade' }),
		entityId: text('entity_id')
			.notNull()
			.references(() => entities.id, { onDelete: 'cascade' }),
		percentage: real('percentage').notNull().default(100),
		createdAt: text('created_at').default("datetime('now')")
	},
	(table) => [
		index('idx_loan_responsibility_loan_id').on(table.loanId),
		index('idx_loan_responsibility_entity_id').on(table.entityId)
	]
);

export const propertyCharges = sqliteTable(
	'property_charges',
	{
		id: text('id').primaryKey(),
		propertyId: text('property_id')
			.notNull()
			.references(() => reProperties.id, { onDelete: 'cascade' }),
		type: text('type', { enum: ['copro', 'tax', 'insurance', 'maintenance', 'other'] }).notNull(),
		name: text('name').notNull(),
		amount: real('amount').notNull(),
		frequency: text('frequency', { enum: ['monthly', 'quarterly', 'annual'] }).notNull(),
		createdAt: text('created_at').default("datetime('now')")
	},
	(table) => [index('idx_property_charges_property_id').on(table.propertyId)]
);

// =====================================================
// IMPORT MODULE - Data Sources
// =====================================================

export const dataSources = sqliteTable(
	'data_sources',
	{
		id: text('id').primaryKey(),
		name: text('name').notNull(),
		type: text('type').notNull(),
		ownerEntityId: text('owner_entity_id')
			.notNull()
			.references(() => entities.id, { onDelete: 'cascade' }),
		linkedAccountId: text('linked_account_id').references(() => accounts.id, { onDelete: 'set null' }),
		url: text('url').notNull(),
		format: text('format').notNull(),
		parserKey: text('parser_key').notNull(),
		lastSyncAt: text('last_sync_at'),
		createdAt: text('created_at').default("datetime('now')")
	},
	(table) => [
		index('idx_data_sources_owner_entity_id').on(table.ownerEntityId),
		index('idx_data_sources_parser_key').on(table.parserKey),
		index('idx_data_sources_linked_account_id').on(table.linkedAccountId)
	]
);

// =====================================================
// INVESTMENTS
// =====================================================

export const positions = sqliteTable(
	'positions',
	{
		id: text('id').primaryKey(),
		accountId: text('account_id')
			.notNull()
			.references(() => accounts.id, { onDelete: 'cascade' }),
		name: text('name').notNull(),
		isin: text('isin'),
		ticker: text('ticker'),
		assetType: text('asset_type', { enum: ['etf', 'stock', 'crypto', 'fund', 'bond'] }).notNull(),
		quantity: real('quantity').notNull(),
		pru: real('pru').notNull(),
		currentPrice: real('current_price'),
		feesTotal: real('fees_total').default(0),
		createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
		updatedAt: text('updated_at').notNull().default('CURRENT_TIMESTAMP')
	},
	(table) => [index('idx_positions_account_id').on(table.accountId)]
);

export const investmentOrders = sqliteTable('investment_orders', {
	id: text('id').primaryKey(),
	positionId: text('position_id')
		.notNull()
		.references(() => positions.id, { onDelete: 'cascade' }),
	date: text('date').notNull(),
	type: text('type', { enum: ['buy', 'sell'] }).notNull(),
	quantity: real('quantity').notNull(),
	price: real('price').notNull(),
	fees: real('fees').default(0),
	total: real('total').notNull()
});

export const priceHistory = sqliteTable(
	'price_history',
	{
		id: text('id').primaryKey(),
		ticker: text('ticker').notNull(),
		date: text('date').notNull(),
		price: real('price').notNull(),
		source: text('source').notNull()
	},
	(table) => [index('idx_price_history_ticker').on(table.ticker)]
);

// =====================================================
// ANALYTICS
// =====================================================

export const netWorthSnapshots = sqliteTable(
	'net_worth_snapshots',
	{
		id: text('id').primaryKey(),
		ownerId: text('owner_id'),
		date: text('date').notNull(),
		cash: real('cash').default(0),
		savings: real('savings').default(0),
		investments: real('investments').default(0),
		realEstate: real('real_estate').default(0),
		debts: real('debts').default(0),
		netWorth: real('net_worth').notNull(),
		createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP')
	},
	(table) => [index('idx_net_worth_snapshots_date').on(table.date)]
);

export const recurringExpenses = sqliteTable('recurring_expenses', {
	id: text('id').primaryKey(),
	ownerId: text('owner_id')
		.notNull()
		.references(() => owners.id),
	accountId: text('account_id').references(() => accounts.id),
	name: text('name').notNull(),
	amount: real('amount').notNull(),
	frequency: text('frequency', { enum: ['monthly', 'quarterly', 'yearly'] }).default('monthly'),
	category: text('category'),
	dayOfMonth: integer('day_of_month'),
	isActive: integer('is_active').default(1),
	createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP')
});

// =====================================================
// RELATIONS
// =====================================================

export const ownersRelations = relations(owners, ({ many }) => ({
	users: many(users),
	accounts: many(accounts),
	properties: many(legacyProperties),
	loans: many(legacyLoans),
	recurringExpenses: many(recurringExpenses)
}));

export const usersRelations = relations(users, ({ one, many }) => ({
	owner: one(owners, { fields: [users.ownerId], references: [owners.id] }),
	banks: many(banks)
}));

export const banksRelations = relations(banks, ({ one, many }) => ({
	user: one(users, { fields: [banks.userId], references: [users.id] }),
	accounts: many(accounts)
}));

export const accountsRelations = relations(accounts, ({ one, many }) => ({
	bank: one(banks, { fields: [accounts.bankId], references: [banks.id] }),
	owner: one(owners, { fields: [accounts.ownerId], references: [owners.id] }),
	transactions: many(transactions),
	positions: many(positions)
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
	account: one(accounts, { fields: [transactions.accountId], references: [accounts.id] })
}));

export const entitiesRelations = relations(entities, ({ many }) => ({
	ownedShares: many(entityShares, { relationName: 'holder' }),
	sciShares: many(entityShares, { relationName: 'sci' }),
	propertyOwnerships: many(propertyOwnership),
	loanResponsibilities: many(loanResponsibility),
	dataSources: many(dataSources)
}));

export const entitySharesRelations = relations(entityShares, ({ one }) => ({
	sci: one(entities, { fields: [entityShares.sciId], references: [entities.id], relationName: 'sci' }),
	holder: one(entities, {
		fields: [entityShares.holderId],
		references: [entities.id],
		relationName: 'holder'
	})
}));

export const rePropertiesRelations = relations(reProperties, ({ one, many }) => ({
	loan: one(reLoans, { fields: [reProperties.id], references: [reLoans.propertyId] }),
	ownerships: many(propertyOwnership),
	charges: many(propertyCharges)
}));

export const propertyOwnershipRelations = relations(propertyOwnership, ({ one }) => ({
	property: one(reProperties, {
		fields: [propertyOwnership.propertyId],
		references: [reProperties.id]
	}),
	entity: one(entities, { fields: [propertyOwnership.entityId], references: [entities.id] })
}));

export const reLoansRelations = relations(reLoans, ({ one, many }) => ({
	property: one(reProperties, { fields: [reLoans.propertyId], references: [reProperties.id] }),
	linkedAccount: one(accounts, { fields: [reLoans.linkedAccountId], references: [accounts.id] }),
	responsibilities: many(loanResponsibility)
}));

export const loanResponsibilityRelations = relations(loanResponsibility, ({ one }) => ({
	loan: one(reLoans, { fields: [loanResponsibility.loanId], references: [reLoans.id] }),
	entity: one(entities, { fields: [loanResponsibility.entityId], references: [entities.id] })
}));

export const propertyChargesRelations = relations(propertyCharges, ({ one }) => ({
	property: one(reProperties, { fields: [propertyCharges.propertyId], references: [reProperties.id] })
}));

export const positionsRelations = relations(positions, ({ one, many }) => ({
	account: one(accounts, { fields: [positions.accountId], references: [accounts.id] }),
	orders: many(investmentOrders)
}));

export const investmentOrdersRelations = relations(investmentOrders, ({ one }) => ({
	position: one(positions, { fields: [investmentOrders.positionId], references: [positions.id] })
}));

export const dataSourcesRelations = relations(dataSources, ({ one }) => ({
	ownerEntity: one(entities, { fields: [dataSources.ownerEntityId], references: [entities.id] }),
	linkedAccount: one(accounts, { fields: [dataSources.linkedAccountId], references: [accounts.id] })
}));
