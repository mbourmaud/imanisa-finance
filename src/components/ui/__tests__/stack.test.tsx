import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Spacer } from '../spacer';
import { HStack, VStack } from '../stack';

describe('VStack', () => {
	it('renders with default props', () => {
		const { container } = render(<VStack>Content</VStack>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="flex flex-col gap-4"
			>
			  Content
			</div>
		`);
	});

	it('renders with gap none', () => {
		const { container } = render(<VStack gap="none">Content</VStack>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="flex flex-col gap-0"
			>
			  Content
			</div>
		`);
	});

	it('renders with gap xs', () => {
		const { container } = render(<VStack gap="xs">Content</VStack>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="flex flex-col gap-1"
			>
			  Content
			</div>
		`);
	});

	it('renders with gap sm', () => {
		const { container } = render(<VStack gap="sm">Content</VStack>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="flex flex-col gap-2"
			>
			  Content
			</div>
		`);
	});

	it('renders with gap lg', () => {
		const { container } = render(<VStack gap="lg">Content</VStack>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="flex flex-col gap-6"
			>
			  Content
			</div>
		`);
	});

	it('renders with gap xl', () => {
		const { container } = render(<VStack gap="xl">Content</VStack>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="flex flex-col gap-8"
			>
			  Content
			</div>
		`);
	});

	it('renders with gap 2xl', () => {
		const { container } = render(<VStack gap="2xl">Content</VStack>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="flex flex-col gap-12"
			>
			  Content
			</div>
		`);
	});

	it('renders with align start', () => {
		const { container } = render(<VStack align="start">Content</VStack>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="flex flex-col gap-4 items-start"
			>
			  Content
			</div>
		`);
	});

	it('renders with align center', () => {
		const { container } = render(<VStack align="center">Content</VStack>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="flex flex-col gap-4 items-center"
			>
			  Content
			</div>
		`);
	});

	it('renders with align end', () => {
		const { container } = render(<VStack align="end">Content</VStack>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="flex flex-col gap-4 items-end"
			>
			  Content
			</div>
		`);
	});

	it('renders with align stretch', () => {
		const { container } = render(<VStack align="stretch">Content</VStack>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="flex flex-col gap-4 items-stretch"
			>
			  Content
			</div>
		`);
	});

	it('accepts custom className', () => {
		const { container } = render(<VStack className="custom-class">Content</VStack>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="flex flex-col gap-4 custom-class"
			>
			  Content
			</div>
		`);
	});
});

describe('HStack', () => {
	it('renders with default props', () => {
		const { container } = render(<HStack>Content</HStack>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="flex flex-row gap-4 items-center"
			>
			  Content
			</div>
		`);
	});

	it('renders with gap none', () => {
		const { container } = render(<HStack gap="none">Content</HStack>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="flex flex-row gap-0 items-center"
			>
			  Content
			</div>
		`);
	});

	it('renders with gap xs', () => {
		const { container } = render(<HStack gap="xs">Content</HStack>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="flex flex-row gap-1 items-center"
			>
			  Content
			</div>
		`);
	});

	it('renders with gap sm', () => {
		const { container } = render(<HStack gap="sm">Content</HStack>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="flex flex-row gap-2 items-center"
			>
			  Content
			</div>
		`);
	});

	it('renders with gap lg', () => {
		const { container } = render(<HStack gap="lg">Content</HStack>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="flex flex-row gap-6 items-center"
			>
			  Content
			</div>
		`);
	});

	it('renders with gap xl', () => {
		const { container } = render(<HStack gap="xl">Content</HStack>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="flex flex-row gap-8 items-center"
			>
			  Content
			</div>
		`);
	});

	it('renders with gap 2xl', () => {
		const { container } = render(<HStack gap="2xl">Content</HStack>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="flex flex-row gap-12 items-center"
			>
			  Content
			</div>
		`);
	});

	it('renders with align start', () => {
		const { container } = render(<HStack align="start">Content</HStack>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="flex flex-row gap-4 items-start"
			>
			  Content
			</div>
		`);
	});

	it('renders with align center', () => {
		const { container } = render(<HStack align="center">Content</HStack>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="flex flex-row gap-4 items-center"
			>
			  Content
			</div>
		`);
	});

	it('renders with align end', () => {
		const { container } = render(<HStack align="end">Content</HStack>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="flex flex-row gap-4 items-end"
			>
			  Content
			</div>
		`);
	});

	it('renders with align stretch', () => {
		const { container } = render(<HStack align="stretch">Content</HStack>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="flex flex-row gap-4 items-stretch"
			>
			  Content
			</div>
		`);
	});

	it('renders with align baseline', () => {
		const { container } = render(<HStack align="baseline">Content</HStack>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="flex flex-row gap-4 items-baseline"
			>
			  Content
			</div>
		`);
	});

	it('renders with wrap', () => {
		const { container } = render(<HStack wrap>Content</HStack>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="flex flex-row gap-4 items-center flex-wrap"
			>
			  Content
			</div>
		`);
	});

	it('accepts custom className', () => {
		const { container } = render(<HStack className="custom-class">Content</HStack>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="flex flex-row gap-4 items-center custom-class"
			>
			  Content
			</div>
		`);
	});
});

describe('Spacer', () => {
	it('renders with default props', () => {
		const { container } = render(<Spacer />);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  aria-hidden="true"
			  class="flex-shrink-0"
			  style="flex-grow: 1;"
			/>
		`);
	});

	it('renders with custom grow value', () => {
		const { container } = render(<Spacer grow={2} />);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  aria-hidden="true"
			  class="flex-shrink-0"
			  style="flex-grow: 2;"
			/>
		`);
	});

	it('accepts custom className', () => {
		const { container } = render(<Spacer className="custom-class" />);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  aria-hidden="true"
			  class="flex-shrink-0 custom-class"
			  style="flex-grow: 1;"
			/>
		`);
	});

	it('renders inside HStack to push content', () => {
		const { container } = render(
			<HStack>
				<span>Left</span>
				<Spacer />
				<span>Right</span>
			</HStack>,
		);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="flex flex-row gap-4 items-center"
			>
			  <span>
			    Left
			  </span>
			  <div
			    aria-hidden="true"
			    class="flex-shrink-0"
			    style="flex-grow: 1;"
			  />
			  <span>
			    Right
			  </span>
			</div>
		`);
	});
});
