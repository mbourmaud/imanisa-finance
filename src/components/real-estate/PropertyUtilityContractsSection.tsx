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
	Droplets,
	ExternalLink,
	Flame,
	Loader2,
	Pencil,
	Plus,
	Trash2,
	Wifi,
	Zap,
} from '@/components';
import type {
	UtilityContract as PropertyUtilityContract,
	UtilityType,
} from '@/features/properties';
import { formatMoneyCompact } from '@/shared/utils';

interface PropertyUtilityContractsSectionProps {
	contracts: PropertyUtilityContract[];
	onAddContract: () => void;
	onEditContract: (contract: PropertyUtilityContract) => void;
	onDeleteContract: (contractId: string) => void;
	deletingContractId: string | null;
}

function getUtilityTypeLabel(type: UtilityType): string {
	switch (type) {
		case 'ELECTRICITY':
			return 'Électricité';
		case 'GAS':
			return 'Gaz';
		case 'WATER':
			return 'Eau';
		case 'INTERNET':
			return 'Internet';
		case 'OTHER':
			return 'Autre';
		default:
			return type;
	}
}

function getUtilityTypeIcon(type: UtilityType): React.ElementType {
	switch (type) {
		case 'ELECTRICITY':
			return Zap;
		case 'GAS':
			return Flame;
		case 'WATER':
			return Droplets;
		case 'INTERNET':
			return Wifi;
		default:
			return Zap;
	}
}

export function PropertyUtilityContractsSection({
	contracts,
	onAddContract,
	onEditContract,
	onDeleteContract,
	deletingContractId,
}: PropertyUtilityContractsSectionProps) {
	const totalMonthly = contracts.reduce((sum, c) => sum + c.monthlyAmount, 0);

	return (
		<Card padding="lg">
			<div className="flex justify-between items-center">
				<h3 className="text-base font-semibold tracking-tight flex items-center gap-2">
					<Zap className="h-4 w-4 text-muted-foreground" />
					Contrats & Abonnements
				</h3>
				<Button variant="outline" size="sm" onClick={onAddContract}>
					<Plus className="mr-1.5 h-4 w-4" />
					Ajouter un contrat
				</Button>
			</div>
			{contracts.length === 0 ? (
				<div className="flex flex-col items-center justify-center text-center py-8">
					<div className="flex items-center justify-center h-12 w-12 rounded-xl bg-muted/50 mb-3">
						<Zap className="h-6 w-6 text-muted-foreground" />
					</div>
					<p className="font-medium mb-1">Aucun contrat</p>
					<p className="text-sm text-muted-foreground mb-4">
						Ajoutez les contrats d&apos;énergie et abonnements liés à ce bien.
					</p>
					<Button variant="outline" size="sm" onClick={onAddContract}>
						<Plus className="mr-1.5 h-4 w-4" />
						Ajouter un contrat
					</Button>
				</div>
			) : (
				<div className="flex flex-col gap-4">
					<div className="grid grid-cols-2 gap-2 sm:gap-4 p-4 rounded-xl bg-muted/30">
						<div className="flex flex-col items-center">
							<p className="text-xs text-muted-foreground">Nombre de contrats</p>
							<p className="text-lg font-semibold">{contracts.length}</p>
						</div>
						<div className="flex flex-col items-center">
							<p className="text-xs text-muted-foreground">Total mensuel</p>
							<p className="text-lg font-semibold tabular-nums">{formatMoneyCompact(totalMonthly)}</p>
						</div>
					</div>
					<div className="flex flex-col gap-3">
						{contracts.map((contract) => {
							const IconComponent = getUtilityTypeIcon(contract.type);
							return (
								<div key={contract.id} className="rounded-xl border border-border/60 p-4">
									<div className="flex justify-between items-start gap-4">
										<div className="flex items-center gap-4">
											<div className="flex items-center justify-center shrink-0 h-10 w-10 rounded-xl bg-primary/10">
												<IconComponent className="h-5 w-5 text-primary" />
											</div>
											<div className="flex flex-col">
												<div className="flex items-center gap-3">
													<p className="font-medium">{contract.provider}</p>
													<span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
														{getUtilityTypeLabel(contract.type)}
													</span>
												</div>
												<p className="text-sm text-muted-foreground tabular-nums">
													{formatMoneyCompact(contract.monthlyAmount)}/mois
													<span className="text-xs ml-1">
														({formatMoneyCompact(contract.monthlyAmount * 12)}/an)
													</span>
												</p>
											</div>
										</div>
										<div className="flex items-center gap-3 shrink-0">
											<Button
												variant="ghost"
												size="icon"
												className="h-10 w-10"
												onClick={() => onEditContract(contract)}
											>
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
														<AlertDialogTitle>Supprimer ce contrat ?</AlertDialogTitle>
														<AlertDialogDescription>
															Cette action est irréversible. Le contrat {contract.provider} sera
															définitivement supprimé.
														</AlertDialogDescription>
													</AlertDialogHeader>
													<AlertDialogFooter>
														<AlertDialogCancel>Annuler</AlertDialogCancel>
														<AlertDialogAction
															onClick={() => onDeleteContract(contract.id)}
															disabled={deletingContractId === contract.id}
															className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
														>
															{deletingContractId === contract.id ? (
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
									{(contract.contractNumber || contract.link) && (
										<div className="flex justify-between items-center gap-4 mt-3 pt-3 border-t border-border/40">
											{contract.contractNumber && (
												<p className="text-xs text-muted-foreground">
													N° contrat:{' '}
													<span className="text-foreground">{contract.contractNumber}</span>
												</p>
											)}
											{contract.link && (
												<a
													href={contract.link}
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
									{contract.notes && (
										<div className="mt-2 pt-2 border-t border-border/40">
											<p className="text-xs text-muted-foreground">{contract.notes}</p>
										</div>
									)}
								</div>
							);
						})}
					</div>
				</div>
			)}
		</Card>
	);
}
