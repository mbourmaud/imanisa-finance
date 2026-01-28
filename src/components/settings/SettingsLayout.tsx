import type { ReactNode } from 'react';

interface SettingsLayoutProps {
	mainContent: ReactNode;
	sidebarContent: ReactNode;
}

/**
 * Settings page layout with main content and sidebar.
 * Main content spans 2 columns on large screens, sidebar 1 column.
 */
export function SettingsLayout({ mainContent, sidebarContent }: SettingsLayoutProps) {
	return (
		<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
			<div className="flex flex-col gap-6 lg:col-span-2">{mainContent}</div>
			<div className="flex flex-col gap-6">{sidebarContent}</div>
		</div>
	);
}
