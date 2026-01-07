<script>
    import { onMount } from 'svelte';

    let data = null;
    let loading = true;
    let error = null;
    let syncing = false;
    let updatingPrices = false;

    // Format monétaire
    const fmt = (n) => new Intl.NumberFormat('fr-FR', { 
        style: 'currency', 
        currency: 'EUR' 
    }).format(n || 0);

    // Format pourcentage
    const pct = (n) => new Intl.NumberFormat('fr-FR', { 
        style: 'percent', 
        minimumFractionDigits: 2 
    }).format(n || 0);

    async function loadDashboard() {
        try {
            const res = await fetch('/api/dashboard');
            data = await res.json();
        } catch (e) {
            error = e.message;
        } finally {
            loading = false;
        }
    }

    async function syncBanks() {
        syncing = true;
        try {
            await fetch('/api/sync', { method: 'POST', body: '{}' });
            await loadDashboard();
        } catch (e) {
            error = e.message;
        } finally {
            syncing = false;
        }
    }

    async function updatePrices() {
        updatingPrices = true;
        try {
            await fetch('/api/prices', { method: 'POST', body: '{}' });
            await loadDashboard();
        } catch (e) {
            error = e.message;
        } finally {
            updatingPrices = false;
        }
    }

    onMount(loadDashboard);
</script>

<svelte:head>
    <title>Imanisa Finance</title>
</svelte:head>

