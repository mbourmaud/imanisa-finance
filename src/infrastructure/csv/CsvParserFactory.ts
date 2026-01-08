import { BankTemplate } from '@domain/bank/BankTemplate';
import type { CsvParser } from './CsvParser';
import { CaisseEpargneParser } from './parsers/CaisseEpargneParser';
import { CICParser } from './parsers/CICParser';
import { RevolutParser } from './parsers/RevolutParser';
import { BourseDirectParser } from './parsers/BourseDirectParser';
import { LinxeaParser } from './parsers/LinxeaParser';

export class CsvParserFactory {
	static create(template: BankTemplate): CsvParser {
		switch (template) {
			case BankTemplate.CAISSE_EPARGNE:
				return new CaisseEpargneParser();
			case BankTemplate.CIC:
				return new CICParser();
			case BankTemplate.REVOLUT:
				return new RevolutParser();
			case BankTemplate.BOURSE_DIRECT:
				return new BourseDirectParser();
			case BankTemplate.LINXEA:
				return new LinxeaParser();
			default:
				throw new Error(`No parser available for template: ${template}`);
		}
	}
}
