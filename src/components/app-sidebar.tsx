'use client';

import {
	ArrowLeftRight,
	Check,
	ChevronRight,
	ChevronsUpDown,
	HandCoins,
	Home,
	Landmark,
	LogOut,
	Monitor,
	Moon,
	Settings,
	Sun,
	Upload,
	User,
	Users,
	Wallet,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useUser } from '@/lib/hooks/use-user';
import { createClient } from '@/lib/supabase/client';
import { useEntityStore } from '@/shared/stores/entity-store';

const menuNavItems = [
	{ title: 'Banques', url: '/dashboard/banks', icon: Landmark },
	{ title: 'Transactions', url: '/dashboard/transactions', icon: ArrowLeftRight },
	{ title: 'Import', url: '/dashboard/import', icon: Upload },
];

const patrimoineNavItems = [
	{ title: 'Immobilier', url: '/dashboard/real-estate', icon: Home },
	{ title: 'Prêts', url: '/dashboard/loans', icon: HandCoins },
];

const gestionNavItems = [
	{ title: 'Paramètres', url: '/dashboard/settings', icon: Settings },
];

function NavItem({
	item,
	isActive,
}: {
	item: { title: string; url: string; icon: React.ElementType };
	isActive: boolean;
}) {
	const Icon = item.icon;

	return (
		<SidebarMenuItem>
			<SidebarMenuButton
				asChild
				isActive={isActive}
				className={`group relative h-11 rounded-xl transition-all duration-300 ${
					isActive
						? 'bg-gradient-to-r from-primary/15 to-primary/5 text-primary font-semibold'
						: 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
				}`}
			>
				<Link href={item.url} className="flex items-center gap-3">
					<div
						className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300 ${
							isActive
								? 'bg-primary text-white shadow-sm shadow-primary/15'
								: 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
						}`}
					>
						<Icon className="h-4 w-4" />
					</div>
					<span className="flex-1">{item.title}</span>
					{isActive && <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />}
				</Link>
			</SidebarMenuButton>
		</SidebarMenuItem>
	);
}

export function AppSidebar() {
	const pathname = usePathname();
	const router = useRouter();
	const { theme, setTheme } = useTheme();
	const { entities, selectedEntityId, setSelectedEntity } = useEntityStore();
	const { avatarUrl, fullName, email } = useUser();

	const selectedEntity = entities.find((e) => e.id === selectedEntityId);

	// Get initials from name or email
	const getInitials = () => {
		if (fullName) {
			return fullName
				.split(' ')
				.map((n) => n[0])
				.join('')
				.toUpperCase()
				.slice(0, 2);
		}
		if (email) {
			return email[0].toUpperCase();
		}
		return 'U';
	};

	const handleLogout = async () => {
		const supabase = createClient();
		await supabase.auth.signOut();
		router.push('/login');
	};

	return (
		<Sidebar className="border-r-0 bg-gradient-to-b from-sidebar to-sidebar/95">
			{/* Header / Logo */}
			<SidebarHeader className="px-4 py-5">
				<div className="flex items-center justify-between">
					<Link href="/dashboard" className="flex items-center gap-3 group">
						<div className="relative">
							<div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/80 shadow-sm shadow-primary/15 transition-transform duration-300 group-hover:scale-105">
								<Wallet className="h-5 w-5 text-white" />
							</div>
							<div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-400 border-2 border-sidebar" />
						</div>
						<div>
							<span className="text-lg font-bold tracking-tight">Imanisa</span>
							<p className="text-[11px] text-muted-foreground font-medium">Finance familiale</p>
						</div>
					</Link>
				</div>

				{/* Entity Selector - Modern pill style */}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<button
							type="button"
							className="mt-5 w-full flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-muted/80 to-muted/40 hover:from-muted hover:to-muted/60 transition-all duration-300 group"
						>
							<div
								className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
									selectedEntity?.type === 'family'
										? 'bg-gradient-to-br from-primary/20 to-purple-500/20'
										: 'bg-gradient-to-br from-primary/20 to-orange-500/20'
								}`}
							>
								{selectedEntity?.type === 'family' ? (
									<Users className="h-5 w-5 text-primary" />
								) : (
									<User className="h-5 w-5 text-primary" />
								)}
							</div>
							<div className="flex-1 text-left">
								<p className="text-sm font-semibold">{selectedEntity?.name ?? 'Sélectionner'}</p>
								<p className="text-[11px] text-muted-foreground">
									{selectedEntity?.type === 'family' ? 'Vue globale' : 'Vue personnelle'}
								</p>
							</div>
							<ChevronsUpDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
						</button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start" className="w-[220px] p-2">
						{entities.map((entity) => (
							<DropdownMenuItem
								key={entity.id}
								onClick={() => setSelectedEntity(entity.id)}
								className="flex items-center gap-3 p-3 rounded-xl cursor-pointer"
							>
								<div
									className={`flex h-9 w-9 items-center justify-center rounded-lg ${
										entity.type === 'family'
											? 'bg-gradient-to-br from-primary/15 to-purple-500/15'
											: 'bg-gradient-to-br from-primary/15 to-orange-500/15'
									}`}
								>
									{entity.type === 'family' ? (
										<Users className="h-4 w-4 text-primary" />
									) : (
										<User className="h-4 w-4 text-primary" />
									)}
								</div>
								<div className="flex-1">
									<p className="font-medium">{entity.name}</p>
									<p className="text-[11px] text-muted-foreground">
										{entity.type === 'family' ? 'Patrimoine familial' : 'Patrimoine personnel'}
									</p>
								</div>
								{entity.id === selectedEntityId && (
									<div className="h-2 w-2 rounded-full bg-primary" />
								)}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarHeader>

			{/* Divider */}
			<div className="mx-4 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

			{/* Navigation */}
			<SidebarContent className="px-3 py-4 scrollbar-thin">
				<SidebarGroup>
					<SidebarGroupLabel className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50">
						Menu
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu className="space-y-1.5">
							{menuNavItems.map((item) => (
								<NavItem key={item.url} item={item} isActive={pathname.startsWith(item.url)} />
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<SidebarGroup>
					<SidebarGroupLabel className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50">
						Patrimoine
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu className="space-y-1.5">
							{patrimoineNavItems.map((item) => (
								<NavItem key={item.url} item={item} isActive={pathname.startsWith(item.url)} />
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<SidebarGroup>
					<SidebarGroupLabel className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50">
						Gestion
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu className="space-y-1.5">
							{gestionNavItems.map((item) => (
								<NavItem key={item.url} item={item} isActive={pathname.startsWith(item.url)} />
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			{/* Footer */}
			<SidebarFooter className="p-4">
				{/* User Menu */}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<button
							type="button"
							className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors"
						>
							{avatarUrl ? (
								<Image
									src={avatarUrl}
									alt={fullName ?? 'Avatar'}
									referrerPolicy="no-referrer"
									className="h-10 w-10 rounded-full border-2 border-primary/20 object-cover"
									width={40}
									height={40}
									unoptimized
								/>
							) : (
								<Avatar className="h-10 w-10 border-2 border-primary/20">
									<AvatarFallback className="bg-gradient-to-br from-primary/20 to-purple-500/20 text-sm font-bold text-primary">
										{getInitials()}
									</AvatarFallback>
								</Avatar>
							)}
							<div className="flex-1 text-left min-w-0">
								<p className="text-sm font-semibold truncate">{fullName ?? 'Utilisateur'}</p>
								{email && <p className="text-[11px] text-muted-foreground truncate">{email}</p>}
							</div>
							<ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
						</button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start" className="w-56 p-2">
						<DropdownMenuItem className="rounded-lg p-2.5">
							<User className="mr-3 h-4 w-4 text-muted-foreground" />
							Profil
						</DropdownMenuItem>
						<DropdownMenuItem className="rounded-lg p-2.5">
							<Settings className="mr-3 h-4 w-4 text-muted-foreground" />
							Paramètres
						</DropdownMenuItem>
						<DropdownMenuSeparator className="my-2" />
						<DropdownMenuSub>
							<DropdownMenuSubTrigger className="rounded-lg p-2.5">
								{theme === 'dark' ? (
									<Moon className="mr-3 h-4 w-4 text-muted-foreground" />
								) : theme === 'light' ? (
									<Sun className="mr-3 h-4 w-4 text-muted-foreground" />
								) : (
									<Monitor className="mr-3 h-4 w-4 text-muted-foreground" />
								)}
								Thème
							</DropdownMenuSubTrigger>
							<DropdownMenuSubContent className="p-2">
								<DropdownMenuItem onClick={() => setTheme('light')} className="rounded-lg p-2.5">
									<Sun className="mr-3 h-4 w-4" />
									Clair
									{theme === 'light' && <Check className="ml-auto h-4 w-4 text-primary" />}
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setTheme('dark')} className="rounded-lg p-2.5">
									<Moon className="mr-3 h-4 w-4" />
									Sombre
									{theme === 'dark' && <Check className="ml-auto h-4 w-4 text-primary" />}
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setTheme('system')} className="rounded-lg p-2.5">
									<Monitor className="mr-3 h-4 w-4" />
									Système
									{theme === 'system' && <Check className="ml-auto h-4 w-4 text-primary" />}
								</DropdownMenuItem>
							</DropdownMenuSubContent>
						</DropdownMenuSub>
						<DropdownMenuSeparator className="my-2" />
						<DropdownMenuItem
							onClick={handleLogout}
							className="rounded-lg p-2.5 text-destructive focus:text-destructive cursor-pointer"
						>
							<LogOut className="mr-3 h-4 w-4" />
							Déconnexion
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
