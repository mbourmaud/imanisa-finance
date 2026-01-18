'use client';

import type { LucideProps } from 'lucide-react';
import {
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
	Grid,
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
} from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// ICON COMPONENT
// =============================================================================
// Wrapper component for lucide-react icons
// Pages should import icons from this file, not directly from lucide-react
//
// Usage:
// ❌ import { Plus } from 'lucide-react';
// ✅ import { Icon, Plus } from '@/components/ui/icon';
// ✅ <Icon name="plus" size="md" />  OR  <Plus className="size-5" />

// =============================================================================
// RE-EXPORT ALL ICONS USED IN THE APP
// =============================================================================
// This allows pages to import icons from one place

export {
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
	Grid,
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
};

// Re-export the LucideIcon type for type definitions
export type { LucideIcon, LucideProps } from 'lucide-react';

// =============================================================================
// ICON TYPES
// =============================================================================

type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
type IconColor = 'current' | 'muted' | 'primary' | 'success' | 'danger' | 'warning' | 'inherit';

const sizeClasses: Record<IconSize, string> = {
	xs: 'size-3',
	sm: 'size-4',
	md: 'size-5',
	lg: 'size-6',
	xl: 'size-8',
	'2xl': 'size-10',
};

const colorClasses: Record<IconColor, string> = {
	current: 'text-current',
	muted: 'text-muted-foreground',
	primary: 'text-primary',
	success: 'text-[oklch(0.55_0.18_145)]',
	danger: 'text-destructive',
	warning: 'text-[oklch(0.65_0.15_85)]',
	inherit: '',
};

// =============================================================================
// ICON WRAPPER COMPONENT
// =============================================================================
// Wrapper that applies consistent sizing and coloring to any Lucide icon

interface IconWrapperProps {
	/** The Lucide icon component to render */
	icon: React.ComponentType<LucideProps>;
	/** Size of the icon */
	size?: IconSize;
	/** Color of the icon */
	color?: IconColor;
	/** Additional class names */
	className?: string;
	/** Accessibility label */
	'aria-label'?: string;
	/** Whether to hide from screen readers */
	'aria-hidden'?: boolean;
}

function IconWrapper({
	icon: IconComponent,
	size = 'md',
	color = 'current',
	className,
	'aria-label': ariaLabel,
	'aria-hidden': ariaHidden = true,
	...props
}: IconWrapperProps) {
	return (
		<IconComponent
			className={cn(sizeClasses[size], color !== 'inherit' && colorClasses[color], className)}
			aria-label={ariaLabel}
			aria-hidden={ariaHidden}
			{...props}
		/>
	);
}

// =============================================================================
// ICON NAME MAP (for name-based usage)
// =============================================================================
// Allows using <Icon name="plus" /> instead of <IconWrapper icon={Plus} />

const iconMap = {
	'alert-circle': AlertCircle,
	'alert-triangle': AlertTriangle,
	'arrow-down': ArrowDown,
	'arrow-down-left': ArrowDownLeft,
	'arrow-down-right': ArrowDownRight,
	'arrow-left': ArrowLeft,
	'arrow-right': ArrowRight,
	'arrow-right-left': ArrowRightLeft,
	'arrow-up-right': ArrowUpRight,
	banknote: Banknote,
	bell: Bell,
	bitcoin: Bitcoin,
	briefcase: Briefcase,
	building: Building,
	building2: Building2,
	calendar: Calendar,
	camera: Camera,
	car: Car,
	check: Check,
	'check-circle': CheckCircle,
	'chevron-down': ChevronDown,
	'chevron-left': ChevronLeft,
	'chevron-right': ChevronRight,
	'chevrons-left': ChevronsLeft,
	'chevrons-right': ChevronsRight,
	'chevron-up': ChevronUp,
	circle: Circle,
	clock: Clock,
	coffee: Coffee,
	copy: Copy,
	'credit-card': CreditCard,
	database: Database,
	'dollar-sign': DollarSign,
	download: Download,
	droplets: Droplets,
	edit: Edit,
	edit2: Edit2,
	edit3: Edit3,
	euro: Euro,
	'external-link': ExternalLink,
	eye: Eye,
	'eye-off': EyeOff,
	file: File,
	'file-spreadsheet': FileSpreadsheet,
	'file-text': FileText,
	film: Film,
	filter: Filter,
	flame: Flame,
	'folder-open': FolderOpen,
	globe: Globe,
	grid: Grid,
	heart: Heart,
	home: Home,
	image: Image,
	inbox: Inbox,
	info: Info,
	key: Key,
	landmark: Landmark,
	link: Link,
	list: List,
	loader: Loader,
	loader2: Loader2,
	'log-out': LogOut,
	mail: Mail,
	'map-pin': MapPin,
	menu: Menu,
	minus: Minus,
	moon: Moon,
	'more-horizontal': MoreHorizontal,
	'more-vertical': MoreVertical,
	package: Package,
	palette: Palette,
	pencil: Pencil,
	percent: Percent,
	'pie-chart': PieChart,
	'piggy-bank': PiggyBank,
	plus: Plus,
	'plus-circle': PlusCircle,
	'refresh-cw': RefreshCw,
	'rotate-ccw': RotateCcw,
	save: Save,
	search: Search,
	settings: Settings,
	settings2: Settings2,
	share: Share,
	shield: Shield,
	'shopping-bag': ShoppingBag,
	'shopping-cart': ShoppingCart,
	star: Star,
	sun: Sun,
	tag: Tag,
	trash: Trash,
	trash2: Trash2,
	'trending-down': TrendingDown,
	'trending-up': TrendingUp,
	upload: Upload,
	user: User,
	'user-plus': UserPlus,
	users: Users,
	utensils: Utensils,
	wallet: Wallet,
	wifi: Wifi,
	x: X,
	'x-circle': XCircle,
	zap: Zap,
} as const;

type IconName = keyof typeof iconMap;

// =============================================================================
// ICON COMPONENT (name-based)
// =============================================================================
// Simplified icon usage with name prop
// <Icon name="plus" size="md" color="primary" />

interface IconProps {
	/** Icon name (kebab-case) */
	name: IconName;
	/** Size of the icon */
	size?: IconSize;
	/** Color of the icon */
	color?: IconColor;
	/** Additional class names */
	className?: string;
	/** Accessibility label */
	'aria-label'?: string;
	/** Whether to hide from screen readers */
	'aria-hidden'?: boolean;
}

function Icon({
	name,
	size = 'md',
	color = 'current',
	className,
	'aria-label': ariaLabel,
	'aria-hidden': ariaHidden = true,
}: IconProps) {
	const IconComponent = iconMap[name];

	if (!IconComponent) {
		console.warn(`Icon "${name}" not found in icon map`);
		return null;
	}

	return (
		<IconComponent
			className={cn(sizeClasses[size], color !== 'inherit' && colorClasses[color], className)}
			aria-label={ariaLabel}
			aria-hidden={ariaHidden}
		/>
	);
}

export { Icon, IconWrapper };
export type { IconProps, IconWrapperProps, IconSize, IconColor, IconName };
