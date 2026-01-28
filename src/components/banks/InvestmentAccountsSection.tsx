import {
	AddBankDropdown,
	BankRow,
	BankRowSkeleton,
	IconBox,
	SectionHeader,
	TrendingUp,
} from '@/components';
import { BankAccountsList } from './BankAccountsList';
import type { Bank } from '@/features/banks';

interface InvestmentAccountsSectionProps {
	banks: Bank[] | undefined;
	loading: boolean;
	onAddAccountClick: (bank: Bank) => void;
	getBankLogo: (bankId: string, originalLogo: string | null) => string | null;
	onLogoChange: (bankId: string, url: string) => void;
}

export function InvestmentAccountsSection({
	banks,
	loading,
	onAddAccountClick,
	getBankLogo,
	onLogoChange,
}: InvestmentAccountsSectionProps) {
	return (
		<div className="flex flex-col gap-2">
			<SectionHeader
				title="Investissements"
				action={banks && <AddBankDropdown banks={banks} onSelectBank={onAddAccountClick} />}
			/>

			{loading ? (
				<div className="flex flex-col gap-2">
					<BankRowSkeleton />
					<BankRowSkeleton />
				</div>
			) : (
				<div className="flex flex-col gap-2">
					{banks?.map((bank, index) => (
						<BankRow
							key={bank.id}
							bankId={bank.id}
							bankName={bank.name}
							bankColor={bank.color}
							logo={getBankLogo(bank.id, bank.logo)}
							description={bank.description}
							accountCount={bank.accountCount}
							totalBalance={bank.totalBalance}
							onAddAccount={() => onAddAccountClick(bank)}
							onLogoChange={(url) => onLogoChange(bank.id, url)}
							accountsList={<BankAccountsList accounts={bank.accounts} />}
							animationDelay={index * 50}
						/>
					))}
				</div>
			)}
		</div>
	);
}
