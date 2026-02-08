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
	Building2,
	Button,
	Card,
	ExternalLink,
	Loader2,
	Pencil,
	Plus,
	Trash2,
} from '@/components';
import { formatMoneyCompact } from '@/shared/utils';

interface CoOwnership {
	id: string;
	name: string;
	quarterlyAmount: number;
	link: string | null;
	notes: string | null;
}

interface PropertyCoOwnershipSectionProps {
	coOwnership: CoOwnership | null;
	onAdd: () => void;
	onEdit: () => void;
	onDelete: () => void;
	isDeleting: boolean;
}

export function PropertyCoOwnershipSection({
	coOwnership,
	onAdd,
	onEdit,
	onDelete,
	isDeleting,
}: PropertyCoOwnershipSectionProps) {
	return (
		<Card padding="lg">
			<div className="flex justify-between items-center">
				<h3 className="text-base font-semibold tracking-tight flex items-center gap-2">
					<Building2 className="h-4 w-4 text-muted-foreground" />
					Copropriété
				</h3>
				{!coOwnership && (
					<Button variant="outline" size="sm" onClick={onAdd}>
						<Plus className="mr-1.5 h-4 w-4" />
						Ajouter
					</Button>
				)}
			</div>
			{coOwnership ? (
				<div className="flex flex-col gap-4 p-4 rounded-xl border border-border/60">
					<div className="flex justify-between items-start gap-4">
						<div className="flex items-center gap-4">
							<div className="flex items-center justify-center shrink-0 h-10 w-10 rounded-xl bg-primary/10">
								<Building2 className="h-5 w-5 text-primary" />
							</div>
							<div className="flex flex-col">
								<p className="font-medium">{coOwnership.name}</p>
								<p className="text-sm text-muted-foreground">Syndic de copropriété</p>
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
										<AlertDialogTitle>Supprimer la copropriété ?</AlertDialogTitle>
										<AlertDialogDescription>
											Cette action est irréversible. Les informations de copropriété seront
											définitivement supprimées.
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
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/40">
						<div className="flex flex-col">
							<p className="text-xs text-muted-foreground">Charges trimestrielles</p>
							<p className="font-medium tabular-nums">
								{formatMoneyCompact(coOwnership.quarterlyAmount)}
							</p>
						</div>
						<div className="flex flex-col">
							<p className="text-xs text-muted-foreground">Charges annuelles</p>
							<p className="font-medium tabular-nums">
								{formatMoneyCompact(coOwnership.quarterlyAmount * 4)}
							</p>
						</div>
					</div>
					{coOwnership.link && (
						<div className="pt-2 border-t border-border/40">
							<a
								href={coOwnership.link}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
							>
								<ExternalLink className="h-3 w-3" />
								Voir les documents
							</a>
						</div>
					)}
					{coOwnership.notes && (
						<div className="pt-2 border-t border-border/40">
							<p className="text-xs text-muted-foreground">Notes</p>
							<p className="text-sm text-muted-foreground mt-0.5">{coOwnership.notes}</p>
						</div>
					)}
				</div>
			) : (
				<div className="flex flex-col items-center justify-center text-center py-8">
					<div className="flex items-center justify-center h-12 w-12 rounded-xl bg-muted/50 mb-3">
						<Building2 className="h-6 w-6 text-muted-foreground" />
					</div>
					<p className="font-medium mb-1">Aucune copropriété</p>
					<p className="text-sm text-muted-foreground mb-4">
						Ajoutez les informations du syndic et des charges de copropriété.
					</p>
					<Button variant="outline" size="sm" onClick={onAdd}>
						<Plus className="mr-1.5 h-4 w-4" />
						Ajouter
					</Button>
				</div>
			)}
		</Card>
	);
}
