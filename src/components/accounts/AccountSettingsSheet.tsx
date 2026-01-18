'use client'

import {
	Button,
	ExternalLink,
	FileSpreadsheet,
	Flex,
	Input,
	Loader2,
	Plus,
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	Trash2,
	X,
} from '@/components'
import { ImportRow } from './ImportRow'
import { MemberChip } from './MemberChip'
import { AddMemberDropdown } from './AddMemberDropdown'

interface AccountMember {
	id: string
	memberId: string
	ownerShare: number
	member: {
		id: string
		name: string
		color: string | null
	}
}

interface Member {
	id: string
	name: string
	color: string | null
}

interface RawImport {
	id: string
	filename: string
	status: 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'FAILED'
	createdAt: string
	recordsCount: number | null
}

interface AccountSettingsSheetProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	// Account data
	accountName: string
	accountDescription: string | null
	accountExportUrl: string | null
	accountInitialBalance: number
	accountInitialBalanceDate: string | null
	accountMembers: AccountMember[]
	transactionCount: number
	// Edit states
	editName: string
	onNameChange: (value: string) => void
	onNameBlur: () => void
	onNameFocus: () => void
	editDescription: string
	onDescriptionChange: (value: string) => void
	onDescriptionBlur: () => void
	onDescriptionFocus: () => void
	exportUrlInput: string
	onExportUrlChange: (value: string) => void
	onExportUrlBlur: () => void
	onExportUrlFocus: () => void
	editInitialBalance: string
	onInitialBalanceChange: (value: string) => void
	onInitialBalanceBlur: () => void
	onInitialBalanceFocus: () => void
	editInitialBalanceDate: string
	onInitialBalanceDateChange: (value: string) => void
	onInitialBalanceDateBlur: () => void
	// Members
	allMembers: Member[]
	availableMembers: Member[]
	showMemberDropdown: boolean
	onMemberDropdownChange: (open: boolean) => void
	onAddMember: (memberId: string) => void
	onRemoveMember: (memberId: string) => void
	addMemberPending: boolean
	addMemberVariables?: { memberId: string }
	removeMemberPending: boolean
	removeMemberVariables?: { memberId: string }
	// Imports
	imports: RawImport[]
	showAllImports: boolean
	onShowAllImportsChange: (show: boolean) => void
	onProcessImport: (importId: string) => void
	onReprocessImport: (importId: string) => void
	onDeleteImport: (importId: string) => void
	processImportPending: boolean
	processImportVariables?: { importId: string }
	reprocessImportPending: boolean
	reprocessImportVariables?: { importId: string }
	deleteImportPending: boolean
	deleteImportId: string | null
	// Delete account
	onDeleteAccountClick: () => void
}

/**
 * Settings sheet for account with information, members, imports, and delete action
 */
