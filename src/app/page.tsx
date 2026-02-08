'use client'

import { useRouter } from 'next/navigation'
import {
	LandingBackground,
	LandingContainer,
	LandingFooter,
	LandingLogo,
	ProfileSelector,
} from '@/components'
import { useEntitySync } from '@/shared/hooks'
import { useEntityStore } from '@/shared/stores/entity-store'

export default function HomePage() {
	const router = useRouter()
	const { entities, setSelectedEntity } = useEntityStore()
	useEntitySync()

	const handleSelectProfile = (entityId: string) => {
		setSelectedEntity(entityId)
		router.push('/dashboard')
	}

	return (
		<LandingContainer>
			<LandingBackground />
			<LandingLogo />
			<ProfileSelector entities={entities} onSelectProfile={handleSelectProfile} />
			<LandingFooter />
		</LandingContainer>
	)
}
