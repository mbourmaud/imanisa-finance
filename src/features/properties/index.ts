// Types
export * from './types'

// TanStack Query Hooks - Properties
export {
	propertyKeys,
	usePropertiesQuery,
	usePropertyQuery,
	useCreatePropertyMutation,
	useUpdatePropertyMutation,
	useDeletePropertyMutation,
} from './hooks/use-properties-query'

// TanStack Query Hooks - Property Insurance
export {
	propertyInsuranceKeys,
	useCreatePropertyInsuranceMutation,
	useUpdatePropertyInsuranceMutation,
	useDeletePropertyInsuranceMutation,
} from './hooks/use-property-insurance-query'

// TanStack Query Hooks - Co-ownership
export {
	coOwnershipKeys,
	useCreateCoOwnershipMutation,
	useUpdateCoOwnershipMutation,
	useDeleteCoOwnershipMutation,
} from './hooks/use-co-ownership-query'

// TanStack Query Hooks - Utility Contracts
export {
	utilityContractKeys,
	useCreateUtilityContractMutation,
	useUpdateUtilityContractMutation,
	useDeleteUtilityContractMutation,
} from './hooks/use-utility-contracts-query'

// Services
export { propertyService } from './services/property-service'
