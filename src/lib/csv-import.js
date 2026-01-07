/**
 * CSV Import Module
 * 
 * Import des positions depuis les exports CSV de Bourse Direct et Linxea
 */

// Parser CSV simple (pas besoin de lib externe)
export function parseCSV(content, delimiter = ';') {
    const lines = content.trim().split('\n');
    const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''));
    
    return lines.slice(1).map(line => {
        const values = line.split(delimiter).map(v => v.trim().replace(/^"|"$/g, ''));
        const row = {};
        headers.forEach((header, i) => {
            row[header] = values[i] || '';
        });
        return row;
    });
}

// Normalise un nombre français (1 234,56 -> 1234.56)
function parseNumber(str) {
    if (!str) return 0;
    return parseFloat(str.replace(/\s/g, '').replace(',', '.')) || 0;
}

/**
 * Import Bourse Direct
 * 
 * Format attendu (export portefeuille):
 * Libellé;ISIN;Quantité;PRU;Cours;Valorisation;+/- value;% +/- value
 */
export function parseBourseDirectCSV(content) {
    const rows = parseCSV(content, ';');
    
    return rows.map(row => {
        // Bourse Direct peut avoir différents noms de colonnes
        const name = row['Libellé'] || row['Libelle'] || row['Nom'] || '';
        const isin = row['ISIN'] || row['Code ISIN'] || '';
        const quantity = parseNumber(row['Quantité'] || row['Qté'] || row['Qty']);
        const averageCost = parseNumber(row['PRU'] || row['Prix de revient unitaire']);
        const lastPrice = parseNumber(row['Cours'] || row['Dernier cours']);

        if (!isin || quantity === 0) return null;

        return {
            symbol: isin,
            name: name,
            quantity: quantity,
            average_cost: averageCost,
            last_price: lastPrice,
            currency: 'EUR',
            asset_type: guessAssetType(name, isin)
        };
    }).filter(Boolean);
}

/**
 * Import Linxea (Assurance Vie)
 * 
 * Format attendu (relevé de situation):
 * Support;ISIN;Nombre de parts;Valeur de la part;Valorisation
 */
export function parseLinxeaCSV(content) {
    const rows = parseCSV(content, ';');
    
    return rows.map(row => {
        const name = row['Support'] || row['Nom du support'] || row['Libellé'] || '';
        const isin = row['ISIN'] || row['Code ISIN'] || '';
        const quantity = parseNumber(row['Nombre de parts'] || row['Nb parts'] || row['Parts']);
        const lastPrice = parseNumber(row['Valeur de la part'] || row['VL'] || row['Cours']);

        if (!name || quantity === 0) return null;

        return {
            symbol: isin || generateSymbolFromName(name),
            name: name,
            quantity: quantity,
            average_cost: null, // Linxea ne fournit pas toujours le PRU
            last_price: lastPrice,
            currency: 'EUR',
            asset_type: 'fund' // Assurance vie = fonds
        };
    }).filter(Boolean);
}

/**
 * Import générique (détection automatique)
 */
export function parseGenericCSV(content) {
    // Détecter le délimiteur
    const firstLine = content.split('\n')[0];
    const delimiter = firstLine.includes(';') ? ';' : ',';
    
    const rows = parseCSV(content, delimiter);
    if (rows.length === 0) return [];

    // Détecter les colonnes
    const headers = Object.keys(rows[0]).map(h => h.toLowerCase());
    
    const findColumn = (options) => {
        for (const opt of options) {
            const found = headers.find(h => h.includes(opt.toLowerCase()));
            if (found) return Object.keys(rows[0]).find(k => k.toLowerCase() === found);
        }
        return null;
    };

    const symbolCol = findColumn(['isin', 'symbol', 'ticker', 'code']);
    const nameCol = findColumn(['libellé', 'libelle', 'nom', 'name', 'support']);
    const qtyCol = findColumn(['quantité', 'quantite', 'qty', 'parts', 'nombre']);
    const priceCol = findColumn(['cours', 'price', 'valeur', 'vl']);
    const costCol = findColumn(['pru', 'prix de revient', 'cost', 'average']);

    return rows.map(row => {
        const symbol = symbolCol ? row[symbolCol] : '';
        const name = nameCol ? row[nameCol] : '';
        const quantity = qtyCol ? parseNumber(row[qtyCol]) : 0;
        const price = priceCol ? parseNumber(row[priceCol]) : null;
        const cost = costCol ? parseNumber(row[costCol]) : null;

        if ((!symbol && !name) || quantity === 0) return null;

        return {
            symbol: symbol || generateSymbolFromName(name),
            name: name || symbol,
            quantity: quantity,
            average_cost: cost,
            last_price: price,
            currency: 'EUR',
            asset_type: guessAssetType(name, symbol)
        };
    }).filter(Boolean);
}

// Devine le type d'actif basé sur le nom
function guessAssetType(name, symbol) {
    const nameLower = (name || '').toLowerCase();
    const symbolLower = (symbol || '').toLowerCase();
    
    if (nameLower.includes('etf') || nameLower.includes('tracker')) return 'etf';
    if (nameLower.includes('action') || nameLower.includes('share')) return 'stock';
    if (nameLower.includes('obligation') || nameLower.includes('bond')) return 'bond';
    if (nameLower.includes('fonds') || nameLower.includes('fund') || nameLower.includes('sicav')) return 'fund';
    if (nameLower.includes('monétaire') || nameLower.includes('money')) return 'money_market';
    
    // Si ISIN commence par FR/LU et pas d'autre indice -> probablement un fonds
    if (/^(FR|LU)/i.test(symbol)) return 'fund';
    
    return 'stock'; // Par défaut
}

// Génère un symbole à partir du nom (pour les fonds sans ISIN)
function generateSymbolFromName(name) {
    return name
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .slice(0, 12);
}

/**
 * Détecte automatiquement le format et parse le fichier
 */
export function autoParseCSV(content, filename = '') {
    const lowerFilename = filename.toLowerCase();
    const lowerContent = content.toLowerCase();

    // Détection par nom de fichier
    if (lowerFilename.includes('bourse') || lowerFilename.includes('bd_')) {
        return { source: 'bourse_direct', positions: parseBourseDirectCSV(content) };
    }
    
    if (lowerFilename.includes('linxea')) {
        return { source: 'linxea', positions: parseLinxeaCSV(content) };
    }

    // Détection par contenu
    if (lowerContent.includes('pru') || lowerContent.includes('prix de revient')) {
        return { source: 'bourse_direct', positions: parseBourseDirectCSV(content) };
    }
    
    if (lowerContent.includes('support') || lowerContent.includes('nombre de parts')) {
        return { source: 'linxea', positions: parseLinxeaCSV(content) };
    }

    // Fallback générique
    return { source: 'generic', positions: parseGenericCSV(content) };
}
