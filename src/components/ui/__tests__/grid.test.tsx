import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Grid } from '../grid';

describe('Grid', () => {
	it('renders with default props', () => {
		const { container } = render(<Grid>Content</Grid>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="grid grid-cols-1 gap-4"
			>
			  Content
			</div>
		`);
	});

	it('renders with cols 2', () => {
		const { container } = render(<Grid cols={2}>Content</Grid>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="grid grid-cols-2 gap-4"
			>
			  Content
			</div>
		`);
	});

	it('renders with cols 3', () => {
		const { container } = render(<Grid cols={3}>Content</Grid>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="grid grid-cols-3 gap-4"
			>
			  Content
			</div>
		`);
	});

	it('renders with cols 4', () => {
		const { container } = render(<Grid cols={4}>Content</Grid>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="grid grid-cols-4 gap-4"
			>
			  Content
			</div>
		`);
	});

	it('renders with cols 12', () => {
		const { container } = render(<Grid cols={12}>Content</Grid>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="grid grid-cols-12 gap-4"
			>
			  Content
			</div>
		`);
	});

	it('renders with responsive columns', () => {
		const { container } = render(
			<Grid cols={1} colsSm={2} colsMd={3} colsLg={4} colsXl={6}>
				Content
			</Grid>,
		);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
			>
			  Content
			</div>
		`);
	});

	it('renders with gap none', () => {
		const { container } = render(<Grid gap="none">Content</Grid>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="grid grid-cols-1 gap-0"
			>
			  Content
			</div>
		`);
	});

	it('renders with gap xs', () => {
		const { container } = render(<Grid gap="xs">Content</Grid>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="grid grid-cols-1 gap-1"
			>
			  Content
			</div>
		`);
	});

	it('renders with gap sm', () => {
		const { container } = render(<Grid gap="sm">Content</Grid>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="grid grid-cols-1 gap-2"
			>
			  Content
			</div>
		`);
	});

	it('renders with gap lg', () => {
		const { container } = render(<Grid gap="lg">Content</Grid>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="grid grid-cols-1 gap-6"
			>
			  Content
			</div>
		`);
	});

	it('renders with gap xl', () => {
		const { container } = render(<Grid gap="xl">Content</Grid>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="grid grid-cols-1 gap-8"
			>
			  Content
			</div>
		`);
	});

	it('renders with gap 2xl', () => {
		const { container } = render(<Grid gap="2xl">Content</Grid>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="grid grid-cols-1 gap-12"
			>
			  Content
			</div>
		`);
	});

	it('renders with separate gapX and gapY', () => {
		const { container } = render(
			<Grid gapX="lg" gapY="sm">
				Content
			</Grid>,
		);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="grid grid-cols-1 gap-x-6 gap-y-2"
			>
			  Content
			</div>
		`);
	});

	it('accepts custom className', () => {
		const { container } = render(<Grid className="custom-class">Content</Grid>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="grid grid-cols-1 gap-4 custom-class"
			>
			  Content
			</div>
		`);
	});
});
