'use client'

import {
	Button,
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from '@/components/ui'

interface ConfirmSheetProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	title: string
	description: string
	confirmLabel?: string
	cancelLabel?: string
	variant?: 'default' | 'destructive'
	onConfirm: () => void
}

export function ConfirmSheet({
	open,
	onOpenChange,
	title,
	description,
	confirmLabel = 'Confirmer',
	cancelLabel = 'Annuler',
	variant = 'default',
	onConfirm,
}: ConfirmSheetProps) {
	const handleConfirm = () => {
		onConfirm()
		onOpenChange(false)
	}

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent side="right" size="sm">
				<SheetHeader>
					<SheetTitle>{title}</SheetTitle>
					<SheetDescription>{description}</SheetDescription>
				</SheetHeader>
				<SheetFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						{cancelLabel}
					</Button>
					<Button
						variant={variant === 'destructive' ? 'destructive' : 'default'}
						onClick={handleConfirm}
					>
						{confirmLabel}
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	)
}
