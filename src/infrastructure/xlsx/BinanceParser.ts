import * as XLSX from 'xlsx';
import type { ParsedCryptoOrder } from './XlsxParser';

export class BinanceParser {
	parse(buffer: ArrayBuffer): ParsedCryptoOrder[] {
		const workbook = XLSX.read(buffer, { type: 'array' });
		const orders: ParsedCryptoOrder[] = [];

		const sheet = workbook.Sheets[workbook.SheetNames[0]];
		if (!sheet) return orders;

		const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');

		for (let row = 0; row <= range.e.r; row++) {
			const rowData = this.extractRowData(sheet, row, range.e.c);
			
			if (!rowData.time || !rowData.spendAmount || !rowData.receiveAmount) continue;
			if (rowData.time === 'Time') continue;

			const date = this.parseDate(rowData.time);
			if (!date) continue;

			const { amount: spendAmount, currency: spendCurrency } = this.parseAmount(rowData.spendAmount);
			const { amount: receiveAmount, currency: receiveCurrency } = this.parseAmount(rowData.receiveAmount);
			const { amount: feeAmount } = this.parseAmount(rowData.fee);

			if (spendAmount <= 0 || receiveAmount <= 0) continue;

			const crypto = this.normalizeCrypto(receiveCurrency);
			if (!crypto) continue;

			orders.push({
				date,
				crypto,
				quantity: receiveAmount,
				price: spendAmount / receiveAmount,
				fees: feeAmount,
				total: spendAmount,
				status: rowData.status?.toLowerCase() === 'successful' ? 'successful' : 'failed'
			});
		}

		return orders;
	}

	private extractRowData(sheet: XLSX.WorkSheet, row: number, maxCol: number): Record<string, string> {
		const data: Record<string, string> = {};
		
		for (let col = 0; col <= maxCol; col++) {
			const cell = sheet[XLSX.utils.encode_cell({ r: row, c: col })];
			if (!cell) continue;

			const value = this.getCellString(cell);
			
			if (value.match(/^\d{2}-\d{2}-\d{2}/)) {
				data.time = value;
			} else if (value.includes('EUR') || value.includes('USD')) {
				if (!data.spendAmount) {
					data.spendAmount = value;
				} else if (!data.fee) {
					data.fee = value;
				}
			} else if (value.includes('BTC') || value.includes('ETH')) {
				data.receiveAmount = value;
			} else if (value === 'Successful' || value === 'Failed') {
				data.status = value;
			}
		}
		
		return data;
	}

	private getCellString(cell: XLSX.CellObject): string {
		if (cell.t === 's') return String(cell.v);
		if (cell.w) return cell.w;
		return String(cell.v || '');
	}

	private parseDate(dateStr: string): Date | null {
		const match = dateStr.match(/^(\d{2})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/);
		if (!match) return null;

		const [, yy, mm, dd, hh, min, ss] = match;
		const year = 2000 + parseInt(yy);
		return new Date(year, parseInt(mm) - 1, parseInt(dd), parseInt(hh), parseInt(min), parseInt(ss));
	}

	private parseAmount(str: string): { amount: number; currency: string } {
		if (!str) return { amount: 0, currency: '' };

		const match = str.match(/^([\d.]+)\s*(\w+)$/);
		if (!match) return { amount: 0, currency: '' };

		return {
			amount: parseFloat(match[1]),
			currency: match[2]
		};
	}

	private normalizeCrypto(currency: string): string | null {
		const upper = currency.toUpperCase();
		if (upper === 'BTC') return 'bitcoin';
		if (upper === 'ETH') return 'ethereum';
		return null;
	}

	getPositionsSummary(orders: ParsedCryptoOrder[]): Map<string, { quantity: number; invested: number; fees: number }> {
		const positions = new Map<string, { quantity: number; invested: number; fees: number }>();

		for (const order of orders) {
			if (order.status !== 'successful') continue;

			const existing = positions.get(order.crypto) || { quantity: 0, invested: 0, fees: 0 };
			existing.quantity += order.quantity;
			existing.invested += order.total;
			existing.fees += order.fees;
			positions.set(order.crypto, existing);
		}

		return positions;
	}
}
