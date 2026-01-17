// Types
export * from './types'

// TanStack Query Hooks - Loans
export {
	loanKeys,
	useLoansQuery,
	useLoansByPropertyQuery,
	useLoanQuery,
	useCreateLoanMutation,
	useUpdateLoanMutation,
	useDeleteLoanMutation,
} from './hooks/use-loans-query'

// TanStack Query Hooks - Loan Insurances
export {
	loanInsuranceKeys,
	useCreateLoanInsuranceMutation,
	useUpdateLoanInsuranceMutation,
	useDeleteLoanInsuranceMutation,
} from './hooks/use-loan-insurances-query'

// Services
export { loanService } from './services/loan-service'
