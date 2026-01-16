export enum AssetCategory {
	LIQUIDITY = 'LIQUIDITY',
	FINANCIAL = 'FINANCIAL',
	REAL_ESTATE = 'REAL_ESTATE',
	DEBT = 'DEBT',
}

export const AssetCategoryLabels: Record<AssetCategory, string> = {
	[AssetCategory.LIQUIDITY]: 'Liquidités',
	[AssetCategory.FINANCIAL]: 'Placements financiers',
	[AssetCategory.REAL_ESTATE]: 'Immobilier',
	[AssetCategory.DEBT]: 'Dettes',
};

export const AssetCategoryColors: Record<AssetCategory, string> = {
	[AssetCategory.LIQUIDITY]: '#3B82F6',
	[AssetCategory.FINANCIAL]: '#10B981',
	[AssetCategory.REAL_ESTATE]: '#F59E0B',
	[AssetCategory.DEBT]: '#EF4444',
};
