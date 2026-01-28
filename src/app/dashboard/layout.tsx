import {
	AppLogo,
	DashboardHeader,
	DashboardHeaderMobile,
	DashboardMain,
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from '@/components';
import { AppSidebar } from '@/components/app-sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset variant="muted">
				<DashboardHeader>
					<DashboardHeaderMobile>
						<SidebarTrigger />
						<AppLogo />
					</DashboardHeaderMobile>
				</DashboardHeader>
				<DashboardMain>{children}</DashboardMain>
			</SidebarInset>
		</SidebarProvider>
	);
}
