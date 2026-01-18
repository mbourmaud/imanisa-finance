'use client'

import {
	Button,
	Check,
	Flex,
	Input,
	Loader2,
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from '@/components'
import { BankLogoBox } from './BankLogoBox'

interface AccountEditSheetProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	bankName: string
	bankColor: string
	editName: string
	onNameChange: (value: string) => void
	editDescription: string
	onDescriptionChange: (value: string) => void
	editAccountNumber: string
	onAccountNumberChange: (value: string) => void
	isPending: boolean
	onSave: () => void
	onCancel: () => void
}

/**
 * Sheet for editing account name, description, and account number
 */
export function AccountEditSheet({
	open,
	onOpenChange,
	bankName,
	bankColor,
	editName,
	onNameChange,
	editDescription,
	onDescriptionChange,
	editAccountNumber,
	onAccountNumberChange,
	isPending,
	onSave,
	onCancel,
}: AccountEditSheetProps) {
	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent
				side="right"
				className="w-full max-w-[420px] overflow-y-auto border-l border-border/20 bg-gradient-to-b from-background to-background/95"
			>
				<SheetHeader className="pb-6">
					<SheetTitle className="text-xl font-bold">Modifier le compte</SheetTitle>
					<SheetDescription>Modifiez les informations du compte.</SheetDescription>
				</SheetHeader>

				<Flex direction="col" gap="lg">
					{/* Bank logo centered */}
					<div className="relative mx-auto w-fit">
						<BankLogoBox bankName={bankName} bankColor={bankColor} />
					</div>

					<Flex direction="col" gap="md">
						<Flex direction="col" gap="sm">
							<label htmlFor="edit-account-name" className="text-sm font-semibold">
								Nom du compte
							</label>
							<Input
								id="edit-account-name"
								value={editName}
								onChange={(e) => onNameChange(e.target.value)}
								placeholder="Ex: Compte Joint"
								className="h-12 text-base rounded-xl bg-background/60 border-border/30"
							/>
						</Flex>
						<Flex direction="col" gap="sm">
							<label htmlFor="edit-account-number" className="text-sm font-semibold">
								Numéro de compte
								<span className="ml-1 text-xs font-normal text-muted-foreground">(optionnel)</span>
							</label>
							<Input
								id="edit-account-number"
								value={editAccountNumber}
								onChange={(e) => onAccountNumberChange(e.target.value)}
								placeholder="Ex: FR76 1234 5678 9012"
								className="h-12 font-mono rounded-xl bg-background/60 border-border/30"
							/>
						</Flex>
						<Flex direction="col" gap="sm">
							<label htmlFor="edit-account-description" className="text-sm font-semibold">
								Description
								<span className="ml-1 text-xs font-normal text-muted-foreground">(optionnel)</span>
							</label>
							<Input
								id="edit-account-description"
								value={editDescription}
								onChange={(e) => onDescriptionChange(e.target.value)}
								placeholder="Ex: Compte pour les dépenses courantes"
								className="h-12 rounded-xl bg-background/60 border-border/30"
							/>
						</Flex>
					</Flex>

					<Flex direction="row" gap="sm" className="pt-4">
						<Button
							variant="outline"
							onClick={onCancel}
							disabled={isPending}
							className="flex-1 h-12 rounded-xl border-border/20"
						>
							Annuler
						</Button>
						<Button
							onClick={onSave}
							disabled={isPending || !editName.trim()}
							className="flex-1 h-12 rounded-xl shadow-md transition-all"
						>
							{isPending ? (
								<Loader2 className="h-4 w-4 animate-spin mr-2" />
							) : (
								<Check className="h-4 w-4 mr-2" />
							)}
							Enregistrer
						</Button>
					</Flex>
				</Flex>
			</SheetContent>
		</Sheet>
	)
}
