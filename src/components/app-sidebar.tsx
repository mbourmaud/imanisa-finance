'use client';

import {
	Building2,
	CreditCard,
	Home,
	Landmark,
	PieChart,
	Receipt,
	Settings,
	TrendingUp,
	Upload,
	Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar';

const navigationItems = [
	{
		title: 'Tableau de bord',
		url: '/dashboard',
		icon: Home,
	},
	{
		title: 'Comptes',
		url: '/dashboard/accounts',
		icon: Wallet,
	},
	{
		title: 'Transactions',
		url: '/dashboard/transactions',
		icon: Receipt,
	},
	{
		title: 'Budget',
		url: '/dashboard/budget',
		icon: PieChart,
	},
];

const investmentItems = [
	{
		title: 'Investissements',
		url: '/dashboard/investments',
		icon: TrendingUp,
	},
	{
		title: 'Immobilier',
		url: '/dashboard/real-estate',
		icon: Building2,
	},
];

const loanItems = [
	{
		title: 'Crédits',
		url: '/dashboard/loans',
		icon: CreditCard,
	},
];

const toolsItems = [
	{
		title: 'Import',
		url: '/dashboard/import',
		icon: Upload,
	},
	{
		title: 'Banques',
		url: '/dashboard/banks',
		icon: Landmark,
	},
	{
		title: 'Paramètres',
		url: '/dashboard/settings',
		icon: Settings,
	},
];

export function AppSidebar() {
	const pathname = usePathname();

	return (
		<Sidebar>
			<SidebarHeader className="border-b px-6 py-4">
				<Link href="/dashboard" className="flex items-center gap-2 font-semibold">
					<Wallet className="h-6 w-6" />
					<span>Imanisa Finance</span>
				</Link>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Navigation</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{navigationItems.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild isActive={pathname === item.url}>
										<Link href={item.url}>
											<item.icon />
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<SidebarGroup>
					<SidebarGroupLabel>Patrimoine</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{investmentItems.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild isActive={pathname === item.url}>
										<Link href={item.url}>
											<item.icon />
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<SidebarGroup>
					<SidebarGroupLabel>Passif</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{loanItems.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild isActive={pathname === item.url}>
										<Link href={item.url}>
											<item.icon />
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<SidebarGroup>
					<SidebarGroupLabel>Outils</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{toolsItems.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild isActive={pathname === item.url}>
										<Link href={item.url}>
											<item.icon />
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
