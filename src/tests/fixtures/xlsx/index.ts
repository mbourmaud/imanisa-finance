import { utils, write } from 'xlsx';

/**
 * Create a test XLSX file for Bourse Direct parser
 * Format: Nom,ISIN,Cours,Devise,Variation Veille %,Quantité,PRU (EUR),+/- value (EUR),+/- value %,Valorisation (EUR),Réglement,MIC,Marché
 */
export function createBourseDirectXLSX(): ArrayBuffer {
	const data = [
		{
			Nom: 'LVMH',
			ISIN: 'FR0000121014',
			Cours: 850.5,
			Devise: 'EUR',
			'Variation Veille %': 1.5,
			'Quantité': 10,
			'PRU (EUR)': 750,
			'+/- value (EUR)': 1005,
			'+/- value %': 13.4,
			'Valorisation (EUR)': 8505,
			'Réglement': 'SRD',
			MIC: 'XPAR',
			'Marché': 'Euronext Paris'
		},
		{
			Nom: 'Total Energies',
			ISIN: 'FR0000120271',
			Cours: 62.3,
			Devise: 'EUR',
			'Variation Veille %': -0.5,
			'Quantité': 50,
			'PRU (EUR)': 55,
			'+/- value (EUR)': 365,
			'+/- value %': 13.27,
			'Valorisation (EUR)': 3115,
			'Réglement': 'Comptant',
			MIC: 'XPAR',
			'Marché': 'Euronext Paris'
		},
		{
			Nom: 'Air Liquide',
			ISIN: 'FR0000120073',
			Cours: 175.2,
			Devise: 'EUR',
			'Variation Veille %': 0.8,
			'Quantité': 0, // Zero quantity should be skipped
			'PRU (EUR)': 160,
			'+/- value (EUR)': 0,
			'+/- value %': 0,
			'Valorisation (EUR)': 0,
			'Réglement': 'Comptant',
			MIC: 'XPAR',
			'Marché': 'Euronext Paris'
		}
	];

	const worksheet = utils.json_to_sheet(data);
	const workbook = utils.book_new();
	utils.book_append_sheet(workbook, worksheet, 'Portefeuille');

	return write(workbook, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer;
}

/**
 * Create a test XLSX file for Linxea parser
 * Format: Placement,N° Contrat,Titulaire,Produit,Catégorie,Sous-catégorie,Nom du support,ISIN,Nbre de parts,Dernière cotation,Date,Somme en Compte,Plus ou Moins Value,Prix de Revient Moyen,Perf.%
 */
export function createLinxeaXLSX(): ArrayBuffer {
	const data = [
		{
			Placement: 'Linxea Spirit 2',
			'N° Contrat': '123456789',
			Titulaire: 'Mathieu',
			Produit: 'Unité de compte',
			'Catégorie': 'Actions',
			'Sous-catégorie': 'France',
			'Nom du support': 'Fonds Actions France',
			ISIN: 'FR0010296061',
			'Nbre de parts': 25.5,
			'Dernière cotation': 120.5,
			Date: '2024-01-15',
			'Somme en Compte': 3072.75,
			'Plus ou Moins Value': 322.75,
			'Prix de Revient Moyen': 107.84,
			'Perf.%': 11.74
		},
		{
			Placement: 'Linxea Spirit 2',
			'N° Contrat': '123456789',
			Titulaire: 'Mathieu',
			Produit: 'Unité de compte',
			'Catégorie': 'Obligations',
			'Sous-catégorie': 'Euro',
			'Nom du support': 'Fonds Obligations Euro',
			ISIN: 'FR0011538818',
			'Nbre de parts': 100,
			'Dernière cotation': 98.5,
			Date: '2024-01-15',
			'Somme en Compte': 9850,
			'Plus ou Moins Value': -150,
			'Prix de Revient Moyen': 100,
			'Perf.%': -1.5
		},
		{
			Placement: 'Linxea Spirit 2',
			'N° Contrat': '123456789',
			Titulaire: 'Mathieu',
			Produit: 'Fonds euro',
			'Catégorie': 'Fonds Euro',
			'Sous-catégorie': '',
			'Nom du support': 'Fonds Euro Suravenir',
			ISIN: '',
			'Nbre de parts': 0, // Zero quantity should be skipped
			'Dernière cotation': 1,
			Date: '2024-01-15',
			'Somme en Compte': 0,
			'Plus ou Moins Value': 0,
			'Prix de Revient Moyen': 1,
			'Perf.%': 0
		}
	];

	const worksheet = utils.json_to_sheet(data);
	const workbook = utils.book_new();
	utils.book_append_sheet(workbook, worksheet, 'Positions');

	return write(workbook, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer;
}

/**
 * Create a test XLSX file for Binance parser
 * Format: Date(UTC+1),Method,Spend Amount,Receive Amount,Fee,Price,Status,Transaction ID
 */
export function createBinanceXLSX(): ArrayBuffer {
	const data = [
		{
			'Date(UTC+1)': '2024-01-15 14:30:00',
			Method: 'Card',
			'Spend Amount': '100.00 EUR',
			'Receive Amount': '0.00235000 BTC',
			Fee: '1.50',
			Price: 42553.19,
			Status: 'Successful',
			'Transaction ID': 'TXN123456'
		},
		{
			'Date(UTC+1)': '2024-01-14 10:00:00',
			Method: 'Bank Transfer',
			'Spend Amount': '500.00 EUR',
			'Receive Amount': '0.23000000 ETH',
			Fee: '3.00',
			Price: 2173.91,
			Status: 'Successful',
			'Transaction ID': 'TXN123457'
		},
		{
			'Date(UTC+1)': '2024-01-13 09:00:00',
			Method: 'Card',
			'Spend Amount': '50.00 EUR',
			'Receive Amount': '0.00100000 BTC',
			Fee: '1.00',
			Price: 50000,
			Status: 'Failed', // Should be skipped
			'Transaction ID': 'TXN123458'
		},
		{
			'Date(UTC+1)': '2024-01-12 16:45:00',
			Method: 'Card',
			'Spend Amount': '200.00 EUR',
			'Receive Amount': '180.00000000 SOL',
			Fee: '2.00',
			Price: 1.11,
			Status: 'Successful',
			'Transaction ID': 'TXN123459'
		}
	];

	const worksheet = utils.json_to_sheet(data);
	const workbook = utils.book_new();
	utils.book_append_sheet(workbook, worksheet, 'Buy History');

	return write(workbook, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer;
}

/**
 * Create an empty XLSX file
 */
export function createEmptyXLSX(): ArrayBuffer {
	const worksheet = utils.json_to_sheet([]);
	const workbook = utils.book_new();
	utils.book_append_sheet(workbook, worksheet, 'Empty');

	return write(workbook, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer;
}
