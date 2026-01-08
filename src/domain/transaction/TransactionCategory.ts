export enum TransactionCategory {
	SALARY = 'SALARY',
	FREELANCE = 'FREELANCE',
	DIVIDENDS = 'DIVIDENDS',
	RENTAL_INCOME = 'RENTAL_INCOME',
	REFUND = 'REFUND',
	OTHER_INCOME = 'OTHER_INCOME',

	HOUSING = 'HOUSING',
	UTILITIES = 'UTILITIES',
	GROCERIES = 'GROCERIES',
	RESTAURANTS = 'RESTAURANTS',
	TRANSPORT = 'TRANSPORT',
	HEALTH = 'HEALTH',
	INSURANCE = 'INSURANCE',
	SUBSCRIPTIONS = 'SUBSCRIPTIONS',
	SHOPPING = 'SHOPPING',
	LEISURE = 'LEISURE',
	TRAVEL = 'TRAVEL',
	EDUCATION = 'EDUCATION',
	TAXES = 'TAXES',
	FEES = 'FEES',
	SAVINGS = 'SAVINGS',
	INVESTMENT = 'INVESTMENT',
	LOAN_PAYMENT = 'LOAN_PAYMENT',
	OTHER_EXPENSE = 'OTHER_EXPENSE',

	TRANSFER = 'TRANSFER'
}

export const TransactionCategoryLabels: Record<TransactionCategory, string> = {
	[TransactionCategory.SALARY]: 'Salaire',
	[TransactionCategory.FREELANCE]: 'Freelance',
	[TransactionCategory.DIVIDENDS]: 'Dividendes',
	[TransactionCategory.RENTAL_INCOME]: 'Revenus locatifs',
	[TransactionCategory.REFUND]: 'Remboursement',
	[TransactionCategory.OTHER_INCOME]: 'Autres revenus',

	[TransactionCategory.HOUSING]: 'Logement',
	[TransactionCategory.UTILITIES]: 'Charges',
	[TransactionCategory.GROCERIES]: 'Courses',
	[TransactionCategory.RESTAURANTS]: 'Restaurants',
	[TransactionCategory.TRANSPORT]: 'Transport',
	[TransactionCategory.HEALTH]: 'Santé',
	[TransactionCategory.INSURANCE]: 'Assurance',
	[TransactionCategory.SUBSCRIPTIONS]: 'Abonnements',
	[TransactionCategory.SHOPPING]: 'Shopping',
	[TransactionCategory.LEISURE]: 'Loisirs',
	[TransactionCategory.TRAVEL]: 'Voyages',
	[TransactionCategory.EDUCATION]: 'Éducation',
	[TransactionCategory.TAXES]: 'Impôts',
	[TransactionCategory.FEES]: 'Frais bancaires',
	[TransactionCategory.SAVINGS]: 'Épargne',
	[TransactionCategory.INVESTMENT]: 'Investissement',
	[TransactionCategory.LOAN_PAYMENT]: 'Crédit',
	[TransactionCategory.OTHER_EXPENSE]: 'Autres dépenses',

	[TransactionCategory.TRANSFER]: 'Virement interne'
};

export const TransactionCategoryColors: Record<TransactionCategory, string> = {
	[TransactionCategory.SALARY]: '#10B981',
	[TransactionCategory.FREELANCE]: '#34D399',
	[TransactionCategory.DIVIDENDS]: '#6EE7B7',
	[TransactionCategory.RENTAL_INCOME]: '#A7F3D0',
	[TransactionCategory.REFUND]: '#D1FAE5',
	[TransactionCategory.OTHER_INCOME]: '#ECFDF5',

	[TransactionCategory.HOUSING]: '#EF4444',
	[TransactionCategory.UTILITIES]: '#F97316',
	[TransactionCategory.GROCERIES]: '#FB923C',
	[TransactionCategory.RESTAURANTS]: '#FDBA74',
	[TransactionCategory.TRANSPORT]: '#3B82F6',
	[TransactionCategory.HEALTH]: '#EC4899',
	[TransactionCategory.INSURANCE]: '#8B5CF6',
	[TransactionCategory.SUBSCRIPTIONS]: '#6366F1',
	[TransactionCategory.SHOPPING]: '#A855F7',
	[TransactionCategory.LEISURE]: '#D946EF',
	[TransactionCategory.TRAVEL]: '#14B8A6',
	[TransactionCategory.EDUCATION]: '#0EA5E9',
	[TransactionCategory.TAXES]: '#64748B',
	[TransactionCategory.FEES]: '#94A3B8',
	[TransactionCategory.SAVINGS]: '#22C55E',
	[TransactionCategory.INVESTMENT]: '#16A34A',
	[TransactionCategory.LOAN_PAYMENT]: '#DC2626',
	[TransactionCategory.OTHER_EXPENSE]: '#CBD5E1',

	[TransactionCategory.TRANSFER]: '#9CA3AF'
};

export const IncomeCategories = [
	TransactionCategory.SALARY,
	TransactionCategory.FREELANCE,
	TransactionCategory.DIVIDENDS,
	TransactionCategory.RENTAL_INCOME,
	TransactionCategory.REFUND,
	TransactionCategory.OTHER_INCOME
];

export const ExpenseCategories = [
	TransactionCategory.HOUSING,
	TransactionCategory.UTILITIES,
	TransactionCategory.GROCERIES,
	TransactionCategory.RESTAURANTS,
	TransactionCategory.TRANSPORT,
	TransactionCategory.HEALTH,
	TransactionCategory.INSURANCE,
	TransactionCategory.SUBSCRIPTIONS,
	TransactionCategory.SHOPPING,
	TransactionCategory.LEISURE,
	TransactionCategory.TRAVEL,
	TransactionCategory.EDUCATION,
	TransactionCategory.TAXES,
	TransactionCategory.FEES,
	TransactionCategory.SAVINGS,
	TransactionCategory.INVESTMENT,
	TransactionCategory.LOAN_PAYMENT,
	TransactionCategory.OTHER_EXPENSE
];
