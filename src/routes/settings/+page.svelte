<script>
    import { onMount } from 'svelte';

    let secretId = '';
    let secretKey = '';
    let saving = false;
    let configured = false;
    let error = null;
    let success = null;

    let institutions = [];
    let loadingInstitutions = false;
    let searchQuery = '';
    let searchResults = [];
    let connecting = null;
    let connectionLink = null;

    async function saveConfig() {
        saving = true;
        error = null;
        success = null;

        try {
            const res = await fetch('/api/gocardless', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ secret_id: secretId, secret_key: secretKey })
            });

            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.error || 'Configuration failed');
            }

            configured = true;
            success = 'Configuration sauvegardée !';
            await loadInstitutions();
        } catch (e) {
            error = e.message;
        } finally {
            saving = false;
        }
    }

    async function loadInstitutions() {
        loadingInstitutions = true;
        try {
            const res = await fetch('/api/gocardless?action=institutions');
            const data = await res.json();
            if (data.institutions) {
                institutions = data.institutions;
            }
        } catch (e) {
            console.error('Failed to load institutions:', e);
        } finally {
            loadingInstitutions = false;
        }
    }

    async function searchInstitutions() {
        if (!searchQuery.trim()) {
            searchResults = [];
            return;
        }

        try {
            const res = await fetch(`/api/gocardless?action=search&q=${encodeURIComponent(searchQuery)}`);
            const data = await res.json();
            searchResults = data.results || [];
        } catch (e) {
            console.error('Search failed:', e);
        }
    }

    async function connectBank(institutionId, institutionName) {
        connecting = institutionId;
        connectionLink = null;
        error = null;

        try {
            const res = await fetch(`/api/gocardless?action=connect&institution_id=${institutionId}`);
            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.error || 'Connection failed');
            }

            connectionLink = {
                name: institutionName,
                link: data.link,
                requisitionId: data.requisition_id
            };
        } catch (e) {
            error = e.message;
        } finally {
            connecting = null;
        }
    }

    onMount(async () => {
        try {
            const res = await fetch('/api/gocardless?action=status');
            if (res.ok) {
                configured = true;
                await loadInstitutions();
            }
        } catch (e) {
            // Not configured yet
        }
    });
</script>

<svelte:head>
    <title>Configuration - Imanisa Finance</title>
</svelte:head>