export function AccountSettingsSheet({
	open,
	onOpenChange,
	accountName,
	accountDescription,
	accountExportUrl,
	accountInitialBalance,
	accountInitialBalanceDate,
	accountMembers,
	transactionCount,
	editName,
	onNameChange,
	onNameBlur,
	onNameFocus,
	editDescription,
	onDescriptionChange,
	onDescriptionBlur,
	onDescriptionFocus,
	exportUrlInput,
	onExportUrlChange,
	onExportUrlBlur,
	onExportUrlFocus,
	editInitialBalance,
	onInitialBalanceChange,
	onInitialBalanceBlur,
	onInitialBalanceFocus,
	editInitialBalanceDate,
	onInitialBalanceDateChange,
	onInitialBalanceDateBlur,
	allMembers,
	availableMembers,
	showMemberDropdown,
	onMemberDropdownChange,
	onAddMember,
	onRemoveMember,
	addMemberPending,
	addMemberVariables,
	removeMemberPending,
	removeMemberVariables,
	imports,
	showAllImports,
	onShowAllImportsChange,
	onProcessImport,
	onReprocessImport,
	onDeleteImport,
	processImportPending,
	processImportVariables,
	reprocessImportPending,
	reprocessImportVariables,
	deleteImportPending,
	deleteImportId,
	onDeleteAccountClick,
}: AccountSettingsSheetProps) {
	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent
				side="right"
				className="w-full min-w-[400px] max-w-[500px] overflow-y-auto bg-background border-l border-border p-0"
			>
				{/* Header */}
				<div className="px-4 py-2 border-b border-border">
					<SheetHeader>
						<SheetTitle className="text-base font-semibold">Paramètres</SheetTitle>
						<SheetDescription className="text-xs">
							Informations et historique du compte
						</SheetDescription>
					</SheetHeader>
				</div>

				<Flex direction="col" gap="none">
					{/* Section 1: Informations */}
					<Flex direction="col" gap="md" className="p-4 border-b border-border">
						<span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
							Informations
						</span>

						{/* Account name */}
						<Flex direction="col" gap="sm">
							<label htmlFor="settings-account-name" className="text-sm text-muted-foreground">
								Nom du compte
							</label>
							<Input
								id="settings-account-name"
								value={editName || accountName}
								onChange={(e) => onNameChange(e.target.value)}
								onBlur={onNameBlur}
								onFocus={onNameFocus}
								className="h-10 text-sm font-medium"
								placeholder="Nom du compte"
							/>
						</Flex>

						{/* Description */}
						<Flex direction="col" gap="sm">
							<label htmlFor="settings-account-description" className="text-sm text-muted-foreground">
								Description
							</label>
							<Input
								id="settings-account-description"
								value={editDescription !== '' ? editDescription : accountDescription || ''}
								onChange={(e) => onDescriptionChange(e.target.value)}
								onBlur={onDescriptionBlur}
								onFocus={onDescriptionFocus}
								className="h-10 text-sm"
								placeholder="Description (optionnel)"
							/>
						</Flex>

						{/* Owners - Multi-select */}
						<Flex direction="col" gap="sm">
							<span className="text-sm text-muted-foreground">Titulaires</span>
							<Flex
								direction="row"
								gap="sm"
								wrap="wrap"
								className="p-2 rounded-md border border-border bg-background min-h-[42px]"
							>
								{accountMembers.map((am) => (
									<MemberChip
										key={am.id}
										memberId={am.memberId}
										memberName={am.member.name}
										memberColor={am.member.color}
										isRemoving={removeMemberPending && removeMemberVariables?.memberId === am.memberId}
										onRemove={() => onRemoveMember(am.memberId)}
										disabled={removeMemberPending || addMemberPending}
									/>
								))}
								<AddMemberDropdown
									open={showMemberDropdown}
									onOpenChange={onMemberDropdownChange}
									availableMembers={availableMembers}
									onSelectMember={onAddMember}
									isPending={addMemberPending}
									pendingMemberId={addMemberVariables?.memberId}
									pendingMemberName={allMembers.find((m) => m.id === addMemberVariables?.memberId)?.name}
									pendingMemberColor={allMembers.find((m) => m.id === addMemberVariables?.memberId)?.color}
									disabled={addMemberPending || removeMemberPending}
								/>
							</Flex>
						</Flex>

						{/* Export URL */}
						<Flex direction="col" gap="sm">
							<Flex direction="row" justify="between" align="center">
								<label htmlFor="settings-export-url" className="text-sm text-muted-foreground">
									Lien d&apos;export banque
								</label>
								{accountExportUrl && (
									<a
										href={accountExportUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-1 text-xs text-primary"
									>
										<span>Ouvrir</span>
										<ExternalLink className="h-3 w-3" />
									</a>
								)}
							</Flex>
							<Input
								id="settings-export-url"
								type="url"
								value={exportUrlInput !== '' ? exportUrlInput : accountExportUrl || ''}
								onChange={(e) => onExportUrlChange(e.target.value)}
								onBlur={onExportUrlBlur}
								onFocus={onExportUrlFocus}
								placeholder="https://www.banque.fr/espace-client"
								className="h-10 text-sm"
							/>
						</Flex>

						{/* Initial Balance */}
						<Flex direction="col" gap="sm">
							<span className="text-sm text-muted-foreground">Solde initial</span>
							<Flex direction="row" gap="sm">
								<div className="relative flex-grow">
									<Input
										type="text"
										value={
											editInitialBalance !== ''
												? editInitialBalance
												: accountInitialBalance?.toString() || '0'
										}
										onChange={(e) => onInitialBalanceChange(e.target.value)}
										onBlur={onInitialBalanceBlur}
										onFocus={onInitialBalanceFocus}
										placeholder="0,00"
										className="h-10 text-sm font-mono pr-12"
									/>
									<span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
										EUR
									</span>
								</div>
								<Input
									type="date"
									value={
										editInitialBalanceDate !== ''
											? editInitialBalanceDate
											: accountInitialBalanceDate
												? new Date(accountInitialBalanceDate).toISOString().split('T')[0]
												: ''
									}
									onChange={(e) => onInitialBalanceDateChange(e.target.value)}
									onBlur={onInitialBalanceDateBlur}
									className="h-10 text-sm flex-1"
								/>
							</Flex>
						</Flex>
					</Flex>

					{/* Section 2: Imports */}
					<Flex direction="col" gap="sm" className="p-4 border-b border-border">
						<Flex direction="row" justify="between" align="center">
							<span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
								Imports
								{imports.length > 0 && (
									<span className="ml-1 text-muted-foreground/60">({imports.length})</span>
								)}
							</span>
							{imports.length > 5 && (
								<Button
									variant="ghost"
									size="sm"
									onClick={() => onShowAllImportsChange(!showAllImports)}
									className="h-6 px-2 text-xs"
								>
									{showAllImports ? 'Réduire' : 'Tout voir'}
								</Button>
							)}
						</Flex>

						{imports.length === 0 ? (
							<Flex
								direction="col"
								gap="sm"
								align="center"
								className="p-6 rounded-lg border border-dashed border-border bg-muted/20"
							>
								<FileSpreadsheet className="h-6 w-6 text-muted-foreground/40" />
								<span className="text-xs text-muted-foreground">Aucun import</span>
							</Flex>
						) : (
							<Flex direction="col" gap="sm">
								{(showAllImports ? imports : imports.slice(0, 5)).map((imp) => (
									<ImportRow
										key={imp.id}
										id={imp.id}
										filename={imp.filename}
										status={imp.status}
										createdAt={imp.createdAt}
										recordsCount={imp.recordsCount}
										onProcess={() => onProcessImport(imp.id)}
										onReprocess={() => onReprocessImport(imp.id)}
										onDelete={() => onDeleteImport(imp.id)}
										isProcessing={processImportPending && processImportVariables?.importId === imp.id}
										isReprocessing={reprocessImportPending && reprocessImportVariables?.importId === imp.id}
										isDeleting={deleteImportPending && deleteImportId === imp.id}
									/>
								))}
							</Flex>
						)}
					</Flex>

					{/* Section 3: Gestion du compte */}
					<Flex direction="col" gap="sm" className="px-4 py-2">
						<span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
							Gestion du compte
						</span>
						<Button
							variant="outline"
							size="sm"
							fullWidth
							onClick={onDeleteAccountClick}
							className="h-8 text-xs text-destructive border-destructive/30"
						>
							<Trash2 className="h-3 w-3 mr-1.5" />
							Supprimer le compte
						</Button>
						{transactionCount > 0 && (
							<span className="text-[11px] text-muted-foreground text-center">
								{transactionCount} transaction{transactionCount > 1 ? 's' : ''} sera
								{transactionCount > 1 ? 'ont' : ''} également supprimée
								{transactionCount > 1 ? 's' : ''}
							</span>
						)}
					</Flex>
				</Flex>
			</SheetContent>
		</Sheet>
	)
}
