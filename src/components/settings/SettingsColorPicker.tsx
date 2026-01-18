import { Flex, Label } from '@/components'

interface ColorOption {
	name: string
	value: string
}

interface SettingsColorPickerProps {
	colors: ColorOption[]
	selected: string
	onChange: (value: string) => void
}

/**
 * Color picker for member customization
 */
export function SettingsColorPicker({ colors, selected, onChange }: SettingsColorPickerProps) {
	return (
		<Flex direction="col" gap="sm">
			<Label>Couleur</Label>
			<Flex direction="row" wrap="wrap" gap="md">
				{colors.map((color) => (
					<button
						key={color.value}
						type="button"
						onClick={() => onChange(color.value)}
						className={`h-8 w-8 rounded-full transition-all ${
							selected === color.value
								? 'outline outline-2 outline-offset-2 outline-primary'
								: ''
						}`}
						style={{ backgroundColor: color.value }}
						title={color.name}
					/>
				))}
			</Flex>
		</Flex>
	)
}
