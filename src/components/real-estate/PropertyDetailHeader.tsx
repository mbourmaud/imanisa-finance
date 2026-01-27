'use client';

import Link from 'next/link';
import {
	ArrowLeft,
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	MapPin,
	MoreHorizontal,
	Pencil,
	Trash2,
} from '@/components';
import type { PropertyType, PropertyUsage } from '@/features/properties';

interface PropertyDetailHeaderProps {
	name: string;
	type: PropertyType;
	usage: PropertyUsage;
	address: string;
	address2: string | null;
	postalCode: string;
	city: string;
	onEdit: () => void;
	onDeleteClick: () => void;
}

function getPropertyTypeLabel(type: PropertyType): string {
	switch (type) {
		case 'HOUSE':
			return 'Maison';
		case 'APARTMENT':
			return 'Appartement';
		default:
			return type;
	}
}

function getPropertyUsageLabel(usage: PropertyUsage): string {
	switch (usage) {
		case 'PRIMARY':
			return 'Résidence principale';
		case 'SECONDARY':
			return 'Résidence secondaire';
		case 'RENTAL':
			return 'Locatif';
		default:
			return usage;
	}
}

export function PropertyDetailHeader({
	name,
	type,
	usage,
	address,
	address2,
	postalCode,
	city,
	onEdit,
	onDeleteClick,
}: PropertyDetailHeaderProps) {
	return (
		<div className="flex flex-col gap-4">
			<div className="flex justify-between items-start gap-4 flex-wrap">
				<div className="flex items-start gap-4">
					<Link
						href="/dashboard/real-estate"
						className="mt-1 flex items-center justify-center h-8 w-8 rounded-lg border border-border/60 text-muted-foreground flex-shrink-0 hover:bg-muted/50 transition-colors"
					>
						<ArrowLeft className="h-4 w-4" />
					</Link>
					<div className="min-w-0">
						<div className="flex items-center gap-3 flex-wrap">
							<h1 className="text-2xl font-semibold tracking-tight">{name}</h1>
							<div className="flex gap-1">
								<span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
									{getPropertyTypeLabel(type)}
								</span>
								<span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
									{getPropertyUsageLabel(usage)}
								</span>
							</div>
						</div>
						<div className="flex items-center gap-1 mt-1">
							<MapPin className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
							<p className="text-sm text-muted-foreground">
								{address}
								{address2 && `, ${address2}`}, {postalCode} {city}
							</p>
						</div>
					</div>
				</div>
				<div className="flex items-center gap-3 shrink-0">
					<Button variant="outline" onClick={onEdit}>
						<Pencil className="mr-1.5 h-4 w-4" />
						Modifier
					</Button>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon">
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem>Exporter les données</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem className="text-destructive" onClick={onDeleteClick}>
								<Trash2 className="mr-2 h-4 w-4" />
								Supprimer
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</div>
	);
}
