'use client'

import { Card, Users } from '@/components'

interface PropertyMemberInfo {
	id: string
	memberId: string
	ownershipShare: number
	member: {
		id: string
		name: string
		color: string | null
	}
}

interface PropertyOwnersSectionProps {
	propertyMembers: PropertyMemberInfo[]
}

export function PropertyOwnersSection({ propertyMembers }: PropertyOwnersSectionProps) {
	return (
		<Card padding="lg">
			<div className="flex flex-col gap-4">
				<div className="flex items-center gap-3">
					<Users className="h-4 w-4 text-muted-foreground" />
					<h3 className="text-base font-semibold tracking-tight">Propriétaires</h3>
				</div>
				{propertyMembers.length === 0 ? (
					<p className="text-sm text-muted-foreground">Aucun propriétaire renseigné</p>
				) : (
					<div className="flex flex-wrap gap-3">
						{propertyMembers.map((pm) => (
							<div
								key={pm.id}
								className="flex items-center gap-3 rounded-xl px-4 py-3 bg-muted/30"
							>
								<div
									className="flex items-center justify-center shrink-0 h-10 w-10 rounded-full text-sm font-medium text-white"
									style={{ backgroundColor: pm.member.color || '#6b7280' }}
								>
									{pm.member.name.charAt(0).toUpperCase()}
								</div>
								<div className="flex flex-col">
									<p className="font-medium">{pm.member.name}</p>
									<p className="text-sm text-muted-foreground">{pm.ownershipShare}%</p>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</Card>
	)
}
