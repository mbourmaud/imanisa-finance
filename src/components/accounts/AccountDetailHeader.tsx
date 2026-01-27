'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import {
	ArrowLeft,
	Button,
	Card,
	Flex,
	Pencil,
	Settings,
	Trash2,
} from '@/components'
import { AccountTypeBadge } from '@/components/accounts/AccountCard'
import { MoneyDisplay } from '@/components/common/MoneyDisplay'
import { MemberAvatarGroup } from '@/components/members/MemberAvatar'
import { BankLogoBox } from './BankLogoBox'

interface AccountMember {
	id: string
	memberId: string
	ownerShare: number
	member: {
		id: string
		name: string
		color: string | null
	}
}

interface AccountDetailHeaderProps {
	accountName: string
	accountDescription?: string | null
	accountNumber?: string | null
	accountType: 'CHECKING' | 'SAVINGS' | 'INVESTMENT' | 'LOAN'
	balance: number
	currency: string
	transactionCount: number
	bankName: string
	bankColor: string
	accountMembers: AccountMember[]
	onEditClick: () => void
	onSettingsClick: () => void
	onDeleteClick: () => void
}

/**
 * Header card for account detail page with bank logo, balance, and actions
 */
export function AccountDetailHeader({
	accountName,
	accountDescription,
	accountNumber,
	accountType,
	balance,
	currency,
	transactionCount,
	bankName,
	bankColor,
	accountMembers,
	onEditClick,
	onSettingsClick,
	onDeleteClick,
}: AccountDetailHeaderProps) {
	return (
		<>
			{/* Back link */}
			<Link
				href="/dashboard/banks"
				className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-all hover:text-foreground group"
			>
				<ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
				<span>Retour aux banques</span>
			</Link>

			{/* Header card */}
			<Card padding="lg" className="relative">
				{/* Gradient accent bar */}
				<div
					className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
					style={{
						background: `linear-gradient(90deg, ${bankColor}, ${bankColor}88, transparent)`,
					}}
				/>

				<Flex direction="row" gap="lg" align="start">
					<BankLogoBox bankName={bankName} bankColor={bankColor} />

					<Flex direction="col" gap="sm" className="flex-grow min-w-0">
						{/* Top row: Name + Balance + Actions */}
						<Flex direction="row" justify="between" align="start" gap="md">
							<div className="min-w-0">
								<Flex direction="row" gap="sm" align="center">
									<h1 className="text-2xl font-bold tracking-tight">{accountName}</h1>
									<Button
										variant="ghost"
										size="icon"
										onClick={onEditClick}
										className="h-9 w-9 rounded-xl text-muted-foreground flex-shrink-0 transition-all hover:text-foreground"
									>
										<Pencil className="h-4 w-4" />
									</Button>
								</Flex>
							</div>

							{/* Balance + Actions */}
							<Flex direction="row" gap="md" className="flex-shrink-0">
								<Flex direction="col" gap="xs" align="end">
									<MoneyDisplay
										amount={balance}
										currency={currency as 'EUR'}
										size="2xl"
										weight="bold"
										className="tracking-tight"
									/>
									<span className="text-xs text-muted-foreground font-medium">
										{transactionCount} transaction
										{transactionCount !== 1 ? 's' : ''}
									</span>
								</Flex>

								{/* Actions */}
								<Flex direction="row" gap="sm">
									<Button
										variant="ghost"
										size="icon"
										onClick={onSettingsClick}
										className="h-10 w-10 rounded-xl bg-background/50 border border-border/20 shadow-sm transition-all hover:bg-background"
									>
										<Settings className="h-4 w-4" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										onClick={onDeleteClick}
										className="h-10 w-10 rounded-xl bg-background/50 border border-border/20 shadow-sm text-muted-foreground transition-all hover:text-destructive"
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</Flex>
							</Flex>
						</Flex>

						{/* Bottom row: Bank info + Members */}
						<Flex direction="row" gap="sm" wrap="wrap" className="mt-3">
							<span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-background/60 text-muted-foreground">
								{bankName}
							</span>
							<AccountTypeBadge
								type={accountType}
								className="bg-background/60 rounded-full px-3 py-1"
							/>
							{accountNumber && (
								<span className="hidden px-3 py-1 text-xs rounded-full font-mono bg-background/60 text-muted-foreground">
									{accountNumber}
								</span>
							)}
							{/* Members */}
							{accountMembers.length > 0 && (
								<>
									<span className="text-muted-foreground/40">•</span>
									<Flex direction="row" gap="sm" align="center">
										<MemberAvatarGroup
											members={accountMembers.map((am) => ({
												id: am.memberId,
												name: am.member.name,
												color: am.member.color,
											}))}
											size="sm"
											max={5}
										/>
										<span className="text-xs text-muted-foreground font-medium">
											{accountMembers.map((am) => am.member.name).join(', ')}
										</span>
									</Flex>
								</>
							)}
						</Flex>
						{accountDescription && (
							<p className="text-sm text-muted-foreground mt-3">{accountDescription}</p>
						)}
					</Flex>
				</Flex>
			</Card>
		</>
	)
}
