import type { ReactNode } from 'react';
import { Button, Card, Plus } from '@/components';
import { BankLogo } from '@/components/banks/BankLogo';
import { MoneyDisplay } from '@/components/common/MoneyDisplay';

interface BankRowProps {
	bankId: string;
	bankName: string;
	bankColor: string;
	logo: string | null;
	description?: string | null;
	accountCount: number;
	totalBalance: number;
	onAddAccount: () => void;
	onLogoChange: (url: string) => void;
	accountsList?: ReactNode;
	animationDelay?: number;
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
	const hasAccounts = accountCount > 0;

	// Content for banks WITH accounts (includes action buttons)
	const contentWithAccounts = (
		<>
			{/* Bank header */}
			<div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:gap-4">
				<div className="flex items-center gap-3 min-w-0 flex-1">
					<BankLogo
						bankId={bankId}
						bankName={bankName}
						bankColor={bankColor}
						logo={logo}
						size="lg"
						onLogoChange={onLogoChange}
					/>
					<div className="flex flex-col gap-0.5 min-w-0 flex-1">
						<div className="flex flex-wrap items-center gap-x-2 gap-y-1">
							<h3 className="text-base font-bold tracking-tight sm:text-lg">
								{bankName}
							</h3>
							<span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground whitespace-nowrap">
								{accountCount} compte{accountCount > 1 ? 's' : ''}
							</span>
						</div>
						{description && (
							<p className="text-xs text-muted-foreground sm:text-sm line-clamp-1">{description}</p>
						)}
					</div>
				</div>
				<div className="flex items-center justify-between gap-2 sm:justify-end">
					<MoneyDisplay
						amount={totalBalance}
						className="text-base font-semibold sm:text-lg"
					/>
					<Button
						variant="ghost"
						size="sm"
						iconLeft={<Plus className="h-4 w-4" />}
						onClick={(e) => {
							e.stopPropagation();
							onAddAccount();
						}}
					>
						<span className="hidden sm:inline">Ajouter</span>
						<span className="sm:hidden">+</span>
					</Button>
				</div>
			</div>

			{/* Accounts list */}
			{accountsList && (
				<div className="flex flex-col gap-2 px-3 pb-3 sm:ml-14 sm:px-4 sm:pb-4">{accountsList}</div>
			)}
		</>
	);

	// Content for banks WITHOUT accounts (simplified, no nested buttons)
	const contentEmptyBank = (
		<div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:gap-4">
			<div className="flex items-center gap-3 min-w-0 flex-1">
				<BankLogo
					bankId={bankId}
					bankName={bankName}
					bankColor={bankColor}
					logo={logo}
					size="lg"
					onLogoChange={onLogoChange}
					disabled
				/>
				<div className="flex flex-col gap-0.5 min-w-0 flex-1">
					<div className="flex flex-wrap items-center gap-x-2 gap-y-1">
						<h3 className="text-base font-bold tracking-tight text-muted-foreground sm:text-lg">
							{bankName}
						</h3>
						<span className="text-xs italic text-muted-foreground">Aucun compte</span>
					</div>
					{description && (
						<p className="text-xs text-muted-foreground sm:text-sm line-clamp-1">{description}</p>
					)}
				</div>
			</div>
			<div className="flex items-center justify-end">
				<span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
					<Plus className="h-4 w-4" />
					<span className="hidden sm:inline">Ajouter un compte</span>
					<span className="sm:hidden">Ajouter</span>
				</span>
			</div>
		</div>
	);

	// CSS custom properties for dynamic values
	const cssVars = {
		'--bank-color': bankColor,
		'--animation-delay': `${animationDelay}ms`,
	} as React.CSSProperties;

	// Return different markup based on whether bank has accounts
	if (!hasAccounts) {
		return (
			<button
				type="button"
				onClick={onAddAccount}
				className="w-full cursor-pointer rounded-xl border-2 border-dashed border-border/40 bg-muted/20 p-0 text-left transition-all hover:bg-muted/30 hover:border-border/60 border-l-4 border-l-[var(--bank-color)] animate-in fade-in"
				style={cssVars}
			>
				{contentEmptyBank}
			</button>
		);
	}

	return (
		<Card
			className="overflow-hidden p-0 transition-all border-l-4 border-l-[var(--bank-color)] animate-in fade-in"
			style={cssVars}
		>
			{contentWithAccounts}
		</Card>
	);
}
