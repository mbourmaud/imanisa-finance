import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Container, Page, Section } from '../layout';

describe('Container', () => {
	it('renders with default props', () => {
		const { container } = render(<Container>Content</Container>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="max-w-screen-xl mx-auto px-4 sm:px-6"
			>
			  Content
			</div>
		`);
	});

	it('renders with maxWidth sm', () => {
		const { container } = render(<Container maxWidth="sm">Content</Container>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="max-w-screen-sm mx-auto px-4 sm:px-6"
			>
			  Content
			</div>
		`);
	});

	it('renders with maxWidth full', () => {
		const { container } = render(<Container maxWidth="full">Content</Container>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="max-w-full mx-auto px-4 sm:px-6"
			>
			  Content
			</div>
		`);
	});

	it('renders without centering', () => {
		const { container } = render(<Container centered={false}>Content</Container>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="max-w-screen-xl px-4 sm:px-6"
			>
			  Content
			</div>
		`);
	});

	it('renders without padding', () => {
		const { container } = render(<Container padded={false}>Content</Container>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="max-w-screen-xl mx-auto"
			>
			  Content
			</div>
		`);
	});

	it('accepts custom className', () => {
		const { container } = render(<Container className="custom-class">Content</Container>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="max-w-screen-xl mx-auto px-4 sm:px-6 custom-class"
			>
			  Content
			</div>
		`);
	});
});

describe('Section', () => {
	it('renders with default props', () => {
		const { container } = render(<Section>Content</Section>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<section
			  class="py-6"
			>
			  Content
			</section>
		`);
	});

	it('renders with title', () => {
		const { container } = render(<Section title="Section Title">Content</Section>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<section
			  class="py-6"
			>
			  <div
			    class="mb-4"
			  >
			    <h2
			      class="text-lg font-semibold tracking-tight"
			    >
			      Section Title
			    </h2>
			  </div>
			  Content
			</section>
		`);
	});

	it('renders with title and description', () => {
		const { container } = render(
			<Section title="Title" description="Description text">
				Content
			</Section>,
		);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<section
			  class="py-6"
			>
			  <div
			    class="mb-4"
			  >
			    <h2
			      class="text-lg font-semibold tracking-tight"
			    >
			      Title
			    </h2>
			    <p
			      class="mt-1 text-sm text-muted-foreground"
			    >
			      Description text
			    </p>
			  </div>
			  Content
			</section>
		`);
	});

	it('renders with spacing sm', () => {
		const { container } = render(<Section spacing="sm">Content</Section>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<section
			  class="py-4"
			>
			  Content
			</section>
		`);
	});

	it('renders with spacing lg', () => {
		const { container } = render(<Section spacing="lg">Content</Section>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<section
			  class="py-8"
			>
			  Content
			</section>
		`);
	});

	it('renders with spacing xl', () => {
		const { container } = render(<Section spacing="xl">Content</Section>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<section
			  class="py-12"
			>
			  Content
			</section>
		`);
	});

	it('renders with spacing none', () => {
		const { container } = render(<Section spacing="none">Content</Section>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<section
			  class=""
			>
			  Content
			</section>
		`);
	});

	it('renders as div', () => {
		const { container } = render(<Section as="div">Content</Section>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="py-6"
			>
			  Content
			</div>
		`);
	});

	it('renders as article', () => {
		const { container } = render(<Section as="article">Content</Section>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<article
			  class="py-6"
			>
			  Content
			</article>
		`);
	});
});

describe('Page', () => {
	it('renders with default props', () => {
		const { container } = render(<Page>Content</Page>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<main
			  class="flex-1 overflow-y-auto scrollbar-thin py-6"
			>
			  Content
			</main>
		`);
	});

	it('renders with title for accessibility', () => {
		const { container } = render(<Page title="Dashboard">Content</Page>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<main
			  aria-label="Dashboard"
			  class="flex-1 overflow-y-auto scrollbar-thin py-6"
			>
			  Content
			</main>
		`);
	});

	it('renders without scrolling', () => {
		const { container } = render(<Page scrollable={false}>Content</Page>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<main
			  class="flex-1 py-6"
			>
			  Content
			</main>
		`);
	});

	it('renders without padding', () => {
		const { container } = render(<Page padded={false}>Content</Page>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<main
			  class="flex-1 overflow-y-auto scrollbar-thin"
			>
			  Content
			</main>
		`);
	});

	it('accepts custom className', () => {
		const { container } = render(<Page className="bg-background">Content</Page>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<main
			  class="flex-1 overflow-y-auto scrollbar-thin py-6 bg-background"
			>
			  Content
			</main>
		`);
	});
});
