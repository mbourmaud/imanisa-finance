import { Entity } from '@domain/shared/Entity';
import { Result } from '@domain/shared/Result';
import type { UniqueId } from '@domain/shared/UniqueId';
import { LoanType } from './LoanType';

export interface LoanScheduleEntry {
	date: Date;
	payment: number;
	principal: number;
	interest: number;
	insurance: number;
	remaining: number;
}

interface LoanProps {
	ownerId: UniqueId;
	propertyId: UniqueId | null;
	name: string;
	bank: string;
	loanNumber: string | null;
	type: LoanType;
	initialAmount: number;
	remainingAmount: number;
	rate: number;
	monthlyPayment: number;
	insuranceMonthly: number;
	startDate: Date | null;
	endDate: Date | null;
	notes: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export class Loan extends Entity<LoanProps> {
	private constructor(props: LoanProps, id?: UniqueId) {
		super(props, id);
	}

	get ownerId(): UniqueId {
		return this.props.ownerId;
	}

	get propertyId(): UniqueId | null {
		return this.props.propertyId;
	}

	get name(): string {
		return this.props.name;
	}

	get bank(): string {
		return this.props.bank;
	}

	get loanNumber(): string | null {
		return this.props.loanNumber;
	}

	get type(): LoanType {
		return this.props.type;
	}

	get initialAmount(): number {
		return this.props.initialAmount;
	}

	get remainingAmount(): number {
		return this.props.remainingAmount;
	}

	get rate(): number {
		return this.props.rate;
	}

	get monthlyPayment(): number {
		return this.props.monthlyPayment;
	}

	get insuranceMonthly(): number {
		return this.props.insuranceMonthly;
	}

	get totalMonthlyPayment(): number {
		return this.props.monthlyPayment + this.props.insuranceMonthly;
	}

	get startDate(): Date | null {
		return this.props.startDate;
	}

	get endDate(): Date | null {
		return this.props.endDate;
	}

	get notes(): string | null {
		return this.props.notes;
	}

	get amountPaid(): number {
		return this.props.initialAmount - this.props.remainingAmount;
	}

	get progressPercent(): number {
		if (this.props.initialAmount === 0) return 0;
		return (this.amountPaid / this.props.initialAmount) * 100;
	}

	get remainingMonths(): number | null {
		if (!this.props.endDate) return null;
		const now = new Date();
		const months =
			(this.props.endDate.getFullYear() - now.getFullYear()) * 12 +
			(this.props.endDate.getMonth() - now.getMonth());
		return Math.max(0, months);
	}

	updateRemainingAmount(amount: number): void {
		this.props.remainingAmount = amount;
		this.props.updatedAt = new Date();
	}

	static create(
		props: {
			ownerId: UniqueId;
			propertyId?: UniqueId | null;
			name: string;
			bank: string;
			loanNumber?: string | null;
			type?: LoanType;
			initialAmount: number;
			remainingAmount: number;
			rate: number;
			monthlyPayment: number;
			insuranceMonthly?: number;
			startDate?: Date | null;
			endDate?: Date | null;
			notes?: string | null;
		},
		id?: UniqueId,
	): Result<Loan> {
		if (!props.name || props.name.trim().length === 0) {
			return Result.fail('Loan name is required');
		}
		if (!props.bank || props.bank.trim().length === 0) {
			return Result.fail('Bank name is required');
		}
		if (props.initialAmount <= 0) {
			return Result.fail('Initial amount must be positive');
		}

		const now = new Date();
		return Result.ok(
			new Loan(
				{
					ownerId: props.ownerId,
					propertyId: props.propertyId ?? null,
					name: props.name.trim(),
					bank: props.bank.trim(),
					loanNumber: props.loanNumber ?? null,
					type: props.type ?? LoanType.MORTGAGE,
					initialAmount: props.initialAmount,
					remainingAmount: props.remainingAmount,
					rate: props.rate,
					monthlyPayment: props.monthlyPayment,
					insuranceMonthly: props.insuranceMonthly ?? 0,
					startDate: props.startDate ?? null,
					endDate: props.endDate ?? null,
					notes: props.notes ?? null,
					createdAt: now,
					updatedAt: now,
				},
				id,
			),
		);
	}

	static reconstitute(
		props: {
			ownerId: UniqueId;
			propertyId: UniqueId | null;
			name: string;
			bank: string;
			loanNumber: string | null;
			type: LoanType;
			initialAmount: number;
			remainingAmount: number;
			rate: number;
			monthlyPayment: number;
			insuranceMonthly: number;
			startDate: Date | null;
			endDate: Date | null;
			notes: string | null;
			createdAt: Date;
			updatedAt: Date;
		},
		id: UniqueId,
	): Result<Loan> {
		return Result.ok(new Loan(props, id));
	}
}
