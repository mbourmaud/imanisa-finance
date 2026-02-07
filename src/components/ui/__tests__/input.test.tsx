import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Input } from '../input';

describe('Input', () => {
	it('renders with default props', () => {
		const { container } = render(<Input />);
		const input = container.querySelector('input');
		expect(input).toBeInTheDocument();
		expect(input).toHaveAttribute('data-slot', 'input');
	});

	it('renders with size sm', () => {
		const { container } = render(<Input size="sm" />);
		const input = container.querySelector('input');
		expect(input).toHaveClass('h-9', 'text-sm');
	});

	it('renders with size md (default)', () => {
		const { container } = render(<Input size="md" />);
		const input = container.querySelector('input');
		expect(input).toHaveClass('h-10', 'text-base');
	});

	it('renders with size lg', () => {
		const { container } = render(<Input size="lg" />);
		const input = container.querySelector('input');
		expect(input).toHaveClass('h-12', 'text-base');
	});

	it('renders with variant default', () => {
		const { container } = render(<Input variant="default" />);
		const input = container.querySelector('input');
		expect(input).toHaveClass('border-input', 'bg-transparent');
	});

	it('renders with type text', () => {
		const { container } = render(<Input type="text" />);
		const input = container.querySelector('input');
		expect(input).toHaveAttribute('type', 'text');
	});

	it('renders with type password', () => {
		const { container } = render(<Input type="password" />);
		const input = container.querySelector('input');
		expect(input).toHaveAttribute('type', 'password');
	});

	it('renders with placeholder', () => {
		const { container } = render(<Input placeholder="Enter text..." />);
		const input = container.querySelector('input');
		expect(input).toHaveAttribute('placeholder', 'Enter text...');
	});

	it('renders disabled state', () => {
		const { container } = render(<Input disabled />);
		const input = container.querySelector('input');
		expect(input).toBeDisabled();
		expect(input).toHaveClass('disabled:opacity-50');
	});

	it('accepts custom className', () => {
		const { container } = render(<Input className="custom-class" />);
		const input = container.querySelector('input');
		expect(input).toHaveClass('custom-class');
	});

	it('renders with all props combined', () => {
		const { container } = render(<Input size="lg" type="email" placeholder="email@example.com" />);
		const input = container.querySelector('input');
		expect(input).toHaveClass('h-12');
		expect(input).toHaveAttribute('type', 'email');
		expect(input).toHaveAttribute('placeholder', 'email@example.com');
	});
});
