import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Heading, Text } from '../typography';

describe('Heading', () => {
	it('renders with default props (h2)', () => {
		const { container } = render(<Heading>Title</Heading>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<h2
			  class="tracking-tight text-2xl md:text-3xl text-foreground font-semibold"
			>
			  Title
			</h2>
		`);
	});

	it('renders h1', () => {
		const { container } = render(<Heading level={1}>Title</Heading>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<h1
			  class="tracking-tight text-3xl md:text-4xl text-foreground font-semibold"
			>
			  Title
			</h1>
		`);
	});

	it('renders h2', () => {
		const { container } = render(<Heading level={2}>Title</Heading>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<h2
			  class="tracking-tight text-2xl md:text-3xl text-foreground font-semibold"
			>
			  Title
			</h2>
		`);
	});

	it('renders h3', () => {
		const { container } = render(<Heading level={3}>Title</Heading>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<h3
			  class="tracking-tight text-xl md:text-2xl text-foreground font-semibold"
			>
			  Title
			</h3>
		`);
	});

	it('renders h4', () => {
		const { container } = render(<Heading level={4}>Title</Heading>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<h4
			  class="tracking-tight text-lg md:text-xl text-foreground font-semibold"
			>
			  Title
			</h4>
		`);
	});

	it('renders h5', () => {
		const { container } = render(<Heading level={5}>Title</Heading>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<h5
			  class="tracking-tight text-base md:text-lg text-foreground font-semibold"
			>
			  Title
			</h5>
		`);
	});

	it('renders h6', () => {
		const { container } = render(<Heading level={6}>Title</Heading>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<h6
			  class="tracking-tight text-sm md:text-base text-foreground font-semibold"
			>
			  Title
			</h6>
		`);
	});

	it('renders with size override xs', () => {
		const { container } = render(<Heading size="xs">Title</Heading>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<h2
			  class="tracking-tight text-xs text-foreground font-semibold"
			>
			  Title
			</h2>
		`);
	});

	it('renders with size override sm', () => {
		const { container } = render(<Heading size="sm">Title</Heading>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<h2
			  class="tracking-tight text-sm text-foreground font-semibold"
			>
			  Title
			</h2>
		`);
	});

	it('renders with size override lg', () => {
		const { container } = render(<Heading size="lg">Title</Heading>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<h2
			  class="tracking-tight text-lg text-foreground font-semibold"
			>
			  Title
			</h2>
		`);
	});

	it('renders with size override xl', () => {
		const { container } = render(<Heading size="xl">Title</Heading>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<h2
			  class="tracking-tight text-xl text-foreground font-semibold"
			>
			  Title
			</h2>
		`);
	});

	it('renders with size override 2xl', () => {
		const { container } = render(<Heading size="2xl">Title</Heading>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<h2
			  class="tracking-tight text-2xl text-foreground font-semibold"
			>
			  Title
			</h2>
		`);
	});

	it('renders with size override 3xl', () => {
		const { container } = render(<Heading size="3xl">Title</Heading>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<h2
			  class="tracking-tight text-3xl text-foreground font-semibold"
			>
			  Title
			</h2>
		`);
	});

	it('renders with size override 4xl', () => {
		const { container } = render(<Heading size="4xl">Title</Heading>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<h2
			  class="tracking-tight text-4xl text-foreground font-semibold"
			>
			  Title
			</h2>
		`);
	});

	it('accepts custom className', () => {
		const { container } = render(<Heading className="custom-class">Title</Heading>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<h2
			  class="tracking-tight text-2xl md:text-3xl text-foreground font-semibold custom-class"
			>
			  Title
			</h2>
		`);
	});
});

describe('Text', () => {
	it('renders with default props', () => {
		const { container } = render(<Text>Content</Text>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<p
			  class=""
			>
			  Content
			</p>
		`);
	});

	it('renders with variant muted', () => {
		const { container } = render(<Text variant="muted">Content</Text>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<p
			  class="text-sm text-muted-foreground"
			>
			  Content
			</p>
		`);
	});

	it('renders with variant lead', () => {
		const { container } = render(<Text variant="lead">Content</Text>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<p
			  class="text-lg text-muted-foreground"
			>
			  Content
			</p>
		`);
	});

	it('renders with variant small', () => {
		const { container } = render(<Text variant="small">Content</Text>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<p
			  class="text-sm"
			>
			  Content
			</p>
		`);
	});

	it('renders with variant mono', () => {
		const { container } = render(<Text variant="mono">Content</Text>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<p
			  class="font-mono text-sm"
			>
			  Content
			</p>
		`);
	});

	it('renders with color muted', () => {
		const { container } = render(<Text color="muted">Content</Text>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<p
			  class="text-base text-muted-foreground"
			>
			  Content
			</p>
		`);
	});

	it('renders with color primary', () => {
		const { container } = render(<Text color="primary">Content</Text>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<p
			  class="text-base text-primary"
			>
			  Content
			</p>
		`);
	});

	it('renders with color success', () => {
		const { container } = render(<Text color="success">Content</Text>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<p
			  class="text-base text-[oklch(0.55_0.18_145)]"
			>
			  Content
			</p>
		`);
	});

	it('renders with color danger', () => {
		const { container } = render(<Text color="danger">Content</Text>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<p
			  class="text-base text-destructive"
			>
			  Content
			</p>
		`);
	});

	it('renders as span', () => {
		const { container } = render(<Text asSpan>Content</Text>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<span
			  class=""
			>
			  Content
			</span>
		`);
	});

	it('renders variant and color together', () => {
		const { container } = render(
			<Text variant="small" color="primary">
				Content
			</Text>
		);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<p
			  class="text-base text-primary"
			>
			  Content
			</p>
		`);
	});

	it('accepts custom className', () => {
		const { container } = render(<Text className="custom-class">Content</Text>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<p
			  class="custom-class"
			>
			  Content
			</p>
		`);
	});
});
