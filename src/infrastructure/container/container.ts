import type { Container, ContainerMode } from './types';
import { UserRepositoryImpl } from '@infrastructure/database/repositories/UserRepository';
import { BankRepositoryImpl } from '@infrastructure/database/repositories/BankRepository';
import { AccountRepositoryImpl } from '@infrastructure/database/repositories/AccountRepository';
import { TransactionRepositoryImpl } from '@infrastructure/database/repositories/TransactionRepository';
import { InMemoryUserRepository } from '@infrastructure/repositories/inmemory/InMemoryUserRepository';
import { InMemoryBankRepository } from '@infrastructure/repositories/inmemory/InMemoryBankRepository';
import { InMemoryAccountRepository } from '@infrastructure/repositories/inmemory/InMemoryAccountRepository';
import { InMemoryTransactionRepository } from '@infrastructure/repositories/inmemory/InMemoryTransactionRepository';
import { seedInitialData, getUserId } from './seed-data';

let containerInstance: Container | null = null;
let currentMode: ContainerMode | null = null;
let demoSeeded = false;

function createSqliteContainer(): Container {
	return {
		userRepository: new UserRepositoryImpl(),
		bankRepository: new BankRepositoryImpl(),
		accountRepository: new AccountRepositoryImpl(),
		transactionRepository: new TransactionRepositoryImpl()
	};
}

function createInMemoryContainer(): Container {
	return {
		userRepository: new InMemoryUserRepository(),
		bankRepository: new InMemoryBankRepository(),
		accountRepository: new InMemoryAccountRepository(),
		transactionRepository: new InMemoryTransactionRepository()
	};
}

export function getContainerMode(): ContainerMode {
	const envMode = process.env.STORAGE_MODE;
	if (envMode === 'sqlite') return 'sqlite';
	return 'inmemory';
}

export async function getContainer(): Promise<Container> {
	const mode = getContainerMode();
	
	if (containerInstance && currentMode === mode) {
		return containerInstance;
	}

	if (mode === 'sqlite') {
		containerInstance = createSqliteContainer();
	} else {
		containerInstance = createInMemoryContainer();
		
		if (!demoSeeded) {
			await seedInitialData(containerInstance);
			demoSeeded = true;
		}
	}
	
	currentMode = mode;
	return containerInstance;
}

export function resetContainer(): void {
	containerInstance = null;
	currentMode = null;
	demoSeeded = false;
}

export function createTestContainer(): Container {
	return createInMemoryContainer();
}

export { getUserId };
