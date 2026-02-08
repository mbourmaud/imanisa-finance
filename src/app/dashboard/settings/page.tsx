'use client'

import { useTheme } from 'next-themes'
import {
	Button,
	Check,
	MembersSection,
	Monitor,
	Moon,
	PageHeader,
	Palette,
	ProfileSection,
	SettingsSectionCard,
	Sun,
} from '@/components'

function ThemeSection() {
	const { theme, setTheme } = useTheme()

	const themes = [
		{ value: 'light', label: 'Clair', icon: Sun },
		{ value: 'dark', label: 'Sombre', icon: Moon },
		{ value: 'system', label: 'Système', icon: Monitor },
	] as const

	return (
		<SettingsSectionCard icon={Palette} title="Apparence" description="Personnalisez le thème de l'application">
			<div className="flex gap-3">
				{themes.map(({ value, label, icon: Icon }) => (
					<Button
						key={value}
						variant={theme === value ? 'default' : 'outline'}
						onClick={() => setTheme(value)}
						className="flex-1 gap-2"
					>
						<Icon className="h-4 w-4" />
						{label}
						{theme === value && <Check className="h-3.5 w-3.5" />}
					</Button>
				))}
			</div>
		</SettingsSectionCard>
	)
}

export default function SettingsPage() {
	return (
		<>
			<PageHeader title="Paramètres" />
			<div className="flex flex-col gap-6">
				<ProfileSection />
				<MembersSection />
				<ThemeSection />
			</div>
		</>
	)
}
