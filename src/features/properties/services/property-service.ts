/**
 * Property API service layer
 * Handles all HTTP requests for properties
 */

import type {
	CreatePropertyInput,
	PropertyFilters,
	PropertySummary,
	PropertyWithDetails,
	UpdatePropertyInput,
} from '../types';

const API_BASE = '/api/properties';

export interface PropertiesResponse {
	properties: PropertyWithDetails[];
	summary: PropertySummary;
}

export const propertyService = {
	/**
	 * Fetch all properties with optional filters
	 */
	async getAll(filters?: PropertyFilters): Promise<PropertiesResponse> {
		const params = new URLSearchParams();
		if (filters?.type) params.set('type', filters.type);
		if (filters?.usage) params.set('usage', filters.usage);
		if (filters?.search) params.set('search', filters.search);

		const url = params.toString() ? `${API_BASE}?${params}` : API_BASE;
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error('Failed to fetch properties');
		}

		return response.json();
	},

	/**
	 * Fetch a single property by ID
	 */
	async getById(id: string): Promise<PropertyWithDetails> {
		const response = await fetch(`${API_BASE}/${id}`);

		if (!response.ok) {
			throw new Error('Failed to fetch property');
		}

		return response.json();
	},

	/**
	 * Create a new property
	 */
	async create(input: CreatePropertyInput): Promise<PropertyWithDetails> {
		const response = await fetch(API_BASE, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(input),
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || 'Failed to create property');
		}

		return response.json();
	},

	/**
	 * Update an existing property
	 */
	async update(id: string, input: UpdatePropertyInput): Promise<PropertyWithDetails> {
		const response = await fetch(`${API_BASE}/${id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(input),
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || 'Failed to update property');
		}

		return response.json();
	},

	/**
	 * Delete a property
	 */
	async delete(id: string): Promise<void> {
		const response = await fetch(`${API_BASE}/${id}`, {
			method: 'DELETE',
		});

		if (!response.ok) {
			throw new Error('Failed to delete property');
		}
	},
};
