<script lang="ts">
	import { page } from '$app/stores';
	import { theme, getResolvedTheme, type Theme } from '$lib/stores/theme';

	interface NavItem {
		href: string;
		label: string;
		icon: string;
	}

	interface Props {
		user: {
			name: string;
			avatarUrl?: string | null;
		} | null;
	}

	let { user }: Props = $props();

	const navItems: NavItem[] = [
		{ href: '/', label: 'Synthèse', icon: 'dashboard' },
		{ href: '/accounts', label: 'Comptes', icon: 'wallet' },
		{ href: '/budget', label: 'Budget', icon: 'pie-chart' },
		{ href: '/investissements', label: 'Invest.', icon: 'chart' },
		{ href: '/immobilier', label: 'Immo.', icon: 'home' },
		{ href: '/transactions', label: 'Opéra.', icon: 'list' },
		{ href: '/loans', label: 'Crédits', icon: 'loan' },
		{ href: '/import', label: 'Import', icon: 'upload' }
	];

	function isActive(href: string, currentPath: string): boolean {
		if (href === '/') return currentPath === '/';
		return currentPath.startsWith(href);
	}

	// Theme toggle
	let currentTheme: Theme = $state('system');
	theme.subscribe((value) => {
		currentTheme = value;
	});

	function toggleTheme() {
		theme.toggle();
	}

	// Get resolved theme for icon display
	$effect(() => {
		// This effect runs on mount and keeps icon in sync
	});
</script>

