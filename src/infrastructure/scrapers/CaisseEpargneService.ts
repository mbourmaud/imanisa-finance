/**
 * Caisse d'Épargne Scraper Service
 * Handles authentication with virtual keyboard and mobile validation detection
 */

import type { ScraperResult } from './types';

// CE Account types
export type CEAccountType = 'CE_PERSO' | 'CE_SCI';

// CE Balance structure
export interface CEAccount {
	id: string;
	name: string;
	type: string; // CHECKING, SAVINGS, etc.
	balance: number;
	currency: string;
}

export interface CEScraperData {
	accounts: CEAccount[];
	totalBalance: number;
	lastUpdate: Date;
}

// Virtual keyboard mapping for CE
interface VirtualKeyboardMap {
	[key: string]: { row: number; col: number };
}

// Auth result type
export type CEAuthResult =
	| { success: true }
	| { success: false; error: string; requires2FA?: boolean };

// CE API endpoints
const CE_BASE_URL = 'https://www.caisse-epargne.fr';
const CE_API_URL = 'https://www.caisse-epargne.fr/espace-client';

// CE uses regional URLs, we'll detect automatically
const CE_REGIONS = [
	'www.caisse-epargne.fr',
	'www.ceidf.caisse-epargne.fr', // Ile-de-France
	'www.nord-france-europe.caisse-epargne.fr',
	'www.rhone-alpes.caisse-epargne.fr',
	'www.provence-alpes-corse.caisse-epargne.fr'
];

export class CaisseEpargneService {
	private credentials: { username: string; password: string } | null = null;
	private accountType: CEAccountType;
	private sessionCookies: string[] = [];
	private csrfToken: string | null = null;

	constructor(accountType: CEAccountType, username?: string, password?: string) {
		this.accountType = accountType;
		if (username && password) {
			this.credentials = { username, password };
		}
	}

	isConfigured(): boolean {
		return this.credentials !== null;
	}

	getAccountType(): CEAccountType {
		return this.accountType;
	}

	getSourceName(): string {
		return this.accountType === 'CE_PERSO' ? 'CE Perso' : 'CE SCI';
	}

	/**
	 * Simulate virtual keyboard click positions
	 * CE uses a randomized virtual keyboard where digits are at different positions each time
	 */
	private async getVirtualKeyboardMapping(keyboardHtml: string): Promise<VirtualKeyboardMap> {
		// Parse the virtual keyboard HTML to extract button positions
		// The keyboard typically has a 4x4 or 5x4 grid with digits 0-9
		const mapping: VirtualKeyboardMap = {};

		// Parse button elements from HTML
		// CE format: <a id="btn_xxx" data-val="X">X</a> or similar
		const buttonRegex = /data-val="(\d)"/g;
		const positionRegex = /id="btn_(\d+)"/g;

		let buttonMatch;
		let positionMatch;
		const buttons: Array<{ value: string; id: string }> = [];

		// Find all buttons with their values
		const buttonMatches = keyboardHtml.matchAll(/<a[^>]*data-val="(\d)"[^>]*id="([^"]+)"/g);
		for (const match of buttonMatches) {
			buttons.push({ value: match[1], id: match[2] });
		}

