'use client';

interface BankLogoBoxProps {
	bankName: string;
	bankColor: string;
	size?: 'md' | 'lg';
}

function getBankShortName(name: string): string {
	return name
		.split(' ')
		.map((word) => word[0])
		.join('')
		.toUpperCase()
		.slice(0, 3);
}

const sizeClasses = {
	md: 'h-16 w-16 rounded-xl text-lg',
	lg: 'h-16 w-16 rounded-xl text-lg',
};

/**
 * Displays a bank logo box with glow effect
 * Uses inline style for dynamic bank color
 */
export function BankLogoBox({ bankName, bankColor, size = 'md' }: BankLogoBoxProps) {
	return (
		<div className="relative flex-shrink-0">
			{/* Glow effect */}
			<div
				className="absolute inset-0 rounded-xl blur-lg opacity-40 bg-[var(--bank-color)]"
				style={{ '--bank-color': bankColor } as React.CSSProperties}
			/>
			{/* Logo box */}
			<div
				className={`flex items-center justify-center relative shadow-lg text-white font-bold transition-transform ${sizeClasses[size]} bg-[image:var(--bank-gradient)]`}
				style={
					{
						'--bank-gradient': `linear-gradient(135deg, ${bankColor}, ${bankColor}dd)`,
					} as React.CSSProperties
				}
			>
				{getBankShortName(bankName)}
			</div>
		</div>
	);
}
