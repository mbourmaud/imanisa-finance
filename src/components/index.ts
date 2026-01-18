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
export type { IconBoxProps, IconBoxSize, IconBoxVariant, IconBoxRounded } from './common/IconBox';
export { IconBox } from './common/IconBox';

// =============================================================================
// ACCOUNT COMPONENTS
// =============================================================================

export type { AccountListItemProps } from './accounts/AccountListItem';
export { AccountListItem } from './accounts/AccountListItem';
export type { AccountTypeHeaderProps } from './accounts/AccountTypeHeader';
export { AccountTypeHeader } from './accounts/AccountTypeHeader';
export type { SearchInputProps, SearchInputSize } from './common/SearchInput';
export { SearchInput } from './common/SearchInput';
export type { ListHeaderProps } from './common/ListHeader';
export { ListHeader } from './common/ListHeader';

// =============================================================================
// TRANSACTION COMPONENTS
// =============================================================================

export type { TransactionListItemProps } from './transactions/TransactionListItem';
export { TransactionListItem } from './transactions/TransactionListItem';

// =============================================================================
// BUDGET COMPONENTS
// =============================================================================

export type { BudgetCategoryCardProps } from './budget/BudgetCategoryCard';
export { BudgetCategoryCard } from './budget/BudgetCategoryCard';

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
