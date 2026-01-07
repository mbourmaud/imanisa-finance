<script>
    let file = null;
    let importType = 'investment';
    let institution = '';
    let accountName = '';
    let importing = false;
    let result = null;
    let error = null;

    const fmt = (n) => new Intl.NumberFormat('fr-FR', { 
        style: 'currency', 
        currency: 'EUR' 
    }).format(n || 0);

    async function handleImport() {
        if (!file) return;
        
        importing = true;
        error = null;
        result = null;

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', importType);
            if (institution) formData.append('institution', institution);
            if (accountName) formData.append('account_name', accountName);

            const res = await fetch('/api/import', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.error || 'Import failed');
            }

            result = data;
        } catch (e) {
            error = e.message;
        } finally {
            importing = false;
        }
    }

    function handleFileSelect(e) {
        file = e.target.files[0];
        if (file) {
            const name = file.name.toLowerCase();
            if (name.includes('caisse') || name.includes('epargne') || name.includes('ce_')) {
                importType = 'bank';
                institution = 'caisse_epargne';
            } else if (name.includes('cic')) {
                importType = 'bank';
                institution = 'cic';
            } else if (name.includes('revolut')) {
                importType = 'bank';
                institution = 'revolut';
            } else if (name.includes('linxea')) {
                importType = 'investment';
                institution = 'linxea';
            } else if (name.includes('bourse') || name.includes('bd_')) {
                importType = 'investment';
                institution = 'bourse_direct';
            }
        }
    }
</script>

<svelte:head>
    <title>Import CSV - Imanisa Finance</title>
</svelte:head>

