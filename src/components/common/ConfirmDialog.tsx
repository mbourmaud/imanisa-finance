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
} from '@/components/ui/alert-dialog';

interface ConfirmDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: string;
	confirmLabel?: string;
	cancelLabel?: string;
	variant?: 'default' | 'destructive';
	onConfirm: () => void;
}

export function ConfirmDialog({
	open,
	onOpenChange,
	title,
	description,
	confirmLabel = 'Confirmer',
	cancelLabel = 'Annuler',
	variant = 'default',
	onConfirm,
}: ConfirmDialogProps) {
	const handleConfirm = () => {
		onConfirm();
		onOpenChange(false);
	};

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					<AlertDialogDescription>{description}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleConfirm}
						className={
							variant === 'destructive'
								? 'bg-[oklch(0.55_0.2_25)] hover:bg-[oklch(0.5_0.2_25)]'
								: ''
						}
					>
						{confirmLabel}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
