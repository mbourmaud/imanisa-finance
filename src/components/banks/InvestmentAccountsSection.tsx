import {
	AddBankDropdown,
	BankRow,
	BankRowSkeleton,
	Flex,
	IconBox,
	SectionHeader,
	TrendingUp,
} from '@/components'
import { BankAccountsList } from './BankAccountsList'
import type { Bank } from '@/features/banks'

interface InvestmentAccountsSectionProps {
	banks: Bank[] | undefined
	loading: boolean
	onAddAccountClick: (bank: Bank) => void
	getBankLogo: (bankId: string, originalLogo: string | null) => string | null
	onLogoChange: (bankId: string, url: string) => void
}

export function InvestmentAccountsSection({
	banks,
	loading,
	onAddAccountClick,
	getBankLogo,
	onLogoChange,
}: InvestmentAccountsSectionProps) {
	return (
		<Flex direction="col" gap="sm">
			<SectionHeader
				title="Investissements"
				size="sm"
				icon={
					<IconBox
						icon={TrendingUp}
						size="sm"
						variant="custom"
						bgColor="hsl(270 60% 95%)"
						iconColor="hsl(270 60% 50%)"
						rounded="md"
					/>
				}
				showLine
				action={
					banks && <AddBankDropdown banks={banks} onSelectBank={onAddAccountClick} />
				}
			/>

			{loading ? (
				<Flex direction="col" gap="sm">
					<BankRowSkeleton />
					<BankRowSkeleton />
				</Flex>
			) : (
				<Flex direction="col" gap="sm">
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
				</Flex>
			)}
		</Flex>
	)
}
