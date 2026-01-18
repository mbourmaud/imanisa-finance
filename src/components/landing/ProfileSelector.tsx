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
		<div className="w-full max-w-sm">
			<p className="mb-6 text-center text-xl font-semibold">
				Qui êtes-vous ?
			</p>
			<div className="flex flex-col gap-4">
				{individualEntities.map((entity, index) => (
					<ProfileButton
						key={entity.id}
						name={entity.name}
						onClick={() => onSelectProfile(entity.id)}
						animationDelay={`${0.1 + index * 0.1}s`}
					/>
				))}
			</div>
		</div>
	)
}
