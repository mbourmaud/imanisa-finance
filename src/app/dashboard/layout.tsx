import { Box, HStack, SidebarInset, SidebarProvider, SidebarTrigger, Text } from '@/components';
import { AppSidebar } from '@/components/app-sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset style={{ backgroundColor: 'hsl(var(--muted) / 0.3)' }}>
				{/* Mobile header with sidebar trigger */}
				<Box
					as="header"
					display="flex"
					style={{
						position: 'sticky',
						top: 0,
						zIndex: 10,
						height: '3.5rem',
						alignItems: 'center',
						gap: '1rem',
						paddingLeft: '1.5rem',
						paddingRight: '1.5rem',
						borderBottom: '1px solid hsl(var(--border))',
						backgroundColor: 'hsl(var(--background) / 0.8)',
						backdropFilter: 'blur(8px)',
					}}
				>
					<HStack gap="md" align="center" style={{ display: 'flex' }} data-hide-desktop>
						<SidebarTrigger />
						<Text weight="semibold">Imanisa Finance</Text>
					</HStack>
				</Box>
				<Box as="main" p="lg" style={{ flex: 1, padding: '1.5rem' }}>
					<Box
						style={{
							maxWidth: '80rem',
							marginLeft: 'auto',
							marginRight: 'auto',
							animation: 'fadeIn 0.3s ease-out',
						}}
					>
						{children}
					</Box>
				</Box>
			</SidebarInset>
		</SidebarProvider>
	);
}
