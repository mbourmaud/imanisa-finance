/**
 * Price Fetching Module
 * 
 * Récupère les prix des actifs depuis Yahoo Finance (gratuit, pas de clé API)
 * Pour les fonds français (ISIN), on utilise Boursorama
 */

// Yahoo Finance - pour actions et ETF cotés
export async function fetchYahooPrice(symbol) {
    try {
        // Yahoo Finance chart API (non officielle mais stable)
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`Yahoo API error: ${response.status}`);
        }

        const data = await response.json();
        const result = data.chart?.result?.[0];
        
        if (!result) {
            throw new Error('No data found');
        }

        const meta = result.meta;
        return {
            symbol: meta.symbol,
            price: meta.regularMarketPrice,
            previousClose: meta.previousClose,
            currency: meta.currency,
            exchange: meta.exchangeName,
            timestamp: new Date(meta.regularMarketTime * 1000).toISOString()
        };
    } catch (error) {
        console.error(`Error fetching ${symbol} from Yahoo:`, error.message);
        return null;
    }
}

// Recherche de symbole Yahoo
export async function searchYahooSymbol(query) {
    try {
        const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10`;
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`Yahoo search error: ${response.status}`);
        }

        const data = await response.json();
        return data.quotes?.map(q => ({
            symbol: q.symbol,
            name: q.longname || q.shortname,
            type: q.typeDisp,
            exchange: q.exchange
        })) || [];
    } catch (error) {
        console.error(`Error searching "${query}":`, error.message);
        return [];
    }
}

// Conversion ISIN vers ticker Yahoo (pour certains ETF européens)
export function isinToYahooTicker(isin) {
    // Quelques mappings connus pour les ETF populaires
    const mappings = {
        // ETF World
        'IE00B4L5Y983': 'IWDA.AS',      // iShares Core MSCI World
        'LU1681043599': 'CW8.PA',        // Amundi MSCI World
        'IE00BK5BQT80': 'VWCE.DE',       // Vanguard FTSE All-World
        
        // ETF S&P 500
        'IE00B5BMR087': 'CSPX.PA',       // iShares Core S&P 500
        'LU0496786574': '500.PA',         // Amundi S&P 500
        
        // ETF Emerging Markets
        'IE00B4L5YC18': 'EIMI.AS',       // iShares Core EM
        
        // ETF Euro Stoxx
        'LU0908501215': 'C6E.PA',        // Amundi Euro Stoxx 600
    };

    return mappings[isin] || null;
}

// Pour les fonds français (assurance vie Linxea, etc.)
// On essaie d'abord Yahoo, sinon on retourne null et il faudra saisir manuellement
export async function fetchFundPrice(isin) {
    // D'abord essayer avec le mapping ISIN -> Yahoo
    const yahooTicker = isinToYahooTicker(isin);
    if (yahooTicker) {
        return fetchYahooPrice(yahooTicker);
    }

    // Essayer directement l'ISIN sur Yahoo (marche parfois)
    const yahooResult = await fetchYahooPrice(`${isin}.PA`);
    if (yahooResult) return yahooResult;

    // Essayer sur d'autres bourses
    for (const suffix of ['.DE', '.AS', '.L', '']) {
        const result = await fetchYahooPrice(`${isin}${suffix}`);
        if (result) return result;
    }

    return null;
}

// Mise à jour des prix pour toutes les positions
export async function updateAllPrices(positions) {
    const results = [];
    
    for (const position of positions) {
        let price = null;

        // Si c'est un ISIN (commence par 2 lettres)
        if (/^[A-Z]{2}/.test(position.symbol)) {
            price = await fetchFundPrice(position.symbol);
        } else {
            // Sinon c'est un ticker direct
            price = await fetchYahooPrice(position.symbol);
        }

        results.push({
            symbol: position.symbol,
            name: position.name,
            price: price?.price || position.last_price,
            currency: price?.currency || position.currency,
            updated: !!price,
            error: price ? null : 'Price not found'
        });

        // Petit délai pour éviter le rate limiting
        await new Promise(r => setTimeout(r, 200));
    }

    return results;
}

// Helper pour récupérer le taux de change EUR/USD si besoin
export async function fetchExchangeRate(from = 'EUR', to = 'USD') {
    try {
        const symbol = `${from}${to}=X`;
        const result = await fetchYahooPrice(symbol);
        return result?.price || null;
    } catch (error) {
        console.error(`Error fetching ${from}/${to} rate:`, error.message);
        return null;
    }
}
