import {
	Button,
	Calendar,
	Card,
	Filter,
	SearchInput,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components';

/**
 * Transaction filters component
 */
export function TransactionFilters() {
	return (
		<Card padding="md">
			<div className="flex flex-col gap-4">
				<div className="flex flex-row gap-4 flex-wrap">
					<SearchInput placeholder="Rechercher une transaction..." size="md" minWidth="200px" />
					<Select defaultValue="all">
						<SelectTrigger className="h-11 w-[180px] rounded-xl">
							<SelectValue placeholder="Catégorie" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Toutes</SelectItem>
							<SelectItem value="courses">Courses</SelectItem>
							<SelectItem value="factures">Factures</SelectItem>
							<SelectItem value="sorties">Sorties</SelectItem>
							<SelectItem value="transport">Transport</SelectItem>
							<SelectItem value="revenus">Revenus</SelectItem>
						</SelectContent>
					</Select>
					<Select defaultValue="all">
						<SelectTrigger className="h-11 w-[180px] rounded-xl">
							<SelectValue placeholder="Compte" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Tous les comptes</SelectItem>
							<SelectItem value="principal">Compte principal</SelectItem>
							<SelectItem value="joint">Compte joint</SelectItem>
						</SelectContent>
					</Select>
					<Button
						variant="outline"
						iconLeft={<Calendar className="h-4 w-4" />}
						className="h-11 rounded-xl"
					>
						Janvier 2025
					</Button>
					<Button variant="outline" size="icon" className="h-11 w-11 rounded-xl">
						<Filter className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</Card>
	);
}
