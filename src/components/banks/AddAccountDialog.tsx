import type { ReactNode } from 'react'
import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	Flex,
	Input,
	Label,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Textarea,
} from '@/components'
import { MemberSelectorChips } from './MemberSelectorChips'

interface Member {
	id: string
	name: string
	color: string | null
}

interface AddAccountDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	bankName: string
	error?: string | null
	isPending: boolean
	name: string
	onNameChange: (value: string) => void
	description: string
	onDescriptionChange: (value: string) => void
	exportUrl: string
	onExportUrlChange: (value: string) => void
	accountType: string
	onAccountTypeChange: (value: string) => void
	members: Member[]
	selectedMemberIds: string[]
	onMemberToggle: (id: string) => void
	onSubmit: () => void
}

/**
 * Dialog for adding a new bank account
 */
export function AddAccountDialog({
	open,
	onOpenChange,
	bankName,
	error,
	isPending,
	name,
	onNameChange,
	description,
	onDescriptionChange,
	exportUrl,
	onExportUrlChange,
	accountType,
	onAccountTypeChange,
	members,
	selectedMemberIds,
	onMemberToggle,
	onSubmit,
}: AddAccountDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>Nouveau compte</DialogTitle>
					<DialogDescription>{bankName}</DialogDescription>
				</DialogHeader>

				<Flex direction="col" gap="lg">
					{/* Error message */}
					{error && (
						<div className="rounded-md border border-destructive/20 bg-destructive/10 p-3">
							<span className="text-sm text-destructive">{error}</span>
						</div>
					)}

					{/* Account name */}
					<Flex direction="col" gap="sm">
						<Label htmlFor="accountName" className="text-sm font-medium text-muted-foreground">
							Nom du compte
						</Label>
						<Input
							id="accountName"
							placeholder="ex: Compte Joint, Livret A..."
							value={name}
							onChange={(e) => onNameChange(e.target.value)}
							className="h-10"
						/>
					</Flex>

					{/* Description (optional) */}
					<Flex direction="col" gap="sm">
						<Label
							htmlFor="accountDescription"
							className="text-sm font-medium text-muted-foreground"
						>
							Description
							<span className="ml-1 text-xs font-normal">(optionnel)</span>
						</Label>
						<Textarea
							id="accountDescription"
							placeholder="Notes ou contexte sur ce compte..."
							value={description}
							onChange={(e) => onDescriptionChange(e.target.value)}
							className="min-h-20 resize-none"
						/>
					</Flex>

					{/* Account type */}
					<Flex direction="col" gap="sm">
						<Label htmlFor="accountType" className="text-sm font-medium text-muted-foreground">
							Type de compte
						</Label>
						<Select value={accountType} onValueChange={onAccountTypeChange}>
							<SelectTrigger id="accountType" className="h-10">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="CHECKING">Compte courant</SelectItem>
								<SelectItem value="SAVINGS">Épargne</SelectItem>
								<SelectItem value="INVESTMENT">Investissement</SelectItem>
								<SelectItem value="LOAN">Prêt</SelectItem>
							</SelectContent>
						</Select>
					</Flex>

					{/* Export URL (optional) */}
					<Flex direction="col" gap="sm">
						<Label
							htmlFor="accountExportUrl"
							className="text-sm font-medium text-muted-foreground"
						>
							Lien d'export
							<span className="ml-1 text-xs font-normal">(optionnel)</span>
						</Label>
						<Input
							id="accountExportUrl"
							type="url"
							placeholder="https://..."
							value={exportUrl}
							onChange={(e) => onExportUrlChange(e.target.value)}
							className="h-10"
						/>
						<span className="text-xs text-muted-foreground">
							URL vers l'espace client pour exporter les relevés
						</span>
					</Flex>

					{/* Member selection */}
					<Flex direction="col" gap="sm">
						<Label className="text-sm font-medium text-muted-foreground">Titulaires</Label>
						<MemberSelectorChips
							members={members}
							selectedIds={selectedMemberIds}
							onToggle={onMemberToggle}
						/>
					</Flex>
				</Flex>

				<DialogFooter className="pt-4">
					<Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
						Annuler
					</Button>
					<Button onClick={onSubmit} disabled={isPending || !name.trim()}>
						{isPending ? 'Création...' : 'Créer le compte'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
