import { Wallet } from 'lucide-react';

/**
 * Compact logo for auth error page
 */
export function AuthErrorLogo() {
	return (
		<div className="flex flex-col items-center gap-4 p-6">
			<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/80 shadow-xl">
				<Wallet className="h-8 w-8 text-white" />
			</div>
		</div>
	);
}
