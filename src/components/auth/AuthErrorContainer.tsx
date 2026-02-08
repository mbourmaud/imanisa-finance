import type { ReactNode } from 'react';

interface AuthErrorContainerProps {
	children: ReactNode;
}

/**
 * Container for auth error page with centered content wrapper
 */
export function AuthErrorContainer({ children }: AuthErrorContainerProps) {
	return (
		<div className="relative flex min-h-screen overflow-hidden bg-background p-6">
			<div className="flex h-full w-full flex-col items-center justify-center">{children}</div>
		</div>
	);
}
