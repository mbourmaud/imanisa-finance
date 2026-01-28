'use client';

import { Bell, Separator, SettingsNotificationRow, SettingsSectionCard } from '@/components';

export function NotificationsSection() {
	return (
		<SettingsSectionCard icon={Bell} title="Notifications">
			<SettingsNotificationRow
				title="Alertes budget"
				description="Dépassement de budget"
				defaultChecked
			/>
			<Separator />
			<SettingsNotificationRow title="Transactions" description="Nouvelles transactions" />
			<Separator />
			<SettingsNotificationRow title="Rappels" description="Échéances de prêts" defaultChecked />
		</SettingsSectionCard>
	);
}
