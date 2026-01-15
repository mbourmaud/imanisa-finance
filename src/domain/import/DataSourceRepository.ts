import type { DataSource } from './DataSource';
import type { UniqueId } from '@domain/shared/UniqueId';

/**
 * Repository interface for DataSource persistence.
 * Implemented in infrastructure layer.
 */
export interface DataSourceRepository {
	/**
	 * Find all data sources
	 */
	findAll(): Promise<DataSource[]>;

	/**
	 * Find a data source by ID
	 */
	findById(id: UniqueId): Promise<DataSource | null>;

	/**
	 * Find data sources by owner entity ID
	 */
	findByOwnerEntityId(ownerEntityId: UniqueId): Promise<DataSource[]>;

	/**
	 * Save (create or update) a data source
	 */
	save(dataSource: DataSource): Promise<void>;

	/**
	 * Delete a data source by ID
	 */
	delete(id: UniqueId): Promise<void>;
}
