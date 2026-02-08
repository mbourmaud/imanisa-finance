'use client';

import { Camera, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

interface BankLogoProps {
	bankId: string;
	bankName: string;
	bankColor: string;
	logo: string | null;
	size?: 'sm' | 'md' | 'lg';
	onLogoChange?: (newLogoUrl: string) => void;
	/** When true, disables click interaction (for use inside buttons) */
	disabled?: boolean;
}

// Get short name from bank name (first letters of each word)
function getShortName(name: string): string {
	return name
		.split(' ')
		.map((word) => word[0])
		.join('')
		.toUpperCase()
		.slice(0, 3);
}

const sizeClasses = {
	sm: 'h-8 w-8 text-[10px]',
	md: 'h-10 w-10 text-xs',
	lg: 'h-12 w-12 text-sm',
};

export function BankLogo({
	bankId,
	bankName,
	bankColor,
	logo,
	size = 'md',
	onLogoChange,
	disabled = false,
}: BankLogoProps) {
	const [isUploading, setIsUploading] = useState(false);
	const [currentLogo, setCurrentLogo] = useState(logo);
	const [isHovered, setIsHovered] = useState(false);
	const [imageError, setImageError] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleClick = () => {
		if (isUploading || disabled) return;
		fileInputRef.current?.click();
	};

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Validate file type client-side
		const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
		if (!allowedTypes.includes(file.type)) {
			toast.error('Format invalide', {
				description: 'Seuls les fichiers PNG, JPG et SVG sont acceptés.',
			});
			return;
		}

		// Validate file size client-side (5MB)
		if (file.size > 5 * 1024 * 1024) {
			toast.error('Fichier trop volumineux', {
				description: 'La taille maximum est de 5 Mo.',
			});
			return;
		}

		setIsUploading(true);
		setImageError(false);

		try {
			const formData = new FormData();
			formData.append('logo', file);

			const response = await fetch(`/api/banks/${bankId}/logo`, {
				method: 'POST',
				body: formData,
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || 'Erreur lors du téléversement');
			}

			const data = await response.json();

			// Use the public URL from the response, add cache-busting query param
			const newLogoUrl = `${data.logo.publicUrl}?t=${Date.now()}`;
			setCurrentLogo(newLogoUrl);
			onLogoChange?.(newLogoUrl);

			toast.success('Logo mis à jour', {
				description: `Le logo de ${bankName} a été changé.`,
			});
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Une erreur est survenue';
			toast.error('Échec du téléversement', {
				description: message,
			});
		} finally {
			setIsUploading(false);
			// Reset file input so same file can be selected again
			if (fileInputRef.current) {
				fileInputRef.current.value = '';
			}
		}
	};

	const showLogo = currentLogo && !imageError;
	const colorStyle = !showLogo ? ({ '--bank-color': bankColor } as React.CSSProperties) : undefined;

	// When disabled, render as non-interactive div
	if (disabled) {
		return (
			<div
				className={`relative flex items-center justify-center rounded-lg font-semibold overflow-hidden ${sizeClasses[size]} ${
					showLogo ? 'bg-transparent' : 'bg-[var(--bank-color)] text-white'
				}`}
				style={colorStyle}
				aria-label={`Logo de ${bankName}`}
			>
				{showLogo ? (
					<Image
						src={currentLogo}
						alt={`Logo ${bankName}`}
						className="h-full w-full object-cover"
						fill
						unoptimized
						onError={() => setImageError(true)}
					/>
				) : (
					<span>{getShortName(bankName)}</span>
				)}
			</div>
		);
	}

	return (
		<div
			className={`relative flex items-center justify-center rounded-lg font-semibold cursor-pointer overflow-hidden transition-all duration-200 ${sizeClasses[size]} ${
				showLogo ? 'bg-transparent' : 'bg-[var(--bank-color)] text-white'
			}`}
			style={colorStyle}
			onClick={handleClick}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			role="button"
			tabIndex={0}
			aria-label={`Changer le logo de ${bankName}`}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					handleClick();
				}
			}}
		>
			{/* Logo image or initials */}
			{showLogo ? (
				<Image
					src={currentLogo}
					alt={`Logo ${bankName}`}
					className="h-full w-full object-cover"
					fill
					unoptimized
					onError={() => setImageError(true)}
				/>
			) : (
				<span>{getShortName(bankName)}</span>
			)}

			{/* Hover overlay with camera icon */}
			{!isUploading && (
				<div
					className={`absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity duration-150 ${
						isHovered ? 'opacity-100' : 'opacity-0'
					}`}
				>
					<Camera className="h-4 w-4 text-white" />
				</div>
			)}

			{/* Upload spinner */}
			{isUploading && (
				<div className="absolute inset-0 flex items-center justify-center bg-black/60">
					<Loader2 className="h-4 w-4 text-white animate-spin" />
				</div>
			)}

			{/* Hidden file input */}
			<input
				ref={fileInputRef}
				type="file"
				accept="image/png,image/jpeg,image/jpg,image/svg+xml"
				className="hidden"
				onChange={handleFileChange}
				disabled={isUploading}
			/>
		</div>
	);
}
