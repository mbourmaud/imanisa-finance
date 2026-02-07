import type { ReactNode } from 'react'
import { Button, Card, Plus } from '@/components'
import { BankLogo } from '@/components/banks/BankLogo'
import { MoneyDisplay } from '@/components/common/MoneyDisplay'

interface BankRowProps {
	bankId: string
	bankName: string
	bankColor: string
	logo: string | null
	description?: string | null
	accountCount: number
	totalBalance: number
	onAddAccount: () => void
	accountsList?: ReactNode
}

/**
 * Bank row displaying bank info with optional accounts list
 */
export function BankRow({
	bankId,
	bankName,
	bankColor,
	logo,
	description,
	accountCount,
	totalBalance,
	onAddAccount,
	accountsList,
}: BankRowProps) {
	if (accountCount === 0) {
		return (
			<button
				type="button"
				onClick={onAddAccount}
				className="w-full cursor-pointer rounded-xl border-2 border-dashed border-border/50 p-4 sm:p-5 text-left transition-colors hover:bg-muted/40 hover:border-border"
			>
				<div className="flex items-center gap-4">
					<BankLogo
						bankId={bankId}
						bankName={bankName}
						bankColor={bankColor}
						logo={logo}
						size="lg"
						disabled
					/>
					<div className="flex flex-col gap-0.5 min-w-0 flex-1">
						<h3 className="text-sm font-semibold text-muted-foreground">
							{bankName}
						</h3>
						{description && (
							<p className="text-xs text-muted-foreground/70 line-clamp-1">{description}</p>
						)}
					</div>
					<span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary shrink-0">
						<Plus className="h-4 w-4" />
						<span className="hidden sm:inline">Ajouter un compte</span>
					</span>
				</div>
			</button>
		)
	}

	return (
		<Card padding="none" className="overflow-hidden">
			{/* Bank header */}
			<div className="flex items-center gap-4 p-4 sm:p-5">
				<BankLogo
					bankId={bankId}
					bankName={bankName}
					bankColor={bankColor}
					logo={logo}
					size="lg"
				/>
				<div className="flex flex-col gap-0.5 min-w-0 flex-1">
					<div className="flex flex-wrap items-center gap-x-2 gap-y-1">
						<h3 className="text-sm font-semibold sm:text-base">
							{bankName}
						</h3>
						<span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
							{accountCount} compte{accountCount > 1 ? 's' : ''}
						</span>
					</div>
					{description && (
						<p className="text-xs text-muted-foreground line-clamp-1">{description}</p>
					)}
				</div>
				<div className="flex items-center gap-3 shrink-0">
					<MoneyDisplay
						amount={totalBalance}
						className="text-sm font-semibold sm:text-base tabular-nums"
					/>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 text-muted-foreground"
						onClick={(e) => {
							e.stopPropagation()
							onAddAccount()
						}}
					>
						<Plus className="h-4 w-4" />
						<span className="sr-only">Ajouter un compte</span>
					</Button>
				</div>
			</div>

			{/* Accounts list */}
			{accountsList && (
				<div className="flex flex-col gap-1 border-t px-4 py-3 sm:px-5 sm:py-4 bg-muted/30">
					{accountsList}
				</div>
			)}
		</Card>
	)
}
