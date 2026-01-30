'use client';

import { useState } from 'react';
import { useMembersQuery } from '@/features/members/hooks/use-members-query';
import { usePropertiesQuery } from '..';

export function useRealEstatePage() {
	// TanStack Query hooks
	const { data, isLoading, isError, error } = usePropertiesQuery();
	const { data: members = [] } = useMembersQuery();

	// Dialog state
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	// Derived data from query
	const properties = data?.properties ?? [];
	const summary = data?.summary ?? null;

	return {
		// Query state
		properties,
		summary,
		isLoading,
		isError,
		error,

		// Members
		members,

		// Dialog state
		isDialogOpen,
		setIsDialogOpen,
	};
}
