export type TransactionType = 'income' | 'expense' | 'transfer'

export interface TransactionCategory {
	id: string
	name: string
	color?: string
	icon?: string
}

export interface TransactionData {
	id: string
	description: string
	amount: number
	currency?: string
	type: TransactionType
	date: Date | string
	category?: TransactionCategory | null
	accountName?: string
	isReconciled?: boolean
	isInternal?: boolean
}
