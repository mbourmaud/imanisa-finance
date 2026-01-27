import { Card } from '@/components'
import { ProfileButton } from './ProfileButton'

interface Entity {
	id: string
	name: string
	type: string
}

interface ProfileSelectorProps {
	entities: Entity[]
	onSelectProfile: (entityId: string) => void
}

/**
 * Profile selector for landing page
 */
export function ProfileSelector({ entities, onSelectProfile }: ProfileSelectorProps) {
	const individualEntities = entities.filter((e) => e.type === 'individual')

	return (
		<Card className="w-full max-w-sm p-6">
			<p className="mb-6 text-center text-xl font-semibold">
				Qui êtes-vous ?
			</p>
			<div className="flex flex-col gap-4">
				{individualEntities.map((entity) => (
					<ProfileButton
						key={entity.id}
						name={entity.name}
						onClick={() => onSelectProfile(entity.id)}
					/>
				))}
			</div>
		</Card>
	)
}
