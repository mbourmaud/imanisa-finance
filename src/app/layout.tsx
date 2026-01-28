import type { Metadata } from 'next';
import { Geist, Geist_Mono, Inter } from 'next/font/google';
import { RootBody, Toaster } from '@/components';
import { Providers } from '@/components/providers';
import { ThemeProvider } from '@/components/theme-provider';
import './globals.css';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

const inter = Inter({
	variable: '--font-inter',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: 'Imanisa Finance',
	description: 'Gestion de patrimoine et finances personnelles',
};

const fontClasses = `${geistSans.variable} ${geistMono.variable} ${inter.variable}`;

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="fr" suppressHydrationWarning>
			<RootBody fontClasses={fontClasses}>
				<Providers>
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
						disableTransitionOnChange
					>
						{children}
						<Toaster position="bottom-right" />
					</ThemeProvider>
				</Providers>
			</RootBody>
		</html>
	);
}
