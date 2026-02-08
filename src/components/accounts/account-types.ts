import type { LucideIcon } from 'lucide-react'
import {
	Building,
	CreditCard,
	PiggyBank,
	TrendingUp,
	Wallet,
} from 'lucide-react'

export type AccountType =
	| 'CHECKING'
	| 'SAVINGS'
	| 'INVESTMENT'
	| 'LOAN'
	| 'PEA'
	| 'CTO'
	| 'ASSURANCE_VIE'
	| 'CRYPTO'
	| 'REAL_ESTATE'
	| 'CREDIT'

export interface AccountBank {
	id: string
	name: string
	color?: string
	shortName?: string
}

export interface AccountMember {
	id: string
	name: string
	color?: string | null
	avatarUrl?: string | null
	ownerShare: number
}

export interface AccountData {
	id: string
	name: string
	type: AccountType
	balance: number
	currency?: string
	bank?: AccountBank | null
	members?: AccountMember[]
	lastSyncAt?: Date | null
}

const accountTypeConfig: Record<string, { label: string; labelShort: string; icon: LucideIcon }> = {
	CHECKING: { label: 'Compte courant', labelShort: 'Courant', icon: Wallet },
	SAVINGS: { label: 'Livret', labelShort: 'Épargne', icon: PiggyBank },
	INVESTMENT: { label: 'Investissement', labelShort: 'Invest', icon: TrendingUp },
	LOAN: { label: 'Prêt', labelShort: 'Prêt', icon: CreditCard },
	PEA: { label: 'PEA', labelShort: 'PEA', icon: TrendingUp },
	CTO: { label: 'CTO', labelShort: 'CTO', icon: TrendingUp },
	ASSURANCE_VIE: { label: 'Assurance vie', labelShort: 'AV', icon: PiggyBank },
	CRYPTO: { label: 'Crypto', labelShort: 'Crypto', icon: TrendingUp },
	REAL_ESTATE: { label: 'Bien immobilier', labelShort: 'Immo', icon: Building },
	CREDIT: { label: 'Crédit', labelShort: 'Crédit', icon: CreditCard },
}

const defaultConfig = { label: 'Compte', labelShort: 'Compte', icon: Wallet }

export function getAccountTypeConfig(type: AccountType) {
	return accountTypeConfig[type] || defaultConfig
}

export function formatBalance(balance: number, currency = 'EUR'): string {
	return new Intl.NumberFormat('fr-FR', {
		style: 'currency',
		currency,
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(balance)
}
