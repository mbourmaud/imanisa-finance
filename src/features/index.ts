/**
 * Feature modules barrel export
 *
 * Each feature follows the clean architecture pattern:
 * - types/     : Domain types and interfaces
 * - services/  : API service layer
 * - stores/    : Zustand state management
 * - hooks/     : React hooks for consuming stores
 * - components/: Feature-specific React components
 */

export * as accounts from './accounts';
export * as transactions from './transactions';
// export * as budget from './budget';
// export * as investments from './investments';
// export * as realEstate from './real-estate';
// export * as loans from './loans';
// export * as banks from './banks';
// export * as import from './import';
