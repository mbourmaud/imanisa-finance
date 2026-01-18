import {
	Button,
	ChevronDown,
	ColorDot,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	Flex,
	Plus,
} from '@/components'

interface Bank {
	id: string
	name: string
	color: string
}

interface AddBankDropdownProps {
	banks: Bank[]
	onSelectBank: (bank: Bank) => void
}

/**
 * Dropdown for selecting a bank to add an account
 */
export function AddBankDropdown({ banks, onSelectBank }: AddBankDropdownProps) {
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
						<Flex direction="row" gap="sm" align="center">
							<ColorDot color={bank.color} size="sm" />
							<span>{bank.name}</span>
						</Flex>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
