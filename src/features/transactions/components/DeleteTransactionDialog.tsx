'use client';

import { toast } from 'sonner';
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
import { useDeleteTransactionMutation } from '../hooks/use-transactions-query';
import type { Transaction } from '../types';

interface DeleteTransactionDialogProps {
	transaction: Transaction | null;
	onOpenChange: (open: boolean) => void;
}

export function DeleteTransactionDialog({
	transaction,
	onOpenChange,
}: DeleteTransactionDialogProps) {
	const deleteMutation = useDeleteTransactionMutation();

	const handleDelete = async () => {
		if (!transaction) return;

		try {
			await deleteMutation.mutateAsync(transaction.id);
			toast.success('Transaction supprimée');
			onOpenChange(false);
		} catch {
			toast.error('Impossible de supprimer la transaction');
		}
	};

	return (
		<AlertDialog open={!!transaction} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Supprimer la transaction</AlertDialogTitle>
					<AlertDialogDescription>
						Êtes-vous sûr de vouloir supprimer la transaction{' '}
						<span className="font-medium text-foreground">
							&laquo;{transaction?.description}&raquo;
						</span>{' '}
						? Cette action est irréversible.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Annuler</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleDelete}
						className="bg-destructive text-white hover:bg-destructive/90"
					>
						{deleteMutation.isPending ? 'Suppression...' : 'Supprimer'}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
