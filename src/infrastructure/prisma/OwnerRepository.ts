import { Owner } from '@domain/owner';
import { OwnerType } from '@domain/owner/OwnerType';
import { UniqueId } from '@domain/shared/UniqueId';
import { OwnerType as PrismaOwnerType } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export class OwnerRepository {
	async findById(id: UniqueId): Promise<Owner | null> {
		const record = await prisma.owner.findUnique({
			where: { id: id.toString() },
		});

		if (!record) {
			return null;
		}

		return this.reconstituteDomainEntity(record);
	}

	async findAll(): Promise<Owner[]> {
		const records = await prisma.owner.findMany();
		return records.map((record) => this.reconstituteDomainEntity(record));
	}

	async save(owner: Owner): Promise<void> {
		const prismaType = this.mapTypeToPrisma(owner.type);

		await prisma.owner.upsert({
			where: { id: owner.id.toString() },
			update: {
				name: owner.name,
				type: prismaType,
			},
			create: {
				id: owner.id.toString(),
				name: owner.name,
				type: prismaType,
				createdAt: new Date(),
			},
		});
	}

	async delete(id: UniqueId): Promise<void> {
		await prisma.owner.delete({
			where: { id: id.toString() },
		});
	}

	private reconstituteDomainEntity(record: {
		id: string;
		name: string;
		type: PrismaOwnerType;
		createdAt: Date;
	}): Owner {
		const result = Owner.reconstitute(
			{
				name: record.name,
				type: this.mapTypeFromPrisma(record.type),
				createdAt: record.createdAt,
			},
			UniqueId.fromString(record.id),
		);

		if (result.isFailure) {
			throw new Error(`Failed to reconstitute Owner: ${result.error}`);
		}

		return result.value;
	}

	private mapTypeToPrisma(type: OwnerType): PrismaOwnerType {
		switch (type) {
			case OwnerType.PERSON:
				return PrismaOwnerType.PERSON;
			case OwnerType.JOINT:
				return PrismaOwnerType.JOINT;
			case OwnerType.SCI:
				return PrismaOwnerType.SCI;
			default:
				return PrismaOwnerType.PERSON;
		}
	}

	private mapTypeFromPrisma(type: PrismaOwnerType): OwnerType {
		switch (type) {
			case PrismaOwnerType.PERSON:
				return OwnerType.PERSON;
			case PrismaOwnerType.JOINT:
				return OwnerType.JOINT;
			case PrismaOwnerType.SCI:
				return OwnerType.SCI;
			default:
				return OwnerType.PERSON;
		}
	}
}
