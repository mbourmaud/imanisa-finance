/**
 * Types for scraper services
 */

export interface ScraperResult<T = unknown> {
	success: boolean;
	source: string;
	data?: T;
	error?: string;
	timestamp: Date;
}

export interface BinanceBalance {
	asset: string;
	free: number;
	locked: number;
	total: number;
}

export interface BinanceScraperData {
	spotBalances: BinanceBalance[];
	earnBalances: BinanceBalance[];
	totalInEur: number;
	prices: Map<string, number>;
}

export interface SyncStatus {
	id: string;
	source: string;
	lastSyncAt: Date | null;
	lastSyncStatus: 'success' | 'failure' | 'pending';
	lastError: string | null;
	nextSyncAt: Date | null;
}

export interface ScraperConfig {
	maxRetries: number;
	retryDelays: number[]; // in ms: [5min, 15min, 30min]
}

export const DEFAULT_SCRAPER_CONFIG: ScraperConfig = {
	maxRetries: 3,
	retryDelays: [5 * 60 * 1000, 15 * 60 * 1000, 30 * 60 * 1000]
};
