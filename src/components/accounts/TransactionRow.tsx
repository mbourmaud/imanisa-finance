'use client'

import { Flex } from '@/components'
import { MoneyDisplay } from '@/components/common/MoneyDisplay'
import { formatDate } from '@/shared/utils'

interface TransactionCategory {
	categoryId: string
	category: {
		id: string
		name: string
		icon: string
		color: string
	}
}

interface TransactionRowProps {
	id: string
	date: string
	description: string
	amount: number
	type: string
	transactionCategory?: TransactionCategory | null
	animationDelay?: number
}

/**
 * Row displaying a transaction with date badge and amount
 */
export function TransactionRow({
	id,
	date,
	description,
	amount,
	type,
	transactionCategory,
	animationDelay = 0,
}: TransactionRowProps) {
	return (
		<Flex
			direction="row"
			justify="between"
			align="center"
			className="p-3.5 px-4 rounded-xl transition-all cursor-default hover:bg-muted/30"
			style={{ animationDelay: `${animationDelay}ms` }}
		>
			<Flex direction="row" gap="md" align="center" className="min-w-0">
				{/* Date badge */}
				<div className="w-16 flex-shrink-0">
					<Flex
						direction="col"
						gap="none"
						align="center"
						className="inline-flex px-2 py-1.5 rounded-lg bg-muted/40 transition-colors"
					>
						<span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
							{formatDate(date, 'MMM')}
						</span>
						<span className="text-sm font-bold -mt-0.5">{formatDate(date, 'D')}</span>
					</Flex>
				</div>
				<Flex direction="col" gap="xs" className="min-w-0">
					<span className="font-medium truncate transition-colors">{description}</span>
					{transactionCategory?.category && (
						<Flex direction="row" gap="xs" className="mt-0.5">
							<span className="text-xs text-muted-foreground">
								{transactionCategory.category.icon}
							</span>
							<span className="text-xs text-muted-foreground">
								{transactionCategory.category.name}
							</span>
						</Flex>
					)}
				</Flex>
			</Flex>
			<MoneyDisplay
				amount={type === 'INCOME' ? amount : -amount}
				format="withSign"
				size="md"
				weight="bold"
				variant={type === 'INCOME' ? 'positive' : 'default'}
				className="flex-shrink-0 ml-4"
			/>
		</Flex>
	)
}
