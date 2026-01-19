import { AccountRowLink, AccountTypeBadge, MemberAvatarGroup } from '@/components'

interface AccountMember {
	id: string
	name: string
	ownerShare: number
	color?: string | null
}

interface Account {
	id: string
	name: string
	balance: number
	type: string
	members: AccountMember[]
}

interface BankAccountsListProps {
	accounts: Account[]
}

export function BankAccountsList({ accounts }: BankAccountsListProps) {
	if (accounts.length === 0) return null

	return (
		<>
			{accounts.map((account) => {
				const memberData = account.members.map((m) => ({
					id: m.id,
					name: m.name,
					color: m.color || undefined,
				}))

				return (
					<AccountRowLink
						key={account.id}
						accountId={account.id}
						name={account.name}
						badge={
							<AccountTypeBadge
								type={account.type as 'CHECKING' | 'SAVINGS' | 'INVESTMENT' | 'LOAN'}
								variant="subtle"
								className="text-[10px]"
							/>
						}
						memberAvatars={
							account.members.length > 0 ? (
								<MemberAvatarGroup members={memberData} size="xs" max={4} spacing="normal" />
							) : undefined
						}
						balance={account.balance}
					/>
				)
			})}
		</>
	)
}
