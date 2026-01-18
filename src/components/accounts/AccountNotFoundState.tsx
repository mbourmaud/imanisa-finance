'use client'

import Link from 'next/link'
import { AlertCircle, ArrowLeft, Button, EmptyState, IconWrapper } from '@/components'

/**
 * Error state displayed when account is not found or has been deleted
 */
export function AccountNotFoundState() {
	return (
		<EmptyState
			icon={AlertCircle}
			title="Compte introuvable"
			description="Ce compte n'existe pas ou a été supprimé"
			size="md"
			action={
				<Button variant="outline" iconLeft={<IconWrapper icon={ArrowLeft} size="sm" />} asChild>
					<Link href="/dashboard/accounts">Retour aux comptes</Link>
				</Button>
			}
		/>
	)
}
