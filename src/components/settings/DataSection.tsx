'use client'

import { Button, Database, Download, Flex, SettingsSectionCard, Upload } from '@/components'

export function DataSection() {
	return (
		<SettingsSectionCard icon={Database} title="Données" description="Export et sauvegarde">
			<Flex direction="col" gap="md">
				<Button
					variant="outline"
					className="flex-1"
					iconLeft={<Download className="h-4 w-4" />}
				>
					Exporter les données
				</Button>
				<Button variant="outline" className="flex-1" iconLeft={<Upload className="h-4 w-4" />}>
					Importer une sauvegarde
				</Button>
			</Flex>
			<p className="text-xs text-muted-foreground">
				Vos données sont stockées localement sur votre serveur. Effectuez des sauvegardes
				régulières pour éviter toute perte de données.
			</p>
		</SettingsSectionCard>
	)
}
