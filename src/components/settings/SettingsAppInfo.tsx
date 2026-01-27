import { Card, Flex } from '@/components'

interface SettingsAppInfoProps {
	version: string
}

/**
 * App info card with version and GitHub link
 */
export function SettingsAppInfo({ version }: SettingsAppInfoProps) {
	return (
		<Card padding="lg" className="bg-muted/20">
			<Flex direction="col" align="center" className="text-center">
				<p className="font-medium">Imanisa Finance</p>
				<p className="text-sm text-muted-foreground">Version {version}</p>
				<p className="mt-4 text-xs text-muted-foreground">
					Application open source de gestion de patrimoine personnel
				</p>
				<a
					href="https://github.com/mbourmaud/imanisa-finance"
					target="_blank"
					rel="noopener noreferrer"
					className="mt-2 text-xs text-primary hover:underline"
				>
					Voir sur GitHub
				</a>
			</Flex>
		</Card>
	)
}
