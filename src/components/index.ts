/**
 * UI Kit Barrel Export
 *
 * This file re-exports all UI components from @/components/ui/
 * Pages and features should import from '@/components' instead of '@/components/ui/*'
 *
 * Usage:
 * ❌ import { Button } from '@/components/ui/button';
 * ✅ import { Button } from '@/components';
 */

// =============================================================================
// ICONS
// =============================================================================

export type {
	IconColor,
	IconName,
	IconProps,
	IconSize,
	IconWrapperProps,
	LucideIcon,
	LucideProps,
} from './ui/icon';
export {
	// Re-exported Lucide icons
	AlertCircle,
	AlertTriangle,
	ArrowDown,
	ArrowDownLeft,
	ArrowDownRight,
	ArrowLeft,
	ArrowRight,
	ArrowRightLeft,
	ArrowUpRight,
	Banknote,
	Bell,
	Bitcoin,
	Briefcase,
	Building,
	Building2,
	Calendar,
	Camera,
	Car,
	Check,
	CheckCircle,
	CheckCircle2,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
	ChevronUp,
	Circle,
	Clock,
	Coffee,
	Copy,
	CreditCard,
	Database,
	DollarSign,
	Download,
	Droplets,
	Edit,
	Edit2,
	Edit3,
	Euro,
	ExternalLink,
	Eye,
	EyeOff,
	File,
	FileSpreadsheet,
	FileText,
	Film,
	Filter,
	Flame,
	FolderOpen,
	Globe,
	Grid as GridIcon,
	Heart,
	Home,
	Icon,
	IconWrapper,
	Image,
	Inbox,
	Info,
	Key,
	Landmark,
	Link,
	List,
	Loader,
	Loader2,
	LogOut,
	Mail,
	MapPin,
	Menu,
	Minus,
	Moon,
	MoreHorizontal,
	MoreVertical,
	Package,
	Palette,
	Pencil,
	Percent,
	PieChart,
	PiggyBank,
	Plus,
	PlusCircle,
	RefreshCw,
	RotateCcw,
	Save,
	Search,
	Settings,
	Settings2,
	Share,
	Shield,
	ShoppingBag,
	ShoppingCart,
	Star,
	Sun,
	Tag,
	Trash,
	Trash2,
	TrendingDown,
	TrendingUp,
	Upload,
	User,
	UserPlus,
	Users,
	Utensils,
	Wallet,
	Wifi,
	X,
	XCircle,
	Zap,
} from './ui/icon';

// =============================================================================
// BUTTONS
// =============================================================================

export type { ButtonProps } from './ui/button';
export { Button, buttonVariants } from './ui/button';

// =============================================================================
// FORM ELEMENTS
// =============================================================================

export { Checkbox } from './ui/checkbox';
// Form components are exported separately from @/components/ui/form
// due to TypeScript/react-hook-form compatibility issues with barrel exports
export {
	FormControl,
	FormDescription,
	FormItem,
	FormLabel,
	FormMessage,
	useFormField,
} from './ui/form';
export type { InputProps } from './ui/input';
export { Input } from './ui/input';
export { Label } from './ui/label';
export {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectScrollDownButton,
	SelectScrollUpButton,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
} from './ui/select';
export { Switch } from './ui/switch';
export type { TextareaProps } from './ui/textarea';
export { Textarea } from './ui/textarea';

// =============================================================================
// CARDS
// =============================================================================

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
export type {
	AccentColor,
	GlassCardHeaderProps,
	GlassCardPadding,
	GlassCardProps,
	GlassCardVariant,
} from './ui/glass-card';
export { GlassCard, GlassCardContent, GlassCardFooter, GlassCardHeader } from './ui/glass-card';
export type {
	StatCardGridProps,
	StatCardProps,
	StatCardSkeletonProps,
	StatCardVariant,
	TrendDirection,
} from './ui/stat-card';
export { StatCard, StatCardGrid, StatCardSkeleton } from './ui/stat-card';

// =============================================================================
// GLASS EFFECTS
// =============================================================================
// NAVIGATION & LAYOUT
// =============================================================================

