import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
	Sheet,
	SheetBody,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from '../sheet';

// Helper to get the visible (non aria-hidden) element from duplicates created by Radix portals
function getVisibleElement(elements: HTMLElement[]): HTMLElement {
	// Find the element that is NOT aria-hidden (the real one)
	const visible = elements.find((el) => el.getAttribute('aria-hidden') !== 'true');
	return visible || elements[0];
}

describe('Sheet', () => {
	it('renders SheetHeader with border', () => {
		render(
			<Sheet defaultOpen>
				<SheetContent>
					<SheetHeader data-testid="header">
						<SheetTitle>Title</SheetTitle>
					</SheetHeader>
				</SheetContent>
			</Sheet>,
		);
		const headers = screen.getAllByTestId('header');
		const header = getVisibleElement(headers);
		expect(header).toBeInTheDocument();
		expect(header).toHaveClass('border-b');
		expect(header).toHaveAttribute('data-slot', 'sheet-header');
	});

	it('renders SheetBody with scrollable content', () => {
		render(
			<Sheet defaultOpen>
				<SheetContent>
					<SheetBody data-testid="body">Content</SheetBody>
				</SheetContent>
			</Sheet>,
		);
		const bodies = screen.getAllByTestId('body');
		const body = getVisibleElement(bodies);
		expect(body).toBeInTheDocument();
		expect(body).toHaveClass('flex-1', 'overflow-y-auto', 'p-4', 'scrollbar-thin');
		expect(body).toHaveAttribute('data-slot', 'sheet-body');
	});

	it('renders SheetFooter with border', () => {
		render(
			<Sheet defaultOpen>
				<SheetContent>
					<SheetFooter data-testid="footer">Footer</SheetFooter>
				</SheetContent>
			</Sheet>,
		);
		const footers = screen.getAllByTestId('footer');
		const footer = getVisibleElement(footers);
		expect(footer).toBeInTheDocument();
		expect(footer).toHaveClass('border-t');
		expect(footer).toHaveAttribute('data-slot', 'sheet-footer');
	});

	it('renders SheetTitle', () => {
		render(
			<Sheet defaultOpen>
				<SheetContent>
					<SheetHeader>
						<SheetTitle data-testid="title">Settings</SheetTitle>
					</SheetHeader>
				</SheetContent>
			</Sheet>,
		);
		const titles = screen.getAllByTestId('title');
		const title = getVisibleElement(titles);
		expect(title).toBeInTheDocument();
		expect(title.tagName).toBe('H2');
		expect(title).toHaveClass('text-foreground', 'font-semibold');
		expect(title).toHaveAttribute('data-slot', 'sheet-title');
	});

	it('renders SheetDescription', () => {
		render(
			<Sheet defaultOpen>
				<SheetContent>
					<SheetHeader>
						<SheetDescription data-testid="description">Configure your settings</SheetDescription>
					</SheetHeader>
				</SheetContent>
			</Sheet>,
		);
		const descriptions = screen.getAllByTestId('description');
		const description = getVisibleElement(descriptions);
		expect(description).toBeInTheDocument();
		expect(description.tagName).toBe('P');
		expect(description).toHaveClass('text-muted-foreground', 'text-sm');
		expect(description).toHaveAttribute('data-slot', 'sheet-description');
	});

	it('has glassmorphism backdrop-blur on content', () => {
		render(
			<Sheet defaultOpen>
				<SheetContent data-testid="content">Content</SheetContent>
			</Sheet>,
		);
		const contents = screen.getAllByTestId('content');
		const content = getVisibleElement(contents);
		expect(content).toHaveClass('backdrop-blur-xl');
		expect(content).toHaveClass('bg-background/95');
	});

	it('renders with size sm (default)', () => {
		render(
			<Sheet defaultOpen>
				<SheetContent data-testid="content">Content</SheetContent>
			</Sheet>,
		);
		const contents = screen.getAllByTestId('content');
		const content = getVisibleElement(contents);
		expect(content).toHaveClass('sm:max-w-sm');
	});

	it('renders with size md', () => {
		render(
			<Sheet defaultOpen>
				<SheetContent size="md" data-testid="content">
					Content
				</SheetContent>
			</Sheet>,
		);
		const contents = screen.getAllByTestId('content');
		const content = getVisibleElement(contents);
		expect(content).toHaveClass('sm:max-w-md');
	});

	it('renders with size lg', () => {
		render(
			<Sheet defaultOpen>
				<SheetContent size="lg" data-testid="content">
					Content
				</SheetContent>
			</Sheet>,
		);
		const contents = screen.getAllByTestId('content');
		const content = getVisibleElement(contents);
		expect(content).toHaveClass('sm:max-w-lg');
	});

	it('renders with side left', () => {
		render(
			<Sheet defaultOpen>
				<SheetContent side="left" data-testid="content">
					Content
				</SheetContent>
			</Sheet>,
		);
		const contents = screen.getAllByTestId('content');
		const content = getVisibleElement(contents);
		expect(content).toHaveClass('left-0');
		expect(content).toHaveClass('border-r');
	});

	it('renders complete sheet structure', () => {
		render(
			<Sheet defaultOpen>
				<SheetContent>
					<SheetHeader>
						<SheetTitle>Title</SheetTitle>
						<SheetDescription>Description</SheetDescription>
					</SheetHeader>
					<SheetBody data-testid="body">
						<p>Body content here</p>
					</SheetBody>
					<SheetFooter data-testid="footer">
						<button type="button">Save</button>
					</SheetFooter>
				</SheetContent>
			</Sheet>,
		);
		const bodies = screen.getAllByTestId('body');
		const footers = screen.getAllByTestId('footer');
		const headings = screen.getAllByRole('heading', { name: 'Title' });
		expect(getVisibleElement(bodies)).toBeInTheDocument();
		expect(getVisibleElement(footers)).toBeInTheDocument();
		expect(getVisibleElement(headings)).toBeInTheDocument();
	});
});
