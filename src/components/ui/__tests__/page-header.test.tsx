import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Settings } from 'lucide-react';
import { PageHeader, SectionHeader } from '../page-header';

describe('PageHeader', () => {
	it('renders with required props', () => {
		const { container } = render(<PageHeader title="Dashboard" />);
		const header = container.querySelector('[data-slot="page-header"]');
		expect(header).toBeInTheDocument();
		const h1 = header?.querySelector('h1');
		expect(h1).toHaveTextContent('Dashboard');
	});

	it('renders with description', () => {
		const { container } = render(<PageHeader title="Dashboard" description="Welcome to your dashboard" />);
		const header = container.querySelector('[data-slot="page-header"]');
		const description = within(header as HTMLElement).getByText('Welcome to your dashboard');
		expect(description).toBeInTheDocument();
	});

	it('renders with size sm', () => {
		const { container } = render(<PageHeader title="Small" size="sm" />);
		const header = container.querySelector('[data-slot="page-header"]');
		expect(header).toHaveClass('pb-4', 'sm:pb-6');
		const h1 = header?.querySelector('h1');
		expect(h1).toHaveClass('text-xl');
	});

	it('renders with size md (default)', () => {
		const { container } = render(<PageHeader title="Medium" size="md" />);
		const header = container.querySelector('[data-slot="page-header"]');
		expect(header).toHaveClass('pb-6', 'sm:pb-8');
		const h1 = header?.querySelector('h1');
		expect(h1).toHaveClass('text-2xl');
	});

	it('renders with size lg', () => {
		const { container } = render(<PageHeader title="Large" size="lg" />);
		const header = container.querySelector('[data-slot="page-header"]');
		expect(header).toHaveClass('pb-8', 'sm:pb-10');
		const h1 = header?.querySelector('h1');
		expect(h1).toHaveClass('text-3xl');
	});

	it('renders with icon', () => {
		const { container } = render(<PageHeader title="Settings" icon={<Settings data-testid="icon" />} />);
		const icon = container.querySelector('[data-testid="icon"]');
		expect(icon).toBeInTheDocument();
	});

	it('renders with actions', () => {
		const { container } = render(
			<PageHeader
				title="Accounts"
				actions={<button type="button" data-testid="action">Add Account</button>}
			/>
		);
		const action = container.querySelector('[data-testid="action"]');
		expect(action).toBeInTheDocument();
	});

	it('renders with breadcrumbs', () => {
		const { container } = render(
			<PageHeader
				title="Account Details"
				breadcrumbs={[
					{ label: 'Dashboard', href: '/dashboard' },
					{ label: 'Accounts', href: '/accounts' },
					{ label: 'Account Details' },
				]}
			/>
		);
		const nav = container.querySelector('nav[aria-label="Breadcrumb"]');
		expect(nav).toBeInTheDocument();
		expect(within(nav as HTMLElement).getByText('Dashboard')).toBeInTheDocument();
		expect(within(nav as HTMLElement).getByText('Accounts')).toBeInTheDocument();
		expect(within(nav as HTMLElement).getByText('Account Details')).toBeInTheDocument();
	});

	it('renders breadcrumbs with links', () => {
		const { container } = render(
			<PageHeader
				title="Details"
				breadcrumbs={[
					{ label: 'Home', href: '/' },
					{ label: 'Current Page' },
				]}
			/>
		);
		const nav = container.querySelector('nav');
		const link = nav?.querySelector('a[href="/"]');
		expect(link).toBeInTheDocument();
		expect(link).toHaveTextContent('Home');
	});

	it('accepts custom className', () => {
		const { container } = render(<PageHeader title="Test" className="custom-class" />);
		const header = container.querySelector('[data-slot="page-header"]');
		expect(header).toHaveClass('custom-class');
	});

	it('renders complete header with all features', () => {
		const { container } = render(
			<PageHeader
				title="Financial Overview"
				description="Track your finances across all accounts"
				size="lg"
				icon={<Settings data-testid="header-icon" />}
				breadcrumbs={[
					{ label: 'Dashboard', href: '/dashboard' },
					{ label: 'Financial Overview' },
				]}
				actions={
					<>
						<button type="button" data-testid="action1">Export</button>
						<button type="button" data-testid="action2">Settings</button>
					</>
				}
			/>
		);

		const header = container.querySelector('[data-slot="page-header"]') as HTMLElement;
		expect(header.querySelector('h1')).toHaveTextContent('Financial Overview');
		expect(within(header).getByText('Track your finances across all accounts')).toBeInTheDocument();
		expect(header.querySelector('[data-testid="header-icon"]')).toBeInTheDocument();
		expect(header.querySelector('nav')).toBeInTheDocument();
		expect(header.querySelector('[data-testid="action1"]')).toBeInTheDocument();
		expect(header.querySelector('[data-testid="action2"]')).toBeInTheDocument();
	});
});

