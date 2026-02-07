'use client'

import {
	Button,
	Droplets,
	Flame,
	Input,
	Label,
	Loader2,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Sheet,
	SheetBody,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	Wifi,
	Zap,
} from '@/components'
import { FormErrorBanner } from './FormErrorBanner'

type UtilityType = 'ELECTRICITY' | 'GAS' | 'WATER' | 'INTERNET' | 'OTHER'

interface UtilityContractFormData {
	type: UtilityType | ''
	provider: string
	contractNumber: string
	monthlyAmount: string
	link: string
	notes: string
}

interface UtilityContractFormSheetProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	formData: UtilityContractFormData
	onInputChange: (field: keyof UtilityContractFormData, value: string) => void
	onSubmit: (e: React.FormEvent) => void
	error: string | null
	isSubmitting: boolean
	isEditing: boolean
	formatCurrency: (amount: number) => string
}

export function UtilityContractFormSheet({
	open,
	onOpenChange,
	formData,
	onInputChange,
	onSubmit,
	error,
	isSubmitting,
	isEditing,
	formatCurrency,
}: UtilityContractFormSheetProps) {
	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent side="right" size="md">
				<SheetHeader>
					<SheetTitle>{isEditing ? 'Modifier le contrat' : 'Ajouter un contrat'}</SheetTitle>
					<SheetDescription>
						Renseignez les informations du contrat ou abonnement.
					</SheetDescription>
				</SheetHeader>
				<SheetBody>
					<form id="utility-contract-form" onSubmit={onSubmit}>
						<div className="flex flex-col gap-4">
							{error && <FormErrorBanner message={error} />}

							{/* Type selection */}
							<div className="flex flex-col gap-2">
								<Label htmlFor="utility-contract-type">Type de contrat *</Label>
								<Select value={formData.type} onValueChange={(value) => onInputChange('type', value)}>
									<SelectTrigger id="utility-contract-type">
										<SelectValue placeholder="Sélectionner le type" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="ELECTRICITY">
											<span className="flex items-center gap-2">
												<Zap className="h-4 w-4" />
												Électricité
											</span>
										</SelectItem>
										<SelectItem value="GAS">
											<span className="flex items-center gap-2">
												<Flame className="h-4 w-4" />
												Gaz
											</span>
										</SelectItem>
										<SelectItem value="WATER">
											<span className="flex items-center gap-2">
												<Droplets className="h-4 w-4" />
												Eau
											</span>
										</SelectItem>
										<SelectItem value="INTERNET">
											<span className="flex items-center gap-2">
												<Wifi className="h-4 w-4" />
												Internet
											</span>
										</SelectItem>
										<SelectItem value="OTHER">
											<span className="flex items-center gap-2">
												<Zap className="h-4 w-4" />
												Autre
											</span>
										</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{/* Provider and contract number */}
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div className="flex flex-col gap-2">
									<Label htmlFor="utility-contract-provider">Fournisseur *</Label>
									<Input
										id="utility-contract-provider"
										placeholder="EDF, Engie, Free..."
										value={formData.provider}
										onChange={(e) => onInputChange('provider', e.target.value)}
									/>
								</div>
								<div className="flex flex-col gap-2">
									<Label htmlFor="utility-contract-number">N° de contrat</Label>
									<Input
										id="utility-contract-number"
										placeholder="ABC-123456"
										value={formData.contractNumber}
										onChange={(e) => onInputChange('contractNumber', e.target.value)}
									/>
								</div>
							</div>

							{/* Monthly amount */}
							<div className="flex flex-col gap-2">
								<Label htmlFor="utility-contract-amount">Montant mensuel (€) *</Label>
								<Input
									id="utility-contract-amount"
									type="number"
									min="0"
									step="0.01"
									placeholder="80"
									value={formData.monthlyAmount}
									onChange={(e) => onInputChange('monthlyAmount', e.target.value)}
								/>
								{formData.monthlyAmount && (
									<p className="text-xs text-muted-foreground">
										Soit {formatCurrency(Number.parseFloat(formData.monthlyAmount) * 12)}/an
									</p>
								)}
							</div>

							{/* Link */}
							<div className="flex flex-col gap-2">
								<Label htmlFor="utility-contract-link">Lien vers le contrat</Label>
								<Input
									id="utility-contract-link"
									placeholder="https://..."
									value={formData.link}
									onChange={(e) => onInputChange('link', e.target.value)}
								/>
							</div>

							{/* Notes */}
							<div className="flex flex-col gap-2">
								<Label htmlFor="utility-contract-notes">Notes</Label>
								<Input
									id="utility-contract-notes"
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
					<Button type="submit" form="utility-contract-form" disabled={isSubmitting}>
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
