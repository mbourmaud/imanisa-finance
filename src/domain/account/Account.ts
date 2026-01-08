import { Entity } from '@domain/shared/Entity';
import { UniqueId } from '@domain/shared/UniqueId';
import { Result } from '@domain/shared/Result';
import { AccountType } from './AccountType';
import { AssetCategory } from './AssetCategory';
import { Money } from './Money';

interface AccountProps {
	bankId: UniqueId;
	name: string;
	type: AccountType;
	assetCategory: AssetCategory;
	balance: Money;
	createdAt: Date;
	updatedAt: Date;
}

export class Account extends Entity<AccountProps> {
	private constructor(props: AccountProps, id?: UniqueId) {
		super(props, id);
	}

	get bankId(): UniqueId {
		return this.props.bankId;
	}

	get name(): string {
		return this.props.name;
	}

	get type(): AccountType {
		return this.props.type;
	}

	get assetCategory(): AssetCategory {
		return this.props.assetCategory;
	}

	get balance(): Money {
		return this.props.balance;
	}

	get createdAt(): Date {
		return this.props.createdAt;
	}

	get updatedAt(): Date {
		return this.props.updatedAt;
	}

	get isDebt(): boolean {
		return this.props.assetCategory === AssetCategory.DEBT;
	}

	updateBalance(newBalance: Money): void {
		this.props.balance = newBalance;
		this.props.updatedAt = new Date();
	}

	static getDefaultAssetCategory(type: AccountType): AssetCategory {
		switch (type) {
			case AccountType.CHECKING:
			case AccountType.SAVINGS:
				return AssetCategory.LIQUIDITY;
			case AccountType.PEA:
			case AccountType.CTO:
			case AccountType.ASSURANCE_VIE:
			case AccountType.CRYPTO:
				return AssetCategory.FINANCIAL;
			case AccountType.REAL_ESTATE:
				return AssetCategory.REAL_ESTATE;
			case AccountType.LOAN:
			case AccountType.CREDIT:
				return AssetCategory.DEBT;
			default:
				return AssetCategory.LIQUIDITY;
		}
	}

	static create(
		props: { bankId: UniqueId; name: string; type: AccountType; assetCategory?: AssetCategory; initialBalance?: number },
		id?: UniqueId
	): Result<Account> {
		if (!props.name || props.name.trim().length === 0) {
			return Result.fail('Account name is required');
		}

		if (!Object.values(AccountType).includes(props.type)) {
			return Result.fail('Invalid account type');
		}

		const assetCategory = props.assetCategory ?? this.getDefaultAssetCategory(props.type);

		const balanceResult = Money.create(props.initialBalance ?? 0);
		if (balanceResult.isFailure) {
			return Result.fail(balanceResult.error);
		}

		const now = new Date();
		return Result.ok(
			new Account(
				{
					bankId: props.bankId,
					name: props.name.trim(),
					type: props.type,
					assetCategory,
					balance: balanceResult.value,
					createdAt: now,
					updatedAt: now
				},
				id
			)
		);
	}

	static reconstitute(
		props: {
			bankId: UniqueId;
			name: string;
			type: AccountType;
			assetCategory: AssetCategory;
			balance: number;
			currency: string;
			createdAt: Date;
			updatedAt: Date;
		},
		id: UniqueId
	): Result<Account> {
		const balanceResult = Money.create(props.balance, props.currency);
		if (balanceResult.isFailure) {
			return Result.fail(balanceResult.error);
		}

		return Result.ok(
			new Account(
				{
					bankId: props.bankId,
					name: props.name,
					type: props.type,
					assetCategory: props.assetCategory,
					balance: balanceResult.value,
					createdAt: props.createdAt,
					updatedAt: props.updatedAt
				},
				id
			)
		);
	}
}
