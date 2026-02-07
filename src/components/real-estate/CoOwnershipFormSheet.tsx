'use client'

import {
	Button,
	Input,
	Label,
	Loader2,
	Sheet,
	SheetBody,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from '@/components'
import { FormErrorBanner } from './FormErrorBanner'

interface CoOwnershipFormData {
	name: string
	quarterlyAmount: string
	link: string
	notes: string
}

interface CoOwnershipFormSheetProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	formData: CoOwnershipFormData
	onInputChange: (field: keyof CoOwnershipFormData, value: string) => void
	onSubmit: (e: React.FormEvent) => void
	error: string | null
	isSubmitting: boolean
	isEditing: boolean
	formatCurrency: (amount: number) => string
}

export function CoOwnershipFormSheet({
	open,
	onOpenChange,
	formData,
	onInputChange,
	onSubmit,
	error,
	isSubmitting,
	isEditing,
	formatCurrency,
}: CoOwnershipFormSheetProps) {
	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent side="right" size="md">
				<SheetHeader>
					<SheetTitle>
						{isEditing ? 'Modifier la copropriété' : 'Ajouter une copropriété'}
					</SheetTitle>
					<SheetDescription>
						Renseignez les informations du syndic et des charges de copropriété.
					</SheetDescription>
				</SheetHeader>
				<SheetBody>
					<form id="coownership-form" onSubmit={onSubmit}>
						<div className="flex flex-col gap-4">
							{error && <FormErrorBanner message={error} />}

							{/* Syndic name */}
							<div className="flex flex-col gap-2">
								<Label htmlFor="coownership-name">Nom du syndic *</Label>
								<Input
									id="coownership-name"
									placeholder="Foncia, Nexity, Citya..."
									value={formData.name}
									onChange={(e) => onInputChange('name', e.target.value)}
								/>
							</div>

							{/* Quarterly amount */}
							<div className="flex flex-col gap-2">
								<Label htmlFor="coownership-amount">Charges trimestrielles (€) *</Label>
								<Input
									id="coownership-amount"
									type="number"
									min="0"
									step="0.01"
									placeholder="450"
									value={formData.quarterlyAmount}
									onChange={(e) => onInputChange('quarterlyAmount', e.target.value)}
								/>
								{formData.quarterlyAmount && (
									<p className="text-xs text-muted-foreground">
										Soit {formatCurrency(Number.parseFloat(formData.quarterlyAmount) * 4)}/an
									</p>
								)}
							</div>

							{/* Link */}
							<div className="flex flex-col gap-2">
								<Label htmlFor="coownership-link">Lien vers les documents</Label>
								<Input
									id="coownership-link"
									placeholder="https://..."
									value={formData.link}
									onChange={(e) => onInputChange('link', e.target.value)}
								/>
							</div>

							{/* Notes */}
							<div className="flex flex-col gap-2">
								<Label htmlFor="coownership-notes">Notes</Label>
								<Input
									id="coownership-notes"
									placeholder="Notes additionnelles..."
									value={formData.notes}
									onChange={(e) => onInputChange('notes', e.target.value)}
								/>
							</div>
						</div>
					</form>
				</SheetBody>
				<SheetFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isSubmitting}
					>
						Annuler
					</Button>
					<Button type="submit" form="coownership-form" disabled={isSubmitting}>
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
				</SheetFooter>
			</SheetContent>
		</Sheet>
	)
}
