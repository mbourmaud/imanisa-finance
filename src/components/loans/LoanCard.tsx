import Link from 'next/link';
import {
	ArrowDown,
	Button,
	Calendar,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	Euro,
	ExternalLink,
	IconBox,
	MoreHorizontal,
	Percent,
	Progress,
	type LucideIcon,
} from '@/components';
import { LoanInfoBox } from './LoanInfoBox';
import { formatMoney } from '@/shared/utils';

interface LoanInsurance {
	monthlyPremium: number;
}

interface LoanProperty {
	name: string;
}

export interface LoanData {
	id: string;
	name: string;
	lender: string | null;
	rate: number;
	propertyId: string;
	property: LoanProperty;
	initialAmount: number;
	remainingAmount: number;
	monthlyPayment: number;
	endDate: string | null;
	loanInsurances: LoanInsurance[];
}

interface LoanCardProps {
	loan: LoanData;
	icon: LucideIcon;
}

function formatCurrency(amount: number): string {
	return new Intl.NumberFormat('fr-FR', {
		style: 'currency',
		currency: 'EUR',
		maximumFractionDigits: 0,
	}).format(amount);
}

function calculateRemainingMonths(endDate: string | null): number {
	if (!endDate) return 0;
	const end = new Date(endDate);
	const now = new Date();
	const months = (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth());
	return Math.max(0, months);
}

function formatRemainingTime(endDate: string | null): string {
	if (!endDate) return 'Non définie';
	const months = calculateRemainingMonths(endDate);
	const years = Math.floor(months / 12);
	const remainingMonths = months % 12;

	if (years > 0 && remainingMonths > 0) {
		return `${years} an${years > 1 ? 's' : ''} et ${remainingMonths} mois`;
	}
	if (years > 0) {
		return `${years} an${years > 1 ? 's' : ''}`;
	}
	return `${remainingMonths} mois`;
}

/**
 * Card displaying a single loan with all its details
 */
export function LoanCard({ loan, icon: Icon }: LoanCardProps) {
	const progress = ((loan.initialAmount - loan.remainingAmount) / loan.initialAmount) * 100;
	const remainingMonths = calculateRemainingMonths(loan.endDate);
	const loanInsuranceTotal = loan.loanInsurances.reduce((sum, ins) => sum + ins.monthlyPremium, 0);

	return (
		<Card className="border-border/60">
			<CardHeader className="pb-3">
				<div className="flex flex-row justify-between items-start">
					<div className="flex flex-row gap-4">
						<IconBox icon={Icon} size="lg" variant="primary" rounded="xl" />
						<div className="flex flex-col gap-1">
							<CardTitle className="text-lg font-medium">{loan.name}</CardTitle>
							<span className="text-sm text-muted-foreground">
								{loan.lender || 'Prêt familial'} · {loan.rate}%
							</span>
							<Link
								href={`/dashboard/real-estate/${loan.propertyId}`}
								className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 hover:text-foreground transition-colors"
							>
								{loan.property.name}
								<ExternalLink className="h-3 w-3" />
							</Link>
						</div>
					</div>
					<div className="flex flex-row gap-4">
						<div className="flex flex-col gap-1 items-end hidden sm:flex">
							<span className="text-2xl font-semibold tabular-nums">
								{formatCurrency(loan.remainingAmount)}
							</span>
							<span className="text-xs text-muted-foreground">Capital restant</span>
						</div>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
								>
									<MoreHorizontal className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem asChild>
									<Link href={`/dashboard/real-estate/${loan.propertyId}`}>Voir le bien</Link>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem className="text-muted-foreground">
									Autres options à venir
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<div className="flex flex-col gap-4">
					{/* Mobile: Show remaining amount */}
					<div className="flex flex-col gap-1 sm:hidden">
						<span className="text-2xl font-semibold tabular-nums">
							{formatCurrency(loan.remainingAmount)}
						</span>
						<span className="text-xs text-muted-foreground">Capital restant</span>
					</div>

					{/* Progress Bar */}
					<div className="flex flex-col gap-2">
						<div className="flex flex-row justify-between">
							<span className="text-xs text-muted-foreground">
								Remboursé: {formatCurrency(loan.initialAmount - loan.remainingAmount)}
							</span>
							<span className="text-xs font-medium">{progress.toFixed(1)}%</span>
						</div>
						<Progress value={progress} className="h-2" />
					</div>

					{/* Info Grid */}
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-border/40">
						<LoanInfoBox
							icon={Euro}
							label="Mensualité"
							value={formatCurrency(loan.monthlyPayment)}
							sublabel={
								loanInsuranceTotal > 0
									? `+ ${formatMoney(loanInsuranceTotal)} assurance`
									: undefined
							}
						/>
						<LoanInfoBox
							icon={Percent}
							label="Taux"
							value={`${loan.rate}%`}
							sublabel="Taux nominal"
						/>
						<LoanInfoBox
							icon={Calendar}
							label="Durée restante"
							value={formatRemainingTime(loan.endDate)}
							sublabel={loan.endDate ? `${remainingMonths} échéances` : undefined}
						/>
						<LoanInfoBox
							icon={ArrowDown}
							label="Montant initial"
							value={formatCurrency(loan.initialAmount)}
							sublabel="Emprunté"
						/>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
