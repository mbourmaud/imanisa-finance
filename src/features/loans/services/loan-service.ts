/**
 * Loan API service layer
 * Handles all HTTP requests for loans
 */

import type {
	LoanWithDetails,
	LoansResponse,
	LoanFilters,
	CreateLoanInput,
	UpdateLoanInput,
} from '../types'

const API_BASE = '/api/loans'

export const loanService = {
	/**
	 * Fetch all loans with optional filters
	 */
	async getAll(filters?: LoanFilters): Promise<LoansResponse> {
		const params = new URLSearchParams()
		if (filters?.propertyId) params.set('propertyId', filters.propertyId)
		if (filters?.memberId) params.set('memberId', filters.memberId)

		const url = params.toString() ? `${API_BASE}?${params}` : API_BASE
		const response = await fetch(url)

		if (!response.ok) {
			throw new Error('Failed to fetch loans')
		}

		return response.json()
	},

	/**
	 * Fetch loans for a specific property
	 */
	async getByProperty(propertyId: string): Promise<LoansResponse> {
		const response = await fetch(`/api/properties/${propertyId}/loans`)

		if (!response.ok) {
			throw new Error('Failed to fetch property loans')
		}

		return response.json()
	},

	/**
	 * Fetch a single loan by ID
	 */
	async getById(id: string): Promise<LoanWithDetails> {
		const response = await fetch(`${API_BASE}/${id}`)

		if (!response.ok) {
			throw new Error('Failed to fetch loan')
		}

		return response.json()
	},

	/**
	 * Create a new loan for a property
	 */
	async create(propertyId: string, input: CreateLoanInput): Promise<LoanWithDetails> {
		const response = await fetch(`/api/properties/${propertyId}/loans`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(input),
		})

		if (!response.ok) {
			const error = await response.json()
			throw new Error(error.error || 'Failed to create loan')
		}

		return response.json()
	},

	/**
	 * Update an existing loan
	 */
	async update(id: string, input: UpdateLoanInput): Promise<LoanWithDetails> {
		const response = await fetch(`${API_BASE}/${id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(input),
		})

		if (!response.ok) {
			const error = await response.json()
			throw new Error(error.error || 'Failed to update loan')
		}

		return response.json()
	},

	/**
	 * Delete a loan
	 */
	async delete(id: string): Promise<void> {
		const response = await fetch(`${API_BASE}/${id}`, {
			method: 'DELETE',
		})

		if (!response.ok) {
			throw new Error('Failed to delete loan')
		}
	},
}
