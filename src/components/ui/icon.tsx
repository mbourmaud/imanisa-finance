'use client';

import { cn } from '@/lib/utils';
import type { LucideProps } from 'lucide-react';

// =============================================================================
// ICON COMPONENT
// =============================================================================
// Wrapper component for lucide-react icons
// Pages should import icons from this file, not directly from lucide-react
//
// Usage:
// ❌ import { Plus } from 'lucide-react';
// ✅ import { Icon, PlusIcon } from '@/components/ui/icon';
// ✅ <Icon name="plus" size="md" />  OR  <PlusIcon size="md" />

// =============================================================================
// RE-EXPORT ALL ICONS USED IN THE APP
// =============================================================================
// This allows pages to import icons from one place

export {
	AlertCircle,
	AlertTriangle,
	ArrowDownLeft,
	ArrowLeft,
	ArrowRight,
	ArrowUpRight,
	Banknote,
	Building,
	Building2,
	Calendar,
	Camera,
	Check,
	CheckCircle,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
	ChevronUp,
	Circle,
	Clock,
	Copy,
	CreditCard,
	DollarSign,
	Download,
	Edit,
	Edit2,
	Edit3,
	ExternalLink,
	Eye,
	EyeOff,
	File,
	FileText,
	Filter,
	FolderOpen,
	Globe,
	Grid,
	Heart,
	Home,
	Image,
	Inbox,
	Info,
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
	MoreHorizontal,
	MoreVertical,
	Package,
	Pencil,
	Percent,
	PieChart,
	PiggyBank,
	Plus,
	PlusCircle,
	RefreshCw,
	Save,
	Search,
	Settings,
	Settings2,
	Share,
	Shield,
	Star,
	Tag,
	Trash,
	Trash2,
	TrendingDown,
	TrendingUp,
	Upload,
	User,
	UserPlus,
	Users,
	Wallet,
	X,
	XCircle,
	Zap,
} from 'lucide-react';

// Re-export the LucideIcon type for type definitions
export type { LucideIcon, LucideProps } from 'lucide-react';

// =============================================================================
// ICON WRAPPER COMPONENT TYPES
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
			className={cn(
				sizeClasses[size],
				color !== 'inherit' && colorClasses[color],
				className
			)}
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

import {
	AlertCircle as AlertCircleIcon,
	AlertTriangle as AlertTriangleIcon,
	ArrowDownLeft as ArrowDownLeftIcon,
	ArrowLeft as ArrowLeftIcon,
	ArrowRight as ArrowRightIcon,
	ArrowUpRight as ArrowUpRightIcon,
	Banknote as BanknoteIcon,
	Building as BuildingIcon,
	Building2 as Building2Icon,
	Calendar as CalendarIcon,
	Camera as CameraIcon,
	Check as CheckIcon,
	CheckCircle as CheckCircleIcon,
	ChevronDown as ChevronDownIcon,
	ChevronLeft as ChevronLeftIcon,
	ChevronRight as ChevronRightIcon,
	ChevronsLeft as ChevronsLeftIcon,
	ChevronsRight as ChevronsRightIcon,
	ChevronUp as ChevronUpIcon,
	Circle as CircleIcon,
	Clock as ClockIcon,
	Copy as CopyIcon,
	CreditCard as CreditCardIcon,
	DollarSign as DollarSignIcon,
	Download as DownloadIcon,
	Edit as EditIcon,
	Edit2 as Edit2Icon,
	Edit3 as Edit3Icon,
	ExternalLink as ExternalLinkIcon,
	Eye as EyeIcon,
	EyeOff as EyeOffIcon,
	File as FileIcon,
	FileText as FileTextIcon,
	Filter as FilterIcon,
	FolderOpen as FolderOpenIcon,
	Globe as GlobeIcon,
	Grid as GridIcon,
	Heart as HeartIcon,
	Home as HomeIcon,
	Image as ImageIcon,
	Inbox as InboxIcon,
	Info as InfoIcon,
	Landmark as LandmarkIcon,
	Link as LinkIcon,
	List as ListIcon,
	Loader as LoaderIcon,
	Loader2 as Loader2Icon,
	LogOut as LogOutIcon,
	Mail as MailIcon,
	MapPin as MapPinIcon,
	Menu as MenuIcon,
	Minus as MinusIcon,
	MoreHorizontal as MoreHorizontalIcon,
	MoreVertical as MoreVerticalIcon,
	Package as PackageIcon,
	Pencil as PencilIcon,
	Percent as PercentIcon,
	PieChart as PieChartIcon,
	PiggyBank as PiggyBankIcon,
	Plus as PlusIcon,
	PlusCircle as PlusCircleIcon,
	RefreshCw as RefreshCwIcon,
	Save as SaveIcon,
	Search as SearchIcon,
	Settings as SettingsIcon,
	Settings2 as Settings2Icon,
	Share as ShareIcon,
	Shield as ShieldIcon,
	Star as StarIcon,
	Tag as TagIcon,
	Trash as TrashIcon,
	Trash2 as Trash2Icon,
	TrendingDown as TrendingDownIcon,
	TrendingUp as TrendingUpIcon,
	Upload as UploadIcon,
	User as UserIcon,
	UserPlus as UserPlusIcon,
	Users as UsersIcon,
	Wallet as WalletIcon,
	X as XIcon,
	XCircle as XCircleIcon,
	Zap as ZapIcon,
} from 'lucide-react';

