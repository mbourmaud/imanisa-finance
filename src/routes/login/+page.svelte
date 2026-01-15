<script lang="ts">
	import type { PageData } from './$types';
	
	let { data }: { data: PageData } = $props();

	let selectedUser: string | null = $state(null);
	let pin = $state('');
	let error: string | null = $state(null);
	let loading = $state(false);
	let shaking = $state(false);

	const PIN_LENGTH = 8;
	const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'delete', '0', 'submit'];

	function selectUser(username: string) {
		selectedUser = username;
		pin = '';
		error = null;
	}

	function addDigit(digit: string) {
		if (pin.length < PIN_LENGTH && !loading) {
			pin += digit;
			error = null;
			
			if (pin.length === PIN_LENGTH) {
				submitPin();
			}
		}
	}

	function deleteDigit() {
		if (pin.length > 0 && !loading) {
			pin = pin.slice(0, -1);
		}
	}

	function handleKeyPress(key: string) {
		if (key === 'delete') {
			deleteDigit();
		} else if (key === 'submit') {
			if (pin.length === PIN_LENGTH) {
				submitPin();
			}
		} else {
			addDigit(key);
		}
	}

	async function submitPin() {
		if (pin.length !== PIN_LENGTH || !selectedUser || loading) return;
		
		loading = true;
		error = null;

		try {
			const res = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username: selectedUser, pin })
			});

			if (res.ok) {
				window.location.href = '/';
			} else {
				error = 'Code PIN incorrect';
				pin = '';
				triggerShake();
			}
		} catch {
			error = 'Erreur de connexion';
			pin = '';
			triggerShake();
		} finally {
			loading = false;
		}
	}

	function triggerShake() {
		shaking = true;
		setTimeout(() => {
			shaking = false;
		}, 300);
	}

	function goBack() {
		selectedUser = null;
		pin = '';
		error = null;
	}

	function getAvatarColor(username: string): string {
		const colors: Record<string, string> = {
			mathieu: '#3B82F6',
			ninon: '#EC4899'
		};
		return colors[username.toLowerCase()] || '#6366F1';
	}

	function getInitial(name: string): string {
		return name.charAt(0).toUpperCase();
	}

	function getSelectedUserName(): string {
		const user = data.users.find((u) => u.username === selectedUser);
		return user?.name || selectedUser || '';
	}
</script>

