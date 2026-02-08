'use client';

import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import { CategoryBadge } from '@/components/transactions/CategoryBadge';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Sheet,
	SheetBody,
	SheetContent,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from '@/components/ui/sheet';
import { useAccountsQuery } from '@/features/accounts';
import { useCategoriesQuery } from '@/features/categories';
import { createTransactionFormSchema } from '../forms/transaction-form-schema';
import { useCreateTransactionMutation } from '../hooks/use-transactions-query';

interface CreateTransactionSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function CreateTransactionSheet({ open, onOpenChange }: CreateTransactionSheetProps) {
	const createMutation = useCreateTransactionMutation();
	const { data: accounts } = useAccountsQuery();
	const { data: categories } = useCategoriesQuery();

	const form = useForm({
		defaultValues: {
			accountId: '',
			type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
			amount: 0,
			description: '',
			date: new Date().toISOString().split('T')[0],
			categoryId: '',
		},
		validators: {
			onSubmit: createTransactionFormSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				await createMutation.mutateAsync({
					accountId: value.accountId,
					type: value.type,
					amount: value.amount,
					description: value.description,
					date: new Date(value.date),
					categoryId: value.categoryId || undefined,
				});
				toast.success('Transaction créée');
				form.reset();
				onOpenChange(false);
			} catch {
				toast.error('Impossible de créer la transaction');
			}
		},
	});

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent>
				<SheetHeader>
					<SheetTitle>Nouvelle transaction</SheetTitle>
				</SheetHeader>

				<SheetBody>
					<form
						id="create-transaction-form"
						onSubmit={(e) => {
							e.preventDefault();
							form.handleSubmit();
						}}
					>
						<FieldGroup>
							<form.Field
								name="accountId"
								children={(field) => {
									const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor="create-tx-account">Compte</FieldLabel>
											<Select
												name={field.name}
												value={field.state.value}
												onValueChange={field.handleChange}
											>
												<SelectTrigger id="create-tx-account" aria-invalid={isInvalid}>
													<SelectValue placeholder="Sélectionner un compte" />
												</SelectTrigger>
												<SelectContent>
													{accounts?.map((account) => (
														<SelectItem key={account.id} value={account.id}>
															{account.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											{isInvalid && <FieldError errors={field.state.meta.errors} />}
										</Field>
									);
								}}
							/>

							<form.Field
								name="description"
								children={(field) => {
									const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor="create-tx-description">Description</FieldLabel>
											<Input
												id="create-tx-description"
												name={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												aria-invalid={isInvalid}
												placeholder="Ex: Courses Carrefour"
											/>
											{isInvalid && <FieldError errors={field.state.meta.errors} />}
										</Field>
									);
								}}
							/>

							<form.Field
								name="amount"
								children={(field) => {
									const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor="create-tx-amount">Montant</FieldLabel>
											<Input
												id="create-tx-amount"
												name={field.name}
												type="number"
												step="0.01"
												min="0.01"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(Number.parseFloat(e.target.value) || 0)}
												aria-invalid={isInvalid}
												placeholder="0.00"
											/>
											{isInvalid && <FieldError errors={field.state.meta.errors} />}
										</Field>
									);
								}}
							/>

							<form.Field
								name="type"
								children={(field) => {
									const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor="create-tx-type">Type</FieldLabel>
											<Select
												name={field.name}
												value={field.state.value}
												onValueChange={(v) => field.handleChange(v as 'INCOME' | 'EXPENSE')}
											>
												<SelectTrigger id="create-tx-type" aria-invalid={isInvalid}>
													<SelectValue placeholder="Sélectionner" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="INCOME">Revenu</SelectItem>
													<SelectItem value="EXPENSE">Dépense</SelectItem>
												</SelectContent>
											</Select>
											{isInvalid && <FieldError errors={field.state.meta.errors} />}
										</Field>
									);
								}}
							/>

							<form.Field
								name="date"
								children={(field) => {
									const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor="create-tx-date">Date</FieldLabel>
											<Input
												id="create-tx-date"
												name={field.name}
												type="date"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												aria-invalid={isInvalid}
											/>
											{isInvalid && <FieldError errors={field.state.meta.errors} />}
										</Field>
									);
								}}
							/>

							<form.Field
								name="categoryId"
								children={(field) => (
									<Field>
										<FieldLabel htmlFor="create-tx-category">Catégorie</FieldLabel>
										<Select
											name={field.name}
											value={field.state.value}
											onValueChange={field.handleChange}
										>
											<SelectTrigger id="create-tx-category">
												<SelectValue placeholder="Aucune catégorie" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="">Aucune</SelectItem>
												{categories?.map((cat) => (
													<SelectItem key={cat.id} value={cat.id}>
														<CategoryBadge
															category={{
																id: cat.id,
																name: cat.name,
																icon: cat.icon,
																color: cat.color,
															}}
															size="sm"
														/>
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</Field>
								)}
							/>
						</FieldGroup>
					</form>
				</SheetBody>

				<SheetFooter>
					<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
						Annuler
					</Button>
					<Button type="submit" form="create-transaction-form" disabled={createMutation.isPending}>
						{createMutation.isPending ? 'Création...' : 'Créer'}
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
