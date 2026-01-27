import { Button, Plus } from '@/components';

interface AddAccountButtonProps {
	onClick?: () => void;
}

/**
 * Button to add a new account
 */
export function AddAccountButton({ onClick }: AddAccountButtonProps) {
	return (
		<Button onClick={onClick} className="gap-2">
			<Plus className="h-4 w-4" />
			Ajouter un compte
		</Button>
	);
}
