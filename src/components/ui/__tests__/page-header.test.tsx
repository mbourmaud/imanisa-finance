import { render, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PageHeader, SectionHeader } from '../page-header'

describe('PageHeader', () => {
	it('renders with required props', () => {
		const { container } = render(<PageHeader title="Dashboard" />)
		const header = container.querySelector('[data-slot="page-header"]')
		expect(header).toBeInTheDocument()
		const h1 = header?.querySelector('h1')
		expect(h1).toHaveTextContent('Dashboard')
	})

	it('renders with description', () => {
		const { container } = render(
			<PageHeader title="Dashboard" description="Welcome to your dashboard" />,
		)
		const header = container.querySelector('[data-slot="page-header"]')
		const description = within(header as HTMLElement).getByText('Welcome to your dashboard')
		expect(description).toBeInTheDocument()
	})

	it('renders with actions', () => {
		const { container } = render(
			<PageHeader
				title="Accounts"
				actions={
					<button type="button" data-testid="action">
						Add Account
					</button>
				}
			/>,
		)
		const action = container.querySelector('[data-testid="action"]')
		expect(action).toBeInTheDocument()
	})

	it('accepts custom className', () => {
		const { container } = render(<PageHeader title="Test" className="custom-class" />)
		const header = container.querySelector('[data-slot="page-header"]')
		expect(header).toHaveClass('custom-class')
	})

	it('renders complete header with all features', () => {
		const { container } = render(
			<PageHeader
				title="Financial Overview"
				description="Track your finances across all accounts"
				actions={
					<>
						<button type="button" data-testid="action1">
							Export
						</button>
						<button type="button" data-testid="action2">
							Settings
						</button>
					</>
				}
			/>,
		)

		const header = container.querySelector('[data-slot="page-header"]') as HTMLElement
		expect(header.querySelector('h1')).toHaveTextContent('Financial Overview')
		expect(within(header).getByText('Track your finances across all accounts')).toBeInTheDocument()
		expect(header.querySelector('[data-testid="action1"]')).toBeInTheDocument()
		expect(header.querySelector('[data-testid="action2"]')).toBeInTheDocument()
	})
})

describe('SectionHeader', () => {
	it('renders with required props', () => {
		const { container } = render(<SectionHeader title="Recent Transactions" />)
		const header = container.querySelector('[data-slot="section-header"]')
		expect(header).toBeInTheDocument()
		const h2 = header?.querySelector('h2')
		expect(h2).toHaveTextContent('Recent Transactions')
	})

	it('renders with description', () => {
		const { container } = render(
			<SectionHeader title="Activity" description="Your latest activity" />,
		)
		const header = container.querySelector('[data-slot="section-header"]') as HTMLElement
		expect(within(header).getByText('Your latest activity')).toBeInTheDocument()
	})

	it('renders with action', () => {
		const { container } = render(
			<SectionHeader
				title="My Section"
				action={
					<button type="button" data-testid="section-action">
						View All
					</button>
				}
			/>,
		)
		const action = container.querySelector('[data-testid="section-action"]')
		expect(action).toBeInTheDocument()
	})

	it('accepts custom className', () => {
		const { container } = render(<SectionHeader title="Test" className="custom-class" />)
		const header = container.querySelector('[data-slot="section-header"]')
		expect(header).toHaveClass('custom-class')
	})

	it('renders complete section header with all features', () => {
		const { container } = render(
			<SectionHeader
				title="Account Summary"
				description="Overview of your connected accounts"
				action={
					<button type="button" data-testid="add-btn">
						Add Account
					</button>
				}
			/>,
		)

		const header = container.querySelector('[data-slot="section-header"]') as HTMLElement
		expect(header.querySelector('h2')).toHaveTextContent('Account Summary')
		expect(within(header).getByText('Overview of your connected accounts')).toBeInTheDocument()
		expect(header.querySelector('[data-testid="add-btn"]')).toBeInTheDocument()
	})
})

describe('PageHeader and SectionHeader composition', () => {
	it('renders page with page header and section headers', () => {
		const { container } = render(
			<div data-testid="page-container">
				<PageHeader title="My Dashboard" description="Welcome back!" />
				<SectionHeader title="Overview" />
				<SectionHeader title="Transactions" action={<button type="button">See All</button>} />
			</div>,
		)

		const pageContainer = container.querySelector('[data-testid="page-container"]') as HTMLElement
		const h1Elements = pageContainer.querySelectorAll('h1')
		const h2Elements = pageContainer.querySelectorAll('h2')

		expect(h1Elements).toHaveLength(1)
		expect(h1Elements[0]).toHaveTextContent('My Dashboard')
		expect(h2Elements).toHaveLength(2)
		expect(within(pageContainer).getByText('Overview')).toBeInTheDocument()
		expect(within(pageContainer).getByText('Transactions')).toBeInTheDocument()
	})
})

describe('PageHeader accessibility', () => {
	it('uses h1 for page title', () => {
		const { container } = render(<PageHeader title="Page Title" />)
		const h1 = container.querySelector('h1')
		expect(h1).toBeInTheDocument()
		expect(h1).toHaveTextContent('Page Title')
	})

	it('uses p for description', () => {
		const { container } = render(<PageHeader title="Title" description="Description text" />)
		const p = container.querySelector('p')
		expect(p).toBeInTheDocument()
		expect(p).toHaveTextContent('Description text')
	})
})

describe('SectionHeader accessibility', () => {
	it('uses h2 for section title', () => {
		const { container } = render(<SectionHeader title="Section Title" />)
		const h2 = container.querySelector('h2')
		expect(h2).toBeInTheDocument()
		expect(h2).toHaveTextContent('Section Title')
	})

	it('uses p for description', () => {
		const { container } = render(<SectionHeader title="Title" description="Description text" />)
		const p = container.querySelector('p')
		expect(p).toBeInTheDocument()
		expect(p).toHaveTextContent('Description text')
	})
})
