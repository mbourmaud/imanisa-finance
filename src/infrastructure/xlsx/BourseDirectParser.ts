import * as XLSX from 'xlsx';
import type { ParsedPosition } from './XlsxParser';

export class BourseDirectParser {
	parse(buffer: ArrayBuffer): ParsedPosition[] {
		const workbook = XLSX.read(buffer, { type: 'array' });
		const positions: ParsedPosition[] = [];

		const sheet = workbook.Sheets[workbook.SheetNames[0]];
		if (!sheet) return positions;

		const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');

		for (let row = 1; row <= range.e.r; row++) {
			const nameCell = sheet[XLSX.utils.encode_cell({ r: row, c: 0 })];
			const isinCell = sheet[XLSX.utils.encode_cell({ r: row, c: 1 })];
			const priceCell = sheet[XLSX.utils.encode_cell({ r: row, c: 2 })];
			const currencyCell = sheet[XLSX.utils.encode_cell({ r: row, c: 3 })];
			const quantityCell = sheet[XLSX.utils.encode_cell({ r: row, c: 5 })];
			const pruCell = sheet[XLSX.utils.encode_cell({ r: row, c: 6 })];

			if (!nameCell || !isinCell || !quantityCell) continue;

			const name = this.getCellString(nameCell);
			const isin = this.getCellString(isinCell);
			
			if (!name || !isin || isin === 'ISIN') continue;

			const currentPrice = this.getCellNumber(priceCell);
			const quantity = this.getCellNumber(quantityCell);
			const pru = this.getCellNumber(pruCell);
			const currency = this.getCellString(currencyCell) || 'EUR';

			if (quantity <= 0) continue;

			positions.push({
				name,
				isin,
				ticker: this.isinToTicker(isin),
				quantity,
				pru,
				currentPrice,
				currency
			});
		}

		return positions;
	}

	private getCellString(cell: XLSX.CellObject | undefined): string {
		if (!cell) return '';
		if (cell.t === 's') return String(cell.v);
		if (cell.w) return cell.w;
		return String(cell.v || '');
	}

	private getCellNumber(cell: XLSX.CellObject | undefined): number {
		if (!cell) return 0;
		if (typeof cell.v === 'number') return cell.v;
		return parseFloat(String(cell.v).replace(',', '.')) || 0;
	}

	private isinToTicker(isin: string): string | null {
		const mapping: Record<string, string> = {
			'FR0011871128': 'PE500.PA',
			'FR0010315770': 'CW8.PA'
		};
		return mapping[isin] || null;
	}
}
