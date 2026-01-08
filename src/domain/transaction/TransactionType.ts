export enum TransactionType {
	INCOME = 'INCOME',
	EXPENSE = 'EXPENSE',
	TRANSFER = 'TRANSFER'
}

export const TransactionTypeLabels: Record<TransactionType, string> = {
	[TransactionType.INCOME]: 'Revenu',
	[TransactionType.EXPENSE]: 'Dépense',
	[TransactionType.TRANSFER]: 'Virement'
};
