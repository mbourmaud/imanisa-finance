'use client'

import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	Input,
	Label,
	Loader2,
} from '@/components'
import { FormErrorBanner } from './FormErrorBanner'

interface LoanFormData {
	name: string
	lender: string
	loanNumber: string
	initialAmount: string
	remainingAmount: string
	rate: string
	monthlyPayment: string
	startDate: string
	endDate: string
	notes: string
}

interface LoanFormDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	formData: LoanFormData
	onInputChange: (field: keyof LoanFormData, value: string) => void
	onSubmit: (e: React.FormEvent) => void
	error: string | null
	isSubmitting: boolean
}

/**
 * Dialog for adding a loan to a property
 */
export function LoanFormDialog({
	open,
	onOpenChange,
	formData,
	onInputChange,
	onSubmit,
	error,
	isSubmitting,
}: LoanFormDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Ajouter un prêt</DialogTitle>
					<DialogDescription>
						Renseignez les informations du crédit immobilier.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={onSubmit}>
					<div className="flex flex-col gap-4">
						{error && <FormErrorBanner message={error} />}

						{/* Basic info */}
						<div className="flex flex-col gap-4">
							<div className="flex flex-col gap-2">
								<Label htmlFor="loan-name">Nom du prêt *</Label>
								<Input
									id="loan-name"
									placeholder="Crédit Immo Principal"
									value={formData.name}
									onChange={(e) => onInputChange('name', e.target.value)}
								/>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div className="flex flex-col gap-2">
									<Label htmlFor="loan-lender">Organisme prêteur</Label>
									<Input
										id="loan-lender"
										placeholder="Crédit Mutuel"
										value={formData.lender}
										onChange={(e) => onInputChange('lender', e.target.value)}
									/>
								</div>
								<div className="flex flex-col gap-2">
									<Label htmlFor="loan-number">N° de contrat</Label>
									<Input
										id="loan-number"
										placeholder="PRE-2024-001"
										value={formData.loanNumber}
										onChange={(e) => onInputChange('loanNumber', e.target.value)}
									/>
								</div>
							</div>
						</div>

						{/* Amounts */}
						<div className="flex flex-col gap-4">
							<p className="text-sm font-medium text-muted-foreground">Montants</p>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div className="flex flex-col gap-2">
									<Label htmlFor="loan-initial">Montant initial (€) *</Label>
									<Input
										id="loan-initial"
										type="number"
										min="0"
										step="0.01"
										placeholder="280000"
										value={formData.initialAmount}
										onChange={(e) => onInputChange('initialAmount', e.target.value)}
									/>
								</div>
								<div className="flex flex-col gap-2">
									<Label htmlFor="loan-remaining">Capital restant (€) *</Label>
									<Input
										id="loan-remaining"
										type="number"
										min="0"
										step="0.01"
										placeholder="250000"
										value={formData.remainingAmount}
										onChange={(e) => onInputChange('remainingAmount', e.target.value)}
									/>
								</div>
							</div>
						</div>

						{/* Rate and payment */}
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div className="flex flex-col gap-2">
								<Label htmlFor="loan-rate">Taux (%) *</Label>
								<Input
									id="loan-rate"
									type="number"
									min="0"
									max="100"
									step="0.01"
									placeholder="1.5"
									value={formData.rate}
									onChange={(e) => onInputChange('rate', e.target.value)}
								/>
							</div>
							<div className="flex flex-col gap-2">
								<Label htmlFor="loan-monthly">Mensualité (€) *</Label>
								<Input
									id="loan-monthly"
									type="number"
									min="0"
									step="0.01"
									placeholder="1200"
									value={formData.monthlyPayment}
									onChange={(e) => onInputChange('monthlyPayment', e.target.value)}
								/>
							</div>
						</div>

						{/* Dates */}
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div className="flex flex-col gap-2">
								<Label htmlFor="loan-start">Date de début *</Label>
								<Input
									id="loan-start"
									type="date"
									value={formData.startDate}
									onChange={(e) => onInputChange('startDate', e.target.value)}
								/>
							</div>
							<div className="flex flex-col gap-2">
								<Label htmlFor="loan-end">Date de fin</Label>
								<Input
									id="loan-end"
									type="date"
									value={formData.endDate}
									onChange={(e) => onInputChange('endDate', e.target.value)}
								/>
							</div>
						</div>

						{/* Notes */}
						<div className="flex flex-col gap-2">
							<Label htmlFor="loan-notes">Notes</Label>
							<Input
								id="loan-notes"
								placeholder="Notes additionnelles..."
								value={formData.notes}
								onChange={(e) => onInputChange('notes', e.target.value)}
							/>
						</div>

						<DialogFooter className="pt-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
								disabled={isSubmitting}
							>
								Annuler
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? (
									<span className="flex items-center gap-2">
										<Loader2 className="h-4 w-4 animate-spin" />
										Création...
									</span>
								) : (
									'Créer le prêt'
								)}
							</Button>
						</DialogFooter>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	)
}
