import type { Loan } from '@lib/types/real-estate';

export interface AmortizationEntry {
	/** Month number (1-indexed) */
	month: number;
	/** Payment date (ISO string) */
	date: string;
	/** Total monthly payment (principal + interest, excluding insurance) */
	payment: number;
	/** Principal portion of payment */
	principal: number;
	/** Interest portion of payment */
	interest: number;
	/** Remaining balance after this payment */
	balance: number;
}

/**
 * Calculate the full amortization schedule for a loan.
 * Uses the standard French amortization formula (constant payment method).
 *
 * @param loan - The loan object with principal, rate, duration, and start date
 * @returns Array of AmortizationEntry for each month of the loan
 */
export function calculateAmortizationSchedule(loan: Loan): AmortizationEntry[] {
	const schedule: AmortizationEntry[] = [];

	const principal = loan.principalAmount;
	const monthlyRate = loan.interestRate / 100 / 12;
	const durationMonths = loan.durationMonths;
	const startDate = new Date(loan.startDate);

	// Monthly payment (excluding insurance)
	// Using the standard formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
	let monthlyPayment: number;
	if (monthlyRate === 0) {
		// Edge case: 0% interest rate
		monthlyPayment = principal / durationMonths;
	} else {
		const rateCompound = Math.pow(1 + monthlyRate, durationMonths);
		monthlyPayment = principal * (monthlyRate * rateCompound) / (rateCompound - 1);
	}

	let balance = principal;

	for (let month = 1; month <= durationMonths; month++) {
		// Calculate payment date (start date + month)
		const paymentDate = new Date(startDate);
		paymentDate.setMonth(paymentDate.getMonth() + month);

		// Interest portion for this month
		const interest = balance * monthlyRate;

		// Principal portion for this month
		const principalPortion = monthlyPayment - interest;

		// Update balance
		balance = balance - principalPortion;

		// Fix floating point issues - don't go negative
		if (balance < 0.01) {
			balance = 0;
		}

		schedule.push({
			month,
			date: paymentDate.toISOString().split('T')[0],
			payment: Math.round(monthlyPayment * 100) / 100,
			principal: Math.round(principalPortion * 100) / 100,
			interest: Math.round(interest * 100) / 100,
			balance: Math.round(balance * 100) / 100
		});
	}

	return schedule;
}

/**
 * Find the current month index in the amortization schedule.
 * Returns the index of the entry that matches or is closest to the current date.
 *
 * @param schedule - The amortization schedule
 * @param referenceDate - The date to compare against (defaults to today)
 * @returns The index of the current month entry, or -1 if no match
 */
export function getCurrentMonthIndex(
	schedule: AmortizationEntry[],
	referenceDate: Date = new Date()
): number {
	const refYear = referenceDate.getFullYear();
	const refMonth = referenceDate.getMonth();

	for (let i = 0; i < schedule.length; i++) {
		const entryDate = new Date(schedule[i].date);
		if (entryDate.getFullYear() === refYear && entryDate.getMonth() === refMonth) {
			return i;
		}
	}

	// If no exact match, find the last entry before the reference date
	for (let i = schedule.length - 1; i >= 0; i--) {
		const entryDate = new Date(schedule[i].date);
		if (entryDate <= referenceDate) {
			return i;
		}
	}

	return -1;
}
