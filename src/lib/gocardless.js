/**
 * GoCardless Bank Account Data API Client
 * 
 * Documentation: https://developer.gocardless.com/bank-account-data/overview
 * 
 * Pour obtenir tes credentials:
 * 1. Va sur https://bankaccountdata.gocardless.com/
 * 2. Crée un compte (gratuit jusqu'à 50 connexions)
 * 3. Va dans "User secrets" et crée une clé
 */

const BASE_URL = 'https://bankaccountdata.gocardless.com/api/v2';

// Institutions supportées pour ton setup
export const SUPPORTED_INSTITUTIONS = {
    // Tu devras récupérer les vrais IDs via l'API /institutions/?country=fr
    caisse_epargne_bretagne: {
        name: 'Caisse d\'Épargne Bretagne-Pays de Loire',
        search: 'caisse epargne bretagne'
    },
    cic: {
        name: 'CIC',
        search: 'cic'
    },
    revolut: {
        name: 'Revolut',
        search: 'revolut'
    }
};

export class GoCardlessClient {
    constructor(secretId, secretKey) {
        this.secretId = secretId;
        this.secretKey = secretKey;
        this.accessToken = null;
        this.refreshToken = null;
        this.accessExpiresAt = null;
    }

    // Restore tokens from saved state
    restoreTokens(tokens) {
        this.accessToken = tokens.access_token;
        this.refreshToken = tokens.refresh_token;
        this.accessExpiresAt = new Date(tokens.access_expires_at);
    }

    async authenticate() {
        const response = await fetch(`${BASE_URL}/token/new/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                secret_id: this.secretId,
                secret_key: this.secretKey
            })
        });

        if (!response.ok) {
            throw new Error(`Auth failed: ${response.status} ${await response.text()}`);
        }

        const data = await response.json();
        this.accessToken = data.access;
        this.refreshToken = data.refresh;
        this.accessExpiresAt = new Date(Date.now() + data.access_expires * 1000);

        return {
            access_token: this.accessToken,
            refresh_token: this.refreshToken,
            access_expires_at: this.accessExpiresAt.toISOString(),
            refresh_expires_at: new Date(Date.now() + data.refresh_expires * 1000).toISOString()
        };
    }

    async refreshAccessToken() {
        const response = await fetch(`${BASE_URL}/token/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: this.refreshToken })
        });

        if (!response.ok) {
            // Refresh token expired, need to re-authenticate
            return this.authenticate();
        }

        const data = await response.json();
        this.accessToken = data.access;
        this.accessExpiresAt = new Date(Date.now() + data.access_expires * 1000);

        return {
            access_token: this.accessToken,
            access_expires_at: this.accessExpiresAt.toISOString()
        };
    }

    async ensureValidToken() {
        if (!this.accessToken || new Date() >= this.accessExpiresAt) {
            if (this.refreshToken) {
                await this.refreshAccessToken();
            } else {
                await this.authenticate();
            }
        }
    }

    async request(endpoint, options = {}) {
        await this.ensureValidToken();

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`API Error: ${response.status} ${error}`);
        }

        return response.json();
    }

    // Liste les institutions disponibles en France
    async getInstitutions(country = 'fr') {
        return this.request(`/institutions/?country=${country}`);
    }

    // Trouve une institution par nom
    async findInstitution(searchTerm, country = 'fr') {
        const institutions = await this.getInstitutions(country);
        const term = searchTerm.toLowerCase();
        return institutions.filter(inst => 
            inst.name.toLowerCase().includes(term) ||
            (inst.bic && inst.bic.toLowerCase().includes(term))
        );
    }

    // Crée un agreement (définit la durée d'accès)
    async createAgreement(institutionId, maxHistoricalDays = 90, accessValidForDays = 90) {
        return this.request('/agreements/enduser/', {
            method: 'POST',
            body: JSON.stringify({
                institution_id: institutionId,
                max_historical_days: maxHistoricalDays,
                access_valid_for_days: accessValidForDays,
                access_scope: ['balances', 'details', 'transactions']
            })
        });
    }

    // Crée une requisition (lien pour connecter un compte)
    async createRequisition(institutionId, redirectUrl, reference = null) {
        const body = {
            institution_id: institutionId,
            redirect: redirectUrl
        };
        if (reference) {
            body.reference = reference;
        }

        return this.request('/requisitions/', {
            method: 'POST',
            body: JSON.stringify(body)
        });
    }

    // Récupère le statut d'une requisition
    async getRequisition(requisitionId) {
        return this.request(`/requisitions/${requisitionId}/`);
    }

    // Liste toutes les requisitions
    async listRequisitions() {
        return this.request('/requisitions/');
    }

    // Récupère les détails d'un compte
    async getAccountDetails(accountId) {
        return this.request(`/accounts/${accountId}/details/`);
    }

    // Récupère les soldes d'un compte
    async getAccountBalances(accountId) {
        return this.request(`/accounts/${accountId}/balances/`);
    }

    // Récupère les transactions d'un compte
    async getAccountTransactions(accountId, dateFrom = null, dateTo = null) {
        let endpoint = `/accounts/${accountId}/transactions/`;
        const params = [];
        if (dateFrom) params.push(`date_from=${dateFrom}`);
        if (dateTo) params.push(`date_to=${dateTo}`);
        if (params.length) endpoint += `?${params.join('&')}`;

        return this.request(endpoint);
    }

    // Récupère toutes les infos d'un compte en une fois
    async getFullAccountData(accountId) {
        const [details, balances, transactions] = await Promise.all([
            this.getAccountDetails(accountId).catch(e => ({ error: e.message })),
            this.getAccountBalances(accountId).catch(e => ({ error: e.message })),
            this.getAccountTransactions(accountId).catch(e => ({ error: e.message }))
        ]);

        return { details, balances, transactions };
    }

    // Supprime une requisition (déconnecte le compte)
    async deleteRequisition(requisitionId) {
        return this.request(`/requisitions/${requisitionId}/`, {
            method: 'DELETE'
        });
    }
}

// Helper pour formater les transactions GoCardless vers notre format
export function formatTransaction(gcTransaction, bankAccountId) {
    return {
        id: gcTransaction.transactionId || gcTransaction.internalTransactionId || crypto.randomUUID(),
        bank_account_id: bankAccountId,
        date: gcTransaction.bookingDate || gcTransaction.valueDate,
        amount: parseFloat(gcTransaction.transactionAmount.amount),
        currency: gcTransaction.transactionAmount.currency,
        description: gcTransaction.remittanceInformationUnstructured || 
                     gcTransaction.remittanceInformationStructured ||
                     gcTransaction.additionalInformation || '',
        counterparty: gcTransaction.creditorName || gcTransaction.debtorName || null,
        transaction_type: parseFloat(gcTransaction.transactionAmount.amount) >= 0 ? 'credit' : 'debit',
        raw_data: JSON.stringify(gcTransaction)
    };
}
