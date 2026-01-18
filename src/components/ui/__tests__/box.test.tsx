import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Box } from '../box';

describe('Box', () => {
	describe('basic rendering', () => {
		it('renders as div by default', () => {
			const { container } = render(<Box>Content</Box>);
			expect(container.firstChild?.nodeName).toBe('DIV');
		});

		it('renders as section', () => {
			const { container } = render(<Box as="section">Content</Box>);
			expect(container.firstChild?.nodeName).toBe('SECTION');
		});

		it('renders as article', () => {
			const { container } = render(<Box as="article">Content</Box>);
			expect(container.firstChild?.nodeName).toBe('ARTICLE');
		});

		it('renders as span', () => {
			const { container } = render(<Box as="span">Content</Box>);
			expect(container.firstChild?.nodeName).toBe('SPAN');
		});
	});

	describe('display prop', () => {
		it('renders with display block', () => {
			const { container } = render(<Box display="block">Content</Box>);
			expect(container.firstChild).toMatchInlineSnapshot(`
				<div
				  class="block"
				>
				  Content
				</div>
			`);
		});

		it('renders with display flex', () => {
			const { container } = render(<Box display="flex">Content</Box>);
			expect(container.firstChild).toMatchInlineSnapshot(`
				<div
				  class="flex"
				>
				  Content
				</div>
			`);
		});

		it('renders with display grid', () => {
			const { container } = render(<Box display="grid">Content</Box>);
			expect(container.firstChild).toMatchInlineSnapshot(`
				<div
				  class="grid"
				>
				  Content
				</div>
			`);
		});

		it('renders with display hidden', () => {
			const { container } = render(<Box display="hidden">Content</Box>);
			expect(container.firstChild).toMatchInlineSnapshot(`
				<div
				  class="hidden"
				>
				  Content
				</div>
			`);
		});
	});

	describe('padding props', () => {
		it('renders with padding all sides', () => {
			const { container } = render(<Box p="md">Content</Box>);
			expect(container.firstChild).toMatchInlineSnapshot(`
				<div
				  class="p-4"
				>
				  Content
				</div>
			`);
		});

		it('renders with padding x and y', () => {
			const { container } = render(
				<Box px="lg" py="sm">
					Content
				</Box>
			);
			expect(container.firstChild).toMatchInlineSnapshot(`
				<div
				  class="px-6 py-2"
				>
				  Content
				</div>
			`);
		});

		it('renders with individual padding', () => {
			const { container } = render(
				<Box pt="xs" pr="sm" pb="md" pl="lg">
					Content
				</Box>
			);
			expect(container.firstChild).toMatchInlineSnapshot(`
				<div
				  class="pt-1 pr-2 pb-4 pl-6"
				>
				  Content
				</div>
			`);
		});
	});

	describe('margin props', () => {
		it('renders with margin all sides', () => {
			const { container } = render(<Box m="md">Content</Box>);
			expect(container.firstChild).toMatchInlineSnapshot(`
				<div
				  class="m-4"
				>
				  Content
				</div>
			`);
		});

		it('renders with margin x and y', () => {
			const { container } = render(
				<Box mx="lg" my="sm">
					Content
				</Box>
			);
			expect(container.firstChild).toMatchInlineSnapshot(`
				<div
				  class="mx-6 my-2"
				>
				  Content
				</div>
			`);
		});
	});

	describe('visual props', () => {
		it('renders with background', () => {
			const { container } = render(<Box bg="muted">Content</Box>);
			expect(container.firstChild).toMatchInlineSnapshot(`
				<div
				  class="bg-muted"
				>
				  Content
				</div>
			`);
		});

		it('renders with border', () => {
			const { container } = render(<Box border="default">Content</Box>);
			expect(container.firstChild).toMatchInlineSnapshot(`
				<div
				  class="border border-border"
				>
				  Content
				</div>
			`);
		});

		it('renders with rounded', () => {
			const { container } = render(<Box rounded="lg">Content</Box>);
			expect(container.firstChild).toMatchInlineSnapshot(`
				<div
				  class="rounded-lg"
				>
				  Content
				</div>
			`);
		});

		it('renders with shadow', () => {
			const { container } = render(<Box shadow="md">Content</Box>);
			expect(container.firstChild).toMatchInlineSnapshot(`
				<div
				  class="shadow-md"
				>
				  Content
				</div>
			`);
		});
	});

	describe('sizing props', () => {
		it('renders with fullWidth', () => {
			const { container } = render(<Box fullWidth>Content</Box>);
			expect(container.firstChild).toMatchInlineSnapshot(`
				<div
				  class="w-full"
				>
				  Content
				</div>
			`);
		});

		it('renders with fullHeight', () => {
			const { container } = render(<Box fullHeight>Content</Box>);
			expect(container.firstChild).toMatchInlineSnapshot(`
				<div
				  class="h-full"
				>
				  Content
				</div>
			`);
		});

		it('renders with grow', () => {
			const { container } = render(<Box grow>Content</Box>);
			expect(container.firstChild).toMatchInlineSnapshot(`
				<div
				  class="flex-1"
				>
				  Content
				</div>
			`);
		});

		it('renders with shrink disabled', () => {
			const { container } = render(<Box shrink={false}>Content</Box>);
			expect(container.firstChild).toMatchInlineSnapshot(`
				<div
				  class="flex-shrink-0"
				>
				  Content
				</div>
			`);
		});
	});

	describe('position and overflow', () => {
		it('renders with position relative', () => {
			const { container } = render(<Box position="relative">Content</Box>);
			expect(container.firstChild).toMatchInlineSnapshot(`
				<div
				  class="relative"
				>
				  Content
				</div>
			`);
		});

		it('renders with overflow hidden', () => {
			const { container } = render(<Box overflow="hidden">Content</Box>);
			expect(container.firstChild).toMatchInlineSnapshot(`
				<div
				  class="overflow-hidden"
				>
				  Content
				</div>
			`);
		});
	});

	describe('combined props', () => {
		it('renders with multiple props', () => {
			const { container } = render(
				<Box
					p="md"
					bg="card"
					border="default"
					rounded="lg"
					shadow="sm"
				>
					Card Content
				</Box>
			);
			expect(container.firstChild).toMatchInlineSnapshot(`
				<div
				  class="p-4 bg-card border border-border rounded-lg shadow-sm"
				>
				  Card Content
				</div>
			`);
		});

		it('renders a typical card-like box', () => {
			const { container } = render(
				<Box
					as="section"
					p="lg"
					bg="muted"
					rounded="xl"
					fullWidth
					position="relative"
				>
					Section Content
				</Box>
			);
			expect(container.firstChild).toMatchInlineSnapshot(`
				<section
				  class="relative p-6 bg-muted rounded-xl w-full"
				>
				  Section Content
				</section>
			`);
		});
	});

	describe('cursor and transition', () => {
		it('renders with cursor pointer', () => {
			const { container } = render(<Box cursor="pointer">Content</Box>);
			expect(container.firstChild).toMatchInlineSnapshot(`
				<div
				  class="cursor-pointer"
				>
				  Content
				</div>
			`);
		});

		it('renders with transition', () => {
			const { container } = render(<Box transition>Content</Box>);
			expect(container.firstChild).toMatchInlineSnapshot(`
				<div
				  class="transition-all"
				>
				  Content
				</div>
			`);
		});
	});
});
