import { UniqueId } from '@domain/shared/UniqueId';
import { User } from '@domain/user';
import type { Email } from '@domain/user/Email';
import type { UserRepository as IUserRepository } from '@domain/user/UserRepository';
import { prisma } from '@/lib/prisma';

export class UserRepository implements IUserRepository {
	async findById(id: UniqueId): Promise<User | null> {
		const record = await prisma.user.findUnique({
			where: { id: id.toString() },
		});

		if (!record) {
			return null;
		}

		return this.reconstituteDomainEntity(record);
	}

	async findByEmail(email: Email): Promise<User | null> {
		const record = await prisma.user.findUnique({
			where: { email: email.value },
		});

		if (!record) {
			return null;
		}

		return this.reconstituteDomainEntity(record);
	}

	async save(user: User): Promise<void> {
		await prisma.user.upsert({
			where: { id: user.id.toString() },
			update: {
				email: user.email.value,
				name: user.name,
				avatarUrl: user.avatarUrl,
			},
			create: {
				id: user.id.toString(),
				ownerId: '', // This will need to be set when user is created with an owner
				email: user.email.value,
				name: user.name,
				avatarUrl: user.avatarUrl,
				createdAt: new Date(),
			},
		});
	}

	async delete(id: UniqueId): Promise<void> {
		await prisma.user.delete({
			where: { id: id.toString() },
		});
	}

	private reconstituteDomainEntity(record: {
		id: string;
		email: string;
		name: string | null;
		avatarUrl: string | null;
		createdAt: Date;
	}): User {
		const result = User.reconstitute(
			{
				email: record.email,
				name: record.name ?? '',
				avatarUrl: record.avatarUrl,
				createdAt: record.createdAt,
			},
			UniqueId.fromString(record.id),
		);

		if (result.isFailure) {
			throw new Error(`Failed to reconstitute User: ${result.error}`);
		}

		return result.value;
	}
}
