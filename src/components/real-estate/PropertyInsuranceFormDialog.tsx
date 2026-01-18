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
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components'
import { FormErrorBanner } from './FormErrorBanner'

type InsuranceType = 'PNO' | 'MRH'

interface PropertyInsuranceFormData {
	type: InsuranceType | ''
	provider: string
	contractNumber: string
	monthlyPremium: string
	startDate: string
	endDate: string
	coverage: string
	link: string
	notes: string
}

interface PropertyInsuranceFormDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	formData: PropertyInsuranceFormData
	onInputChange: (field: keyof PropertyInsuranceFormData, value: string) => void
	onSubmit: (e: React.FormEvent) => void
	error: string | null
	isSubmitting: boolean
	isEditing: boolean
	formatCurrency: (amount: number) => string
}

/**
 * Dialog for adding/editing property insurance (MRH or PNO)
 */
export function PropertyInsuranceFormDialog({
	open,
	onOpenChange,
	formData,
	onInputChange,
	onSubmit,
	error,
	isSubmitting,
	isEditing,
	formatCurrency,
}: PropertyInsuranceFormDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						{isEditing ? "Modifier l'assurance" : 'Ajouter une assurance'}
					</DialogTitle>
					<DialogDescription>
						Renseignez les informations de l&apos;assurance habitation (MRH ou PNO).
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={onSubmit}>
					<div className="flex flex-col gap-4">
						{error && <FormErrorBanner message={error} />}

						{/* Type selection */}
						<div className="flex flex-col gap-2">
							<Label htmlFor="property-insurance-type">Type d&apos;assurance *</Label>
							<Select
								value={formData.type}
								onValueChange={(value) => onInputChange('type', value)}
							>
								<SelectTrigger id="property-insurance-type">
									<SelectValue placeholder="Sélectionner le type" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="MRH">
										<div className="flex flex-col">
											<span>MRH - Multirisque Habitation</span>
											<p className="text-xs text-muted-foreground">Pour les occupants du bien</p>
										</div>
									</SelectItem>
									<SelectItem value="PNO">
										<div className="flex flex-col">
											<span>PNO - Propriétaire Non-Occupant</span>
											<p className="text-xs text-muted-foreground">Pour les biens locatifs</p>
										</div>
									</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Provider and contract */}
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div className="flex flex-col gap-2">
								<Label htmlFor="property-insurance-provider">Assureur *</Label>
								<Input
									id="property-insurance-provider"
									placeholder="MAIF, AXA, Groupama..."
									value={formData.provider}
									onChange={(e) => onInputChange('provider', e.target.value)}
								/>
							</div>
							<div className="flex flex-col gap-2">
								<Label htmlFor="property-insurance-contract">N° de contrat</Label>
								<Input
									id="property-insurance-contract"
									placeholder="HAB-2024-001"
									value={formData.contractNumber}
									onChange={(e) => onInputChange('contractNumber', e.target.value)}
								/>
							</div>
						</div>

						{/* Premium */}
						<div className="flex flex-col gap-2">
							<Label htmlFor="property-insurance-premium">Prime mensuelle (€) *</Label>
							<Input
								id="property-insurance-premium"
								type="number"
								min="0"
								step="0.01"
								placeholder="35"
								value={formData.monthlyPremium}
								onChange={(e) => onInputChange('monthlyPremium', e.target.value)}
							/>
							{formData.monthlyPremium && (
								<p className="text-xs text-muted-foreground">
									Soit {formatCurrency(Number.parseFloat(formData.monthlyPremium) * 12)}/an
								</p>
							)}
						</div>

						{/* Dates */}
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div className="flex flex-col gap-2">
								<Label htmlFor="property-insurance-start">Date de début *</Label>
								<Input
									id="property-insurance-start"
									type="date"
									value={formData.startDate}
									onChange={(e) => onInputChange('startDate', e.target.value)}
								/>
							</div>
							<div className="flex flex-col gap-2">
								<Label htmlFor="property-insurance-end">Date de fin</Label>
								<Input
									id="property-insurance-end"
									type="date"
									value={formData.endDate}
									onChange={(e) => onInputChange('endDate', e.target.value)}
								/>
							</div>
						</div>

						{/* Coverage */}
						<div className="flex flex-col gap-2">
							<Label htmlFor="property-insurance-coverage">Couverture</Label>
							<Input
								id="property-insurance-coverage"
								placeholder="Dégâts des eaux, incendie, vol..."
								value={formData.coverage}
								onChange={(e) => onInputChange('coverage', e.target.value)}
							/>
						</div>

						{/* Link */}
						<div className="flex flex-col gap-2">
							<Label htmlFor="property-insurance-link">Lien vers le contrat</Label>
							<Input
								id="property-insurance-link"
								placeholder="https://..."
								value={formData.link}
								onChange={(e) => onInputChange('link', e.target.value)}
							/>
						</div>

						{/* Notes */}
						<div className="flex flex-col gap-2">
							<Label htmlFor="property-insurance-notes">Notes</Label>
							<Input
								id="property-insurance-notes"
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
										{isEditing ? 'Modification...' : 'Création...'}
									</span>
								) : isEditing ? (
									'Modifier'
								) : (
									'Ajouter'
								)}
							</Button>
						</DialogFooter>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	)
}
