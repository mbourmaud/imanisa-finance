// Types

// TanStack Query Hooks - Loan Insurances
export {
	loanInsuranceKeys,
	useCreateLoanInsuranceMutation,
	useDeleteLoanInsuranceMutation,
	useUpdateLoanInsuranceMutation,
} from './hooks/use-loan-insurances-query';

// TanStack Query Hooks - Loans
export {
	loanKeys,
	useCreateLoanMutation,
	useDeleteLoanMutation,
	useLoanQuery,
	useLoansByPropertyQuery,
	useLoansQuery,
	useUpdateLoanMutation,
} from './hooks/use-loans-query';
// Services
export { loanService } from './services/loan-service';
export * from './types';
