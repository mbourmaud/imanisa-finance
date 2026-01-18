import { Button, Download } from '@/components'

interface ExportButtonProps {
	onClick?: () => void
}

/**
 * Button to export transactions
 */
export function ExportButton({ onClick }: ExportButtonProps) {
	return (
		<Button
			variant="outline"
			iconLeft={<Download className="h-4 w-4" />}
			onClick={onClick}
		>
			Exporter
		</Button>
	)
}
