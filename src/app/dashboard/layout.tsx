import { SidebarInset, SidebarProvider, SidebarTrigger, Text } from '@/components';
import { AppSidebar } from '@/components/app-sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset style={{ backgroundColor: 'hsl(var(--muted) / 0.3)' }}>
				{/* Mobile header with sidebar trigger */}
				<header
					className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-border bg-background/80 px-6 backdrop-blur-sm"
				>
					<div className="flex items-center gap-4 lg:hidden">
						<SidebarTrigger />
						<Text weight="semibold">Imanisa Finance</Text>
					</div>
				</header>
				<main className="flex-1 p-6">
					<div
						className="mx-auto max-w-7xl"
						style={{ animation: 'fadeIn 0.3s ease-out' }}
					>
						{children}
					</div>
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
