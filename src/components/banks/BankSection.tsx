import {
	AddBankDropdown,
	BankRow,
	BankRowSkeleton,
	SectionHeader,
} from '@/components'
import { BankAccountsList } from './BankAccountsList'
import type { Bank } from '@/features/banks'

interface BankSectionProps {
	title: string
	banks: Bank[] | undefined
	isLoading: boolean
	skeletonCount?: number
	onAddAccountClick: (bank: Bank) => void
}

export function BankSection({
	title,
	banks,
	isLoading,
	skeletonCount = 2,
	onAddAccountClick,
}: BankSectionProps) {
	return (
		<div className="flex flex-col gap-4">
			<SectionHeader
				title={title}
				action={banks && <AddBankDropdown banks={banks} onSelectBank={onAddAccountClick} />}
			/>

			{isLoading ? (
				<div className="flex flex-col gap-3">
					{Array.from({ length: skeletonCount }, (_, i) => (
						<BankRowSkeleton key={i} />
					))}
				</div>
			) : (
				<div className="flex flex-col gap-3">
					{banks?.map((bank) => (
						<BankRow
							key={bank.id}
							bankId={bank.id}
							bankName={bank.name}
							bankColor={bank.color}
							logo={bank.logo}
							description={bank.description}
							accountCount={bank.accountCount}
							totalBalance={bank.totalBalance}
							onAddAccount={() => onAddAccountClick(bank)}
							accountsList={<BankAccountsList accounts={bank.accounts} />}
						/>
					))}
				</div>
			)}
		</div>
	)
}
