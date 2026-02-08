'use client';

import { Tag, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { CategoryBadge } from '@/components/transactions/CategoryBadge';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCategoriesQuery } from '@/features/categories';
import { useBulkCategorizeMutation, useBulkDeleteMutation } from '../hooks/use-transactions-query';

interface BulkActionsToolbarProps {
	selectedIds: string[];
	onClearSelection: () => void;
}

export function BulkActionsToolbar({ selectedIds, onClearSelection }: BulkActionsToolbarProps) {
	const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
	const { data: categories } = useCategoriesQuery();
	const bulkDeleteMutation = useBulkDeleteMutation();
	const bulkCategorizeMutation = useBulkCategorizeMutation();

	const count = selectedIds.length;
	if (count === 0) return null;

	const handleBulkCategorize = async (categoryId: string) => {
		try {
			await bulkCategorizeMutation.mutateAsync({
				transactionIds: selectedIds,
				categoryId,
			});
			const cat = categories?.find((c) => c.id === categoryId);
			toast.success(`Catégorie "${cat?.name ?? ''}" appliquée à ${count} transaction(s)`);
			onClearSelection();
		} catch {
			toast.error('Impossible de catégoriser les transactions');
		}
	};

	const handleBulkDelete = async () => {
		try {
			await bulkDeleteMutation.mutateAsync(selectedIds);
			toast.success(`${count} transaction(s) supprimée(s)`);
			onClearSelection();
			setDeleteConfirmOpen(false);
		} catch {
			toast.error('Impossible de supprimer les transactions');
		}
	};

	return (
		<>
			<div className="sticky bottom-0 z-10 flex items-center justify-between gap-4 rounded-lg border bg-background p-3 shadow-lg">
				<span className="text-sm font-medium text-muted-foreground">
					{count} sélectionnée{count > 1 ? 's' : ''}
				</span>

				<div className="flex items-center gap-2">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" size="sm">
								<Tag className="h-4 w-4" />
								Catégoriser
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="max-h-80 overflow-y-auto">
							{categories?.map((cat) => (
								<DropdownMenuItem key={cat.id} onClick={() => handleBulkCategorize(cat.id)}>
									<CategoryBadge
										category={{
											id: cat.id,
											name: cat.name,
											icon: cat.icon,
											color: cat.color,
										}}
										size="sm"
									/>
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>

					<Button variant="destructive" size="sm" onClick={() => setDeleteConfirmOpen(true)}>
						<Trash2 className="h-4 w-4" />
						Supprimer
					</Button>

					<Button variant="ghost" size="sm" onClick={onClearSelection}>
						Annuler
					</Button>
				</div>
			</div>

			<AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Supprimer {count} transaction(s)</AlertDialogTitle>
						<AlertDialogDescription>
							Êtes-vous sûr de vouloir supprimer {count} transaction{count > 1 ? 's' : ''} ? Cette
							action est irréversible.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Annuler</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleBulkDelete}
							className="bg-destructive text-white hover:bg-destructive/90"
						>
							{bulkDeleteMutation.isPending ? 'Suppression...' : 'Supprimer'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
