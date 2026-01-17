import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Textarea } from '../textarea';
import { Checkbox } from '../checkbox';
import { Switch } from '../switch';

describe('Textarea', () => {
	it('renders with default props', () => {
		const { container } = render(<Textarea />);
		const textarea = container.querySelector('textarea');
		expect(textarea).toBeInTheDocument();
		expect(textarea).toHaveAttribute('data-slot', 'textarea');
	});

	it('renders with size sm', () => {
		const { container } = render(<Textarea size="sm" />);
		const textarea = container.querySelector('textarea');
		expect(textarea).toHaveClass('min-h-[80px]', 'text-xs');
	});

	it('renders with size md (default)', () => {
		const { container } = render(<Textarea size="md" />);
		const textarea = container.querySelector('textarea');
		expect(textarea).toHaveClass('min-h-[100px]', 'text-sm');
	});

	it('renders with size lg', () => {
		const { container } = render(<Textarea size="lg" />);
		const textarea = container.querySelector('textarea');
		expect(textarea).toHaveClass('min-h-[120px]', 'text-base');
	});

	it('renders with variant glass', () => {
		const { container } = render(<Textarea variant="glass" />);
		const textarea = container.querySelector('textarea');
		expect(textarea).toHaveClass('border-border/50', 'bg-background/50', 'backdrop-blur-sm');
	});

	it('renders disabled state', () => {
		const { container } = render(<Textarea disabled />);
		const textarea = container.querySelector('textarea');
		expect(textarea).toBeDisabled();
	});
});

describe('Checkbox', () => {
	it('renders with default props', () => {
		const { container } = render(<Checkbox />);
		const checkbox = container.querySelector('button');
		expect(checkbox).toBeInTheDocument();
		expect(checkbox).toHaveAttribute('data-slot', 'checkbox');
	});

	it('renders with size sm', () => {
		const { container } = render(<Checkbox size="sm" />);
		const checkbox = container.querySelector('button');
		expect(checkbox).toHaveClass('h-3.5', 'w-3.5');
	});

	it('renders with size md (default)', () => {
		const { container } = render(<Checkbox size="md" />);
		const checkbox = container.querySelector('button');
		expect(checkbox).toHaveClass('h-4', 'w-4');
	});

	it('renders with size lg', () => {
		const { container } = render(<Checkbox size="lg" />);
		const checkbox = container.querySelector('button');
		expect(checkbox).toHaveClass('h-5', 'w-5');
	});

	it('renders disabled state', () => {
		const { container } = render(<Checkbox disabled />);
		const checkbox = container.querySelector('button');
		expect(checkbox).toBeDisabled();
	});

	it('has transition animation', () => {
		const { container } = render(<Checkbox />);
		const checkbox = container.querySelector('button');
		expect(checkbox).toHaveClass('transition-colors', 'duration-150');
	});
});

describe('Switch', () => {
	it('renders with default props', () => {
		const { container } = render(<Switch />);
		const switchEl = container.querySelector('button');
		expect(switchEl).toBeInTheDocument();
		expect(switchEl).toHaveAttribute('data-slot', 'switch');
	});

	it('renders with size sm', () => {
		const { container } = render(<Switch size="sm" />);
		const switchEl = container.querySelector('button');
		expect(switchEl).toHaveClass('h-4', 'w-7');
	});

	it('renders with size md (default)', () => {
		const { container } = render(<Switch size="md" />);
		const switchEl = container.querySelector('button');
		expect(switchEl).toHaveClass('h-5', 'w-9');
	});

	it('renders with size lg', () => {
		const { container } = render(<Switch size="lg" />);
		const switchEl = container.querySelector('button');
		expect(switchEl).toHaveClass('h-6', 'w-11');
	});

	it('renders disabled state', () => {
		const { container } = render(<Switch disabled />);
		const switchEl = container.querySelector('button');
		expect(switchEl).toBeDisabled();
	});

	it('has transition animation', () => {
		const { container } = render(<Switch />);
		const switchEl = container.querySelector('button');
		expect(switchEl).toHaveClass('transition-colors', 'duration-200');
	});

	it('has thumb element', () => {
		const { container } = render(<Switch />);
		const thumb = container.querySelector('[data-slot="switch-thumb"]');
		expect(thumb).toBeInTheDocument();
	});
});
