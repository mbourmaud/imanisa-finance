import {
	DashboardHeader,
	DashboardHeaderMobile,
	DashboardMain,
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
	Text,
} from '@/components';
import { AppSidebar } from '@/components/app-sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset style={{ backgroundColor: 'hsl(var(--muted) / 0.3)' }}>
				{/* Mobile header with sidebar trigger */}
				<DashboardHeader>
					<DashboardHeaderMobile>
						<SidebarTrigger />
						<Text as="span" weight="semibold">
							Imanisa Finance
						</Text>
					</DashboardHeaderMobile>
				</DashboardHeader>
				<DashboardMain>{children}</DashboardMain>
			</SidebarInset>
		</SidebarProvider>
	);
}
