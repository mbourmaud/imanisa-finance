'use client';

import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error('[Dashboard]', error);
	}, [error]);

	return (
		<div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
			<AlertCircle className="h-12 w-12 text-destructive" />
			<h2 className="text-lg font-semibold">Une erreur est survenue</h2>
			<p className="max-w-md text-sm text-muted-foreground">
				Quelque chose s&apos;est mal passé. Veuillez réessayer ou revenir plus tard.
			</p>
			<Button onClick={reset}>Réessayer</Button>
		</div>
	);
}
