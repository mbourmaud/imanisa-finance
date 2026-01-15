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
		<Navigation user={data.user} />

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
</style>
