/**
 * UI Kit Barrel Export
 *
 * This file re-exports all components from domain-specific barrels.
 * Pages and features should import from '@/components' instead of '@/components/[domain]/*'
 *
 * Usage:
 * ❌ import { Button } from '@/components/ui/button';
 * ✅ import { Button } from '@/components';
 */

// =============================================================================
// UI COMPONENTS (shadcn/ui base + custom extensions)
// =============================================================================

export * from './ui';

// =============================================================================
// COMMON COMPONENTS (shared business components)
// =============================================================================

export * from './common';

// =============================================================================
// DOMAIN COMPONENTS
// =============================================================================

export * from './accounts';
export * from './auth';
export * from './banks';
export * from './budget';
export * from './import';
export * from './investments';
export * from './landing';
export * from './loans';
export * from './login';
export * from './members';
export * from './real-estate';
export * from './settings';
export * from './transactions';
