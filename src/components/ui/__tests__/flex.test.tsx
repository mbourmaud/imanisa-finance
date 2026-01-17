import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Flex } from '../flex';

describe('Flex', () => {
	it('renders with default props', () => {
		const { container } = render(<Flex>Content</Flex>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="flex flex-row gap-4"
			>
			  Content
			</div>
		`);
	});

	it('renders with direction col', () => {
		const { container } = render(<Flex direction="col">Content</Flex>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="flex flex-col gap-4"
			>
			  Content
			</div>
		`);
	});

	it('renders with direction row-reverse', () => {
		const { container } = render(<Flex direction="row-reverse">Content</Flex>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="flex flex-row-reverse gap-4"
			>
			  Content
			</div>
		`);
	});

	it('renders with direction col-reverse', () => {
		const { container } = render(<Flex direction="col-reverse">Content</Flex>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="flex flex-col-reverse gap-4"
			>
			  Content
			</div>
		`);
	});

	it('renders with responsive direction', () => {
		const { container } = render(
			<Flex direction="col" directionSm="row" directionMd="row" directionLg="row">
				Content
			</Flex>
		);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="flex flex-col sm:flex-row md:flex-row lg:flex-row gap-4"
			>
			  Content
			</div>
		`);
	});

	it('renders with align center', () => {
		const { container } = render(<Flex align="center">Content</Flex>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="flex flex-row items-center gap-4"
			>
			  Content
			</div>
		`);
	});

	it('renders with align start', () => {
		const { container } = render(<Flex align="start">Content</Flex>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="flex flex-row items-start gap-4"
			>
			  Content
			</div>
		`);
	});

	it('renders with align end', () => {
		const { container } = render(<Flex align="end">Content</Flex>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="flex flex-row items-end gap-4"
			>
			  Content
			</div>
		`);
	});

	it('renders with align stretch', () => {
		const { container } = render(<Flex align="stretch">Content</Flex>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="flex flex-row items-stretch gap-4"
			>
			  Content
			</div>
		`);
	});

	it('renders with align baseline', () => {
		const { container } = render(<Flex align="baseline">Content</Flex>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="flex flex-row items-baseline gap-4"
			>
			  Content
			</div>
		`);
	});

	it('renders with justify center', () => {
		const { container } = render(<Flex justify="center">Content</Flex>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="flex flex-row justify-center gap-4"
			>
			  Content
			</div>
		`);
	});

	it('renders with justify between', () => {
		const { container } = render(<Flex justify="between">Content</Flex>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="flex flex-row justify-between gap-4"
			>
			  Content
			</div>
		`);
	});

	it('renders with justify around', () => {
		const { container } = render(<Flex justify="around">Content</Flex>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="flex flex-row justify-around gap-4"
			>
			  Content
			</div>
		`);
	});

	it('renders with justify evenly', () => {
		const { container } = render(<Flex justify="evenly">Content</Flex>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="flex flex-row justify-evenly gap-4"
			>
			  Content
			</div>
		`);
	});

	it('renders with wrap', () => {
		const { container } = render(<Flex wrap="wrap">Content</Flex>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="flex flex-row flex-wrap gap-4"
			>
			  Content
			</div>
		`);
	});

	it('renders with wrap nowrap', () => {
		const { container } = render(<Flex wrap="nowrap">Content</Flex>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="flex flex-row flex-nowrap gap-4"
			>
			  Content
			</div>
		`);
	});

	it('renders with wrap wrap-reverse', () => {
		const { container } = render(<Flex wrap="wrap-reverse">Content</Flex>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="flex flex-row flex-wrap-reverse gap-4"
			>
			  Content
			</div>
		`);
	});

	it('renders with gap none', () => {
		const { container } = render(<Flex gap="none">Content</Flex>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="flex flex-row gap-0"
			>
			  Content
			</div>
		`);
	});

	it('renders with gap xs', () => {
		const { container } = render(<Flex gap="xs">Content</Flex>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="flex flex-row gap-1"
			>
			  Content
			</div>
		`);
	});

	it('renders with gap sm', () => {
		const { container } = render(<Flex gap="sm">Content</Flex>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="flex flex-row gap-2"
			>
			  Content
			</div>
		`);
	});

	it('renders with gap lg', () => {
		const { container } = render(<Flex gap="lg">Content</Flex>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="flex flex-row gap-6"
			>
			  Content
			</div>
		`);
	});

	it('renders with gap xl', () => {
		const { container } = render(<Flex gap="xl">Content</Flex>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="flex flex-row gap-8"
			>
			  Content
			</div>
		`);
	});

	it('renders with gap 2xl', () => {
		const { container } = render(<Flex gap="2xl">Content</Flex>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="flex flex-row gap-12"
			>
			  Content
			</div>
		`);
	});

	it('renders as inline-flex', () => {
		const { container } = render(<Flex inline>Content</Flex>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="inline-flex flex-row gap-4"
			>
			  Content
			</div>
		`);
	});

	it('renders with all props combined', () => {
		const { container } = render(
			<Flex direction="col" align="center" justify="between" wrap="wrap" gap="lg">
				Content
			</Flex>
		);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="flex flex-col items-center justify-between flex-wrap gap-6"
			>
			  Content
			</div>
		`);
	});

	it('accepts custom className', () => {
		const { container } = render(<Flex className="custom-class">Content</Flex>);
		expect(container.firstChild).toMatchInlineSnapshot(`
			<div
			  class="flex flex-row gap-4 custom-class"
			>
			  Content
			</div>
		`);
	});
});
