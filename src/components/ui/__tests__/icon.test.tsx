import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { IconWrapper, Plus, Search, Wallet } from '../icon';

describe('Icon', () => {
	describe('IconWrapper', () => {
		it('renders with default size and color', () => {
			const { container } = render(<IconWrapper icon={Plus} />);
			expect(container.firstChild).toMatchInlineSnapshot(`
				<svg
				  aria-hidden="true"
				  class="lucide lucide-plus size-5 text-current"
				  fill="none"
				  height="24"
				  stroke="currentColor"
				  stroke-linecap="round"
				  stroke-linejoin="round"
				  stroke-width="2"
				  viewBox="0 0 24 24"
				  width="24"
				  xmlns="http://www.w3.org/2000/svg"
				>
				  <path
				    d="M5 12h14"
				  />
				  <path
				    d="M12 5v14"
				  />
				</svg>
			`);
		});

		it('renders with size xs', () => {
			const { container } = render(<IconWrapper icon={Plus} size="xs" />);
			const svg = container.querySelector('svg');
			expect(svg?.classList.contains('size-3')).toBe(true);
		});

		it('renders with size sm', () => {
			const { container } = render(<IconWrapper icon={Plus} size="sm" />);
			const svg = container.querySelector('svg');
			expect(svg?.classList.contains('size-4')).toBe(true);
		});

		it('renders with size lg', () => {
			const { container } = render(<IconWrapper icon={Plus} size="lg" />);
			const svg = container.querySelector('svg');
			expect(svg?.classList.contains('size-6')).toBe(true);
		});

		it('renders with size xl', () => {
			const { container } = render(<IconWrapper icon={Plus} size="xl" />);
			const svg = container.querySelector('svg');
			expect(svg?.classList.contains('size-8')).toBe(true);
		});

		it('renders with size 2xl', () => {
			const { container } = render(<IconWrapper icon={Plus} size="2xl" />);
			const svg = container.querySelector('svg');
			expect(svg?.classList.contains('size-10')).toBe(true);
		});

		it('renders with color muted', () => {
			const { container } = render(<IconWrapper icon={Plus} color="muted" />);
			const svg = container.querySelector('svg');
			expect(svg?.classList.contains('text-muted-foreground')).toBe(true);
		});

		it('renders with color primary', () => {
			const { container } = render(<IconWrapper icon={Plus} color="primary" />);
			const svg = container.querySelector('svg');
			expect(svg?.classList.contains('text-primary')).toBe(true);
		});

		it('renders with color danger', () => {
			const { container } = render(<IconWrapper icon={Plus} color="danger" />);
			const svg = container.querySelector('svg');
			expect(svg?.classList.contains('text-destructive')).toBe(true);
		});

		it('renders with custom className', () => {
			const { container } = render(<IconWrapper icon={Plus} className="animate-spin" />);
			const svg = container.querySelector('svg');
			expect(svg?.classList.contains('animate-spin')).toBe(true);
		});

		it('renders with aria-label', () => {
			const { container } = render(<IconWrapper icon={Plus} aria-label="Add item" aria-hidden={false} />);
			const svg = container.querySelector('svg');
			expect(svg?.getAttribute('aria-label')).toBe('Add item');
			expect(svg?.getAttribute('aria-hidden')).toBe('false');
		});
	});

	describe('Re-exported icons', () => {
		it('exports Plus icon', () => {
			const { container } = render(<Plus />);
			expect(container.querySelector('svg')).toBeTruthy();
		});

		it('exports Search icon', () => {
			const { container } = render(<Search />);
			expect(container.querySelector('svg')).toBeTruthy();
		});

		it('exports Wallet icon', () => {
			const { container } = render(<Wallet />);
			expect(container.querySelector('svg')).toBeTruthy();
		});
	});
});
