/**
 * Date utilities using dayjs
 */
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import isBetween from 'dayjs/plugin/isBetween';
import isToday from 'dayjs/plugin/isToday';
import isYesterday from 'dayjs/plugin/isYesterday';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import relativeTime from 'dayjs/plugin/relativeTime';
import weekOfYear from 'dayjs/plugin/weekOfYear';

// Configure dayjs
dayjs.extend(relativeTime);
dayjs.extend(isToday);
dayjs.extend(isYesterday);
dayjs.extend(isBetween);
dayjs.extend(weekOfYear);
dayjs.extend(quarterOfYear);
dayjs.locale('fr');

export { dayjs };

/**
 * Format date for display
 */
export function formatDate(date: Date | string, format = 'D MMM YYYY'): string {
	return dayjs(date).format(format);
}

/**
 * Format date with time
 */
export function formatDateTime(date: Date | string): string {
	return dayjs(date).format('D MMM YYYY à HH:mm');
}

/**
 * Format relative time (e.g., "il y a 2 jours")
 */
export function formatRelativeTime(date: Date | string): string {
	const d = dayjs(date);

	if (d.isToday()) return "Aujourd'hui";
	if (d.isYesterday()) return 'Hier';

	return d.fromNow();
}

/**
 * Format for month display
 */
export function formatMonth(date: Date | string): string {
	return dayjs(date).format('MMMM YYYY');
}

/**
 * Get start of current month
 */
export function startOfMonth(date?: Date | string): Date {
	return dayjs(date).startOf('month').toDate();
}

/**
 * Get end of current month
 */
export function endOfMonth(date?: Date | string): Date {
	return dayjs(date).endOf('month').toDate();
}

/**
 * Get start of current year
 */
export function startOfYear(date?: Date | string): Date {
	return dayjs(date).startOf('year').toDate();
}

/**
 * Get end of current year
 */
export function endOfYear(date?: Date | string): Date {
	return dayjs(date).endOf('year').toDate();
}

/**
 * Check if date is between two dates
 */
export function isBetweenDates(
	date: Date | string,
	start: Date | string,
	end: Date | string,
): boolean {
	return dayjs(date).isBetween(start, end, 'day', '[]');
}

/**
 * Get months between two dates
 */
export function getMonthsBetween(start: Date | string, end: Date | string): Date[] {
	const months: Date[] = [];
	let current = dayjs(start).startOf('month');
	const endMonth = dayjs(end).startOf('month');

	while (current.isBefore(endMonth) || current.isSame(endMonth, 'month')) {
		months.push(current.toDate());
		current = current.add(1, 'month');
	}

	return months;
}

/**
 * Parse date string
 */
export function parseDate(dateStr: string, format?: string): Date {
	return format ? dayjs(dateStr, format).toDate() : dayjs(dateStr).toDate();
}

/**
 * Check if date is valid
 */
export function isValidDate(date: unknown): boolean {
	return dayjs(date as Date).isValid();
}

/**
 * Get difference in days
 */
export function diffInDays(date1: Date | string, date2: Date | string): number {
	return dayjs(date1).diff(dayjs(date2), 'day');
}

/**
 * Get difference in months
 */
export function diffInMonths(date1: Date | string, date2: Date | string): number {
	return dayjs(date1).diff(dayjs(date2), 'month');
}

/**
 * Add days to a date
 */
export function addDays(date: Date | string, days: number): Date {
	return dayjs(date).add(days, 'day').toDate();
}

/**
 * Add months to a date
 */
export function addMonths(date: Date | string, months: number): Date {
	return dayjs(date).add(months, 'month').toDate();
}

/**
 * Format remaining time (e.g., "2 ans et 3 mois")
 */
export function formatRemainingTime(endDate: Date | string): string {
	const end = dayjs(endDate);
	const now = dayjs();

	if (end.isBefore(now)) return 'Terminé';

	const months = end.diff(now, 'month');
	const years = Math.floor(months / 12);
	const remainingMonths = months % 12;

	if (years > 0 && remainingMonths > 0) {
		return `${years} an${years > 1 ? 's' : ''} et ${remainingMonths} mois`;
	}
	if (years > 0) {
		return `${years} an${years > 1 ? 's' : ''}`;
	}
	return `${remainingMonths} mois`;
}
