'use client';

import {
	AppearanceSection,
	DataSection,
	MembersSection,
	NotificationsSection,
	PageHeader,
	ProfileSection,
	SecuritySection,
	SettingsAppInfo,
	SettingsLayout,
} from '@/components';

export default function SettingsPage() {
	return (
		<div className="flex flex-col gap-8">
			<PageHeader title="Paramètres" description="Configurez votre application" />

			<SettingsLayout
				mainContent={
					<>
						<ProfileSection />
						<MembersSection />
						<AppearanceSection />
						<DataSection />
					</>
				}
				sidebarContent={
					<>
						<NotificationsSection />
						<SecuritySection />
						<SettingsAppInfo version="2.0.0" />
					</>
				}
			/>
		</div>
	);
}
