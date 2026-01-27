'use client';

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
	Skeleton,
} from '@/components';
import { FormErrorBanner } from './FormErrorBanner';

interface Member {
	id: string;
	name: string;
	color: string | null;
}

interface InsuranceFormData {
	memberId: string;
	name: string;
	provider: string;
	contractNumber: string;
	coveragePercent: string;
	monthlyPremium: string;
	link: string;
	notes: string;
}

interface LoanInsuranceFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	formData: InsuranceFormData;
	onInputChange: (field: keyof InsuranceFormData, value: string) => void;
	onSubmit: (e: React.FormEvent) => void;
	error: string | null;
	isSubmitting: boolean;
	members: Member[];
	loadingMembers: boolean;
}

/**
 * Dialog for adding a loan insurance
 */
export function LoanInsuranceFormDialog({
	open,
	onOpenChange,
	formData,
	onInputChange,
	onSubmit,
	error,
	isSubmitting,
	members,
	loadingMembers,
}: LoanInsuranceFormDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Ajouter une assurance emprunteur</DialogTitle>
					<DialogDescription>
						Renseignez les informations de l&apos;assurance pour ce prêt.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={onSubmit} className="flex flex-col gap-4">
					{error && <FormErrorBanner message={error} />}

					{/* Member selection */}
					<div className="flex flex-col gap-2">
						<Label htmlFor="insurance-member">Emprunteur assuré *</Label>
						{loadingMembers ? (
							<Skeleton className="h-10 w-full" />
						) : (
							<Select
								value={formData.memberId}
								onValueChange={(value) => onInputChange('memberId', value)}
							>
								<SelectTrigger id="insurance-member">
									<SelectValue placeholder="Sélectionner un membre" />
								</SelectTrigger>
								<SelectContent>
									{members.map((member) => (
										<SelectItem key={member.id} value={member.id}>
											<span className="flex items-center gap-2">
												<div
													className="rounded-full h-4 w-4 bg-[var(--member-color)]"
													style={
														{ '--member-color': member.color || '#6b7280' } as React.CSSProperties
													}
												/>
												{member.name}
											</span>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					</div>

					{/* Insurance info */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div className="flex flex-col gap-2">
							<Label htmlFor="insurance-name">Nom de l&apos;assurance *</Label>
							<Input
								id="insurance-name"
								placeholder="Assurance ADI"
								value={formData.name}
								onChange={(e) => onInputChange('name', e.target.value)}
							/>
						</div>
						<div className="flex flex-col gap-2">
							<Label htmlFor="insurance-provider">Assureur *</Label>
							<Input
								id="insurance-provider"
								placeholder="April, CNP, MAIF..."
								value={formData.provider}
								onChange={(e) => onInputChange('provider', e.target.value)}
							/>
						</div>
					</div>

					{/* Coverage and premium */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div className="flex flex-col gap-2">
							<Label htmlFor="insurance-coverage">Quotité (%) *</Label>
							<Input
								id="insurance-coverage"
								type="number"
								min="0"
								max="100"
								step="1"
								placeholder="50"
								value={formData.coveragePercent}
								onChange={(e) => onInputChange('coveragePercent', e.target.value)}
							/>
							<p className="text-xs text-muted-foreground">Pourcentage du capital couvert</p>
						</div>
						<div className="flex flex-col gap-2">
							<Label htmlFor="insurance-premium">Prime mensuelle (€) *</Label>
							<Input
								id="insurance-premium"
								type="number"
								min="0"
								step="0.01"
								placeholder="25"
								value={formData.monthlyPremium}
								onChange={(e) => onInputChange('monthlyPremium', e.target.value)}
							/>
						</div>
					</div>

					{/* Contract number */}
					<div className="flex flex-col gap-2">
						<Label htmlFor="insurance-contract">N° de contrat</Label>
						<Input
							id="insurance-contract"
							placeholder="ASS-2024-001"
							value={formData.contractNumber}
							onChange={(e) => onInputChange('contractNumber', e.target.value)}
						/>
					</div>

					{/* Link */}
					<div className="flex flex-col gap-2">
						<Label htmlFor="insurance-link">Lien vers le contrat</Label>
						<Input
							id="insurance-link"
							placeholder="https://..."
							value={formData.link}
							onChange={(e) => onInputChange('link', e.target.value)}
						/>
					</div>

					{/* Notes */}
					<div className="flex flex-col gap-2">
						<Label htmlFor="insurance-notes">Notes</Label>
						<Input
							id="insurance-notes"
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
								"Ajouter l'assurance"
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
