'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import {
	Flex,
	Label,
	Palette,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Separator,
	SettingsSectionCard,
	SettingsThemeSelector,
} from '@/components'

export function AppearanceSection() {
	const [mounted, setMounted] = useState(false)
	const { theme, setTheme } = useTheme()

	// Avoid hydration mismatch by only rendering theme-dependent UI after mount
	useEffect(() => {
		setMounted(true)
	}, [])

	return (
		<SettingsSectionCard icon={Palette} title="Apparence" description="Personnalisez l'interface">
			<SettingsThemeSelector
				theme={(theme as 'light' | 'dark' | 'system') || 'system'}
				onChange={setTheme}
				mounted={mounted}
			/>

			<Separator />

			{/* Language */}
			<Flex direction="col" gap="sm">
				<Label htmlFor="language">Langue</Label>
				<Select defaultValue="fr">
					<SelectTrigger id="language" className="w-full max-w-[200px]">
						<SelectValue placeholder="Sélectionner" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="fr">Français</SelectItem>
						<SelectItem value="en">English</SelectItem>
					</SelectContent>
				</Select>
			</Flex>
		</SettingsSectionCard>
	)
}
