<script lang="ts">
	import '@lib/styles/global.css';
	import { page } from '$app/stores';
	
	let { children, data } = $props();

	const navItems = [
		{ href: '/', label: 'Synthèse', icon: 'dashboard' },
		{ href: '/accounts', label: 'Comptes', icon: 'wallet' },
		{ href: '/investissements', label: 'Invest.', icon: 'chart' },
		{ href: '/immobilier', label: 'Immobilier', icon: 'home' },
		{ href: '/transactions', label: 'Transactions', icon: 'list' },
		{ href: '/loans', label: 'Crédits', icon: 'loan' },
		{ href: '/import', label: 'Import', icon: 'upload' }
	];

	function isActive(href: string, currentPath: string): boolean {
		if (href === '/') return currentPath === '/';
		return currentPath.startsWith(href);
	}
</script>

<svelte:head>
	<title>Imanisa Finance</title>
	<meta name="description" content="Gérez vos finances personnelles avec Imanisa Finance" />
</svelte:head>

{#if data.user}
	<div class="app-layout">
		<aside class="sidebar">
			<div class="sidebar-header">
				<a href="/" class="logo" title="Imanisa Finance">
					<span class="logo-icon">
						<svg width="28" height="28" viewBox="0 0 28 28" fill="none">
							<rect width="28" height="28" rx="8" fill="url(#logo-gradient)"/>
							<path d="M8 20V8h3v12H8zm4.5-6v6h3v-6h-3zm4.5 2v4h3v-4h-3z" fill="white"/>
							<defs>
								<linearGradient id="logo-gradient" x1="0" y1="0" x2="28" y2="28">
									<stop stop-color="#FF8F7D"/>
									<stop offset="1" stop-color="#FA8072"/>
								</linearGradient>
							</defs>
						</svg>
					</span>
				</a>
			</div>

			<nav class="sidebar-nav">
				{#each navItems as item}
					{@const active = isActive(item.href, $page.url.pathname)}
				<a 
					href={item.href} 
					class="nav-item"
					class:active
					title={item.label}
				>
					<span class="nav-icon">
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
						<span class="nav-indicator"></span>
					{/if}
				</a>
				{/each}
			</nav>

			<div class="sidebar-footer">
				<a href="/banks" class="nav-item" class:active={isActive('/banks', $page.url.pathname)} title="Banques">
					<span class="nav-icon">
						<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="m3 11 9-9 9 9"/>
							<path d="M12 2v7"/>
							<rect x="4" y="11" width="16" height="10" rx="2"/>
							<path d="M9 21v-4a3 3 0 0 1 6 0v4"/>
						</svg>
					</span>
				</a>

				<div class="user-section" title={data.user.name}>
					{#if data.user.avatarUrl}
						<img src={data.user.avatarUrl} alt={data.user.name} class="user-avatar" />
					{:else}
						<div class="user-avatar-placeholder">
							{data.user.name.charAt(0)}
						</div>
					{/if}
				</div>
			</div>
		</aside>

		<main class="main-content">
			{@render children()}
		</main>
	</div>
{:else}
	<main class="main-content-full">
		{@render children()}
	</main>
{/if}

<style>
	.app-layout {
		display: flex;
		min-height: 100vh;
		background: var(--color-bg-deep);
	}

	/* Desktop Sidebar */
	.sidebar {
		position: fixed;
		left: 0;
		top: 0;
		bottom: 0;
		width: var(--sidebar-width-collapsed);
		background: var(--color-bg-base);
		border-right: 1px solid var(--color-border);
		display: flex;
		flex-direction: column;
		z-index: 100;
	}

	.sidebar-header {
		padding: var(--spacing-4);
		height: 72px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.logo {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-text-primary);
		text-decoration: none;
	}

	.logo-icon {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.sidebar-nav {
		flex: 1;
		padding: var(--spacing-2);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-1);
	}

	.nav-item {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--spacing-3);
		border-radius: var(--radius-xl);
		color: var(--color-text-tertiary);
		text-decoration: none;
		position: relative;
		transition: all var(--transition-fast);
		min-height: 48px;
	}

	.nav-item:hover {
		color: var(--color-text-primary);
		background: var(--color-bg-subtle);
	}

	.nav-item.active {
		color: var(--color-primary-500);
		background: var(--gradient-accent-soft);
	}

	.nav-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
	}

	.nav-label {
		display: none;
	}

	.nav-indicator {
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
		padding: var(--spacing-2);
		border-top: 1px solid var(--color-border);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-2);
	}

	.user-section {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--spacing-3);
		border-radius: var(--radius-xl);
		transition: background var(--transition-fast);
		cursor: pointer;
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

	.main-content {
		flex: 1;
		margin-left: var(--sidebar-width-collapsed);
		min-height: 100vh;
		padding: var(--spacing-8);
		animation: fadeIn 0.4s ease;
	}

	.main-content-full {
		min-height: 100vh;
		animation: fadeIn 0.4s ease;
	}

	/* ═══════════════════════════════════════════════════════════════════════════
	   MOBILE BOTTOM NAVIGATION
	   Converts sidebar to iOS-style bottom tab bar on mobile
	   ═══════════════════════════════════════════════════════════════════════════ */
	@media (max-width: 768px) {
		.sidebar {
			position: fixed;
			left: 0;
			right: 0;
			top: auto;
			bottom: 0;
			width: 100%;
			height: auto;
			border-right: none;
			border-top: 1px solid var(--color-border);
			flex-direction: row;
			padding: 0;
			padding-bottom: env(safe-area-inset-bottom, 0);
			background: var(--color-bg-base);
			backdrop-filter: blur(12px);
			-webkit-backdrop-filter: blur(12px);
		}

		.sidebar-header {
			display: none;
		}

		.sidebar-nav {
			flex: 1;
			flex-direction: row;
			justify-content: space-around;
			align-items: center;
			padding: var(--spacing-2) var(--spacing-1);
			gap: 0;
		}

		.nav-item {
			flex: 1;
			flex-direction: column;
			gap: var(--spacing-1);
			padding: var(--spacing-2) var(--spacing-1);
			min-height: 56px;
			max-width: 80px;
			border-radius: var(--radius-lg);
		}

		.nav-item .nav-icon {
			width: 22px;
			height: 22px;
		}

		.nav-item .nav-icon svg {
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

		.nav-item.active {
			background: transparent;
		}

		.nav-item.active .nav-icon {
			color: var(--color-primary-500);
		}

		.nav-item.active .nav-label {
			color: var(--color-primary-500);
		}

		.sidebar-footer {
			display: none;
		}

		.main-content {
			margin-left: 0;
			padding: var(--spacing-4);
			padding-bottom: calc(80px + env(safe-area-inset-bottom, 0));
			min-height: calc(100vh - 80px);
		}
	}

	/* Small mobile refinements */
	@media (max-width: 375px) {
		.nav-item {
			padding: var(--spacing-1-5) var(--spacing-1);
			min-height: 52px;
		}

		.nav-label {
			font-size: 9px;
		}

		.main-content {
			padding: var(--spacing-3);
			padding-bottom: calc(76px + env(safe-area-inset-bottom, 0));
		}
	}
</style>
