'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight, ExternalLink } from 'lucide-react';
import type { SupportedBank } from '@/shared/constants/supported-banks';

// =============================================================================
// BANK AVATAR COMPONENT
// =============================================================================

type BankAvatarSize = 'sm' | 'md' | 'lg' | 'xl';

const avatarSizeClasses: Record<BankAvatarSize, string> = {
	sm: 'h-8 w-8 text-[10px]',
	md: 'h-10 w-10 text-xs',
	lg: 'h-12 w-12 text-sm',
	xl: 'h-14 w-14 text-base',
};

interface BankAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Bank data */
	bank: Pick<SupportedBank, 'name' | 'shortName' | 'color' | 'textColor'>;
	/** Custom logo URL */
	logoUrl?: string | null;
	/** Avatar size */
	size?: BankAvatarSize;
}

const BankAvatar = forwardRef<HTMLDivElement, BankAvatarProps>(
	({ bank, logoUrl, size = 'md', className, ...props }, ref) => {
		return (
			<div
				ref={ref}
				data-slot="bank-avatar"
				className={cn(
					'flex items-center justify-center rounded-xl font-bold overflow-hidden flex-shrink-0',
					avatarSizeClasses[size],
					className,
				)}
				style={{
					backgroundColor: bank.color,
					color: bank.textColor || '#ffffff',
				}}
				{...props}
			>
				{logoUrl ? (
					<img
						src={logoUrl}
						alt={`Logo ${bank.name}`}
						className="h-full w-full object-cover"
					/>
				) : (
					<span>{bank.shortName}</span>
				)}
			</div>
		);
	},
);
BankAvatar.displayName = 'BankAvatar';

// =============================================================================
// BANK CARD COMPONENT
// =============================================================================

type BankCardVariant = 'default' | 'compact' | 'detailed';

interface BankCardProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Bank data */
	bank: SupportedBank;
	/** Custom logo URL */
	logoUrl?: string | null;
	/** Number of accounts for this bank */
	accountCount?: number;
	/** Total balance for this bank */
	totalBalance?: string;
	/** Visual variant */
	variant?: BankCardVariant;
	/** Whether the card is clickable/interactive */
	interactive?: boolean;
	/** Click handler */
	onBankClick?: () => void;
	/** Show external link to bank website */
	showExternalLink?: boolean;
}

const BankCard = forwardRef<HTMLDivElement, BankCardProps>(
	(
		{
			bank,
			logoUrl,
			accountCount,
			totalBalance,
			variant = 'default',
			interactive = false,
			onBankClick,
			showExternalLink = false,
			className,
			...props
		},
		ref,
	) => {
		const isCompact = variant === 'compact';
		const isDetailed = variant === 'detailed';

		return (
			<div
				ref={ref}
				data-slot="bank-card"
				className={cn(
					'glass-card',
					isCompact ? 'p-3' : 'p-4',
					interactive && 'cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg',
					className,
				)}
				onClick={interactive ? onBankClick : undefined}
				onKeyDown={interactive ? (e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						onBankClick?.();
					}
				} : undefined}
				tabIndex={interactive ? 0 : undefined}
				role={interactive ? 'button' : undefined}
				{...props}
			>
				<div className="flex items-center gap-3">
					{/* Bank Avatar */}
					<BankAvatar
						bank={bank}
						logoUrl={logoUrl}
						size={isCompact ? 'sm' : isDetailed ? 'xl' : 'lg'}
					/>

					{/* Bank Info */}
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2">
							<h3 className={cn(
								'font-semibold truncate',
								isCompact ? 'text-sm' : 'text-base',
							)}>
								{bank.name}
							</h3>
							{bank.type === 'investment' && (
								<span className="badge-fun badge-purple text-[10px] px-1.5">
									Invest
								</span>
							)}
						</div>

						{!isCompact && accountCount !== undefined && (
							<p className="text-xs text-muted-foreground mt-0.5">
								{accountCount === 0 ? 'Aucun compte' : `${accountCount} compte${accountCount > 1 ? 's' : ''}`}
							</p>
						)}

						{isDetailed && bank.supportedFormats && (
							<p className="text-xs text-muted-foreground mt-1">
								Formats: {bank.supportedFormats.join(', ')}
							</p>
						)}
					</div>

					{/* Balance (if provided) */}
					{totalBalance && (
						<div className="text-right flex-shrink-0">
							<span className={cn(
								'font-semibold number-display',
								isCompact ? 'text-sm' : 'text-base',
							)}>
								{totalBalance}
							</span>
						</div>
					)}

					{/* Actions */}
					{interactive && !showExternalLink && (
						<ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
					)}

					{showExternalLink && bank.defaultExportUrl && (
						<a
							href={bank.defaultExportUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="text-muted-foreground hover:text-foreground transition-colors p-1"
							onClick={(e) => e.stopPropagation()}
						>
							<ExternalLink className="h-4 w-4" />
						</a>
					)}
				</div>
			</div>
		);
	},
);
BankCard.displayName = 'BankCard';

