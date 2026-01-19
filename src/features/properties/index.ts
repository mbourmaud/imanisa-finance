// Types
export * from './types';
export * from './types/form-types';

// TanStack Query Hooks - Co-ownership
export {
	coOwnershipKeys,
	useCreateCoOwnershipMutation,
	useDeleteCoOwnershipMutation,
	useUpdateCoOwnershipMutation,
} from './hooks/use-co-ownership-query';

// TanStack Query Hooks - Properties
export {
	propertyKeys,
	useCreatePropertyMutation,
	useDeletePropertyMutation,
	usePropertiesQuery,
	usePropertyQuery,
	useUpdatePropertyMutation,
} from './hooks/use-properties-query';

// TanStack Query Hooks - Property Insurance
export {
	propertyInsuranceKeys,
	useCreatePropertyInsuranceMutation,
	useDeletePropertyInsuranceMutation,
	useUpdatePropertyInsuranceMutation,
} from './hooks/use-property-insurance-query';

// TanStack Query Hooks - Utility Contracts
export {
	useCreateUtilityContractMutation,
	useDeleteUtilityContractMutation,
	useUpdateUtilityContractMutation,
	utilityContractKeys,
} from './hooks/use-utility-contracts-query';

// Page hooks
export { formatCurrency, usePropertyDetailPage } from './hooks/use-property-detail-page';
export { useRealEstatePage } from './hooks/use-real-estate-page';

// Utils
export { getPropertyTypeLabel, getPropertyUsageLabel } from './utils/property-labels';

// Services
export { propertyService } from './services/property-service';
