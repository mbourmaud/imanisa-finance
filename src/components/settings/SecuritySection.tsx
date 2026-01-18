'use client'

import {
	Button,
	Key,
	Separator,
	SettingsNotificationRow,
	SettingsSectionCard,
	Shield,
} from '@/components'

export function SecuritySection() {
	return (
		<SettingsSectionCard icon={Shield} title="Sécurité">
			<Button
				variant="outline"
				className="w-full justify-start"
				iconLeft={<Key className="h-4 w-4" />}
			>
				Changer le mot de passe
			</Button>
			<SettingsNotificationRow title="2FA" description="Authentification double facteur" />
			<Separator />
			<SettingsNotificationRow
				title="Sessions"
				description="Déconnexion automatique"
				defaultChecked
			/>
		</SettingsSectionCard>
	)
}
