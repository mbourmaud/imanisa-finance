export function parseCSV(content, delimiter = ';') {
    const lines = content.trim().split('\n');
    const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''));
    
    return lines.slice(1).filter(line => line.trim()).map(line => {
        const values = line.split(delimiter).map(v => v.trim().replace(/^"|"$/g, ''));
        const row = {};
        headers.forEach((header, i) => {
            row[header] = values[i] || '';
        });
        return row;
    });
}

function parseNumber(str) {
    if (!str) return 0;
    return parseFloat(str.replace(/\s/g, '').replace(',', '.')) || 0;
}

function parseDate(str) {
    if (!str) return null;
    
    const ddmmyyyy = str.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (ddmmyyyy) {
        return `${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}`;
    }
    
    const yyyymmdd = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (yyyymmdd) return str;
    
    const ddmmyy = str.match(/^(\d{2})\/(\d{2})\/(\d{2})$/);
    if (ddmmyy) {
        const year = parseInt(ddmmyy[3]) > 50 ? `19${ddmmyy[3]}` : `20${ddmmyy[3]}`;
        return `${year}-${ddmmyy[2]}-${ddmmyy[1]}`;
    }
    
    return null;
}

export function parseCaisseEpargneCSV(content) {
    const rows = parseCSV(content, ';');
    
    return rows.map(row => {
        const date = parseDate(row['Date'] || row['Date opération'] || row['Date comptable']);
        const description = row['Libellé'] || row['Libelle'] || row['Description'] || '';
        const debit = parseNumber(row['Débit'] || row['Debit'] || '');
        const credit = parseNumber(row['Crédit'] || row['Credit'] || '');
        let amount = credit - debit;
        
        if (!amount && row['Montant']) {
            amount = parseNumber(row['Montant']);
        }

        if (!date) return null;

        return {
            id: `ce_${date}_${Math.abs(amount).toFixed(2)}_${description.slice(0, 20)}`.replace(/[^a-zA-Z0-9_]/g, ''),
            date,
            amount,
            description,
            currency: 'EUR',
            transaction_type: amount >= 0 ? 'credit' : 'debit'
        };
    }).filter(Boolean);
}

export function parseCICCSV(content) {
    const rows = parseCSV(content, ';');
    
    return rows.map(row => {
        const date = parseDate(row['Date'] || row['Date opération'] || row['Date valeur']);
        const description = row['Libellé'] || row['Libelle'] || row['Description'] || '';
        const amount = parseNumber(row['Montant'] || row['Credit'] || '') - parseNumber(row['Debit'] || '');

        if (!date) return null;

        return {
            id: `cic_${date}_${Math.abs(amount).toFixed(2)}_${description.slice(0, 20)}`.replace(/[^a-zA-Z0-9_]/g, ''),
            date,
            amount,
            description,
            currency: 'EUR',
            transaction_type: amount >= 0 ? 'credit' : 'debit'
        };
    }).filter(Boolean);
}

export function parseRevolutCSV(content) {
    const rows = parseCSV(content, ',');
    
    return rows.map(row => {
        const dateStr = row['Started Date'] || row['Completed Date'] || row['Date'];
        const date = dateStr ? dateStr.split(' ')[0] : null;
        const description = row['Description'] || '';
        const amount = parseNumber(row['Amount']);
        const currency = row['Currency'] || 'EUR';

        if (!date || !amount) return null;

        return {
            id: `rev_${date}_${Math.abs(amount).toFixed(2)}_${description.slice(0, 20)}`.replace(/[^a-zA-Z0-9_]/g, ''),
            date: parseDate(date) || date,
            amount,
            description,
            currency,
            transaction_type: amount >= 0 ? 'credit' : 'debit'
        };
    }).filter(Boolean);
}

export function parseBourseDirectCSV(content) {
    const rows = parseCSV(content, ';');
    
    return rows.map(row => {
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
            average_cost: null,
            last_price: lastPrice,
            currency: 'EUR',
            asset_type: 'fund'
        };
    }).filter(Boolean);
}

function guessAssetType(name, symbol) {
    const nameLower = (name || '').toLowerCase();
    
    if (nameLower.includes('etf') || nameLower.includes('tracker')) return 'etf';
    if (nameLower.includes('action') || nameLower.includes('share')) return 'stock';
    if (nameLower.includes('obligation') || nameLower.includes('bond')) return 'bond';
    if (nameLower.includes('fonds') || nameLower.includes('fund') || nameLower.includes('sicav')) return 'fund';
    if (nameLower.includes('monétaire') || nameLower.includes('money')) return 'money_market';
    
    if (/^(FR|LU)/i.test(symbol)) return 'fund';
    
    return 'stock';
}

function generateSymbolFromName(name) {
    return name
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .slice(0, 12);
}

export function detectBankFormat(content, filename = '') {
    const lowerFilename = filename.toLowerCase();
    const lowerContent = content.toLowerCase();

    if (lowerFilename.includes('caisse') || lowerFilename.includes('epargne') || lowerFilename.includes('ce_')) {
        return 'caisse_epargne';
    }
    if (lowerFilename.includes('cic')) {
        return 'cic';
    }
    if (lowerFilename.includes('revolut')) {
        return 'revolut';
    }
    
    if (lowerContent.includes('started date') || lowerContent.includes('completed date')) {
        return 'revolut';
    }
    
    if (lowerContent.includes('débit') && lowerContent.includes('crédit')) {
        return 'caisse_epargne';
    }

    return 'generic_bank';
}

export function detectInvestmentFormat(content, filename = '') {
    const lowerFilename = filename.toLowerCase();
    const lowerContent = content.toLowerCase();

    if (lowerFilename.includes('bourse') || lowerFilename.includes('bd_')) {
        return 'bourse_direct';
    }
    if (lowerFilename.includes('linxea')) {
        return 'linxea';
    }

    if (lowerContent.includes('pru') || lowerContent.includes('prix de revient')) {
        return 'bourse_direct';
    }
    if (lowerContent.includes('support') || lowerContent.includes('nombre de parts')) {
        return 'linxea';
    }

    return 'generic_investment';
}

export function parseBankCSV(content, format) {
    switch (format) {
        case 'caisse_epargne':
            return parseCaisseEpargneCSV(content);
        case 'cic':
            return parseCICCSV(content);
        case 'revolut':
            return parseRevolutCSV(content);
        default:
            return parseCaisseEpargneCSV(content);
    }
}

export function parseInvestmentCSV(content, format) {
    switch (format) {
        case 'bourse_direct':
            return parseBourseDirectCSV(content);
        case 'linxea':
            return parseLinxeaCSV(content);
        default:
            return parseBourseDirectCSV(content);
    }
}

export function autoParseCSV(content, filename = '') {
    const lowerFilename = filename.toLowerCase();
    const lowerContent = content.toLowerCase();

    if (lowerFilename.includes('bourse') || lowerFilename.includes('bd_')) {
        return { source: 'bourse_direct', type: 'investment', positions: parseBourseDirectCSV(content) };
    }
    
    if (lowerFilename.includes('linxea')) {
        return { source: 'linxea', type: 'investment', positions: parseLinxeaCSV(content) };
    }

    if (lowerContent.includes('pru') || lowerContent.includes('prix de revient')) {
        return { source: 'bourse_direct', type: 'investment', positions: parseBourseDirectCSV(content) };
    }
    
    if (lowerContent.includes('support') || lowerContent.includes('nombre de parts')) {
        return { source: 'linxea', type: 'investment', positions: parseLinxeaCSV(content) };
    }

    return { source: 'generic', type: 'investment', positions: parseBourseDirectCSV(content) };
}
