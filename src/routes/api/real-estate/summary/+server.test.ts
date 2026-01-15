import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the repository before importing the handler
vi.mock('@infrastructure/repositories/RealEstateRepository', () => ({
	getRealEstateSummary: vi.fn()
}));

import { GET } from './+server';
import { getRealEstateSummary } from '@infrastructure/repositories/RealEstateRepository';

describe('GET /api/real-estate/summary', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return real estate summary with correct structure', async () => {
		vi.mocked(getRealEstateSummary).mockResolvedValue({
			totalValue: 500000,
			totalDebt: 300000,
			netEquity: 200000,
			propertyCount: 2
		});

		const response = await GET({ request: new Request('http://localhost') } as Parameters<
			typeof GET
		>[0]);
		const data = await response.json();

		expect(data).toMatchInlineSnapshot(`
			{
			  "net_equity": 200000,
			  "property_count": 2,
			  "total_debt": 300000,
			  "total_value": 500000,
			}
		`);
	});

	it('should return zeros when no properties exist', async () => {
		vi.mocked(getRealEstateSummary).mockResolvedValue({
			totalValue: 0,
			totalDebt: 0,
			netEquity: 0,
			propertyCount: 0
		});

		const response = await GET({ request: new Request('http://localhost') } as Parameters<
			typeof GET
		>[0]);
		const data = await response.json();

		expect(data).toMatchInlineSnapshot(`
			{
			  "net_equity": 0,
			  "property_count": 0,
			  "total_debt": 0,
			  "total_value": 0,
			}
		`);
	});

	it('should handle positive equity (more value than debt)', async () => {
		vi.mocked(getRealEstateSummary).mockResolvedValue({
			totalValue: 1000000,
			totalDebt: 400000,
			netEquity: 600000,
			propertyCount: 3
		});

		const response = await GET({ request: new Request('http://localhost') } as Parameters<
			typeof GET
		>[0]);
		const data = await response.json();

		expect(data.net_equity).toBe(600000);
		expect(data.net_equity).toBe(data.total_value - data.total_debt);
	});

	it('should handle fully paid properties (no debt)', async () => {
		vi.mocked(getRealEstateSummary).mockResolvedValue({
			totalValue: 250000,
			totalDebt: 0,
			netEquity: 250000,
			propertyCount: 1
		});

		const response = await GET({ request: new Request('http://localhost') } as Parameters<
			typeof GET
		>[0]);
		const data = await response.json();

		expect(data.total_debt).toBe(0);
		expect(data.net_equity).toBe(data.total_value);
	});
});
