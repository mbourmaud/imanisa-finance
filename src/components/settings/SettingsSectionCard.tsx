import { Flex, GlassCard, type LucideIcon } from '@/components'
import type { ReactNode } from 'react'

interface SettingsSectionCardProps {
	icon: LucideIcon
	title: string
	description?: string
	action?: ReactNode
	children: ReactNode
}

/**
 * Card wrapper for a settings section with icon header
 */
export function SettingsSectionCard({
	icon: Icon,
	title,
	description,
	action,
	children,
}: SettingsSectionCardProps) {
	return (
		<GlassCard padding="lg">
			<Flex direction="col" gap="md">
				<Flex direction="row" justify="between" align="center" className="pb-2">
					<Flex direction="row" gap="md" align="center">
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
							<Icon className="h-5 w-5" />
						</div>
						<Flex direction="col">
							<h3 className="text-lg font-medium tracking-tight">{title}</h3>
							{description && (
								<p className="text-sm text-muted-foreground">{description}</p>
							)}
						</Flex>
					</Flex>
					{action}
				</Flex>
				{children}
			</Flex>
		</GlassCard>
	)
}
