import type { UserRepository } from '@domain/user/UserRepository';
import type { BankRepository } from '@domain/bank/BankRepository';
import type { AccountRepository } from '@domain/account/AccountRepository';
import type { TransactionRepository } from '@domain/transaction/TransactionRepository';

export interface Container {
	userRepository: UserRepository;
	bankRepository: BankRepository;
	accountRepository: AccountRepository;
	transactionRepository: TransactionRepository;
}

export type ContainerMode = 'sqlite' | 'inmemory';
