import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset className="bg-muted/30">
				{/* Mobile header with sidebar trigger */}
				<header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-6 md:hidden">
					<SidebarTrigger />
					<span className="font-semibold">Imanisa Finance</span>
				</header>
				<main className="flex-1 p-6 md:p-8 lg:p-10">
					<div className="mx-auto max-w-7xl animate-fade-in">{children}</div>
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
