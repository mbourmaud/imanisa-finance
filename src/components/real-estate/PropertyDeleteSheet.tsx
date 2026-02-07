'use client'

import {
	Button,
	Loader2,
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from '@/components'

interface PropertyDeleteSheetProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	propertyName: string
	onDelete: () => void
	isDeleting: boolean
}

export function PropertyDeleteSheet({
	open,
	onOpenChange,
	propertyName,
	onDelete,
	isDeleting,
}: PropertyDeleteSheetProps) {
	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent side="right" size="sm">
				<SheetHeader>
					<SheetTitle>Supprimer ce bien ?</SheetTitle>
					<SheetDescription>
						Cette action est irréversible. Le bien « {propertyName} » sera définitivement supprimé,
						ainsi que tous les prêts, assurances et contrats associés.
					</SheetDescription>
				</SheetHeader>
				<SheetFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
						Annuler
					</Button>
					<Button variant="destructive" onClick={onDelete} disabled={isDeleting}>
						{isDeleting ? (
							<span className="flex items-center gap-2">
								<Loader2 className="h-4 w-4 animate-spin" />
								Suppression...
							</span>
						) : (
							'Supprimer'
						)}
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	)
}
