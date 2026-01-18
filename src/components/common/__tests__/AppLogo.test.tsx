import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { AppLogo } from '../AppLogo'

describe('AppLogo', () => {
	afterEach(() => {
		cleanup()
	})

	describe('snapshots', () => {
		it('renders with default name', () => {
			const { container } = render(<AppLogo />)
			expect(container).toMatchSnapshot()
		})

		it('renders with custom name', () => {
			const { container } = render(<AppLogo name="Custom App" />)
			expect(container).toMatchSnapshot()
		})
	})

	describe('behavior', () => {
		it('displays default app name', () => {
			render(<AppLogo />)
			expect(screen.getByText('Imanisa Finance')).toBeInTheDocument()
		})

		it('displays custom app name', () => {
			render(<AppLogo name="My Finance App" />)
			expect(screen.getByText('My Finance App')).toBeInTheDocument()
		})

		it('applies font-semibold class', () => {
			const { container } = render(<AppLogo />)
			const span = container.querySelector('span')
			expect(span).toHaveClass('font-semibold')
		})
	})
})
