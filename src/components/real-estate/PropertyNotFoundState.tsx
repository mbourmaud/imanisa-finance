'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Button, Card } from '@/components'

interface PropertyNotFoundStateProps {
	error: string | null
}

export function PropertyNotFoundState({ error }: PropertyNotFoundStateProps) {
	const router = useRouter()

	return (
		<div className="flex flex-col gap-6">
			<Link
				href="/dashboard/real-estate"
				className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
			>
				<ArrowLeft className="h-4 w-4" />
				Retour aux biens
			</Link>
			<Card padding="lg" className="border-destructive/50 bg-destructive/5">
				<p className="text-sm text-destructive">{error || 'Bien non trouvé'}</p>
				<Button
					variant="outline"
					size="sm"
					className="mt-4"
					onClick={() => router.push('/dashboard/real-estate')}
				>
					Retour à la liste
				</Button>
			</Card>
		</div>
	)
}
