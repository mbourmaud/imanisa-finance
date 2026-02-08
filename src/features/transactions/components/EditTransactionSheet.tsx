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
import { useCategoriesQuery } from '@/features/categories';
import { transactionFormSchema } from '../forms/transaction-form-schema';
import { useUpdateTransactionMutation } from '../hooks/use-transactions-query';
import type { Transaction } from '../types';

interface EditTransactionSheetProps {
	transaction: Transaction | null;
	onOpenChange: (open: boolean) => void;
}

export function EditTransactionSheet({ transaction, onOpenChange }: EditTransactionSheetProps) {
	const updateMutation = useUpdateTransactionMutation();
	const { data: categories } = useCategoriesQuery();

	const form = useForm({
		defaultValues: {
			type: (transaction?.type ?? 'EXPENSE') as 'INCOME' | 'EXPENSE',
			amount: transaction?.amount ?? 0,
			description: transaction?.description ?? '',
			date: transaction ? new Date(transaction.date).toISOString().split('T')[0] : '',
			categoryId: transaction?.transactionCategory?.categoryId ?? '',
		},
		validators: {
			onSubmit: transactionFormSchema,
		},
		onSubmit: async ({ value }) => {
			if (!transaction) return;

			try {
				await updateMutation.mutateAsync({
					id: transaction.id,
					input: {
						type: value.type,
						amount: value.amount,
						description: value.description,
						date: new Date(value.date),
						categoryId: value.categoryId || null,
					},
				});
				toast.success('Transaction modifiée');
				onOpenChange(false);
			} catch {
				toast.error('Impossible de modifier la transaction');
			}
		},
	});

	return (
		<Sheet open={!!transaction} onOpenChange={onOpenChange}>
			<SheetContent>
				<SheetHeader>
					<SheetTitle>Modifier la transaction</SheetTitle>
				</SheetHeader>

				<SheetBody>
					<form
						id="edit-transaction-form"
						onSubmit={(e) => {
							e.preventDefault();
							form.handleSubmit();
						}}
					>
						<FieldGroup>
							<form.Field
								name="description"
								children={(field) => {
									const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor="edit-tx-description">Description</FieldLabel>
											<Input
												id="edit-tx-description"
												name={field.name}
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
								name="amount"
								children={(field) => {
									const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor="edit-tx-amount">Montant</FieldLabel>
											<Input
												id="edit-tx-amount"
												name={field.name}
												type="number"
												step="0.01"
												min="0.01"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(Number.parseFloat(e.target.value) || 0)}
												aria-invalid={isInvalid}
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
											<FieldLabel htmlFor="edit-tx-type">Type</FieldLabel>
											<Select
												name={field.name}
												value={field.state.value}
												onValueChange={(v) => field.handleChange(v as 'INCOME' | 'EXPENSE')}
											>
												<SelectTrigger id="edit-tx-type" aria-invalid={isInvalid}>
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
											<FieldLabel htmlFor="edit-tx-date">Date</FieldLabel>
											<Input
												id="edit-tx-date"
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
										<FieldLabel htmlFor="edit-tx-category">Catégorie</FieldLabel>
										<Select
											name={field.name}
											value={field.state.value}
											onValueChange={field.handleChange}
										>
											<SelectTrigger id="edit-tx-category">
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
					<Button type="submit" form="edit-transaction-form" disabled={updateMutation.isPending}>
						{updateMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
