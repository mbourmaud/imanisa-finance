import type { ReactNode } from 'react'
import { Flex } from '@/components'

interface SettingsLayoutProps {
	mainContent: ReactNode
	sidebarContent: ReactNode
}

/**
 * Settings page layout with main content and sidebar.
 * Main content spans 2 columns on large screens, sidebar 1 column.
 */
export function SettingsLayout({ mainContent, sidebarContent }: SettingsLayoutProps) {
	return (
		<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
			<Flex direction="col" gap="lg" className="lg:col-span-2">
				{mainContent}
			</Flex>
			<Flex direction="col" gap="lg">
				{sidebarContent}
			</Flex>
		</div>
	)
}
