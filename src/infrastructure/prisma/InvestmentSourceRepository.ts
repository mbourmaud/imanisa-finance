import { InvestmentSource } from '@domain/investment/InvestmentSource';
import { InvestmentSourceType } from '@domain/investment/InvestmentSourceType';
import { UniqueId } from '@domain/shared/UniqueId';
import { InvestmentSourceType as PrismaInvestmentSourceType } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export class InvestmentSourceRepository {
	async findById(id: UniqueId): Promise<InvestmentSource | null> {
		const record = await prisma.investmentSource.findUnique({
			where: { id: id.toString() },
		});

		if (!record) {
			return null;
		}

		return this.reconstituteDomainEntity(record);
	}

	async findByOwnerId(ownerId: UniqueId): Promise<InvestmentSource[]> {
		const records = await prisma.investmentSource.findMany({
			where: { ownerId: ownerId.toString() },
		});

		return records.map((record) => this.reconstituteDomainEntity(record));
	}

	async save(source: InvestmentSource): Promise<void> {
		const prismaType = this.mapTypeToPrisma(source.type);

		await prisma.investmentSource.upsert({
			where: { id: source.id.toString() },
			update: {
				name: source.name,
				type: prismaType,
				bank: source.bank,
				notes: source.notes,
				updatedAt: new Date(),
			},
			create: {
				id: source.id.toString(),
				ownerId: source.ownerId.toString(),
				name: source.name,
				type: prismaType,
				bank: source.bank,
				notes: source.notes,
				createdAt: source.createdAt,
				updatedAt: source.updatedAt,
			},
		});
	}

	async delete(id: UniqueId): Promise<void> {
		await prisma.investmentSource.delete({
			where: { id: id.toString() },
		});
	}

	private reconstituteDomainEntity(record: {
		id: string;
		ownerId: string;
		name: string;
		type: PrismaInvestmentSourceType;
		bank: string | null;
		notes: string | null;
		createdAt: Date;
		updatedAt: Date;
	}): InvestmentSource {
		const result = InvestmentSource.reconstitute(
			{
				name: record.name,
				type: this.mapTypeFromPrisma(record.type),
				ownerId: UniqueId.fromString(record.ownerId),
				bank: record.bank,
				notes: record.notes,
				createdAt: record.createdAt,
				updatedAt: record.updatedAt,
			},
			UniqueId.fromString(record.id),
		);

		if (result.isFailure) {
			throw new Error(`Failed to reconstitute InvestmentSource: ${result.error}`);
		}

		return result.value;
	}

	private mapTypeToPrisma(type: InvestmentSourceType): PrismaInvestmentSourceType {
		switch (type) {
			case InvestmentSourceType.PEA:
				return PrismaInvestmentSourceType.PEA;
			case InvestmentSourceType.CTO:
				return PrismaInvestmentSourceType.CTO;
			case InvestmentSourceType.ASSURANCE_VIE:
				return PrismaInvestmentSourceType.ASSURANCE_VIE;
			case InvestmentSourceType.PER:
				return PrismaInvestmentSourceType.PER;
			case InvestmentSourceType.CRYPTO:
				return PrismaInvestmentSourceType.CRYPTO;
			case InvestmentSourceType.CROWDFUNDING:
				return PrismaInvestmentSourceType.CROWDFUNDING;
			case InvestmentSourceType.OTHER:
				return PrismaInvestmentSourceType.OTHER;
			default:
				return PrismaInvestmentSourceType.OTHER;
		}
	}

	private mapTypeFromPrisma(type: PrismaInvestmentSourceType): InvestmentSourceType {
		switch (type) {
			case PrismaInvestmentSourceType.PEA:
				return InvestmentSourceType.PEA;
			case PrismaInvestmentSourceType.CTO:
				return InvestmentSourceType.CTO;
			case PrismaInvestmentSourceType.ASSURANCE_VIE:
				return InvestmentSourceType.ASSURANCE_VIE;
			case PrismaInvestmentSourceType.PER:
				return InvestmentSourceType.PER;
			case PrismaInvestmentSourceType.CRYPTO:
				return InvestmentSourceType.CRYPTO;
			case PrismaInvestmentSourceType.CROWDFUNDING:
				return InvestmentSourceType.CROWDFUNDING;
			case PrismaInvestmentSourceType.OTHER:
				return InvestmentSourceType.OTHER;
			default:
				return InvestmentSourceType.OTHER;
		}
	}
}
