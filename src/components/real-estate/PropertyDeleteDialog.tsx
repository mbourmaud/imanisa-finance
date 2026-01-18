'use client'

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	Loader2,
} from '@/components'

interface PropertyDeleteDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	propertyName: string
	onDelete: () => void
	isDeleting: boolean
}

/**
 * Confirmation dialog for deleting a property
 */
export function PropertyDeleteDialog({
	open,
	onOpenChange,
	propertyName,
	onDelete,
	isDeleting,
}: PropertyDeleteDialogProps) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Supprimer ce bien ?</AlertDialogTitle>
					<AlertDialogDescription>
						Cette action est irréversible. Le bien « {propertyName} » sera définitivement
						supprimé, ainsi que tous les prêts, assurances et contrats associés.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
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
	)
}