		// Alternative pattern matching for different keyboard formats
		if (buttons.length === 0) {
			const altMatches = keyboardHtml.matchAll(/id="([^"]+)"[^>]*data-val="(\d)"/g);
			for (const match of altMatches) {
				buttons.push({ value: match[2], id: match[1] });
			}
		}

		// Map values to their positions
		for (let i = 0; i < buttons.length; i++) {
			const btn = buttons[i];
			mapping[btn.value] = {
				row: Math.floor(i / 4),
				col: i % 4
			};
		}

		return mapping;
	}

	/**
	 * Convert password to virtual keyboard click sequence
	 */
	private encodePasswordWithKeyboard(
		password: string,
		keyboardMapping: VirtualKeyboardMap
	): string[] {
		const clicks: string[] = [];
		for (const digit of password) {
			const pos = keyboardMapping[digit];
			if (pos) {
				clicks.push(`${pos.row},${pos.col}`);
			}
		}
		return clicks;
	}

	/**
	 * Detect if mobile validation (2FA) is required
	 */
	private detectMobileValidation(responseHtml: string): boolean {
		const mobileValidationIndicators = [
			'validation mobile',
			'valider sur votre mobile',
			'confirmer sur votre application',
			'Sécurimobile',
			'notification mobile',
			'code de validation',
			'validation en cours',
			'en attente de validation'
		];

		const lowerHtml = responseHtml.toLowerCase();
		return mobileValidationIndicators.some((indicator) => lowerHtml.includes(indicator.toLowerCase()));
	}

	/**
	 * Detect authentication errors
	 */
	private detectAuthError(responseHtml: string): string | null {
		const errorIndicators = [
			{ pattern: 'identifiant incorrect', message: 'Identifiant incorrect' },
			{ pattern: 'mot de passe incorrect', message: 'Mot de passe incorrect' },
			{ pattern: 'compte bloqué', message: 'Compte bloqué - contactez votre agence' },
			{ pattern: 'trop de tentatives', message: 'Trop de tentatives - compte temporairement bloqué' },
			{ pattern: 'erreur technique', message: 'Erreur technique CE' },
			{ pattern: 'service indisponible', message: 'Service temporairement indisponible' }
		];

		const lowerHtml = responseHtml.toLowerCase();
		for (const { pattern, message } of errorIndicators) {
			if (lowerHtml.includes(pattern)) {
				return message;
			}
		}
		return null;
	}

	/**
	 * Perform login with virtual keyboard handling
	 */
	private async login(): Promise<CEAuthResult> {
		if (!this.credentials) {
			return { success: false, error: 'Credentials not configured' };
		}

		try {
			// Step 1: Get login page and CSRF token
			console.log(`[${this.getSourceName()}] Fetching login page...`);

			const loginPageResponse = await fetch(`${CE_BASE_URL}/espace-client/`, {
				headers: {
					'User-Agent':
						'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
					Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
					'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8'
				}
			});

			if (!loginPageResponse.ok) {
				return { success: false, error: `Failed to load login page: ${loginPageResponse.status}` };
			}

			// Store cookies from response
			const setCookies = loginPageResponse.headers.getSetCookie();
			this.sessionCookies = setCookies;

			const loginPageHtml = await loginPageResponse.text();

			// Extract CSRF token if present
			const csrfMatch = loginPageHtml.match(/name="_csrf"[^>]*value="([^"]+)"/);
			if (csrfMatch) {
				this.csrfToken = csrfMatch[1];
			}

			// Step 2: Get virtual keyboard
			console.log(`[${this.getSourceName()}] Fetching virtual keyboard...`);

			const keyboardResponse = await fetch(`${CE_BASE_URL}/espace-client/api/keyboard`, {
				headers: {
					'User-Agent':
						'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
					Cookie: this.sessionCookies.join('; '),
					Referer: `${CE_BASE_URL}/espace-client/`
				}
			});

			let keyboardMapping: VirtualKeyboardMap = {};

			if (keyboardResponse.ok) {
				const keyboardData = await keyboardResponse.text();
				keyboardMapping = await this.getVirtualKeyboardMapping(keyboardData);
			} else {
				// Keyboard might be embedded in the page or use a different endpoint
				keyboardMapping = await this.getVirtualKeyboardMapping(loginPageHtml);
			}

			// Step 3: Submit login with encoded password
			console.log(`[${this.getSourceName()}] Submitting credentials...`);

			const passwordClicks = this.encodePasswordWithKeyboard(
				this.credentials.password,
				keyboardMapping
			);

			const loginData = new URLSearchParams();
			loginData.append('username', this.credentials.username);
			loginData.append('password', passwordClicks.join('|'));
			if (this.csrfToken) {
				loginData.append('_csrf', this.csrfToken);
			}

			const loginResponse = await fetch(`${CE_BASE_URL}/espace-client/login`, {
				method: 'POST',
				headers: {
					'User-Agent':
						'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
					'Content-Type': 'application/x-www-form-urlencoded',
					Cookie: this.sessionCookies.join('; '),
					Referer: `${CE_BASE_URL}/espace-client/`
				},
				body: loginData.toString(),
				redirect: 'manual'
			});

			// Update session cookies
			const newCookies = loginResponse.headers.getSetCookie();
			if (newCookies.length > 0) {
				this.sessionCookies = [...this.sessionCookies, ...newCookies];
			}

			// Step 4: Check response for success/2FA/error
			const responseHtml = await loginResponse.text();

			// Check for mobile validation requirement
			if (this.detectMobileValidation(responseHtml)) {
				console.log(`[${this.getSourceName()}] Mobile validation required`);
				return {
					success: false,
					error: 'Validation mobile requise - veuillez confirmer sur votre application',
					requires2FA: true
				};
			}

			// Check for authentication errors
			const authError = this.detectAuthError(responseHtml);
			if (authError) {
				console.error(`[${this.getSourceName()}] Auth error: ${authError}`);
				return { success: false, error: authError };
			}

			// Check if we're redirected to the account page (success)
			if (
				loginResponse.status === 302 ||
				responseHtml.includes('mes-comptes') ||
				responseHtml.includes('synthese')
			) {
				console.log(`[${this.getSourceName()}] Login successful`);
				return { success: true };
			}

			// Unknown state
			return { success: false, error: 'État de connexion inconnu' };
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			console.error(`[${this.getSourceName()}] Login error:`, errorMessage);
			return { success: false, error: errorMessage };
		}
	}

	/**
	 * Fetch account balances after successful login
	 */
	private async fetchAccounts(): Promise<CEAccount[]> {
		try {
			console.log(`[${this.getSourceName()}] Fetching accounts...`);

			const accountsResponse = await fetch(`${CE_BASE_URL}/espace-client/api/comptes`, {
				headers: {
					'User-Agent':
						'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
					Cookie: this.sessionCookies.join('; '),
					Accept: 'application/json'
				}
			});

			if (!accountsResponse.ok) {
				// Try alternative endpoint
				const altResponse = await fetch(`${CE_BASE_URL}/espace-client/mes-comptes/synthese`, {
					headers: {
						'User-Agent':
							'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
						Cookie: this.sessionCookies.join('; '),
						Accept: 'text/html,application/json'
					}
				});

				if (!altResponse.ok) {
					throw new Error(`Failed to fetch accounts: ${altResponse.status}`);
				}

				// Parse HTML response for account data
				const html = await altResponse.text();
				return this.parseAccountsFromHtml(html);
			}

			const data = await accountsResponse.json();
			return this.parseAccountsFromJson(data);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			console.error(`[${this.getSourceName()}] Failed to fetch accounts:`, errorMessage);
			throw error;
		}
	}

	/**
	 * Parse accounts from JSON API response
	 */
	private parseAccountsFromJson(data: Record<string, unknown>): CEAccount[] {
		const accounts: CEAccount[] = [];

		// CE API typically returns accounts in a structure like:
		// { comptes: [{ id, libelle, solde, devise, typeCompte }] }
		const comptesArray = (data.comptes || data.accounts || []) as Array<Record<string, unknown>>;

		for (const compte of comptesArray) {
			accounts.push({
				id: String(compte.id || compte.numero || ''),
				name: String(compte.libelle || compte.name || ''),
				type: this.mapAccountType(String(compte.typeCompte || compte.type || '')),
				balance: Number(compte.solde || compte.balance || 0),
				currency: String(compte.devise || compte.currency || 'EUR')
			});
		}

		return accounts;
	}

	/**
	 * Parse accounts from HTML page (fallback)
	 */
	private parseAccountsFromHtml(html: string): CEAccount[] {
		const accounts: CEAccount[] = [];

		// Look for account patterns in HTML
		// CE typically displays accounts in a table or card format
		const accountRegex =
			/<div[^>]*class="[^"]*compte[^"]*"[^>]*>[\s\S]*?<span[^>]*class="[^"]*libelle[^"]*"[^>]*>([^<]+)<\/span>[\s\S]*?<span[^>]*class="[^"]*solde[^"]*"[^>]*>([^<]+)<\/span>/gi;

		let match;
		let index = 0;
		while ((match = accountRegex.exec(html)) !== null) {
			const name = match[1].trim();
			const balanceStr = match[2].trim().replace(/[^\d,.-]/g, '').replace(',', '.');
			const balance = parseFloat(balanceStr) || 0;

			accounts.push({
				id: `compte-${index++}`,
				name,
				type: this.inferAccountType(name),
				balance,
				currency: 'EUR'
			});
		}

		// Alternative pattern for different page layouts
		if (accounts.length === 0) {
			const altRegex = /data-compte-id="([^"]+)"[^>]*data-solde="([^"]+)"[^>]*data-libelle="([^"]+)"/gi;
			while ((match = altRegex.exec(html)) !== null) {
				accounts.push({
					id: match[1],
					name: match[3],
					type: this.inferAccountType(match[3]),
					balance: parseFloat(match[2].replace(',', '.')) || 0,
					currency: 'EUR'
				});
			}
		}

		return accounts;
	}

	/**
	 * Map CE account type to standard type
	 */
	private mapAccountType(ceType: string): string {
		const typeMap: Record<string, string> = {
			COURANT: 'CHECKING',
			EPARGNE: 'SAVINGS',
			LIVRET: 'SAVINGS',
			'LIVRET A': 'SAVINGS',
			LDD: 'SAVINGS',
			LDDS: 'SAVINGS',
			PEL: 'SAVINGS',
			CEL: 'SAVINGS',
			PEA: 'PEA',
			CTO: 'CTO',
			'ASSURANCE VIE': 'LIFE_INSURANCE'
		};

		const upperType = ceType.toUpperCase();
		return typeMap[upperType] || 'OTHER';
	}

	/**
	 * Infer account type from name
	 */
	private inferAccountType(name: string): string {
		const lowerName = name.toLowerCase();

		if (lowerName.includes('courant') || lowerName.includes('principal')) return 'CHECKING';
		if (lowerName.includes('livret a')) return 'SAVINGS';
		if (lowerName.includes('ldd') || lowerName.includes('ldds')) return 'SAVINGS';
		if (lowerName.includes('pel') || lowerName.includes('cel')) return 'SAVINGS';
		if (lowerName.includes('livret') || lowerName.includes('épargne')) return 'SAVINGS';
		if (lowerName.includes('pea')) return 'PEA';
		if (lowerName.includes('cto') || lowerName.includes('titre')) return 'CTO';
		if (lowerName.includes('assurance vie')) return 'LIFE_INSURANCE';

		return 'OTHER';
	}

	/**
	 * Main scrape method
	 */
	async scrape(): Promise<ScraperResult<CEScraperData>> {
		const source = this.getSourceName();

		if (!this.isConfigured()) {
			return {
				success: false,
				source,
				error: `${source} non configuré`,
				timestamp: new Date()
			};
		}

		try {
			// Step 1: Login
			console.log(`[${source}] Starting scrape...`);
			const loginResult = await this.login();

			if (!loginResult.success) {
				return {
					success: false,
					source,
					error: loginResult.error,
					timestamp: new Date(),
					// Include 2FA flag in the result for special handling
					data: loginResult.requires2FA
						? ({ requires2FA: true } as unknown as CEScraperData)
						: undefined
				};
			}

			// Step 2: Fetch accounts
			const accounts = await this.fetchAccounts();

			if (accounts.length === 0) {
				return {
					success: false,
					source,
					error: 'Aucun compte trouvé',
					timestamp: new Date()
				};
			}

			// Calculate total balance
			const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

			console.log(`[${source}] Found ${accounts.length} accounts, total: ${totalBalance.toFixed(2)} EUR`);

			return {
				success: true,
				source,
				data: {
					accounts,
					totalBalance,
					lastUpdate: new Date()
				},
				timestamp: new Date()
			};
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			console.error(`[${source}] Scrape failed:`, errorMessage);

			return {
				success: false,
				source,
				error: errorMessage,
				timestamp: new Date()
			};
		}
	}
}

/**
 * Factory function to create CE services
 */
export function createCEPersoService(username?: string, password?: string): CaisseEpargneService {
	return new CaisseEpargneService('CE_PERSO', username, password);
}

export function createCESCIService(username?: string, password?: string): CaisseEpargneService {
	return new CaisseEpargneService('CE_SCI', username, password);
}
