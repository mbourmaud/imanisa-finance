'use client'

/**
 * Settings Page
 *
 * User settings including profile, members, appearance, and data management.
 * Uses extracted section components for maintainability.
 */

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
} from '@/components'

export default function SettingsPage() {
	return (
		<Flex direction="col" gap="xl">
			{/* Header */}
			<PageHeader title="Paramètres" description="Configurez votre application" />

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				{/* Main Settings Column */}
				<Flex direction="col" gap="lg" className="lg:col-span-2">
					<ProfileSection />
					<MembersSection />
					<AppearanceSection />
					<DataSection />
				</Flex>

				{/* Sidebar Settings */}
				<Flex direction="col" gap="lg">
					<NotificationsSection />
					<SecuritySection />
					<SettingsAppInfo version="2.0.0" />
				</Flex>
			</div>
		</Flex>
	)
}
