interface AppLogoProps {
	name?: string;
}

/**
 * App logo/name for headers
 */
export function AppLogo({ name = 'Imanisa Finance' }: AppLogoProps) {
	return <span className="font-semibold">{name}</span>;
}
