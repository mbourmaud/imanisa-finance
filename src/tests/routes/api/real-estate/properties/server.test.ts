import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the repository before importing the handler
vi.mock('@infrastructure/repositories/RealEstateRepository', () => ({
	getPropertiesWithLoans: vi.fn()
}));

import { GET } from '@routes/api/real-estate/properties/+server';
import { getPropertiesWithLoans } from '@infrastructure/repositories/RealEstateRepository';

describe('GET /api/real-estate/properties', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return empty array when no properties exist', async () => {
		vi.mocked(getPropertiesWithLoans).mockResolvedValue([]);

		const response = await GET({ request: new Request('http://localhost') } as Parameters<
			typeof GET
		>[0]);
		const data = await response.json();

		expect(data).toMatchInlineSnapshot(`[]`);
	});

	it('should return property with correct structure', async () => {
		vi.mocked(getPropertiesWithLoans).mockResolvedValue([
			{
				id: 'prop-1',
				name: 'Appartement Paris 11',
				type: 'apartment',
				category: 'rental',
				address: '123 rue de la République',
				city: 'Paris',
				postalCode: '75011',
				surfaceM2: 45,
				rooms: 2,
				dpeRating: 'C',
				estimatedValue: 350000,
				purchasePrice: 300000,
				isRented: true,
				monthlyRent: 1200,
				loan: {
					id: 'loan-1',
					name: 'Crédit immo Paris',
					bankName: 'Crédit Mutuel',
					principalAmount: 250000,
					interestRate: 1.5,
					monthlyPayment: 850,
					currentBalance: 180000
				}
			}
		]);

		const response = await GET({ request: new Request('http://localhost') } as Parameters<
			typeof GET
		>[0]);
		const data = await response.json();

		expect(data).toHaveLength(1);
		expect(data[0]).toMatchInlineSnapshot(`
			{
			  "address": "123 rue de la République",
			  "category": "rental",
			  "city": "Paris",
			  "dpe_rating": "C",
			  "estimated_value": 350000,
			  "id": "prop-1",
			  "is_rented": true,
			  "loan": {
			    "bank_name": "Crédit Mutuel",
			    "current_balance": 180000,
			    "id": "loan-1",
			    "interest_rate": 1.5,
			    "monthly_payment": 850,
			    "name": "Crédit immo Paris",
			    "principal_amount": 250000,
			  },
			  "monthly_rent": 1200,
			  "name": "Appartement Paris 11",
			  "postal_code": "75011",
			  "purchase_price": 300000,
			  "rooms": 2,
			  "surface_m2": 45,
			  "type": "apartment",
			}
		`);
	});

	it('should handle property without loan', async () => {
		vi.mocked(getPropertiesWithLoans).mockResolvedValue([
			{
				id: 'prop-2',
				name: 'Maison secondaire',
				type: 'house',
				category: 'primary',
				address: '456 chemin des Vignes',
				city: 'Bordeaux',
				postalCode: '33000',
				surfaceM2: 120,
				rooms: 5,
				dpeRating: 'B',
				estimatedValue: 450000,
				purchasePrice: 400000,
				isRented: false,
				monthlyRent: null,
				loan: null
			}
		]);

		const response = await GET({ request: new Request('http://localhost') } as Parameters<
			typeof GET
		>[0]);
		const data = await response.json();

		expect(data[0].loan).toBeNull();
		expect(data[0].monthly_rent).toBeNull();
		expect(data[0].is_rented).toBe(false);
	});

	it('should return multiple properties', async () => {
		vi.mocked(getPropertiesWithLoans).mockResolvedValue([
			{
				id: 'prop-1',
				name: 'Appartement 1',
				type: 'apartment',
				category: 'rental',
				address: 'Addr 1',
				city: 'Paris',
				postalCode: '75001',
				surfaceM2: 30,
				rooms: 1,
				dpeRating: 'D',
				estimatedValue: 200000,
				purchasePrice: 180000,
				isRented: true,
				monthlyRent: 800,
				loan: null
			},
			{
				id: 'prop-2',
				name: 'Appartement 2',
				type: 'apartment',
				category: 'rental',
				address: 'Addr 2',
				city: 'Lyon',
				postalCode: '69001',
				surfaceM2: 50,
				rooms: 2,
				dpeRating: 'C',
				estimatedValue: 180000,
				purchasePrice: 150000,
				isRented: true,
				monthlyRent: 700,
				loan: {
					id: 'loan-2',
					name: 'Prêt Lyon',
					bankName: 'LCL',
					principalAmount: 100000,
					interestRate: 2,
					monthlyPayment: 500,
					currentBalance: 75000
				}
			}
		]);

		const response = await GET({ request: new Request('http://localhost') } as Parameters<
			typeof GET
		>[0]);
		const data = await response.json();

		expect(data).toHaveLength(2);
		expect(data[0].name).toBe('Appartement 1');
		expect(data[0].loan).toBeNull();
		expect(data[1].name).toBe('Appartement 2');
		expect(data[1].loan).not.toBeNull();
	});

	it('should handle all DPE ratings', async () => {
		const dpeRatings = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
		vi.mocked(getPropertiesWithLoans).mockResolvedValue(
			dpeRatings.map((dpe, idx) => ({
				id: `prop-${idx}`,
				name: `Property ${idx}`,
				type: 'apartment',
				category: 'rental',
				address: `Address ${idx}`,
				city: 'City',
				postalCode: '00000',
				surfaceM2: 50,
				rooms: 2,
				dpeRating: dpe,
				estimatedValue: 100000,
				purchasePrice: 90000,
				isRented: false,
				monthlyRent: null,
				loan: null
			}))
		);

		const response = await GET({ request: new Request('http://localhost') } as Parameters<
			typeof GET
		>[0]);
		const data = await response.json();

		expect(data).toHaveLength(7);
		const returnedDpes = data.map((p: { dpe_rating: string }) => p.dpe_rating);
		expect(returnedDpes).toEqual(dpeRatings);
	});
});
