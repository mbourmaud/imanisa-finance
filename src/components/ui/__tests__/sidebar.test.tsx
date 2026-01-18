import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
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
	SidebarProvider,
} from '../sidebar';

// Mock the useIsMobile hook
vi.mock('@/hooks/use-mobile', () => ({
	useIsMobile: () => false,
}));

describe('Sidebar', () => {
	it('renders SidebarProvider with children', () => {
		const { container } = render(
			<SidebarProvider>
				<div data-testid="child">Content</div>
			</SidebarProvider>,
		);
		expect(screen.getByTestId('child')).toBeInTheDocument();
		expect(container.querySelector('[data-slot="sidebar-wrapper"]')).toBeInTheDocument();
	});

	it('renders SidebarHeader', () => {
		const { container } = render(
			<SidebarProvider>
				<Sidebar>
					<SidebarHeader data-testid="header">Header Content</SidebarHeader>
				</Sidebar>
			</SidebarProvider>,
		);
		expect(screen.getByTestId('header')).toMatchInlineSnapshot(`
			<div
			  class="flex flex-col gap-2 p-2"
			  data-sidebar="header"
			  data-slot="sidebar-header"
			  data-testid="header"
			>
			  Header Content
			</div>
		`);
	});

	it('renders SidebarContent', () => {
		const { container } = render(
			<SidebarProvider>
				<Sidebar>
					<SidebarContent data-testid="content">Content</SidebarContent>
				</Sidebar>
			</SidebarProvider>,
		);
		expect(screen.getByTestId('content')).toMatchInlineSnapshot(`
			<div
			  class="flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden"
			  data-sidebar="content"
			  data-slot="sidebar-content"
			  data-testid="content"
			>
			  Content
			</div>
		`);
	});

	it('renders SidebarFooter', () => {
		const { container } = render(
			<SidebarProvider>
				<Sidebar>
					<SidebarFooter data-testid="footer">Footer Content</SidebarFooter>
				</Sidebar>
			</SidebarProvider>,
		);
		expect(screen.getByTestId('footer')).toMatchInlineSnapshot(`
			<div
			  class="flex flex-col gap-2 p-2"
			  data-sidebar="footer"
			  data-slot="sidebar-footer"
			  data-testid="footer"
			>
			  Footer Content
			</div>
		`);
	});

	it('renders SidebarGroup with label', () => {
		const { container } = render(
			<SidebarProvider>
				<Sidebar>
					<SidebarContent>
						<SidebarGroup data-testid="group">
							<SidebarGroupLabel data-testid="label">Navigation</SidebarGroupLabel>
							<SidebarGroupContent data-testid="group-content">Content</SidebarGroupContent>
						</SidebarGroup>
					</SidebarContent>
				</Sidebar>
			</SidebarProvider>,
		);
		expect(screen.getByTestId('label')).toMatchInlineSnapshot(`
			<div
			  class="text-sidebar-foreground/70 ring-sidebar-ring flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium outline-hidden transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0 group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0"
			  data-sidebar="group-label"
			  data-slot="sidebar-group-label"
			  data-testid="label"
			>
			  Navigation
			</div>
		`);
	});

	it('renders SidebarMenu with items', () => {
		const { container } = render(
			<SidebarProvider>
				<Sidebar>
					<SidebarContent>
						<SidebarGroup>
							<SidebarGroupContent>
								<SidebarMenu data-testid="menu">
									<SidebarMenuItem data-testid="item">
										<SidebarMenuButton data-testid="button">Home</SidebarMenuButton>
									</SidebarMenuItem>
								</SidebarMenu>
							</SidebarGroupContent>
						</SidebarGroup>
					</SidebarContent>
				</Sidebar>
			</SidebarProvider>,
		);
		expect(screen.getByTestId('menu')).toMatchInlineSnapshot(`
			<ul
			  class="flex w-full min-w-0 flex-col gap-1"
			  data-sidebar="menu"
			  data-slot="sidebar-menu"
			  data-testid="menu"
			>
			  <li
			    class="group/menu-item relative"
			    data-sidebar="menu-item"
			    data-slot="sidebar-menu-item"
			    data-testid="item"
			  >
			    <button
			      class="peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left outline-hidden ring-sidebar-ring transition-[width,height,padding] focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-8 text-sm"
			      data-active="false"
			      data-sidebar="menu-button"
			      data-size="default"
			      data-slot="sidebar-menu-button"
			      data-testid="button"
			    >
			      Home
			    </button>
			  </li>
			</ul>
		`);
	});

	it('renders SidebarMenuButton with isActive', () => {
		const { container } = render(
			<SidebarProvider>
				<Sidebar>
					<SidebarContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton isActive data-testid="active-button">
									Active Item
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarContent>
				</Sidebar>
			</SidebarProvider>,
		);
		expect(screen.getByTestId('active-button')).toHaveAttribute('data-active', 'true');
	});

	it('has backdrop-blur for glassmorphism effect', () => {
		const { container } = render(
			<SidebarProvider>
				<Sidebar>
					<SidebarContent>Content</SidebarContent>
				</Sidebar>
			</SidebarProvider>,
		);
		const sidebarInner = container.querySelector('[data-slot="sidebar-inner"]');
		expect(sidebarInner).toHaveClass('backdrop-blur-xl');
	});
});
