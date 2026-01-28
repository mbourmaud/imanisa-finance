import {
	Button,
	ChevronDown,
	ColorDot,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	Plus,
} from '@/components';

interface BaseBank {
	id: string;
	name: string;
	color: string;
}

interface AddBankDropdownProps<T extends BaseBank> {
	banks: T[];
	onSelectBank: (bank: T) => void;
}

/**
 * Dropdown for selecting a bank to add an account
 */
export function AddBankDropdown<T extends BaseBank>({
	banks,
	onSelectBank,
}: AddBankDropdownProps<T>) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="sm">
					<Plus className="h-3.5 w-3.5" />
					<span className="text-xs">Ajouter</span>
					<ChevronDown className="h-3 w-3 opacity-50" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-48">
				{banks.map((bank) => (
					<DropdownMenuItem key={bank.id} onClick={() => onSelectBank(bank)}>
						<div className="flex flex-row gap-2 items-center">
							<ColorDot color={bank.color} size="sm" />
							<span>{bank.name}</span>
						</div>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
