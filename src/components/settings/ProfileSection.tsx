'use client';

import {
	Label,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	SettingsSectionCard,
	User,
} from '@/components';
import { ProfileForm } from '@/features/profile';

export function ProfileSection() {
	return (
		<SettingsSectionCard icon={User} title="Profil" description="Vos informations personnelles">
			<ProfileForm />
			<div className="flex flex-col gap-2">
				<Label htmlFor="currency">Devise par défaut</Label>
				<Select defaultValue="eur">
					<SelectTrigger id="currency" className="w-full max-w-[200px]">
						<SelectValue placeholder="Sélectionner" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="eur">EUR</SelectItem>
						<SelectItem value="usd">USD ($)</SelectItem>
						<SelectItem value="gbp">GBP</SelectItem>
						<SelectItem value="chf">CHF</SelectItem>
					</SelectContent>
				</Select>
			</div>
		</SettingsSectionCard>
	);
}
