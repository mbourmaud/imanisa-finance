/**
 * Common Components Barrel Export
 *
 * Shared business components used across the application.
 * Import from '@/components' for convenience, or from here directly.
 */

// =============================================================================
// LAYOUT
// =============================================================================

export type {
	FlexAlign,
	FlexDirection,
	FlexGap,
	FlexItemProps,
	FlexJustify,
	FlexProps,
	FlexWrap,
} from './Flex'
export { Flex, FlexItem } from './Flex'

// =============================================================================
// DASHBOARD
// =============================================================================

export type { DashboardHeaderProps, DashboardMainProps } from './DashboardHeader'
export { DashboardHeader, DashboardHeaderMobile, DashboardMain } from './DashboardHeader'

// =============================================================================
// LOADING & FEEDBACK
// =============================================================================

export type { LoadingSpinnerProps, LoadingSpinnerSize } from './LoadingSpinner'
export { LoadingSpinner } from './LoadingSpinner'

export type {
	ContentSkeletonProps,
	ContentSkeletonSize,
	ContentSkeletonVariant,
} from './ContentSkeleton'
export { ContentSkeleton } from './ContentSkeleton'

// =============================================================================
// ICONS & INDICATORS
// =============================================================================

export { AppLogo } from './AppLogo'

export type { IconBoxProps, IconBoxRounded, IconBoxSize, IconBoxVariant } from './IconBox'
export { IconBox } from './IconBox'

export type { ColorDotProps, ColorDotSize } from './ColorDot'
export { ColorDot } from './ColorDot'

// =============================================================================
// LIST & SEARCH
// =============================================================================

export type { SearchInputProps, SearchInputSize } from './SearchInput'
export { SearchInput } from './SearchInput'

export type { ListHeaderProps } from './ListHeader'
export { ListHeader } from './ListHeader'

// =============================================================================
// MONEY DISPLAY
// =============================================================================

export type {
	BalanceDisplayProps,
	MoneyDifferenceProps,
	MoneyDisplayFormat,
	MoneyDisplayProps,
	MoneyDisplaySize,
	MoneyDisplayVariant,
	MoneyPercentChangeProps,
	MoneySplitMember,
	MoneySplitProps,
} from './MoneyDisplay'
export {
	BalanceDisplay,
	MoneyDifference,
	MoneyDisplay,
	MoneyPercentChange,
	MoneySplit,
} from './MoneyDisplay'

// =============================================================================
// DIALOGS
// =============================================================================

export { ConfirmDialog } from './ConfirmDialog'

// =============================================================================
// FEEDBACK & STATES
// =============================================================================

export { ErrorBanner } from './ErrorBanner'
