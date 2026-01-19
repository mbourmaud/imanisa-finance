'use client'

import {
	AppearanceSection,
	DataSection,
	Flex,
	MembersSection,
	NotificationsSection,
	PageHeader,
	ProfileSection,
	SecuritySection,
	SettingsAppInfo,
	SettingsLayout,
} from '@/components'

export default function SettingsPage() {
	return (
		<Flex direction="col" gap="xl">
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
		</Flex>
	)
}