<main>
    <header>
        <div class="header-left">
            <h1>💰 Imanisa Finance</h1>
            {#if data?.user}
                <span class="user-name">Bonjour, {data.user.name.split(' ')[0]}</span>
            {/if}
        </div>
        <div class="actions">
            <button onclick={syncBanks} disabled={syncing}>
                {syncing ? '⏳' : '🔄'} Sync
            </button>
            <button onclick={updatePrices} disabled={updatingPrices}>
                {updatingPrices ? '⏳' : '📈'} Prix
            </button>
            <a href="/import" class="btn">📥 Import</a>
            <a href="/settings" class="btn">⚙️ Config</a>
            <a href="/api/auth/logout" class="btn btn-secondary">Déconnexion</a>
        </div>
    </header>

    {#if loading}
        <div class="loading">Chargement...</div>
    {:else if error}
        <div class="error">{error}</div>
    {:else if data}
        <!-- Résumé patrimoine -->
        <section class="summary">
            <div class="card total">
                <span class="label">Patrimoine total</span>
                <span class="value">{fmt(data.summary.net_worth)}</span>
            </div>
            <div class="card">
                <span class="label">Comptes bancaires</span>
                <span class="value">{fmt(data.summary.bank_total)}</span>
            </div>
            <div class="card">
                <span class="label">Investissements</span>
                <span class="value">{fmt(data.summary.investment_total)}</span>
            </div>
        </section>

        <!-- Comptes bancaires -->
        {#if data.bank_accounts.length > 0}
            <section>
                <h2>🏦 Comptes bancaires</h2>
                <div class="accounts-grid">
                    {#each data.bank_accounts as account}
                        <div class="account-card">
                            <div class="account-header">
                                <span class="name">{account.name}</span>
                                <span class="institution">{account.institution}</span>
                            </div>
                            <div class="balance">{fmt(account.balance)}</div>
                            {#if account.last_synced_at}
                                <div class="sync-date">
                                    Sync: {new Date(account.last_synced_at).toLocaleDateString('fr-FR')}
                                </div>
                            {/if}
                        </div>
                    {/each}
                </div>
            </section>
        {/if}

        <!-- Comptes investissement -->
        {#if data.investment_accounts.length > 0}
            <section>
                <h2>📊 Investissements</h2>
                <div class="accounts-grid">
                    {#each data.investment_accounts as account}
                        <div class="account-card">
                            <div class="account-header">
                                <span class="name">{account.name}</span>
                                <span class="institution">{account.institution}</span>
                            </div>
                            <div class="balance">{fmt(account.total_value)}</div>
                            <div class="pnl" class:positive={account.unrealized_pnl >= 0} class:negative={account.unrealized_pnl < 0}>
                                {account.unrealized_pnl >= 0 ? '+' : ''}{fmt(account.unrealized_pnl)}
                            </div>
                            <div class="positions-count">{account.positions_count} positions</div>
                        </div>
                    {/each}
                </div>
            </section>
        {/if}

        <!-- Top positions -->
        {#if data.positions.length > 0}
            <section>
                <h2>📈 Positions</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Actif</th>
                            <th>Compte</th>
                            <th>Qté</th>
                            <th>Cours</th>
                            <th>Valeur</th>
                            <th>+/- Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each data.positions.slice(0, 20) as pos}
                            <tr>
                                <td>
                                    <strong>{pos.name}</strong>
                                    <small>{pos.symbol}</small>
                                </td>
                                <td>{pos.account_name}</td>
                                <td>{pos.quantity.toFixed(2)}</td>
                                <td>{fmt(pos.last_price)}</td>
                                <td>{fmt(pos.market_value)}</td>
                                <td class:positive={pos.unrealized_pnl >= 0} class:negative={pos.unrealized_pnl < 0}>
                                    {pos.unrealized_pnl >= 0 ? '+' : ''}{fmt(pos.unrealized_pnl)}
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </section>
        {/if}

        <!-- Transactions récentes -->
        {#if data.recent_transactions.length > 0}
            <section>
                <h2>💳 Transactions récentes</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Compte</th>
                            <th>Description</th>
                            <th>Montant</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each data.recent_transactions as tx}
                            <tr>
                                <td>{new Date(tx.date).toLocaleDateString('fr-FR')}</td>
                                <td>{tx.account_name}</td>
                                <td>{tx.description || tx.counterparty || '-'}</td>
                                <td class:positive={tx.amount >= 0} class:negative={tx.amount < 0}>
                                    {fmt(tx.amount)}
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </section>
        {/if}

        <!-- Message si vide -->
        {#if data.bank_accounts.length === 0 && data.investment_accounts.length === 0}
            <section class="empty">
                <h2>🚀 Bienvenue !</h2>
                <p>Ton patrimoine est vide. Pour commencer :</p>
                <ol>
                    <li><a href="/settings">Configure GoCardless</a> pour connecter tes banques (CE, CIC, Revolut)</li>
                    <li><a href="/import">Importe un CSV</a> de Bourse Direct ou Linxea</li>
                </ol>
            </section>
        {/if}
    {/if}
</main>

<style>
    :global(body) {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        margin: 0;
        padding: 0;
        background: #f5f5f5;
        color: #333;
    }

    main {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
    }

    header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
    }

    .header-left {
        display: flex;
        align-items: baseline;
        gap: 15px;
    }

    header h1 {
        margin: 0;
    }

    .user-name {
        font-size: 0.9em;
        color: #666;
    }

    .actions {
        display: flex;
        gap: 10px;
    }

    button, .btn {
        padding: 8px 16px;
        border: none;
        border-radius: 6px;
        background: #007bff;
        color: white;
        cursor: pointer;
        text-decoration: none;
        font-size: 14px;
    }

    button:hover, .btn:hover {
        background: #0056b3;
    }

    button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .btn-secondary {
        background: #6c757d;
    }

    .btn-secondary:hover {
        background: #545b62;
    }

    section {
        margin-bottom: 30px;
    }

    h2 {
        margin-bottom: 15px;
        font-size: 1.2em;
    }

    .summary {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
    }

    .card {
        background: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .card.total {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
    }

    .card .label {
        display: block;
        font-size: 0.9em;
        opacity: 0.8;
    }

    .card .value {
        display: block;
        font-size: 1.8em;
        font-weight: bold;
        margin-top: 5px;
    }

    .accounts-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 15px;
    }

    .account-card {
        background: white;
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .account-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
    }

    .account-header .name {
        font-weight: bold;
    }

    .account-header .institution {
        font-size: 0.85em;
        color: #666;
    }

    .balance {
        font-size: 1.5em;
        font-weight: bold;
    }

    .pnl, .sync-date, .positions-count {
        font-size: 0.85em;
        color: #666;
        margin-top: 5px;
    }

    .positive { color: #28a745; }
    .negative { color: #dc3545; }

    table {
        width: 100%;
        background: white;
        border-collapse: collapse;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    th, td {
        padding: 12px 15px;
        text-align: left;
        border-bottom: 1px solid #eee;
    }

    th {
        background: #f8f9fa;
        font-weight: 600;
    }

    td small {
        display: block;
        color: #666;
        font-size: 0.85em;
    }

    .loading, .error {
        text-align: center;
        padding: 40px;
    }

    .error {
        color: #dc3545;
    }

    .empty {
        background: white;
        padding: 40px;
        border-radius: 10px;
        text-align: center;
    }

    .empty ol {
        text-align: left;
        display: inline-block;
    }

    .empty a {
        color: #007bff;
    }
</style>