describe('SectionHeader', () => {
	it('renders with required props', () => {
		const { container } = render(<SectionHeader title="Recent Transactions" />);
		const header = container.querySelector('[data-slot="section-header"]');
		expect(header).toBeInTheDocument();
		const h2 = header?.querySelector('h2');
		expect(h2).toHaveTextContent('Recent Transactions');
	});

	it('renders with description', () => {
		const { container } = render(<SectionHeader title="Activity" description="Your latest activity" />);
		const header = container.querySelector('[data-slot="section-header"]') as HTMLElement;
		expect(within(header).getByText('Your latest activity')).toBeInTheDocument();
	});

	it('renders with size sm', () => {
		const { container } = render(<SectionHeader title="Small Section" size="sm" />);
		const header = container.querySelector('[data-slot="section-header"]');
		expect(header).toHaveClass('pb-3');
		const h2 = header?.querySelector('h2');
		expect(h2).toHaveClass('text-base');
	});

	it('renders with size md (default)', () => {
		const { container } = render(<SectionHeader title="Medium Section" size="md" />);
		const header = container.querySelector('[data-slot="section-header"]');
		expect(header).toHaveClass('pb-4');
		const h2 = header?.querySelector('h2');
		expect(h2).toHaveClass('text-lg');
	});

	it('renders with size lg', () => {
		const { container } = render(<SectionHeader title="Large Section" size="lg" />);
		const header = container.querySelector('[data-slot="section-header"]');
		expect(header).toHaveClass('pb-6');
		const h2 = header?.querySelector('h2');
		expect(h2).toHaveClass('text-xl');
	});

	it('renders with action', () => {
		const { container } = render(
			<SectionHeader
				title="My Section"
				action={<button type="button" data-testid="section-action">View All</button>}
			/>
		);
		const action = container.querySelector('[data-testid="section-action"]');
		expect(action).toBeInTheDocument();
	});

	it('renders with bordered prop', () => {
		const { container } = render(<SectionHeader title="Bordered" bordered />);
		const header = container.querySelector('[data-slot="section-header"]');
		expect(header).toHaveClass('border-b', 'border-border/60', 'mb-4');
	});

	it('renders without border by default', () => {
		const { container } = render(<SectionHeader title="Not Bordered" />);
		const header = container.querySelector('[data-slot="section-header"]');
		expect(header).not.toHaveClass('border-b');
	});

	it('accepts custom className', () => {
		const { container } = render(<SectionHeader title="Test" className="custom-class" />);
		const header = container.querySelector('[data-slot="section-header"]');
		expect(header).toHaveClass('custom-class');
	});

	it('renders complete section header with all features', () => {
		const { container } = render(
			<SectionHeader
				title="Account Summary"
				description="Overview of your connected accounts"
				size="lg"
				bordered
				action={<button type="button" data-testid="add-btn">Add Account</button>}
			/>
		);

		const header = container.querySelector('[data-slot="section-header"]') as HTMLElement;
		expect(header.querySelector('h2')).toHaveTextContent('Account Summary');
		expect(within(header).getByText('Overview of your connected accounts')).toBeInTheDocument();
		expect(header.querySelector('[data-testid="add-btn"]')).toBeInTheDocument();
	});
});

describe('PageHeader and SectionHeader composition', () => {
	it('renders page with page header and section headers', () => {
		const { container } = render(
			<div data-testid="page-container">
				<PageHeader
					title="My Dashboard"
					description="Welcome back!"
				/>
				<SectionHeader title="Overview" />
				<SectionHeader title="Transactions" action={<button type="button">See All</button>} />
			</div>
		);

		const pageContainer = container.querySelector('[data-testid="page-container"]') as HTMLElement;
		const h1Elements = pageContainer.querySelectorAll('h1');
		const h2Elements = pageContainer.querySelectorAll('h2');

		expect(h1Elements).toHaveLength(1);
		expect(h1Elements[0]).toHaveTextContent('My Dashboard');
		expect(h2Elements).toHaveLength(2);
		expect(within(pageContainer).getByText('Overview')).toBeInTheDocument();
		expect(within(pageContainer).getByText('Transactions')).toBeInTheDocument();
	});
});