<div class="login-container">
	<div class="login-card">
		<div class="login-header">
			<h1 class="login-title">
				<span>Imanisa</span>
				<span class="accent">Finance</span>
			</h1>
			{#if !selectedUser}
				<p class="login-subtitle">Qui êtes-vous ?</p>
			{:else}
				<button class="back-button" onclick={goBack} type="button">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M19 12H5M12 19l-7-7 7-7"/>
					</svg>
					Changer d'utilisateur
				</button>
			{/if}
		</div>

		{#if !selectedUser}
			<div class="user-selector">
				{#each data.users as user}
					<button
						type="button"
						class="user-avatar-btn"
						onclick={() => selectUser(user.username)}
						style="--avatar-color: {getAvatarColor(user.username)}"
					>
						<div class="user-avatar">
							{getInitial(user.name)}
						</div>
						<span class="user-name">{user.name}</span>
					</button>
				{/each}
			</div>
		{:else}
			<div class="pin-section">
				<div class="selected-user">
					<div 
						class="selected-avatar" 
						style="--avatar-color: {getAvatarColor(selectedUser)}"
					>
						{getInitial(getSelectedUserName())}
					</div>
					<span class="selected-name">
						{getSelectedUserName()}
					</span>
				</div>

				<div class="pin-display" class:shake={shaking}>
					{#each Array(PIN_LENGTH) as _, i}
						<div class="pin-dot" class:filled={i < pin.length} class:current={i === pin.length}>
							{#if i < pin.length}
								<div class="pin-dot-inner"></div>
							{/if}
						</div>
					{/each}
				</div>

				{#if error}
					<p class="error-message">{error}</p>
				{/if}

				<div class="pin-pad">
					{#each digits as key}
						{#if key === 'delete'}
							<button
								type="button"
								class="pin-key pin-key-action"
								onclick={deleteDigit}
								disabled={loading || pin.length === 0}
								aria-label="Supprimer le dernier chiffre"
							>
								<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
									<path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/>
									<line x1="18" y1="9" x2="12" y2="15"/>
									<line x1="12" y1="9" x2="18" y2="15"/>
								</svg>
							</button>
						{:else if key === 'submit'}
							<button
								type="button"
								class="pin-key pin-key-submit"
								onclick={submitPin}
								disabled={loading || pin.length !== PIN_LENGTH}
								class:ready={pin.length === PIN_LENGTH}
								aria-label="Valider le code PIN"
							>
								{#if loading}
									<div class="spinner" aria-hidden="true"></div>
								{:else}
									<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
										<polyline points="20 6 9 17 4 12"/>
									</svg>
								{/if}
							</button>
						{:else}
							<button
								type="button"
								class="pin-key"
								onclick={() => handleKeyPress(key)}
								disabled={loading || pin.length >= PIN_LENGTH}
							>
								{key}
							</button>
						{/if}
					{/each}
				</div>
			</div>
		{/if}

		<p class="login-notice">
			Accès réservé aux utilisateurs autorisés
		</p>
	</div>
</div>

<style>
	.login-container {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--spacing-4);
		background: var(--gradient-main);
		position: relative;
	}

	.login-container::before {
		content: '';
		position: fixed;
		inset: 0;
		background: 
			radial-gradient(ellipse 80% 50% at 20% 20%, rgba(255, 255, 255, 0.4) 0%, transparent 50%),
			radial-gradient(ellipse 60% 60% at 80% 80%, rgba(255, 202, 177, 0.3) 0%, transparent 50%),
			radial-gradient(ellipse 40% 40% at 50% 50%, rgba(255, 255, 255, 0.2) 0%, transparent 60%);
		pointer-events: none;
		z-index: 0;
	}

	.login-card {
		background: var(--glass-bg);
		backdrop-filter: blur(24px) saturate(var(--glass-saturation));
		-webkit-backdrop-filter: blur(24px) saturate(var(--glass-saturation));
		border-radius: var(--radius-3xl);
		box-shadow: var(--shadow-glass);
		border: 1px solid var(--glass-border);
		padding: var(--spacing-10);
		width: 100%;
		max-width: 400px;
		text-align: center;
		position: relative;
		z-index: 1;
		animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
	}

	.login-header {
		margin-bottom: var(--spacing-8);
	}

	.login-title {
		font-size: var(--font-size-3xl);
		font-weight: var(--font-weight-bold);
		color: var(--color-gray-900);
		margin-bottom: var(--spacing-3);
		letter-spacing: -0.03em;
		line-height: 1.1;
	}

	.login-title .accent {
		background: var(--gradient-accent);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.login-subtitle {
		color: var(--color-gray-600);
		font-size: var(--font-size-lg);
	}

	.back-button {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-2);
		color: var(--color-gray-500);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		background: none;
		border: none;
		cursor: pointer;
		padding: var(--spacing-2) var(--spacing-3);
		border-radius: var(--radius-lg);
		transition: all var(--transition-fast);
		margin-top: var(--spacing-2);
	}

	.back-button:hover {
		color: var(--color-gray-700);
		background: rgba(0, 0, 0, 0.05);
	}

	.user-selector {
		display: flex;
		justify-content: center;
		gap: var(--spacing-6);
		margin-bottom: var(--spacing-6);
	}

	.user-avatar-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-3);
		background: none;
		border: none;
		cursor: pointer;
		padding: var(--spacing-4);
		border-radius: var(--radius-2xl);
		transition: all var(--transition-normal);
	}

	.user-avatar-btn:hover {
		background: rgba(0, 0, 0, 0.04);
		transform: translateY(-4px);
	}

	.user-avatar-btn:active {
		transform: translateY(-2px) scale(0.98);
	}

	.user-avatar {
		width: 88px;
		height: 88px;
		border-radius: 50%;
		background: var(--avatar-color);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 36px;
		font-weight: var(--font-weight-bold);
		box-shadow: 
			0 8px 32px -8px var(--avatar-color),
			0 4px 16px -4px rgba(0, 0, 0, 0.1),
			inset 0 2px 4px rgba(255, 255, 255, 0.25);
		transition: all var(--transition-normal);
		position: relative;
		overflow: hidden;
	}

	.user-avatar::before {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%);
		border-radius: 50%;
	}

	.user-avatar-btn:hover .user-avatar {
		transform: scale(1.08);
		box-shadow: 
			0 12px 40px -8px var(--avatar-color),
			0 6px 20px -4px rgba(0, 0, 0, 0.15),
			inset 0 2px 4px rgba(255, 255, 255, 0.25);
	}

	.user-name {
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-semibold);
		color: var(--color-gray-700);
	}

	.pin-section {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.selected-user {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-2);
		margin-bottom: var(--spacing-6);
	}

	.selected-avatar {
		width: 64px;
		height: 64px;
		border-radius: 50%;
		background: var(--avatar-color);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 26px;
		font-weight: var(--font-weight-bold);
		box-shadow: 
			0 6px 24px -6px var(--avatar-color),
			inset 0 2px 4px rgba(255, 255, 255, 0.25);
		position: relative;
		overflow: hidden;
	}

	.selected-avatar::before {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%);
		border-radius: 50%;
	}

	.selected-name {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		color: var(--color-gray-800);
	}

	.pin-display {
		display: flex;
		gap: var(--spacing-2);
		margin-bottom: var(--spacing-4);
	}

	.pin-dot {
		width: 14px;
		height: 14px;
		border-radius: 50%;
		border: 2px solid var(--color-gray-300);
		background: transparent;
		transition: all 0.15s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.pin-dot.filled {
		border-color: var(--color-gray-800);
		background: var(--color-gray-800);
		transform: scale(1.1);
	}

	.pin-dot.current {
		border-color: var(--color-gray-400);
		animation: pulse 1.5s ease-in-out infinite;
	}

	.pin-dot-inner {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: white;
	}

	.error-message {
		color: #DC2626;
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		margin-bottom: var(--spacing-4);
		padding: var(--spacing-2) var(--spacing-4);
		background: rgba(220, 38, 38, 0.1);
		border-radius: var(--radius-lg);
	}

	.pin-pad {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--spacing-3);
		width: 100%;
		max-width: 280px;
	}

	.pin-key {
		width: 72px;
		height: 72px;
		border-radius: 50%;
		border: none;
		background: white;
		color: var(--color-gray-800);
		font-size: 28px;
		font-weight: var(--font-weight-semibold);
		cursor: pointer;
		transition: all 0.15s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 
			0 4px 12px -2px rgba(0, 0, 0, 0.08),
			0 2px 4px rgba(0, 0, 0, 0.04),
			inset 0 1px 0 rgba(255, 255, 255, 0.8);
		justify-self: center;
		position: relative;
		overflow: hidden;
	}

	.pin-key::before {
		content: '';
		position: absolute;
		inset: 0;
		background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8) 0%, transparent 60%);
		opacity: 0.5;
	}

	.pin-key:hover:not(:disabled) {
		background: var(--color-gray-50);
		transform: translateY(-2px);
		box-shadow: 
			0 8px 20px -4px rgba(0, 0, 0, 0.12),
			0 4px 8px rgba(0, 0, 0, 0.06),
			inset 0 1px 0 rgba(255, 255, 255, 0.8);
	}

	.pin-key:active:not(:disabled) {
		transform: translateY(0) scale(0.95);
		box-shadow: 
			0 2px 8px -2px rgba(0, 0, 0, 0.1),
			inset 0 2px 4px rgba(0, 0, 0, 0.05);
	}

	.pin-key:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.pin-key-action {
		background: var(--color-gray-100);
		color: var(--color-gray-600);
	}

	.pin-key-action:hover:not(:disabled) {
		background: var(--color-gray-200);
	}

	.pin-key-submit {
		background: var(--color-gray-200);
		color: var(--color-gray-400);
	}

	.pin-key-submit.ready {
		background: linear-gradient(135deg, #22C55E 0%, #16A34A 100%);
		color: white;
		box-shadow: 
			0 4px 16px -4px rgba(34, 197, 94, 0.5),
			0 2px 4px rgba(0, 0, 0, 0.04),
			inset 0 1px 0 rgba(255, 255, 255, 0.3);
	}

	.pin-key-submit.ready:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 
			0 8px 24px -4px rgba(34, 197, 94, 0.6),
			0 4px 8px rgba(0, 0, 0, 0.06),
			inset 0 1px 0 rgba(255, 255, 255, 0.3);
	}

	.spinner {
		width: 24px;
		height: 24px;
		border: 3px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	.login-notice {
		margin-top: var(--spacing-6);
		font-size: var(--font-size-xs);
		color: var(--color-gray-500);
	}

	@keyframes scaleIn {
		from {
			opacity: 0;
			transform: scale(0.95);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	@keyframes shake {
		0%, 100% { transform: translateX(0); }
		20% { transform: translateX(-10px); }
		40% { transform: translateX(10px); }
		60% { transform: translateX(-8px); }
		80% { transform: translateX(8px); }
	}

	.shake {
		animation: shake 0.4s ease-in-out;
	}

	@keyframes pulse {
		0%, 100% { 
			border-color: var(--color-gray-300);
			transform: scale(1);
		}
		50% { 
			border-color: var(--color-gray-500);
			transform: scale(1.1);
		}
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	@media (max-width: 480px) {
		.login-card {
			padding: var(--spacing-6);
			border-radius: var(--radius-2xl);
		}

		.login-title {
			font-size: var(--font-size-2xl);
		}

		.login-subtitle {
			font-size: var(--font-size-base);
		}

		.user-avatar {
			width: 72px;
			height: 72px;
			font-size: 28px;
		}

		.pin-key {
			width: 64px;
			height: 64px;
			font-size: 24px;
		}

		.pin-pad {
			gap: var(--spacing-2);
			max-width: 240px;
		}

		.user-selector {
			gap: var(--spacing-4);
		}
	}

	@media (max-width: 375px) {
		.login-card {
			padding: var(--spacing-4);
		}

		.login-header {
			margin-bottom: var(--spacing-6);
		}

		.user-avatar {
			width: 64px;
			height: 64px;
			font-size: 24px;
		}

		.pin-key {
			width: 56px;
			height: 56px;
			font-size: 22px;
		}

		.pin-pad {
			gap: var(--spacing-2);
			max-width: 200px;
		}

		.pin-dot {
			width: 12px;
			height: 12px;
		}
	}

	@media (max-width: 320px) {
		.pin-key {
			width: 52px;
			height: 52px;
			font-size: 20px;
		}

		.pin-pad {
			max-width: 180px;
		}
	}
</style>
