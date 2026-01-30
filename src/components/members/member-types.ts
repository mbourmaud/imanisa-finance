export interface MemberData {
	id: string
	name: string
	color?: string | null
	avatarUrl?: string | null
}

export interface MemberWithShare extends MemberData {
	ownerShare?: number
}
