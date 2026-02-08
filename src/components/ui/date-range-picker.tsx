'use client';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DateRangePreset {
	label: string;
	range: DateRange;
}

function getPresets(): DateRangePreset[] {
	const now = new Date();
	const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
	const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
	const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
	const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
	const startOfYear = new Date(now.getFullYear(), 0, 1);

	return [
		{ label: 'Ce mois', range: { from: startOfMonth, to: now } },
		{ label: 'Mois dernier', range: { from: startOfLastMonth, to: endOfLastMonth } },
		{ label: '3 derniers mois', range: { from: threeMonthsAgo, to: now } },
		{ label: 'Cette année', range: { from: startOfYear, to: now } },
	];
}

interface DateRangePickerProps {
	value?: DateRange;
	onChange: (range: DateRange | undefined) => void;
	className?: string;
	placeholder?: string;
}

function DateRangePicker({
	value,
	onChange,
	className,
	placeholder = 'Sélectionner les dates',
}: DateRangePickerProps) {
	const presets = getPresets();

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					className={cn(
						'justify-start text-left font-normal',
						!value?.from && 'text-muted-foreground',
						className,
					)}
				>
					<CalendarIcon className="h-4 w-4" />
					{value?.from ? (
						value.to ? (
							<>
								{format(value.from, 'd MMM', { locale: fr })} -{' '}
								{format(value.to, 'd MMM yyyy', { locale: fr })}
							</>
						) : (
							format(value.from, 'd MMM yyyy', { locale: fr })
						)
					) : (
						<span>{placeholder}</span>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="start">
				<div className="flex">
					<div className="flex flex-col gap-1 border-r p-3">
						{presets.map((preset) => (
							<Button
								key={preset.label}
								variant="ghost"
								size="sm"
								className="justify-start"
								onClick={() => onChange(preset.range)}
							>
								{preset.label}
							</Button>
						))}
						{value?.from && (
							<Button
								variant="ghost"
								size="sm"
								className="justify-start text-muted-foreground"
								onClick={() => onChange(undefined)}
							>
								Effacer
							</Button>
						)}
					</div>
					<Calendar
						mode="range"
						selected={value}
						onSelect={onChange}
						numberOfMonths={2}
						locale={fr}
					/>
				</div>
			</PopoverContent>
		</Popover>
	);
}

export { DateRangePicker };
export type { DateRangePickerProps };
