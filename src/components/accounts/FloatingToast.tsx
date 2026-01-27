'use client'

import { AlertCircle, Button, CheckCircle2, Flex, X } from '@/components'

interface FloatingToastProps {
	message: string
	isSuccess?: boolean
	onClose: () => void
}

/**
 * Floating toast notification for success/error messages
 */
export function FloatingToast({ message, isSuccess = false, onClose }: FloatingToastProps) {
	return (
		<div
			className={`fixed bottom-6 right-6 z-50 max-w-md p-4 rounded-lg shadow-lg border bg-background animate-in fade-in slide-in-from-bottom-4 duration-300 ${
				isSuccess ? 'border-emerald-500/50' : 'border-red-500/50'
			}`}
		>
			<Flex direction="row" gap="sm" align="start">
				<div
					className={`flex items-center justify-center flex-shrink-0 h-8 w-8 rounded-lg ${
						isSuccess ? 'bg-emerald-500/10' : 'bg-red-500/10'
					}`}
				>
					{isSuccess ? (
						<CheckCircle2 className="h-4 w-4 text-emerald-500" />
					) : (
						<AlertCircle className="h-4 w-4 text-red-500" />
					)}
				</div>
				<Flex direction="col" gap="xs" className="flex-grow min-w-0">
					<span className={`text-sm font-semibold ${isSuccess ? 'text-emerald-500' : 'text-red-500'}`}>
						{isSuccess ? 'Import réussi' : 'Erreur'}
					</span>
					<span className="text-sm text-foreground">{message}</span>
				</Flex>
				<Button
					variant="ghost"
					size="icon"
					onClick={onClose}
					className="flex-shrink-0 h-8 w-8 rounded-lg"
				>
					<X className="h-4 w-4" />
				</Button>
			</Flex>
		</div>
	)
}
