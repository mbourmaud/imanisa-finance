import {
	AddBankDropdown,
	BankRow,
	BankRowSkeleton,
	Flex,
	IconBox,
	Landmark,
	SectionHeader,
} from '@/components'
import { BankAccountsList } from './BankAccountsList'
import type { Bank } from '@/features/banks'

interface BankAccountsSectionProps {
	banks: Bank[] | undefined
	loading: boolean
	onAddAccountClick: (bank: Bank) => void
	getBankLogo: (bankId: string, originalLogo: string | null) => string | null
	onLogoChange: (bankId: string, url: string) => void
}

export function BankAccountsSection({
	banks,
	loading,
	onAddAccountClick,
	getBankLogo,
	onLogoChange,
}: BankAccountsSectionProps) {
	return (
		<Flex direction="col" gap="sm">
			<SectionHeader
				title="Comptes bancaires"
				size="sm"
				icon={<IconBox icon={Landmark} size="sm" variant="primary" rounded="md" />}
				showLine
				action={
					banks && <AddBankDropdown banks={banks} onSelectBank={onAddAccountClick} />
				}
			/>

			{loading ? (
				<Flex direction="col" gap="sm">
					<BankRowSkeleton />
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
