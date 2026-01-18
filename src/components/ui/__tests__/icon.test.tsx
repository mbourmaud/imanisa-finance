import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Icon, IconWrapper, Plus, Search, Wallet } from '../icon';

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

	describe('Icon (name-based)', () => {
		it('renders icon by name with default size and color', () => {
			const { container } = render(<Icon name="plus" />);
			const svg = container.querySelector('svg');
			expect(svg).toBeTruthy();
			expect(svg?.classList.contains('size-5')).toBe(true);
			expect(svg?.classList.contains('text-current')).toBe(true);
		});

		it('renders icon with size xs', () => {
			const { container } = render(<Icon name="search" size="xs" />);
			const svg = container.querySelector('svg');
			expect(svg?.classList.contains('size-3')).toBe(true);
		});

		it('renders icon with size sm', () => {
			const { container } = render(<Icon name="search" size="sm" />);
			const svg = container.querySelector('svg');
			expect(svg?.classList.contains('size-4')).toBe(true);
		});

		it('renders icon with size lg', () => {
			const { container } = render(<Icon name="search" size="lg" />);
			const svg = container.querySelector('svg');
			expect(svg?.classList.contains('size-6')).toBe(true);
		});

		it('renders icon with size xl', () => {
			const { container } = render(<Icon name="search" size="xl" />);
			const svg = container.querySelector('svg');
			expect(svg?.classList.contains('size-8')).toBe(true);
		});

		it('renders icon with size 2xl', () => {
			const { container } = render(<Icon name="search" size="2xl" />);
			const svg = container.querySelector('svg');
			expect(svg?.classList.contains('size-10')).toBe(true);
		});

		it('renders icon with color muted', () => {
			const { container } = render(<Icon name="wallet" color="muted" />);
			const svg = container.querySelector('svg');
			expect(svg?.classList.contains('text-muted-foreground')).toBe(true);
		});

		it('renders icon with color primary', () => {
			const { container } = render(<Icon name="wallet" color="primary" />);
			const svg = container.querySelector('svg');
			expect(svg?.classList.contains('text-primary')).toBe(true);
		});

		it('renders icon with color danger', () => {
			const { container } = render(<Icon name="wallet" color="danger" />);
			const svg = container.querySelector('svg');
			expect(svg?.classList.contains('text-destructive')).toBe(true);
		});

		it('renders icon with color inherit (no color class)', () => {
			const { container } = render(<Icon name="wallet" color="inherit" />);
			const svg = container.querySelector('svg');
			expect(svg?.classList.contains('text-current')).toBe(false);
			expect(svg?.classList.contains('text-muted-foreground')).toBe(false);
		});

		it('renders icon with custom className', () => {
			const { container } = render(<Icon name="plus" className="animate-spin" />);
			const svg = container.querySelector('svg');
			expect(svg?.classList.contains('animate-spin')).toBe(true);
		});

		it('renders icon with aria-label', () => {
			const { container } = render(<Icon name="plus" aria-label="Add item" aria-hidden={false} />);
			const svg = container.querySelector('svg');
			expect(svg?.getAttribute('aria-label')).toBe('Add item');
			expect(svg?.getAttribute('aria-hidden')).toBe('false');
		});

		it('renders various kebab-case icon names', () => {
			const iconNames = [
				'alert-circle',
				'arrow-right',
				'chevron-down',
				'credit-card',
				'trending-up',
			] as const;

			iconNames.forEach((name) => {
				const { container } = render(<Icon name={name} />);
				expect(container.querySelector('svg')).toBeTruthy();
			});
		});

		it('returns null and warns for unknown icon name', () => {
			const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
			// @ts-expect-error - testing invalid icon name
			const { container } = render(<Icon name="unknown-icon" />);
			expect(container.firstChild).toBeNull();
			expect(consoleSpy).toHaveBeenCalledWith('Icon "unknown-icon" not found in icon map');
			consoleSpy.mockRestore();
		});
	});
});
