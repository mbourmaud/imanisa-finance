'use client';

import { useState } from 'react';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
	Button,
	ChevronDown,
	ChevronUp,
	Loader2,
	Plus,
	Progress,
	Shield,
	Trash2,
} from '@/components';

interface LoanInsurance {
	id: string;
	provider: string;
	coveragePercent: number;
	monthlyPremium: number;
	member: {
		name: string;
		color: string | null;
	};
}

interface Loan {
	id: string;
	name: string;
	lender: string | null;
	loanNumber: string | null;
	initialAmount: number;
	remainingAmount: number;
	monthlyPayment: number;
	rate: number;
	loanInsurances?: LoanInsurance[];
}

interface PropertyDetailLoanCardProps {
	loan: Loan;
	onAddInsurance: (loanId: string) => void;
	onDelete: (loanId: string) => void;
	isDeleting: boolean;
	formatCurrency: (amount: number) => string;
}

/**
 * Loan card component for property detail page with expandable insurance section
 */
export function PropertyDetailLoanCard({
	loan,
	onAddInsurance,
	onDelete,
	isDeleting,
	formatCurrency,
}: PropertyDetailLoanCardProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const paidPercent =
		loan.initialAmount > 0
			? ((loan.initialAmount - loan.remainingAmount) / loan.initialAmount) * 100
			: 0;

	const hasInsurances = loan.loanInsurances && loan.loanInsurances.length > 0;
	const totalInsurancePremium =
		loan.loanInsurances?.reduce((sum, ins) => sum + ins.monthlyPremium, 0) || 0;
	const totalCoverage =
		loan.loanInsurances?.reduce((sum, ins) => sum + ins.coveragePercent, 0) || 0;

	return (
		<div className="rounded-xl border border-border/60 p-4">
			<div className="flex flex-col gap-4">
				<div className="flex justify-between items-start gap-4">
					<div className="min-w-0">
						<p className="font-medium truncate">{loan.name}</p>
						{loan.lender && <p className="text-sm text-muted-foreground">{loan.lender}</p>}
					</div>
					<div className="flex items-start gap-2 shrink-0">
						<div className="text-right">
							<p className="text-lg font-semibold tabular-nums">
								{formatCurrency(loan.remainingAmount)}
							</p>
							<p className="text-xs text-muted-foreground">restant</p>
						</div>
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 text-muted-foreground hover:text-destructive"
									disabled={isDeleting}
								>
									{isDeleting ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<Trash2 className="h-4 w-4" />
									)}
									<span className="sr-only">Supprimer le prêt</span>
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Supprimer le prêt</AlertDialogTitle>
									<AlertDialogDescription>
										Êtes-vous sûr de vouloir supprimer le prêt « {loan.name} » ? Les assurances
										emprunteur associées seront également supprimées.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Annuler</AlertDialogCancel>
									<AlertDialogAction
										onClick={() => onDelete(loan.id)}
										className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
									>
										Supprimer
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</div>
				</div>

				<div className="flex flex-col gap-2">
					<div className="flex justify-between">
						<p className="text-xs text-muted-foreground">Progression du remboursement</p>
						<p className="text-xs tabular-nums">{paidPercent.toFixed(0)}%</p>
					</div>
					<Progress value={paidPercent} className="h-2" />
				</div>

				<div className="grid grid-cols-3 gap-2 sm:gap-4 pt-2 text-sm">
					<div className="flex flex-col">
						<p className="text-xs text-muted-foreground">Mensualité</p>
						<p className="font-medium tabular-nums">{formatCurrency(loan.monthlyPayment)}</p>
					</div>
					<div className="flex flex-col">
						<p className="text-xs text-muted-foreground">Taux</p>
						<p className="font-medium tabular-nums">{loan.rate}%</p>
					</div>
					<div className="flex flex-col">
						<p className="text-xs text-muted-foreground">Montant initial</p>
						<p className="font-medium tabular-nums">{formatCurrency(loan.initialAmount)}</p>
					</div>
				</div>

				{loan.loanNumber && (
					<p className="text-xs text-muted-foreground pt-2 border-t border-border/40">
						N° contrat: {loan.loanNumber}
					</p>
				)}

				{/* Insurance section */}
				<div className="pt-3 border-t border-border/40">
					<button
						type="button"
						onClick={() => setIsExpanded(!isExpanded)}
						className="flex items-center justify-between w-full text-left"
					>
						<div className="flex items-center gap-3">
							<Shield className="h-4 w-4 text-muted-foreground" />
							<p className="text-sm font-medium">
								Assurance emprunteur
								{hasInsurances && (
									<span className="text-xs text-muted-foreground font-normal ml-2">
										({loan.loanInsurances?.length} contrat
										{loan.loanInsurances && loan.loanInsurances.length > 1 ? 's' : ''})
									</span>
								)}
							</p>
						</div>
						<div className="flex items-center gap-3">
							{hasInsurances && (
								<p className="text-xs text-muted-foreground">
									{formatCurrency(totalInsurancePremium)}/mois · {totalCoverage}%
								</p>
							)}
							{isExpanded ? (
								<ChevronUp className="h-4 w-4 text-muted-foreground" />
							) : (
								<ChevronDown className="h-4 w-4 text-muted-foreground" />
							)}
						</div>
					</button>

					{isExpanded && (
						<div className="flex flex-col gap-3 mt-3">
							{hasInsurances ? (
								<div className="flex flex-col gap-3">
									{loan.loanInsurances?.map((insurance) => (
										<div
											key={insurance.id}
											className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
										>
											<div
												className="flex items-center justify-center h-8 w-8 rounded-full text-xs font-medium text-white shrink-0 bg-[var(--member-color)]"
												style={
													{
														'--member-color': insurance.member.color || '#6b7280',
													} as React.CSSProperties
												}
											>
												{insurance.member.name.charAt(0).toUpperCase()}
											</div>
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-3 flex-wrap">
													<p className="text-sm font-medium truncate">{insurance.member.name}</p>
													<span className="text-xs px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
														{insurance.coveragePercent}%
													</span>
												</div>
												<p className="text-xs text-muted-foreground truncate">
													{insurance.provider} · {formatCurrency(insurance.monthlyPremium)}/mois
												</p>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="text-center py-3">
									<p className="text-sm text-muted-foreground mb-2">Aucune assurance emprunteur</p>
								</div>
							)}
							<Button
								variant="outline"
								size="sm"
								className="w-full gap-2"
								onClick={() => onAddInsurance(loan.id)}
							>
								<Plus className="h-3.5 w-3.5" />
								Ajouter une assurance
							</Button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