<main>
    <header>
        <a href="/" class="back">← Retour</a>
        <h1>📥 Import CSV</h1>
    </header>

    <section class="import-form">
        <h2>Importer un fichier</h2>
        
        <div class="form-group">
            <label for="importType">Type d'import</label>
            <select id="importType" bind:value={importType}>
                <option value="bank">Compte bancaire (transactions)</option>
                <option value="investment">Investissements (positions)</option>
            </select>
        </div>

        {#if importType === 'bank'}
            <div class="form-group">
                <label for="institution">Banque</label>
                <select id="institution" bind:value={institution}>
                    <option value="">Détection automatique</option>
                    <option value="caisse_epargne">Caisse d'Épargne</option>
                    <option value="cic">CIC</option>
                    <option value="revolut">Revolut</option>
                </select>
            </div>
        {:else}
            <div class="form-group">
                <label for="institution">Plateforme</label>
                <select id="institution" bind:value={institution}>
                    <option value="">Détection automatique</option>
                    <option value="bourse_direct">Bourse Direct (PEA / CTO)</option>
                    <option value="linxea">Linxea (Assurance Vie)</option>
                </select>
            </div>
        {/if}

        <div class="form-group">
            <label for="accountName">Nom du compte (optionnel)</label>
            <input type="text" id="accountName" bind:value={accountName} placeholder="Ex: PEA, Compte Joint...">
        </div>

        <div class="form-group">
            <label for="file">Fichier CSV</label>
            <input 
                type="file" 
                id="file" 
                accept=".csv,.txt"
                onchange={handleFileSelect}
            >
        </div>

        <button onclick={handleImport} disabled={!file || importing}>
            {importing ? '⏳ Import en cours...' : '📤 Importer'}
        </button>
    </section>

    {#if error}
        <div class="error">❌ {error}</div>
    {/if}

    {#if result}
        <section class="result">
            <h2>✅ Import réussi !</h2>
            
            {#if result.type === 'bank'}
                <p>
                    <strong>{result.transactions_imported}</strong> transactions importées
                    (format: {result.detected_format})
                </p>
                <p>Solde calculé: <strong>{fmt(result.balance)}</strong></p>
            {:else}
                <p>
                    <strong>{result.positions_imported}</strong> positions importées
                    (format: {result.detected_format})
                </p>
                
                <table>
                    <thead>
                        <tr>
                            <th>Symbole</th>
                            <th>Nom</th>
                            <th>Quantité</th>
                            <th>Valeur</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each result.positions as pos}
                            <tr>
                                <td>{pos.symbol}</td>
                                <td>{pos.name}</td>
                                <td>{pos.quantity}</td>
                                <td>{fmt(pos.value)}</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            {/if}

            <a href="/" class="btn">Voir le dashboard</a>
        </section>
    {/if}

    <section class="instructions">
        <h2>Comment exporter vos données ?</h2>
        
        <div class="tabs">
            <h3>🏦 Comptes bancaires</h3>
            
            <div class="instruction-card">
                <h4>Caisse d'Épargne</h4>
                <ol>
                    <li>Connectez-vous sur caisse-epargne.fr</li>
                    <li>Allez dans "Mes comptes" → sélectionnez le compte</li>
                    <li>Cliquez sur "Exporter" (icône téléchargement)</li>
                    <li>Choisissez le format CSV</li>
                </ol>
            </div>

            <div class="instruction-card">
                <h4>CIC</h4>
                <ol>
                    <li>Connectez-vous sur cic.fr</li>
                    <li>Allez dans "Comptes" → "Historique"</li>
                    <li>Cliquez sur "Exporter" en haut à droite</li>
                    <li>Sélectionnez CSV et la période</li>
                </ol>
            </div>

            <div class="instruction-card">
                <h4>Revolut</h4>
                <ol>
                    <li>Ouvrez l'app Revolut ou revolut.com</li>
                    <li>Allez dans le compte → "Relevés"</li>
                    <li>Cliquez sur "Générer un relevé"</li>
                    <li>Choisissez CSV et la période</li>
                </ol>
            </div>
        </div>

        <div class="tabs">
            <h3>📈 Investissements</h3>
            
            <div class="instruction-card">
                <h4>Bourse Direct</h4>
                <ol>
                    <li>Connectez-vous sur boursedirect.fr</li>
                    <li>Allez dans "Portefeuille"</li>
                    <li>Cliquez sur "Exporter" ou l'icône CSV</li>
                    <li>Téléchargez le fichier</li>
                </ol>
            </div>

            <div class="instruction-card">
                <h4>Linxea</h4>
                <ol>
                    <li>Connectez-vous sur votre espace Linxea</li>
                    <li>Allez dans "Mes contrats" → votre contrat</li>
                    <li>Téléchargez le "Relevé de situation"</li>
                    <li>Si PDF, copiez dans Excel puis exportez en CSV</li>
                </ol>
            </div>
        </div>
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

    h3 {
        margin-top: 20px;
        margin-bottom: 15px;
        color: #333;
    }

    h4 {
        margin: 0 0 10px 0;
        color: #007bff;
    }

    .form-group {
        margin-bottom: 20px;
    }

    label {
        display: block;
        margin-bottom: 5px;
        font-weight: 500;
    }

    select, input[type="file"], input[type="text"] {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 1em;
        box-sizing: border-box;
    }

    button, .btn {
        padding: 12px 24px;
        border: none;
        border-radius: 6px;
        background: #007bff;
        color: white;
        cursor: pointer;
        font-size: 1em;
        text-decoration: none;
        display: inline-block;
    }

    button:hover, .btn:hover {
        background: #0056b3;
    }

    button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .error {
        background: #f8d7da;
        color: #721c24;
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 20px;
    }

    .result table {
        width: 100%;
        margin: 20px 0;
        border-collapse: collapse;
    }

    .result th, .result td {
        padding: 10px;
        text-align: left;
        border-bottom: 1px solid #eee;
    }

    .result th {
        background: #f8f9fa;
    }

    .instruction-card {
        background: #f8f9fa;
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 15px;
    }

    .instruction-card ol {
        margin: 0;
        padding-left: 20px;
    }

    .instruction-card li {
        margin-bottom: 5px;
    }
</style>
