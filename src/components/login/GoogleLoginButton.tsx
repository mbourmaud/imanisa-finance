import { Button } from '@/components';
import { GoogleIcon } from './GoogleIcon';

interface GoogleLoginButtonProps {
	onClick: () => void;
	isLoading: boolean;
}

/**
 * Google OAuth login button with Google branding
 */
export function GoogleLoginButton({ onClick, isLoading }: GoogleLoginButtonProps) {
	return (
		<Button
			onClick={onClick}
			disabled={isLoading}
			variant="outline"
			fullWidth
			className="gap-3 rounded-2xl border-gray-200 bg-white p-4 text-gray-800 hover:bg-gray-50"
		>
			<GoogleIcon />
			{isLoading ? 'Connexion...' : 'Continuer avec Google'}
		</Button>
	);
}
