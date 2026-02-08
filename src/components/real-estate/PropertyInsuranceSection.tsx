'use client';

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
	Card,
	ExternalLink,
	Loader2,
	Pencil,
	Plus,
	Shield,
	Trash2,
} from '@/components';
import type { InsuranceType } from '@/features/properties';
import { formatDate, formatMoneyCompact } from '@/shared/utils';

interface PropertyInsurance {
	id: string;
	type: InsuranceType;
	provider: string;
	contractNumber: string | null;
	monthlyPremium: number;
	startDate: Date | string;
	endDate: Date | string | null;
	coverage: string | null;
	link: string | null;
	notes: string | null;
}

interface PropertyInsuranceSectionProps {
	insurance: PropertyInsurance | null;
	onAdd: () => void;
	onEdit: () => void;
	onDelete: () => void;
	isDeleting: boolean;
}

function getInsuranceTypeLabel(type: InsuranceType): string {
	switch (type) {
		case 'PNO':
			return 'Propriétaire Non-Occupant';
		case 'MRH':
			return 'Multirisque Habitation';
		default:
			return type;
	}
}

function getInsuranceTypeBadge(type: InsuranceType): string {
	switch (type) {
		case 'PNO':
			return 'PNO';
		case 'MRH':
			return 'MRH';
		default:
			return type;
	}
}

export function PropertyInsuranceSection({
	insurance,
	onAdd,
	onEdit,
	onDelete,
	isDeleting,
}: PropertyInsuranceSectionProps) {
	return (
		<Card padding="lg">
			<div className="flex justify-between items-center">
				<h3 className="text-base font-semibold tracking-tight flex items-center gap-2">
					<Shield className="h-4 w-4 text-muted-foreground" />
					Assurance habitation
				</h3>
				{!insurance && (
					<Button variant="outline" size="sm" onClick={onAdd}>
						<Plus className="mr-1.5 h-4 w-4" />
						Ajouter une assurance
					</Button>
				)}
			</div>
			{insurance ? (
				<div className="flex flex-col gap-4 p-4 rounded-xl border border-border/60">
					<div className="flex justify-between items-start gap-4">
						<div className="flex items-center gap-4">
							<div className="flex items-center justify-center shrink-0 h-10 w-10 rounded-xl bg-primary/10">
								<Shield className="h-5 w-5 text-primary" />
							</div>
							<div className="flex flex-col">
								<div className="flex items-center gap-3">
									<p className="font-medium">{insurance.provider}</p>
									<span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
										{getInsuranceTypeBadge(insurance.type)}
									</span>
								</div>
								<p className="text-sm text-muted-foreground">
									{getInsuranceTypeLabel(insurance.type)}
								</p>
							</div>
						</div>
						<div className="flex items-center gap-3 shrink-0">
							<Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
								<Pencil className="h-4 w-4" />
							</Button>
							<AlertDialog>
								<AlertDialogTrigger asChild>
									<Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
										<Trash2 className="h-4 w-4" />
									</Button>
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>Supprimer l&apos;assurance ?</AlertDialogTitle>
										<AlertDialogDescription>
											Cette action est irréversible. L&apos;assurance habitation sera définitivement
											supprimée.
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel>Annuler</AlertDialogCancel>
										<AlertDialogAction
											onClick={onDelete}
											disabled={isDeleting}
											className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
										>
											{isDeleting ? (
												<span className="flex items-center gap-2">
													<Loader2 className="h-4 w-4 animate-spin" />
													Suppression...
												</span>
											) : (
												'Supprimer'
											)}
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						</div>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-border/40">
						<div>
							<p className="text-xs text-muted-foreground">Prime mensuelle</p>
							<p className="font-medium tabular-nums">{formatMoneyCompact(insurance.monthlyPremium)}</p>
							<p className="text-xs text-muted-foreground mt-0.5">
								{formatMoneyCompact(insurance.monthlyPremium * 12)}/an
							</p>
						</div>
						<div>
							<p className="text-xs text-muted-foreground">Date de début</p>
							<p className="font-medium">{formatDate(insurance.startDate.toString(), 'D MMMM YYYY')}</p>
						</div>
						{insurance.endDate && (
							<div>
								<p className="text-xs text-muted-foreground">Date de fin</p>
								<p className="font-medium">{formatDate(insurance.endDate.toString(), 'D MMMM YYYY')}</p>
							</div>
						)}
					</div>
					{(insurance.contractNumber || insurance.coverage || insurance.link) && (
						<div className="flex flex-col gap-2 pt-2 border-t border-border/40">
							{insurance.contractNumber && (
								<p className="text-xs text-muted-foreground">
									N° contrat: <span className="text-foreground">{insurance.contractNumber}</span>
								</p>
							)}
							{insurance.coverage && (
								<p className="text-xs text-muted-foreground">
									Couverture: <span className="text-foreground">{insurance.coverage}</span>
								</p>
							)}
							{insurance.link && (
								<a
									href={insurance.link}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
								>
									<ExternalLink className="h-3 w-3" />
									Voir le contrat
								</a>
							)}
						</div>
					)}
					{insurance.notes && (
						<div className="pt-2 border-t border-border/40">
							<p className="text-xs text-muted-foreground">Notes</p>
							<p className="text-sm text-muted-foreground mt-0.5">{insurance.notes}</p>
						</div>
					)}
				</div>
			) : (
				<div className="flex flex-col items-center justify-center text-center py-8">
					<div className="flex items-center justify-center h-12 w-12 rounded-xl bg-muted/50 mb-3">
						<Shield className="h-6 w-6 text-muted-foreground" />
					</div>
					<p className="font-medium mb-1">Aucune assurance</p>
					<p className="text-sm text-muted-foreground mb-4">
						Ajoutez l&apos;assurance habitation de ce bien (MRH ou PNO).
					</p>
					<Button variant="outline" size="sm" onClick={onAdd}>
						<Plus className="mr-1.5 h-4 w-4" />
						Ajouter une assurance
					</Button>
				</div>
			)}
		</Card>
	);
}
