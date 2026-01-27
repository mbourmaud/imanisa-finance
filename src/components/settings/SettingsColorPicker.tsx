import { Label } from '@/components';

interface ColorOption {
	name: string;
	value: string;
}

interface SettingsColorPickerProps {
	colors: ColorOption[];
	selected: string;
	onChange: (value: string) => void;
}

/**
 * Color picker for member customization
 */
export function SettingsColorPicker({ colors, selected, onChange }: SettingsColorPickerProps) {
	return (
		<div className="flex flex-col gap-2">
			<Label>Couleur</Label>
			<div className="flex flex-wrap gap-4">
				{colors.map((color) => (
					<button
						key={color.value}
						type="button"
						onClick={() => onChange(color.value)}
						className={`h-8 w-8 rounded-full transition-all bg-[var(--color-value)] ${
							selected === color.value ? 'outline outline-2 outline-offset-2 outline-primary' : ''
						}`}
						style={{ '--color-value': color.value } as React.CSSProperties}
						title={color.name}
					/>
				))}
			</div>
		</div>
	);
}
