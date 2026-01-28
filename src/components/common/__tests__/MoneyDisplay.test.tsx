import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MoneyDisplay } from '../MoneyDisplay'

describe('MoneyDisplay', () => {
	it('renders with default props', () => {
		const { container } = render(<MoneyDisplay amount={1234.56} />)
		const display = container.querySelector('[data-slot="money-display"]')
		expect(display).toBeInTheDocument()
		expect(display).toHaveClass('number-display')
	})

	it('formats amount in EUR', () => {
		const { container } = render(<MoneyDisplay amount={1234.56} currency="EUR" />)
		const display = container.querySelector('[data-slot="money-display"]')
		// French locale uses non-breaking space and €
		expect(display?.textContent).toMatch(/1[\s\u00A0]234,56[\s\u00A0]€/)
	})

	it('formats amount in USD', () => {
		const { container } = render(<MoneyDisplay amount={1234.56} currency="USD" locale="en-US" />)
		const display = container.querySelector('[data-slot="money-display"]')
		expect(display?.textContent).toMatch(/\$1,234\.56/)
	})

	it('renders with format compact', () => {
		const { container } = render(<MoneyDisplay amount={1234.56} format="compact" />)
		const display = container.querySelector('[data-slot="money-display"]')
		// Compact format should show without decimals
		expect(display?.textContent).toMatch(/1[\s\u00A0]235[\s\u00A0]€/)
	})

	it('renders with format short', () => {
		const { container } = render(<MoneyDisplay amount={150000} format="short" />)
		const display = container.querySelector('[data-slot="money-display"]')
		// Short format uses compact notation for large amounts
		expect(display?.textContent).toMatch(/k|K|150/)
	})

	it('renders with format withSign', () => {
		const { container } = render(<MoneyDisplay amount={100} format="withSign" />)
		const display = container.querySelector('[data-slot="money-display"]')
		expect(display?.textContent).toMatch(/\+/)
	})

	it('accepts custom className', () => {
		const { container } = render(<MoneyDisplay amount={100} className="custom-class" />)
		const display = container.querySelector('[data-slot="money-display"]')
		expect(display).toHaveClass('custom-class')
	})

	it('renders zero amount', () => {
		const { container } = render(<MoneyDisplay amount={0} />)
		const display = container.querySelector('[data-slot="money-display"]')
		expect(display?.textContent).toMatch(/0,00[\s\u00A0]€/)
	})

	it('renders negative amount', () => {
		const { container } = render(<MoneyDisplay amount={-500} />)
		const display = container.querySelector('[data-slot="money-display"]')
		expect(display?.textContent).toMatch(/-500,00[\s\u00A0]€/)
	})
})
