<script lang="ts">
	import '@lib/styles/global.css';
	import Navigation from '$lib/components/Navigation.svelte';

	let { children, data } = $props();
</script>

<svelte:head>
	<title>Imanisa Finance</title>
	<meta name="description" content="Gérez vos finances personnelles avec Imanisa Finance" />
</svelte:head>

{#if data.user}
	<div class="app-layout">
		<a href="#main-content" class="skip-to-content">Aller au contenu principal</a>
		<Navigation user={data.user} />

		<main id="main-content" class="main-content" tabindex="-1">
			{@render children()}
		</main>
	</div>
{:else}
	<a href="#main-content" class="skip-to-content">Aller au contenu principal</a>
	<main id="main-content" class="main-content-full" tabindex="-1">
		{@render children()}
	</main>
{/if}

<style>
	/* ═══════════════════════════════════════════════════════════════════════════
	   LAYOUT STYLES - Mobile-First
	   Navigation styles are in Navigation.svelte component
	   ═══════════════════════════════════════════════════════════════════════════ */

	.app-layout {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		min-height: 100dvh; /* Dynamic viewport height for mobile */
		background: var(--color-bg-deep);
	}

	/* Main content area - mobile first */
	.main-content {
		flex: 1;
		margin-left: 0;
		min-height: 100vh;
		min-height: 100dvh;
		padding: var(--spacing-4);
		/* Bottom padding accounts for nav bar + safe area */
		padding-bottom: calc(80px + env(safe-area-inset-bottom, 0));
		/* Left/right safe areas for landscape mode */
		padding-left: max(var(--spacing-4), env(safe-area-inset-left, 0));
		padding-right: max(var(--spacing-4), env(safe-area-inset-right, 0));
		animation: fadeIn 0.4s ease;
	}

	.main-content-full {
		min-height: 100vh;
		min-height: 100dvh;
		padding: var(--spacing-4);
		padding-left: max(var(--spacing-4), env(safe-area-inset-left, 0));
		padding-right: max(var(--spacing-4), env(safe-area-inset-right, 0));
		animation: fadeIn 0.4s ease;
	}

	/* ─────────────────────────────────────────────────────────────────────────────
	   Small mobile (iPhone SE, 375px)
	   ───────────────────────────────────────────────────────────────────────────── */
	@media (max-width: 375px) {
		.main-content {
			padding: var(--spacing-3);
			padding-bottom: calc(76px + env(safe-area-inset-bottom, 0));
			padding-left: max(var(--spacing-3), env(safe-area-inset-left, 0));
			padding-right: max(var(--spacing-3), env(safe-area-inset-right, 0));
		}
	}

	/* ─────────────────────────────────────────────────────────────────────────────
	   TABLET/DESKTOP (769px+)
	   ───────────────────────────────────────────────────────────────────────────── */
	@media (min-width: 769px) {
		.app-layout {
			flex-direction: row;
		}

		.main-content {
			margin-left: var(--sidebar-width-collapsed);
			padding: var(--spacing-8);
			padding-bottom: var(--spacing-8);
		}

		.main-content-full {
			padding: var(--spacing-8);
		}
	}

	/* ─────────────────────────────────────────────────────────────────────────────
	   Reduced motion preference
	   ───────────────────────────────────────────────────────────────────────────── */
	@media (prefers-reduced-motion: reduce) {
		.main-content,
		.main-content-full {
			animation: none;
		}
	}

	/* ─────────────────────────────────────────────────────────────────────────────
	   Skip to content link - Accessibility
	   Visible only on focus for keyboard navigation
	   ───────────────────────────────────────────────────────────────────────────── */
	.skip-to-content {
		position: fixed;
		top: var(--spacing-4);
		left: 50%;
		transform: translateX(-50%) translateY(-200%);
		z-index: 1000;
		background: var(--color-bg-elevated);
		color: var(--color-primary-500);
		padding: var(--spacing-3) var(--spacing-6);
		border-radius: var(--radius-lg);
		border: 2px solid var(--color-primary-500);
		font-weight: var(--font-weight-semibold);
		font-size: var(--font-size-sm);
		text-decoration: none;
		box-shadow: var(--shadow-lg);
		transition: transform var(--transition-fast);
	}

	.skip-to-content:focus {
		transform: translateX(-50%) translateY(0);
		outline: none;
	}

	/* Remove focus outline from main when navigated to via skip link */
	.main-content:focus,
	.main-content-full:focus {
		outline: none;
	}
</style>
