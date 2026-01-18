import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Glass } from '../glass';

describe('Glass', () => {
	it('renders with default props', () => {
		const { container } = render(<Glass>Content</Glass>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="glass-card p-6 rounded-2xl"
			>
			  Content
			</div>
		`);
	});

	it('renders with variant card', () => {
		const { container } = render(<Glass variant="card">Content</Glass>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="glass-card p-6 rounded-2xl"
			>
			  Content
			</div>
		`);
	});

	it('renders with variant panel', () => {
		const { container } = render(<Glass variant="panel">Content</Glass>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="glass-card border-border/40 p-6 rounded-2xl"
			>
			  Content
			</div>
		`);
	});

	it('renders with variant subtle', () => {
		const { container } = render(<Glass variant="subtle">Content</Glass>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="glass-surface p-6 rounded-2xl"
			>
			  Content
			</div>
		`);
	});

	it('renders with variant surface', () => {
		const { container } = render(<Glass variant="surface">Content</Glass>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="glass-surface border-0 p-6 rounded-2xl"
			>
			  Content
			</div>
		`);
	});

	it('renders with padding none', () => {
		const { container } = render(<Glass padding="none">Content</Glass>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="glass-card rounded-2xl"
			>
			  Content
			</div>
		`);
	});

	it('renders with padding sm', () => {
		const { container } = render(<Glass padding="sm">Content</Glass>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="glass-card p-4 rounded-2xl"
			>
			  Content
			</div>
		`);
	});

	it('renders with padding md', () => {
		const { container } = render(<Glass padding="md">Content</Glass>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="glass-card p-6 rounded-2xl"
			>
			  Content
			</div>
		`);
	});

	it('renders with padding lg', () => {
		const { container } = render(<Glass padding="lg">Content</Glass>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="glass-card p-8 rounded-2xl"
			>
			  Content
			</div>
		`);
	});

	it('renders with radius none', () => {
		const { container } = render(<Glass radius="none">Content</Glass>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="glass-card p-6 rounded-none"
			>
			  Content
			</div>
		`);
	});

	it('renders with radius sm', () => {
		const { container } = render(<Glass radius="sm">Content</Glass>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="glass-card p-6 rounded-sm"
			>
			  Content
			</div>
		`);
	});

	it('renders with radius md', () => {
		const { container } = render(<Glass radius="md">Content</Glass>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="glass-card p-6 rounded-md"
			>
			  Content
			</div>
		`);
	});

	it('renders with radius lg', () => {
		const { container } = render(<Glass radius="lg">Content</Glass>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="glass-card p-6 rounded-lg"
			>
			  Content
			</div>
		`);
	});

	it('renders with radius xl', () => {
		const { container } = render(<Glass radius="xl">Content</Glass>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="glass-card p-6 rounded-xl"
			>
			  Content
			</div>
		`);
	});

	it('renders with radius 2xl', () => {
		const { container } = render(<Glass radius="2xl">Content</Glass>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="glass-card p-6 rounded-2xl"
			>
			  Content
			</div>
		`);
	});

	it('renders with interactive mode', () => {
		const { container } = render(<Glass interactive>Content</Glass>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="glass-card p-6 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer"
			>
			  Content
			</div>
		`);
	});

	it('renders with all props combined', () => {
		const { container } = render(
			<Glass variant="subtle" padding="lg" radius="xl" interactive>
				Content
			</Glass>,
		);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="glass-surface p-8 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer"
			>
			  Content
			</div>
		`);
	});

	it('accepts custom className', () => {
		const { container } = render(<Glass className="custom-class">Content</Glass>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="glass-card p-6 rounded-2xl custom-class"
			>
			  Content
			</div>
		`);
	});
});
