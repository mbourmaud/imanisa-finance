import type { ReactNode } from 'react'
import { Button, Flex, GlassCard, Plus } from '@/components'
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
	onLogoChange: (url: string) => void
	accountsList?: ReactNode
	animationDelay?: number
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
	onLogoChange,
	accountsList,
	animationDelay = 0,
}: BankRowProps) {
	const hasAccounts = accountCount > 0

	const contentMarkup = (
		<>
			{/* Bank header */}
			<Flex direction="row" gap="md" className="p-3">
				<BankLogo
					bankId={bankId}
					bankName={bankName}
					bankColor={bankColor}
					logo={logo}
					size="lg"
					onLogoChange={onLogoChange}
				/>
				<Flex direction="col" gap="xs" className="min-w-0 flex-1">
					<Flex direction="row" gap="sm" align="center">
						<h3
							className={`text-lg font-bold tracking-tight ${!hasAccounts ? 'text-muted-foreground' : ''}`}
						>
							{bankName}
						</h3>
						{hasAccounts ? (
							<span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
								{accountCount} compte{accountCount > 1 ? 's' : ''}
							</span>
						) : (
							<span className="text-xs italic text-muted-foreground">Aucun compte</span>
						)}
					</Flex>
					{description && (
						<p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
					)}
				</Flex>
				{hasAccounts ? (
					<>
						<MoneyDisplay amount={totalBalance} size="lg" weight="semibold" />
						<Button
							variant="ghost"
							size="sm"
							iconLeft={<Plus className="h-4 w-4" />}
							onClick={(e) => {
								e.stopPropagation()
								onAddAccount()
							}}
						>
							Ajouter
						</Button>
					</>
				) : (
					<Button
						variant="default"
						size="sm"
						iconLeft={<Plus className="h-4 w-4" />}
						onClick={(e) => {
							e.stopPropagation()
							onAddAccount()
						}}
					>
						Ajouter un compte
					</Button>
				)}
			</Flex>

			{/* Accounts list */}
			{accountsList && (
				<Flex direction="col" gap="sm" className="ml-16 px-4 pb-4">
					{accountsList}
				</Flex>
			)}
		</>
	)

	// Return different markup based on whether bank has accounts
	if (!hasAccounts) {
		return (
			<button
				type="button"
				onClick={onAddAccount}
				className="w-full cursor-pointer rounded-xl border-2 border-dashed border-border/40 bg-muted/20 p-0 text-left transition-all"
				style={{
					borderLeft: `4px solid ${bankColor}`,
					animationDelay: `${animationDelay}ms`,
					animationFillMode: 'backwards',
				}}
			>
				{contentMarkup}
			</button>
		)
	}

	return (
		<GlassCard
			className="overflow-hidden p-0 transition-all"
			style={{
				borderLeft: `4px solid ${bankColor}`,
				animationDelay: `${animationDelay}ms`,
				animationFillMode: 'backwards',
			}}
		>
			{contentMarkup}
		</GlassCard>
	)
}