export type {
	BreadcrumbItem,
	PageHeaderProps,
	PageHeaderSize,
	SectionHeaderProps,
	SectionHeaderSize,
} from './ui/page-header';
export { PageHeader, SectionHeader } from './ui/page-header';
export {
	Sheet,
	SheetBody,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from './ui/sheet';
export {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupAction,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarInput,
	SidebarInset,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuBadge,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSkeleton,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	SidebarProvider,
	SidebarRail,
	SidebarSeparator,
	SidebarTrigger,
	useSidebar,
} from './ui/sidebar';

// =============================================================================
// DATA DISPLAY
// =============================================================================

export { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
export { Badge, badgeVariants } from './ui/badge';
export { DataTable } from './ui/data-table';
export { Progress } from './ui/progress';
export { Skeleton } from './ui/skeleton';
export {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from './ui/table';

// =============================================================================
// FEEDBACK
// =============================================================================

export {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogOverlay,
	AlertDialogPortal,
	AlertDialogTitle,
	AlertDialogTrigger,
} from './ui/alert-dialog';
export {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogOverlay,
	DialogPortal,
	DialogTitle,
	DialogTrigger,
} from './ui/dialog';
export type {
	EmptyStatePresetProps,
	EmptyStateProps,
	EmptyStateSize,
	EmptyStateVariant,
} from './ui/empty-state';
export {
	EmptyState,
	EmptyStateError,
	EmptyStateNoAccounts,
	EmptyStateNoResults,
	EmptyStateNoTransactions,
} from './ui/empty-state';
export { Toaster } from './ui/sonner';

// =============================================================================
// OVERLAYS & POPOVERS
// =============================================================================

export {
	Command,
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
	CommandShortcut,
} from './ui/command';
export {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuPortal,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from './ui/dropdown-menu';
export { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
export {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from './ui/tooltip';

// =============================================================================
// TABS & ACCORDION
// =============================================================================

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
export { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

// =============================================================================
// SCROLL & SEPARATOR
// =============================================================================

export { ScrollArea, ScrollBar } from './ui/scroll-area';

export { Separator } from './ui/separator';

// =============================================================================
// LAYOUT COMPONENTS
// =============================================================================

export type { FlexProps, FlexItemProps, FlexDirection, FlexGap, FlexAlign, FlexJustify, FlexWrap } from './common/Flex';
export { Flex, FlexItem } from './common/Flex';

// =============================================================================
// DASHBOARD LAYOUT COMPONENTS
// =============================================================================

export type { DashboardHeaderProps, DashboardMainProps } from './common/DashboardHeader';
export { DashboardHeader, DashboardHeaderMobile, DashboardMain } from './common/DashboardHeader';
export type { LoadingSpinnerProps, LoadingSpinnerSize } from './common/LoadingSpinner';
export { LoadingSpinner } from './common/LoadingSpinner';
export { AppLogo } from './common/AppLogo';
export type { IconBoxProps, IconBoxSize, IconBoxVariant, IconBoxRounded } from './common/IconBox';
export { IconBox } from './common/IconBox';

// =============================================================================
// ACCOUNT COMPONENTS
// =============================================================================

export type { AccountListItemProps } from './accounts/AccountListItem';
export { AccountListItem } from './accounts/AccountListItem';
export type { AccountTypeHeaderProps } from './accounts/AccountTypeHeader';
export { AccountTypeHeader } from './accounts/AccountTypeHeader';
export { AddAccountButton } from './accounts/AddAccountButton';
export { AccountLoadingState } from './accounts/AccountLoadingState';
export { AccountNotFoundState } from './accounts/AccountNotFoundState';
export { BankLogoBox } from './accounts/BankLogoBox';
export { AccountDetailHeader } from './accounts/AccountDetailHeader';
export { AccountEditSheet } from './accounts/AccountEditSheet';
export { AccountSettingsSheet } from './accounts/AccountSettingsSheet';
export { FloatingToast } from './accounts/FloatingToast';
export { ImportStatusIcon } from './accounts/ImportStatusIcon';
export { ImportRow } from './accounts/ImportRow';
export { MemberChip } from './accounts/MemberChip';
export { AddMemberDropdown } from './accounts/AddMemberDropdown';
export { TransactionRow } from './accounts/TransactionRow';
export { TransactionsSection } from './accounts/TransactionsSection';
export type { SearchInputProps, SearchInputSize } from './common/SearchInput';
export { SearchInput } from './common/SearchInput';
export type { ListHeaderProps } from './common/ListHeader';
export { ListHeader } from './common/ListHeader';

// =============================================================================
// TRANSACTION COMPONENTS
// =============================================================================

export type { TransactionListItemProps } from './transactions/TransactionListItem';
export { TransactionListItem } from './transactions/TransactionListItem';
export { ExportButton } from './transactions/ExportButton';
export { TransactionFilters } from './transactions/TransactionFilters';
export { TransactionListContainer } from './transactions/TransactionListContainer';

// =============================================================================
// BUDGET COMPONENTS
// =============================================================================

export type { BudgetCategoryCardProps } from './budget/BudgetCategoryCard';
export { BudgetCategoryCard } from './budget/BudgetCategoryCard';
export { BudgetCategoryGrid } from './budget/BudgetCategoryGrid';
export { BudgetChartSection } from './budget/BudgetChartSection';
export { BudgetHeader } from './budget/BudgetHeader';
export { BudgetProgress } from './budget/BudgetProgress';

// =============================================================================
// INDICATOR COMPONENTS
// =============================================================================

export type { ColorDotProps, ColorDotSize } from './common/ColorDot';
export { ColorDot } from './common/ColorDot';

// =============================================================================
// SKELETON COMPONENTS
// =============================================================================

export type {
	ContentSkeletonProps,
	ContentSkeletonVariant,
	ContentSkeletonSize,
} from './common/ContentSkeleton';
export { ContentSkeleton } from './common/ContentSkeleton';

// =============================================================================
// LANDING PAGE COMPONENTS
// =============================================================================

export { LandingBackground } from './landing/LandingBackground';
export { LandingContainer } from './landing/LandingContainer';
export { LandingFooter } from './landing/LandingFooter';
export { LandingLogo } from './landing/LandingLogo';
export { ProfileButton } from './landing/ProfileButton';
export { ProfileSelector } from './landing/ProfileSelector';

// =============================================================================
// LOGIN PAGE COMPONENTS
// =============================================================================

export { GoogleIcon } from './login/GoogleIcon';
export { GoogleLoginButton } from './login/GoogleLoginButton';
export { LoginCard } from './login/LoginCard';
export { LoginLogo } from './login/LoginLogo';

// =============================================================================
// AUTH ERROR PAGE COMPONENTS
// =============================================================================

export { AuthErrorBackground } from './auth/AuthErrorBackground';
export { AuthErrorCard } from './auth/AuthErrorCard';
export { AuthErrorContainer } from './auth/AuthErrorContainer';
export { AuthErrorFooter } from './auth/AuthErrorFooter';
export { AuthErrorLogo } from './auth/AuthErrorLogo';

// =============================================================================
// INVESTMENT COMPONENTS
// =============================================================================

export { InvestmentActions } from './investments/InvestmentActions';
export type { InvestmentSource } from './investments/InvestmentSourceCard';
export { InvestmentSourceCard } from './investments/InvestmentSourceCard';
export { InvestmentSourceGrid } from './investments/InvestmentSourceGrid';
export type { Position } from './investments/PositionListItem';
export { PositionListItem } from './investments/PositionListItem';
export { PortfolioChartSection } from './investments/PortfolioChartSection';
export { PositionsSection } from './investments/PositionsSection';

// =============================================================================
// LOAN COMPONENTS
// =============================================================================

export type { LoanData } from './loans/LoanCard';
export { LoanCard } from './loans/LoanCard';
export { LoanCardSkeleton } from './loans/LoanCardSkeleton';
export { LoanEmptyState } from './loans/LoanEmptyState';
export { LoanErrorCard } from './loans/LoanErrorCard';
export { LoanInfoBox } from './loans/LoanInfoBox';
export { LoanSummaryCard } from './loans/LoanSummaryCard';

// =============================================================================
// IMPORT COMPONENTS
// =============================================================================

export { ImportDropZone } from './import/ImportDropZone';
export { ImportErrorBanner } from './import/ImportErrorBanner';
export { ImportHistorySection } from './import/ImportHistorySection';
export { ImportRefreshButton } from './import/ImportRefreshButton';
export type { ImportData } from './import/ImportRow';
export { ImportRow } from './import/ImportRow';
export { ImportStatsCard } from './import/ImportStatsCard';

// =============================================================================
// SETTINGS COMPONENTS
// =============================================================================

export { SettingsAppInfo } from './settings/SettingsAppInfo';
export { SettingsColorPicker } from './settings/SettingsColorPicker';
export { SettingsMemberRow } from './settings/SettingsMemberRow';
export { SettingsMemberSkeleton } from './settings/SettingsMemberSkeleton';
export { SettingsNotificationRow } from './settings/SettingsNotificationRow';
export { SettingsSectionCard } from './settings/SettingsSectionCard';
export { SettingsThemeSelector } from './settings/SettingsThemeSelector';

// =============================================================================
// BANK COMPONENTS
// =============================================================================

export type {
	BankAvatarProps,
	BankAvatarSize,
	BankCardProps,
	BankCardVariant,
	BankCardListProps,
	BankCardGridProps,
} from './banks/BankCard';
export { BankAvatar, BankCard, BankCardList, BankCardGrid } from './banks/BankCard';
export { BankLogo } from './banks/BankLogo';
export { BankRow } from './banks/BankRow';
export { BankRowSkeleton } from './banks/BankRowSkeleton';
export { AccountRowLink } from './banks/AccountRowLink';
export { AddBankDropdown } from './banks/AddBankDropdown';
export { AddAccountDialog } from './banks/AddAccountDialog';
export { MemberSelectorChips } from './banks/MemberSelectorChips';

// =============================================================================
// REAL ESTATE COMPONENTS
// =============================================================================

export { FormErrorBanner } from './real-estate/FormErrorBanner';
export { LoanProgressCard } from './real-estate/LoanProgressCard';
export { MemberShareRow } from './real-estate/MemberShareRow';
export { PropertiesEmptyState } from './real-estate/PropertiesEmptyState';
export { PropertyBadge } from './real-estate/PropertyBadge';
export { PropertyCardSkeleton } from './real-estate/PropertyCardSkeleton';
export { PropertyFormGrid } from './real-estate/PropertyFormGrid';
export { PropertyInfoItem } from './real-estate/PropertyInfoItem';
export { PropertyRentBox } from './real-estate/PropertyRentBox';
export { PropertyValueBox } from './real-estate/PropertyValueBox';
export { StatsCardSkeleton } from './real-estate/StatsCardSkeleton';
export { LoanFormDialog } from './real-estate/LoanFormDialog';
export { LoanInsuranceFormDialog } from './real-estate/LoanInsuranceFormDialog';
export { PropertyInsuranceFormDialog } from './real-estate/PropertyInsuranceFormDialog';
export { CoOwnershipFormDialog } from './real-estate/CoOwnershipFormDialog';
export { UtilityContractFormDialog } from './real-estate/UtilityContractFormDialog';
export { PropertyEditDialog } from './real-estate/PropertyEditDialog';
export { PropertyDeleteDialog } from './real-estate/PropertyDeleteDialog';
export { PropertyDetailLoanCard } from './real-estate/PropertyDetailLoanCard';
export { PropertyDetailHeader } from './real-estate/PropertyDetailHeader';
export { PropertyStatsSummary } from './real-estate/PropertyStatsSummary';
export { PropertyInfoSection } from './real-estate/PropertyInfoSection';
export { PropertyOwnersSection } from './real-estate/PropertyOwnersSection';
export { PropertyLoansSection } from './real-estate/PropertyLoansSection';
export { PropertyInsuranceSection } from './real-estate/PropertyInsuranceSection';
export { PropertyCoOwnershipSection } from './real-estate/PropertyCoOwnershipSection';
export { PropertyUtilityContractsSection } from './real-estate/PropertyUtilityContractsSection';
export { PropertyDetailSkeleton } from './real-estate/PropertyDetailSkeleton';
export { PropertyNotFoundState } from './real-estate/PropertyNotFoundState';
