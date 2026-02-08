import { Info } from '@/components'
import type { ParserFormatInfo } from '@/features/import'

interface ImportFormatInfoProps {
	formatInfo: ParserFormatInfo
}

export function ImportFormatInfo({ formatInfo }: ImportFormatInfoProps) {
	return (
		<div className="flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/30">
			<Info className="h-4 w-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
			<div className="flex flex-col gap-0.5 text-sm text-blue-800 dark:text-blue-300">
				<span className="font-medium">Format attendu</span>
				<span>Séparateur : {formatInfo.delimiter}</span>
				<span>Encodage : {formatInfo.encoding}</span>
				<span>Colonnes : {formatInfo.columns}</span>
			</div>
		</div>
	)
}