const iconMap = {
	'alert-circle': AlertCircleIcon,
	'alert-triangle': AlertTriangleIcon,
	'arrow-down-left': ArrowDownLeftIcon,
	'arrow-left': ArrowLeftIcon,
	'arrow-right': ArrowRightIcon,
	'arrow-up-right': ArrowUpRightIcon,
	banknote: BanknoteIcon,
	building: BuildingIcon,
	building2: Building2Icon,
	calendar: CalendarIcon,
	camera: CameraIcon,
	check: CheckIcon,
	'check-circle': CheckCircleIcon,
	'chevron-down': ChevronDownIcon,
	'chevron-left': ChevronLeftIcon,
	'chevron-right': ChevronRightIcon,
	'chevrons-left': ChevronsLeftIcon,
	'chevrons-right': ChevronsRightIcon,
	'chevron-up': ChevronUpIcon,
	circle: CircleIcon,
	clock: ClockIcon,
	copy: CopyIcon,
	'credit-card': CreditCardIcon,
	'dollar-sign': DollarSignIcon,
	download: DownloadIcon,
	edit: EditIcon,
	edit2: Edit2Icon,
	edit3: Edit3Icon,
	'external-link': ExternalLinkIcon,
	eye: EyeIcon,
	'eye-off': EyeOffIcon,
	file: FileIcon,
	'file-text': FileTextIcon,
	filter: FilterIcon,
	'folder-open': FolderOpenIcon,
	globe: GlobeIcon,
	grid: GridIcon,
	heart: HeartIcon,
	home: HomeIcon,
	image: ImageIcon,
	inbox: InboxIcon,
	info: InfoIcon,
	landmark: LandmarkIcon,
	link: LinkIcon,
	list: ListIcon,
	loader: LoaderIcon,
	loader2: Loader2Icon,
	'log-out': LogOutIcon,
	mail: MailIcon,
	'map-pin': MapPinIcon,
	menu: MenuIcon,
	minus: MinusIcon,
	'more-horizontal': MoreHorizontalIcon,
	'more-vertical': MoreVerticalIcon,
	package: PackageIcon,
	pencil: PencilIcon,
	percent: PercentIcon,
	'pie-chart': PieChartIcon,
	'piggy-bank': PiggyBankIcon,
	plus: PlusIcon,
	'plus-circle': PlusCircleIcon,
	'refresh-cw': RefreshCwIcon,
	save: SaveIcon,
	search: SearchIcon,
	settings: SettingsIcon,
	settings2: Settings2Icon,
	share: ShareIcon,
	shield: ShieldIcon,
	star: StarIcon,
	tag: TagIcon,
	trash: TrashIcon,
	trash2: Trash2Icon,
	'trending-down': TrendingDownIcon,
	'trending-up': TrendingUpIcon,
	upload: UploadIcon,
	user: UserIcon,
	'user-plus': UserPlusIcon,
	users: UsersIcon,
	wallet: WalletIcon,
	x: XIcon,
	'x-circle': XCircleIcon,
	zap: ZapIcon,
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
			className={cn(
				sizeClasses[size],
				color !== 'inherit' && colorClasses[color],
				className
			)}
			aria-label={ariaLabel}
			aria-hidden={ariaHidden}
		/>
	);
}

export { Icon, IconWrapper };
export type { IconProps, IconWrapperProps, IconSize, IconColor, IconName };
