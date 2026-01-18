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
// LAYOUT COMPONENTS
// =============================================================================

export { Box } from './ui/box';
export type {
	BoxProps,
	SpacingSize,
	DisplayType,
	PositionType,
	OverflowType,
	BackgroundColor,
	BorderStyle,
	RoundedSize,
	ShadowSize,
	ElementType as BoxElementType,
} from './ui/box';

export { VStack, HStack } from './ui/stack';
export type {
	VStackProps,
	HStackProps,
	GapSize,
	VStackAlign,
	HStackAlign,
	JustifyContent,
	PaddingSize,
} from './ui/stack';

export { Flex } from './ui/flex';
export type {
	FlexProps,
	FlexDirection,
	FlexAlign,
	FlexJustify,
	FlexWrap,
} from './ui/flex';

export { Grid } from './ui/grid';
export type { GridProps, GridCols, GridAlign, GridJustify } from './ui/grid';

export { Spacer } from './ui/spacer';
export type { SpacerProps } from './ui/spacer';

export { Container, Section, Page } from './ui/layout';
export type { ContainerProps, ContainerMaxWidth, SectionProps, SectionSpacing, PageProps } from './ui/layout';

// =============================================================================
// TYPOGRAPHY
// =============================================================================

export { Heading, Text } from './ui/typography';
export type {
	HeadingProps,
	HeadingLevel,
	TextProps,
	TextVariant,
	TextSize,
	TextColor,
	FontWeight,
	TextAlign,
	TextTruncate,
} from './ui/typography';

// =============================================================================
// ICONS
// =============================================================================

export {
	Icon,
	IconWrapper,
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
export type {
	IconProps,
	IconWrapperProps,
	IconSize,
	IconColor,
	IconName,
	LucideIcon,
	LucideProps,
} from './ui/icon';

// =============================================================================
// BUTTONS
// =============================================================================

export { Button, buttonVariants } from './ui/button';
export type { ButtonProps } from './ui/button';

// =============================================================================
// FORM ELEMENTS
// =============================================================================

export { Input } from './ui/input';
export type { InputProps } from './ui/input';

export { Textarea } from './ui/textarea';
export type { TextareaProps } from './ui/textarea';

export { Checkbox } from './ui/checkbox';

export { Switch } from './ui/switch';

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

export { Label } from './ui/label';

export {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	useFormField,
} from './ui/form';

// =============================================================================
// CARDS
// =============================================================================

export { GlassCard, GlassCardHeader, GlassCardContent, GlassCardFooter } from './ui/glass-card';
export type {
	GlassCardProps,
	GlassCardHeaderProps,
	GlassCardVariant,
	GlassCardPadding,
	AccentColor,
} from './ui/glass-card';

export { StatCard, StatCardGrid, StatCardSkeleton } from './ui/stat-card';
export type {
	StatCardProps,
	StatCardGridProps,
	StatCardSkeletonProps,
	StatCardVariant,
	TrendDirection,
} from './ui/stat-card';

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';

// =============================================================================
// GLASS EFFECTS
// =============================================================================

export { Glass } from './ui/glass';
export type { GlassProps, GlassVariant, GlassPadding, GlassRadius } from './ui/glass';

// =============================================================================
// NAVIGATION & LAYOUT
// =============================================================================

export { PageHeader, SectionHeader } from './ui/page-header';
export type {
	PageHeaderProps,
	SectionHeaderProps,
	PageHeaderSize,
	SectionHeaderSize,
	BreadcrumbItem,
} from './ui/page-header';

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

export {
	Sheet,
	SheetTrigger,
	SheetClose,
	SheetContent,
	SheetHeader,
	SheetBody,
	SheetFooter,
	SheetTitle,
	SheetDescription,
} from './ui/sheet';

// =============================================================================
// DATA DISPLAY
// =============================================================================

export { DataTable } from './ui/data-table';

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

export { Badge, badgeVariants } from './ui/badge';

export { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

export { Progress } from './ui/progress';

export { Skeleton } from './ui/skeleton';

// =============================================================================
// FEEDBACK
// =============================================================================

export {
	EmptyState,
	EmptyStateNoAccounts,
	EmptyStateNoTransactions,
	EmptyStateNoResults,
	EmptyStateError,
} from './ui/empty-state';
export type {
	EmptyStateProps,
	EmptyStatePresetProps,
	EmptyStateSize,
	EmptyStateVariant,
} from './ui/empty-state';

export { Toaster } from './ui/sonner';

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

// =============================================================================
// OVERLAYS & POPOVERS
// =============================================================================

export {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from './ui/tooltip';

export { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

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

// =============================================================================
// TABS & ACCORDION
// =============================================================================

export { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

// =============================================================================
// SCROLL & SEPARATOR
// =============================================================================

export { ScrollArea, ScrollBar } from './ui/scroll-area';

export { Separator } from './ui/separator';