<main>
    <header>
        <a href="/" class="back">← Retour</a>
        <h1>⚙️ Configuration</h1>
    </header>

    <section>
        <h2>🔗 GoCardless Bank Account Data</h2>
        
        <p class="intro">
            GoCardless permet de synchroniser automatiquement vos comptes bancaires.
            <a href="https://bankaccountdata.gocardless.com/" target="_blank">
                Créez un compte gratuit
            </a> (50 connexions gratuites).
        </p>

        <div class="form-group">
            <label for="secretId">Secret ID</label>
            <input 
                type="text" 
                id="secretId" 
                bind:value={secretId}
                placeholder="Votre secret_id GoCardless"
            >
        </div>

        <div class="form-group">
            <label for="secretKey">Secret Key</label>
            <input 
                type="password" 
                id="secretKey" 
                bind:value={secretKey}
                placeholder="Votre secret_key GoCardless"
            >
        </div>

        <button onclick={saveConfig} disabled={saving || !secretId || !secretKey}>
            {saving ? '⏳ Sauvegarde...' : '💾 Sauvegarder'}
        </button>

        {#if error}
            <div class="error">❌ {error}</div>
        {/if}

        {#if success}
            <div class="success">✅ {success}</div>
        {/if}
    </section>

    {#if configured}
        <section>
            <h2>🏦 Connecter une banque</h2>

            <div class="bank-grid">
                <h3>Banques recommandées</h3>
                <div class="quick-banks">
                    {#each institutions.filter(i => 
                        i.name.toLowerCase().includes('caisse') ||
                        i.name.toLowerCase().includes('cic') ||
                        i.name.toLowerCase().includes('revolut')
                    ).slice(0, 6) as inst}
                        <button 
                            class="bank-btn"
                            onclick={() => connectBank(inst.id, inst.name)}
                            disabled={connecting === inst.id}
                        >
                            {#if inst.logo}
                                <img src={inst.logo} alt="" class="bank-logo">
                            {/if}
                            <span>{inst.name}</span>
                            {#if connecting === inst.id}
                                <span class="spinner">⏳</span>
                            {/if}
                        </button>
                    {/each}
                </div>
            </div>

            <div class="search-section">
                <h3>Rechercher une autre banque</h3>
                <div class="search-box">
                    <input 
                        type="text" 
                        bind:value={searchQuery}
                        oninput={searchInstitutions}
                        placeholder="Nom de la banque..."
                    >
                </div>

                {#if searchResults.length > 0}
                    <div class="search-results">
                        {#each searchResults as inst}
                            <button 
                                class="bank-btn small"
                                onclick={() => connectBank(inst.id, inst.name)}
                                disabled={connecting === inst.id}
                            >
                                {inst.name}
                            </button>
                        {/each}
                    </div>
                {/if}
            </div>

            {#if connectionLink}
                <div class="connection-link">
                    <h3>🔐 Connexion à {connectionLink.name}</h3>
                    <p>Cliquez sur le lien ci-dessous pour vous connecter à votre banque :</p>
                    <a href={connectionLink.link} target="_blank" class="btn-primary">
                        Se connecter à {connectionLink.name}
                    </a>
                    <p class="note">
                        Vous serez redirigé vers le site de votre banque pour autoriser l'accès.
                        Une fois terminé, vous reviendrez automatiquement ici.
                    </p>
                </div>
            {/if}
        </section>
    {/if}

    <section class="help">
        <h2>📖 Comment ça marche ?</h2>
        
        <ol>
            <li>
                <strong>Créez un compte GoCardless</strong><br>
                Rendez-vous sur <a href="https://bankaccountdata.gocardless.com/" target="_blank">bankaccountdata.gocardless.com</a> 
                et créez un compte gratuit.
            </li>
            <li>
                <strong>Générez vos credentials</strong><br>
                Dans "User secrets", créez une nouvelle clé. Copiez le Secret ID et Secret Key.
            </li>
            <li>
                <strong>Configurez Imanisa Finance</strong><br>
                Collez vos credentials ci-dessus et sauvegardez.
            </li>
            <li>
                <strong>Connectez vos banques</strong><br>
                Cliquez sur votre banque, autorisez l'accès, et vos transactions seront synchronisées !
            </li>
        </ol>

        <h3>Banques supportées</h3>
        <ul>
            <li>✅ <strong>Caisse d'Épargne Bretagne-Pays de Loire</strong> - 90 jours d'historique</li>
            <li>✅ <strong>CIC</strong> - 90 jours d'historique</li>
            <li>✅ <strong>Revolut</strong> - 730 jours d'historique</li>
        </ul>

        <h3>Pour les investissements</h3>
        <p>
            Bourse Direct et Linxea ne sont pas supportés par GoCardless.
            Utilisez l'<a href="/import">import CSV</a> pour ajouter vos positions manuellement.
        </p>
    </section>
</main>

<style>
    main {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
    }

    header {
        margin-bottom: 30px;
    }

    .back {
        color: #666;
        text-decoration: none;
        font-size: 0.9em;
    }

    h1 {
        margin: 10px 0 0 0;
    }

    section {
        background: white;
        padding: 25px;
        border-radius: 10px;
        margin-bottom: 20px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    h2 {
        margin-top: 0;
    }

    .intro {
        color: #666;
        margin-bottom: 20px;
    }

    .intro a {
        color: #007bff;
    }

    .form-group {
        margin-bottom: 15px;
    }

    label {
        display: block;
        margin-bottom: 5px;
        font-weight: 500;
    }

    input[type="text"],
    input[type="password"] {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 1em;
        box-sizing: border-box;
    }

    button {
        padding: 10px 20px;
        border: none;
        border-radius: 6px;
        background: #007bff;
        color: white;
        cursor: pointer;
        font-size: 1em;
    }

    button:hover {
        background: #0056b3;
    }

    button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .error {
        background: #f8d7da;
        color: #721c24;
        padding: 10px;
        border-radius: 6px;
        margin-top: 15px;
    }

    .success {
        background: #d4edda;
        color: #155724;
        padding: 10px;
        border-radius: 6px;
        margin-top: 15px;
    }

    .bank-grid h3 {
        margin-top: 0;
    }

    .quick-banks {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 10px;
        margin-bottom: 20px;
    }

    .bank-btn {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 15px;
        background: #f8f9fa;
        border: 1px solid #ddd;
        border-radius: 8px;
        cursor: pointer;
        text-align: left;
        color: #333;
    }

    .bank-btn:hover {
        background: #e9ecef;
        border-color: #007bff;
    }

    .bank-btn.small {
        padding: 8px 12px;
        font-size: 0.9em;
    }

    .bank-logo {
        width: 24px;
        height: 24px;
        object-fit: contain;
    }

    .search-box input {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 6px;
        margin-bottom: 15px;
        box-sizing: border-box;
    }

    .search-results {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }

    .connection-link {
        background: #e7f3ff;
        padding: 20px;
        border-radius: 8px;
        margin-top: 20px;
    }

    .connection-link h3 {
        margin-top: 0;
    }

    .btn-primary {
        display: inline-block;
        padding: 12px 24px;
        background: #007bff;
        color: white;
        text-decoration: none;
        border-radius: 6px;
        font-weight: 500;
    }

    .btn-primary:hover {
        background: #0056b3;
    }

    .note {
        font-size: 0.9em;
        color: #666;
        margin-top: 15px;
    }

    .help ol, .help ul {
        padding-left: 20px;
    }

    .help li {
        margin-bottom: 15px;
    }

    .help a {
        color: #007bff;
    }
</style>
