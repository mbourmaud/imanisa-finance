/**
 * UI Components Barrel Export
 *
 * Core shadcn/ui components and custom extensions.
 * Import from '@/components' for convenience, or from here directly.
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
} from './icon'
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
} from './icon'

// =============================================================================
// BUTTONS
// =============================================================================

export type { ButtonProps } from './button'
export { Button, buttonVariants } from './button'

// =============================================================================
// FORM ELEMENTS
// =============================================================================

export { Checkbox } from './checkbox'
export {
	FormControl,
	FormDescription,
	FormItem,
	FormLabel,
	FormMessage,
	useFormField,
} from './form'
export type { InputProps } from './input'
export { Input } from './input'
export { Label } from './label'
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
} from './select'
export { Switch } from './switch'
export type { TextareaProps } from './textarea'
export { Textarea } from './textarea'

// =============================================================================
// CARDS
// =============================================================================

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card'
export type {
	StatCardGridProps,
	StatCardProps,
	StatCardSkeletonProps,
	StatCardVariant,
	TrendDirection,
} from './stat-card'
export { StatCard, StatCardGrid, StatCardSkeleton } from './stat-card'

// =============================================================================
// NAVIGATION & LAYOUT
// =============================================================================

export type {
	BreadcrumbItem,
	PageHeaderProps,
	PageHeaderSize,
	SectionHeaderProps,
	SectionHeaderSize,
} from './page-header'
export { PageHeader, SectionHeader } from './page-header'
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
} from './sheet'
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
} from './sidebar'

// =============================================================================
// DATA DISPLAY
// =============================================================================

export { Avatar, AvatarFallback, AvatarImage } from './avatar'
export { Badge, badgeVariants } from './badge'
export { DataTable } from './data-table'
export { Progress } from './progress'
export { Skeleton } from './skeleton'
export {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from './table'

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
} from './alert-dialog'
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
} from './dialog'
export type {
	EmptyStatePresetProps,
	EmptyStateProps,
	EmptyStateSize,
	EmptyStateVariant,
} from './empty-state'
export {
	EmptyState,
	EmptyStateError,
	EmptyStateNoAccounts,
	EmptyStateNoResults,
	EmptyStateNoTransactions,
} from './empty-state'
export { Toaster } from './sonner'

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
} from './command'
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
} from './dropdown-menu'
export { Popover, PopoverContent, PopoverTrigger } from './popover'
export {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from './tooltip'

// =============================================================================
// TABS & ACCORDION
// =============================================================================

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion'
export { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'

// =============================================================================
// SCROLL & SEPARATOR
// =============================================================================

export { ScrollArea, ScrollBar } from './scroll-area'
export { Separator } from './separator'
