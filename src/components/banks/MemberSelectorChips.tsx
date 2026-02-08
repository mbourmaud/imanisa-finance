import { Button } from '@/components';
import { MemberAvatar } from '@/components/members/MemberAvatar';

interface Member {
	id: string;
	name: string;
	color: string | null;
	avatarUrl?: string | null;
}

interface MemberSelectorChipsProps {
	members: Member[];
	selectedIds: string[];
	onToggle: (id: string) => void;
}

/**
 * Chip buttons for selecting/deselecting members
 */
export function MemberSelectorChips({ members, selectedIds, onToggle }: MemberSelectorChipsProps) {
	return (
		<div className="flex gap-2 flex-wrap">
			{members.map((member) => {
				const isSelected = selectedIds.includes(member.id);
				return (
					<Button
						key={member.id}
						variant="ghost"
						size="sm"
						onClick={() => onToggle(member.id)}
						className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-all ${
							isSelected
								? 'border border-primary/30 bg-primary/10 text-primary'
								: 'border border-transparent bg-muted/50 text-muted-foreground'
						}`}
					>
						<MemberAvatar member={member} size="xs" />
						<span>{member.name}</span>
					</Button>
				);
			})}
		</div>
	);
}
