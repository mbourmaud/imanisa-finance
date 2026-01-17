// Types
export * from './types';

// Zustand Hooks (legacy - for UI state)
export {
	useAccount,
	useAccountActions,
	useAccountSummary,
	useAccounts,
	useAccountsByType,
} from './hooks/use-accounts';

// TanStack Query Hooks (for data fetching)
export {
	accountKeys,
	useAccountsQuery,
	useAccountQuery,
	useAccountSummaryQuery,
	useCreateAccountMutation,
	useUpdateAccountMutation,
	useDeleteAccountMutation,
	useSyncAccountMutation,
	useAddAccountMemberMutation,
	useRemoveAccountMemberMutation,
} from './hooks/use-accounts-query';

// Services
export { accountService } from './services/account-service';

// Store
export { accountSelectors, useAccountStore } from './stores/account-store';