// =============================================================================
// BANK CARD LIST
// =============================================================================

interface BankCardListProps extends React.HTMLAttributes<HTMLDivElement> {
	/** List of banks to display */
	banks: Array<{
		bank: SupportedBank;
		logoUrl?: string | null;
		accountCount?: number;
		totalBalance?: string;
	}>;
	/** Variant for all cards */
	variant?: BankCardVariant;
	/** Whether cards are interactive */
	interactive?: boolean;
	/** Handler for bank click */
	onBankClick?: (bank: SupportedBank) => void;
}

function BankCardList({
	banks,
	variant = 'default',
	interactive = false,
	onBankClick,
	className,
	...props
}: BankCardListProps) {
	return (
		<div
			data-slot="bank-card-list"
			className={cn('space-y-3', className)}
			{...props}
		>
			{banks.map((item) => (
				<BankCard
					key={item.bank.key}
					bank={item.bank}
					logoUrl={item.logoUrl}
					accountCount={item.accountCount}
					totalBalance={item.totalBalance}
					variant={variant}
					interactive={interactive}
					onBankClick={() => onBankClick?.(item.bank)}
				/>
			))}
		</div>
	);
}

// =============================================================================
// BANK CARD GRID
// =============================================================================

interface BankCardGridProps extends React.HTMLAttributes<HTMLDivElement> {
	/** List of banks to display */
	banks: Array<{
		bank: SupportedBank;
		logoUrl?: string | null;
		accountCount?: number;
		totalBalance?: string;
	}>;
	/** Number of columns */
	columns?: 2 | 3 | 4;
	/** Whether cards are interactive */
	interactive?: boolean;
	/** Handler for bank click */
	onBankClick?: (bank: SupportedBank) => void;
}

function BankCardGrid({
	banks,
	columns = 3,
	interactive = false,
	onBankClick,
	className,
	...props
}: BankCardGridProps) {
	const columnClasses = {
		2: 'grid-cols-1 sm:grid-cols-2',
		3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
		4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
	};

	return (
		<div
			data-slot="bank-card-grid"
			className={cn('grid gap-4', columnClasses[columns], className)}
			{...props}
		>
			{banks.map((item) => (
				<BankCard
					key={item.bank.key}
					bank={item.bank}
					logoUrl={item.logoUrl}
					accountCount={item.accountCount}
					totalBalance={item.totalBalance}
					variant="compact"
					interactive={interactive}
					onBankClick={() => onBankClick?.(item.bank)}
				/>
			))}
		</div>
	);
}

// =============================================================================
// EXPORTS
// =============================================================================

export { BankAvatar, BankCard, BankCardList, BankCardGrid };
export type {
	BankAvatarProps,
	BankAvatarSize,
	BankCardProps,
	BankCardVariant,
	BankCardListProps,
	BankCardGridProps,
};
