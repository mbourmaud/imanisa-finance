'use client'

import { useState } from 'react'
import Link from 'next/link';
import {
	ArrowDown,
	Button,
	Calendar,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	ChevronDown,
	ChevronUp,
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
	Shield,
	Sigma,
	FileSpreadsheet,
	type LucideIcon,
} from '@/components';
import { LoanAmortizationTable } from './LoanAmortizationTable';
import { LoanInfoBox } from './LoanInfoBox';
import { formatMoney, formatMoneyCompact } from '@/shared/utils';

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
	startDate: string;
	endDate: string | null;
	loanInsurances: LoanInsurance[];
}

interface LoanCardProps {
	loan: LoanData;
	icon: LucideIcon;
}

function calculateTotalMonths(startDate: string, endDate: string | null): number {
	if (!endDate) return 0
	const start = new Date(startDate)
	const end = new Date(endDate)
	return Math.max(0, (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()))
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
	const [showAmortization, setShowAmortization] = useState(false)
	const progress = ((loan.initialAmount - loan.remainingAmount) / loan.initialAmount) * 100;
	const remainingMonths = calculateRemainingMonths(loan.endDate);
	const loanInsuranceTotal = loan.loanInsurances.reduce((sum, ins) => sum + ins.monthlyPremium, 0);
	const canShowAmortization = loan.rate > 0 && loan.monthlyPayment > 0

	const totalMonths = calculateTotalMonths(loan.startDate, loan.endDate)
	const hasFullData = totalMonths > 0 && loan.monthlyPayment > 0
	const interestCost = hasFullData ? Math.max(0, loan.monthlyPayment * totalMonths - loan.initialAmount) : 0
	const insuranceCost = hasFullData ? loanInsuranceTotal * totalMonths : 0
	const insuranceRate = loan.initialAmount > 0 && loanInsuranceTotal > 0
		? (loanInsuranceTotal * 12 / loan.initialAmount) * 100
		: 0

	return (
		<Card className="group border-border/60">
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
								{formatMoneyCompact(loan.initialAmount - loan.remainingAmount)}
							</span>
							<span className="text-xs text-muted-foreground">Capital remboursé</span>
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
					{/* Mobile: Show repaid amount */}
					<div className="flex flex-col gap-1 sm:hidden">
						<span className="text-2xl font-semibold tabular-nums">
							{formatMoneyCompact(loan.initialAmount - loan.remainingAmount)}
						</span>
						<span className="text-xs text-muted-foreground">Capital remboursé</span>
					</div>

					{/* Progress Bar */}
					<div className="flex flex-col gap-2">
						<div className="flex flex-row justify-between">
							<span className="text-xs text-muted-foreground">
								Remboursé: {formatMoneyCompact(loan.initialAmount - loan.remainingAmount)}
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
							value={formatMoneyCompact(loan.monthlyPayment)}
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
							value={formatMoneyCompact(loan.initialAmount)}
							sublabel="Emprunté"
						/>
					</div>

					{/* Cost Grid */}
					{hasFullData && (
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-border/40">
							<LoanInfoBox
								icon={Percent}
								label="Taux assurance"
								value={insuranceRate > 0 ? `${insuranceRate.toFixed(2)}%` : '—'}
								sublabel="TAEA"
							/>
							<LoanInfoBox
								icon={Euro}
								label="Coût intérêts"
								value={formatMoneyCompact(interestCost)}
								sublabel="Sur la durée totale"
							/>
							<LoanInfoBox
								icon={Shield}
								label="Coût assurance"
								value={insuranceCost > 0 ? formatMoneyCompact(insuranceCost) : '—'}
								sublabel="Sur la durée totale"
							/>
							<LoanInfoBox
								icon={Sigma}
								label="Coût total"
								value={formatMoneyCompact(interestCost + insuranceCost)}
								sublabel="Intérêts + assurance"
							/>
						</div>
					)}

					{/* Amortization Table */}
					{canShowAmortization && (
						<div className="pt-2 border-t border-border/40">
							<button
								type="button"
								onClick={() => setShowAmortization(!showAmortization)}
								className="flex items-center justify-between w-full text-left py-1 cursor-pointer rounded-lg px-2 -mx-2 hover:bg-muted/50 transition-colors"
							>
								<div className="flex items-center gap-2">
									<FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
									<span className="text-sm font-medium">Tableau d'amortissement</span>
								</div>
								{showAmortization ? (
									<ChevronUp className="h-4 w-4 text-muted-foreground" />
								) : (
									<ChevronDown className="h-4 w-4 text-muted-foreground" />
								)}
							</button>
							{showAmortization && (
								<div className="mt-3">
									<LoanAmortizationTable
										initialAmount={loan.initialAmount}
										rate={loan.rate}
										monthlyPayment={loan.monthlyPayment}
										startDate={loan.startDate}
									/>
								</div>
							)}
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
