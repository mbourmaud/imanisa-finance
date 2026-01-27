import { Globe, Label, Moon, Sun } from '@/components';

type Theme = 'light' | 'dark' | 'system';

interface SettingsThemeSelectorProps {
	theme: Theme;
	onChange: (theme: Theme) => void;
	mounted: boolean;
}

interface ThemeOption {
	value: Theme;
	label: string;
	icon: typeof Sun;
}

const themeOptions: ThemeOption[] = [
	{ value: 'light', label: 'Clair', icon: Sun },
	{ value: 'dark', label: 'Sombre', icon: Moon },
	{ value: 'system', label: 'Système', icon: Globe },
];

/**
 * Theme selection buttons (light/dark/system)
 */
export function SettingsThemeSelector({ theme, onChange, mounted }: SettingsThemeSelectorProps) {
	return (
		<div className="flex flex-col gap-4">
			<Label>Thème</Label>
			<div className="grid grid-cols-3 gap-2">
				{themeOptions.map(({ value, label, icon: Icon }) => {
					const isSelected = mounted && theme === value;

					return (
						<button
							key={value}
							type="button"
							onClick={() => onChange(value)}
							className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
								isSelected
									? 'border-primary bg-primary/5'
									: 'border-border/60 bg-transparent hover:border-border'
							}`}
						>
							<Icon className="h-5 w-5" />
							<span className="text-sm font-medium">{label}</span>
						</button>
					);
				})}
			</div>
		</div>
	);
}
