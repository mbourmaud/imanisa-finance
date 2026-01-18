import { AlertCircle, Button, Flex } from '@/components'

interface ImportErrorBannerProps {
	message: string
	onClose: () => void
}

/**
 * Error banner for import mutation errors
 */
export function ImportErrorBanner({ message, onClose }: ImportErrorBannerProps) {
	return (
		<div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
			<Flex direction="row" align="center" gap="md">
				<AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
				<span className="font-medium text-red-600 dark:text-red-400">{message}</span>
				<Button
					variant="ghost"
					size="sm"
					onClick={onClose}
					className="ml-auto h-6 px-2"
				>
					Fermer
				</Button>
			</Flex>
		</div>
	)
}