<aside class="sidebar" role="navigation" aria-label="Navigation principale">
	<div class="sidebar-header">
		<a href="/" class="logo" title="Imanisa Finance">
			<span class="logo-icon">
				<svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
					<rect width="28" height="28" rx="8" fill="url(#logo-gradient-nav)"/>
					<path d="M8 20V8h3v12H8zm4.5-6v6h3v-6h-3zm4.5 2v4h3v-4h-3z" fill="white"/>
					<defs>
						<linearGradient id="logo-gradient-nav" x1="0" y1="0" x2="28" y2="28">
							<stop stop-color="#FF8F7D"/>
							<stop offset="1" stop-color="#FA8072"/>
						</linearGradient>
					</defs>
				</svg>
			</span>
			<span class="sr-only">Imanisa Finance - Accueil</span>
		</a>
	</div>

	<nav class="sidebar-nav">
		{#each navItems as item}
			{@const active = isActive(item.href, $page.url.pathname)}
			<a
				href={item.href}
				class="nav-item"
				class:active
				aria-current={active ? 'page' : undefined}
			>
				<span class="nav-icon" aria-hidden="true">
					{#if item.icon === 'dashboard'}
						<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<rect x="3" y="3" width="7" height="7" rx="1"/>
							<rect x="14" y="3" width="7" height="7" rx="1"/>
							<rect x="3" y="14" width="7" height="7" rx="1"/>
							<rect x="14" y="14" width="7" height="7" rx="1"/>
						</svg>
					{:else if item.icon === 'wallet'}
						<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<rect x="2" y="4" width="20" height="16" rx="2"/>
							<path d="M2 10h20"/>
						</svg>
					{:else if item.icon === 'pie-chart'}
						<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
							<path d="M22 12A10 10 0 0 0 12 2v10z"/>
						</svg>
					{:else if item.icon === 'chart'}
						<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
							<polyline points="16 7 22 7 22 13"/>
						</svg>
					{:else if item.icon === 'list'}
						<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<line x1="8" y1="6" x2="21" y2="6"/>
							<line x1="8" y1="12" x2="21" y2="12"/>
							<line x1="8" y1="18" x2="21" y2="18"/>
							<line x1="3" y1="6" x2="3.01" y2="6"/>
							<line x1="3" y1="12" x2="3.01" y2="12"/>
							<line x1="3" y1="18" x2="3.01" y2="18"/>
						</svg>
					{:else if item.icon === 'home'}
						<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
							<polyline points="9 22 9 12 15 12 15 22"/>
						</svg>
					{:else if item.icon === 'loan'}
						<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M12 2v20M2 12h20"/>
						</svg>
					{:else if item.icon === 'upload'}
						<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
							<polyline points="17 8 12 3 7 8"/>
							<line x1="12" y1="3" x2="12" y2="15"/>
						</svg>
					{/if}
				</span>
				<span class="nav-label">{item.label}</span>
				{#if active}
					<span class="nav-indicator" aria-hidden="true"></span>
				{/if}
			</a>
		{/each}
	</nav>

	<div class="sidebar-footer">
		<a
			href="/banks"
			class="nav-item"
			class:active={isActive('/banks', $page.url.pathname)}
			aria-label="Gestion des banques"
		>
			<span class="nav-icon" aria-hidden="true">
				<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="m3 11 9-9 9 9"/>
					<path d="M12 2v7"/>
					<rect x="4" y="11" width="16" height="10" rx="2"/>
					<path d="M9 21v-4a3 3 0 0 1 6 0v4"/>
				</svg>
			</span>
		</a>

		<!-- Theme toggle button -->
		<button
			class="theme-toggle nav-item"
			onclick={toggleTheme}
			aria-label={getResolvedTheme(currentTheme) === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
			title={getResolvedTheme(currentTheme) === 'dark' ? 'Mode clair' : 'Mode sombre'}
		>
			<span class="nav-icon" aria-hidden="true">
				{#if getResolvedTheme(currentTheme) === 'dark'}
					<!-- Sun icon for switching to light mode -->
					<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<circle cx="12" cy="12" r="4"/>
						<path d="M12 2v2"/>
						<path d="M12 20v2"/>
						<path d="m4.93 4.93 1.41 1.41"/>
						<path d="m17.66 17.66 1.41 1.41"/>
						<path d="M2 12h2"/>
						<path d="M20 12h2"/>
						<path d="m6.34 17.66-1.41 1.41"/>
						<path d="m19.07 4.93-1.41 1.41"/>
					</svg>
				{:else}
					<!-- Moon icon for switching to dark mode -->
					<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
					</svg>
				{/if}
			</span>
		</button>

		{#if user}
			<div class="user-section" title={user.name}>
				{#if user.avatarUrl}
					<img
						src={user.avatarUrl}
						alt={user.name}
						class="user-avatar"
						width="36"
						height="36"
						loading="lazy"
					/>
				{:else}
					<div class="user-avatar-placeholder" aria-label={user.name}>
						{user.name.charAt(0)}
					</div>
				{/if}
			</div>
		{/if}
	</div>
</aside>

<style>
	/* ═══════════════════════════════════════════════════════════════════════════
	   NAVIGATION COMPONENT - Mobile-First
	   Base styles: Bottom navigation bar
	   Desktop: Side navigation (min-width: 769px)
	   ═══════════════════════════════════════════════════════════════════════════ */

	/* Screen reader only utility */
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	/* ─────────────────────────────────────────────────────────────────────────────
	   MOBILE: Bottom Navigation Bar - Apple Liquid Glass Style
	   ───────────────────────────────────────────────────────────────────────────── */
	.sidebar {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		width: 100%;
		height: auto;
		background: var(--glass-bg);
		border-top: 1px solid var(--glass-border);
		display: flex;
		flex-direction: row;
		padding: 0;
		padding-bottom: env(safe-area-inset-bottom, 0);
		z-index: 100;
		backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturation));
		-webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturation));
		box-shadow: var(--glass-shadow);
	}

	/* Glass highlight overlay for depth - frosted edge effect */
	.sidebar::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 100%;
		background: var(--glass-highlight);
		pointer-events: none;
		border-radius: inherit;
	}

	.sidebar-header {
		display: none;
	}

	.logo {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-text-primary);
		text-decoration: none;
		touch-action: manipulation;
	}

	.logo-icon {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.sidebar-nav {
		flex: 1;
		display: flex;
		flex-direction: row;
		justify-content: space-around;
		align-items: center;
		padding: var(--spacing-2) var(--spacing-1);
		gap: 0;
	}

	.nav-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-0-5);
		padding: var(--spacing-1-5) var(--spacing-1);
		border-radius: var(--radius-2xl);
		color: var(--color-text-tertiary);
		text-decoration: none;
		position: relative;
		min-height: var(--touch-target-min, 44px);
		max-width: 72px;
		touch-action: manipulation;
		transition:
			color var(--transition-fast),
			background-color var(--transition-fast),
			transform var(--transition-fast);
		-webkit-user-select: none;
		user-select: none;
		-webkit-tap-highlight-color: transparent;
	}

	.nav-item:focus-visible {
		outline: 2px solid var(--color-primary-500);
		outline-offset: 2px;
	}

	.nav-item:hover {
		color: var(--color-text-secondary);
	}

	.nav-item:active {
		transform: scale(0.92);
	}

	/* Pill-style active state with glass background */
	.nav-item.active {
		color: var(--color-primary-500);
		background: var(--glass-bg-active);
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.06),
			0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.nav-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 22px;
		height: 22px;
	}

	.nav-icon svg {
		width: 22px;
		height: 22px;
	}

	.nav-label {
		display: block;
		font-size: 10px;
		font-weight: var(--font-weight-medium);
		line-height: 1;
		white-space: nowrap;
	}

	.nav-indicator {
		display: none;
	}

	.sidebar-footer {
		display: none;
	}

	/* Theme toggle button - inherits nav-item styles */
	.theme-toggle {
		border: none;
		background: none;
		cursor: pointer;
	}

	.user-section {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--spacing-3);
		border-radius: var(--radius-xl);
		transition: background-color var(--transition-fast);
		cursor: pointer;
		touch-action: manipulation;
		min-height: var(--touch-target-min, 44px);
		min-width: var(--touch-target-min, 44px);
	}

	.user-section:focus-visible {
		outline: 2px solid var(--color-primary-500);
		outline-offset: 2px;
	}

	.user-section:hover {
		background: var(--color-bg-subtle);
	}

	.user-avatar {
		width: 36px;
		height: 36px;
		border-radius: var(--radius-full);
		object-fit: cover;
		border: 2px solid var(--color-border);
	}

	.user-avatar-placeholder {
		width: 36px;
		height: 36px;
		border-radius: var(--radius-full);
		background: var(--gradient-accent);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: var(--font-weight-semibold);
		font-size: var(--font-size-sm);
	}

	/* ─────────────────────────────────────────────────────────────────────────────
	   Small mobile (iPhone SE, 375px)
	   ───────────────────────────────────────────────────────────────────────────── */
	@media (max-width: 375px) {
		.nav-item {
			padding: var(--spacing-1-5) var(--spacing-1);
		}

		.nav-label {
			font-size: 9px;
		}
	}

	/* ─────────────────────────────────────────────────────────────────────────────
	   TABLET/DESKTOP: Side Navigation (769px+)
	   ───────────────────────────────────────────────────────────────────────────── */
	@media (min-width: 769px) {
		.sidebar {
			position: fixed;
			left: 0;
			top: 0;
			bottom: 0;
			right: auto;
			width: var(--sidebar-width-collapsed);
			height: auto;
			background: var(--color-bg-base);
			border-right: 1px solid var(--color-border);
			border-top: none;
			flex-direction: column;
			padding: 0;
			backdrop-filter: none;
			-webkit-backdrop-filter: none;
		}

		.sidebar::before {
			display: none;
		}

		.sidebar-header {
			display: flex;
			padding: var(--spacing-4);
			height: 72px;
			align-items: center;
			justify-content: center;
		}

		.sidebar-nav {
			flex: 1;
			flex-direction: column;
			justify-content: flex-start;
			padding: var(--spacing-2);
			gap: var(--spacing-1);
		}

		.nav-item {
			flex: initial;
			flex-direction: row;
			justify-content: center;
			gap: 0;
			padding: var(--spacing-3);
			border-radius: var(--radius-xl);
			max-width: none;
			min-height: 48px;
		}

		.nav-item:active {
			transform: none;
		}

		.nav-item.active {
			background: var(--gradient-accent-soft);
			box-shadow: none;
		}

		.nav-icon {
			width: 24px;
			height: 24px;
		}

		.nav-icon svg {
			width: 22px;
			height: 22px;
		}

		.nav-label {
			display: none;
		}

		.nav-indicator {
			display: block;
			position: absolute;
			left: 0;
			top: 50%;
			transform: translateY(-50%);
			width: 3px;
			height: 24px;
			background: var(--gradient-accent);
			border-radius: 0 var(--radius-full) var(--radius-full) 0;
		}

		.sidebar-footer {
			display: flex;
			padding: var(--spacing-2);
			border-top: 1px solid var(--color-border);
			flex-direction: column;
			gap: var(--spacing-2);
		}
	}

	/* ─────────────────────────────────────────────────────────────────────────────
	   Reduced motion preference
	   ───────────────────────────────────────────────────────────────────────────── */
	@media (prefers-reduced-motion: reduce) {
		.nav-item {
			transition: none;
		}

		.nav-item:active {
			transform: none;
		}
	}
</style>
