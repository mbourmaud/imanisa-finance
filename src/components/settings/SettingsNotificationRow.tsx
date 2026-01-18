import { Flex, Switch } from '@/components'

interface SettingsNotificationRowProps {
	title: string
	description: string
	defaultChecked?: boolean
	onChange?: (checked: boolean) => void
}

/**
 * Notification toggle row with title and description
 */
export function SettingsNotificationRow({
	title,
	description,
	defaultChecked,
	onChange,
}: SettingsNotificationRowProps) {
	return (
		<Flex direction="row" justify="between" align="center">
			<Flex direction="col">
				<p className="font-medium">{title}</p>
				<p className="text-xs text-muted-foreground">{description}</p>
			</Flex>
			<Switch defaultChecked={defaultChecked} onCheckedChange={onChange} />
		</Flex>
	)
}
