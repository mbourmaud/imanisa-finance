'use client'

import {
	MembersSection,
	ProfileSection,
	SettingsAppInfo,
	SettingsLayout,
} from '@/components'
import { usePageHeader } from '@/shared/hooks'

export default function SettingsPage() {
	usePageHeader('Paramètres')

	return (
		<SettingsLayout
			mainContent={
				<>
					<ProfileSection />
					<MembersSection />
				</>
			}
			sidebarContent={<SettingsAppInfo version="2.0.0" />}
		/>
	)
}
