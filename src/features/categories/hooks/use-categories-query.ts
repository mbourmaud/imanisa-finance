/**
 * TanStack Query hooks for categories
 */

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '../services/category-service';
import type {
	CategorizeTransactionInput,
	CreateCategoryInput,
	CreateCategoryRuleInput,
} from '../types';

/**
 * Query key factory for categories
 */
export const categoryKeys = {
	all: ['categories'] as const,
	lists: () => [...categoryKeys.all, 'list'] as const,
	detail: (id: string) => [...categoryKeys.all, 'detail', id] as const,
	rules: () => [...categoryKeys.all, 'rules'] as const,
	recurring: () => ['recurring-patterns'] as const,
};

/**
 * Hook to fetch all categories
 */
export function useCategoriesQuery() {
	return useQuery({
		queryKey: categoryKeys.lists(),
		queryFn: () => categoryService.getAll(),
		staleTime: 5 * 60 * 1000, // 5 minutes - categories rarely change
	});
}

/**
 * Hook to fetch category rules
 */
export function useCategoryRulesQuery() {
	return useQuery({
		queryKey: categoryKeys.rules(),
		queryFn: () => categoryService.getRules(),
		staleTime: 5 * 60 * 1000,
	});
}

/**
 * Hook to fetch recurring patterns
 */
export function useRecurringPatternsQuery() {
	return useQuery({
		queryKey: categoryKeys.recurring(),
		queryFn: () => categoryService.getRecurringPatterns(),
	});
}

/**
 * Hook to create a category
 */
export function useCreateCategoryMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreateCategoryInput) => categoryService.create(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
		},
	});
}

/**
 * Hook to create a category rule
 */
export function useCreateCategoryRuleMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreateCategoryRuleInput) => categoryService.createRule(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: categoryKeys.rules() });
		},
	});
}

/**
 * Hook to manually categorize a transaction
 * Also invalidates transaction lists since category data changed
 */
export function useCategorizeTransactionMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			transactionId,
			input,
		}: {
			transactionId: string;
			input: CategorizeTransactionInput;
		}) => categoryService.categorizeTransaction(transactionId, input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['transactions'] });
			queryClient.invalidateQueries({ queryKey: categoryKeys.rules() });
		},
	});
}

/**
 * Hook to trigger the categorization pipeline
 */
export function useRunCategorizationMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (accountId?: string) => categoryService.runCategorization(accountId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['transactions'] });
		},
	});
}

/**
 * Hook to trigger recurring pattern detection
 */
export function useDetectRecurringMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => categoryService.detectRecurringPatterns(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: categoryKeys.recurring() });
		},
	});
}
