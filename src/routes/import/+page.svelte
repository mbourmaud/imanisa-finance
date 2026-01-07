<script>
    let file = null;
    let institution = 'bourse_direct';
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
            formData.append('institution', institution);

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
        // Auto-detect institution from filename
        if (file) {
            const name = file.name.toLowerCase();
            if (name.includes('linxea')) {
                institution = 'linxea';
            } else if (name.includes('bourse') || name.includes('bd_')) {
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

    <section class="instructions">
        <h2>Comment exporter vos positions ?</h2>
        
        <div class="instruction-card">
            <h3>📈 Bourse Direct</h3>
            <ol>
                <li>Connectez-vous sur boursedirect.fr</li>
                <li>Allez dans "Portefeuille"</li>
                <li>Cliquez sur "Exporter" ou le bouton CSV</li>
                <li>Téléchargez le fichier</li>
            </ol>
        </div>

        <div class="instruction-card">
            <h3>💼 Linxea</h3>
            <ol>
                <li>Connectez-vous sur votre espace Linxea</li>
                <li>Allez dans "Mes contrats" → votre contrat</li>
                <li>Téléchargez le "Relevé de situation"</li>
                <li>Ou exportez depuis "Répartition"</li>
            </ol>
            <p class="note">Note: Si PDF, copiez les données dans un fichier Excel et exportez en CSV</p>
        </div>
    </section>

    <section class="import-form">
        <h2>Importer un fichier</h2>
        
        <div class="form-group">
            <label for="institution">Type de compte</label>
            <select id="institution" bind:value={institution}>
                <option value="bourse_direct">Bourse Direct (PEA / CTO)</option>
                <option value="linxea">Linxea (Assurance Vie)</option>
            </select>
        </div>

        <div class="form-group">
            <label for="file">Fichier CSV</label>
            <input 
                type="file" 
                id="file" 
                accept=".csv,.txt,.xls,.xlsx"
                onchange={handleFileSelect}
            >
        </div>

        <button onclick={handleImport} disabled={!file || importing}>
            {importing ? '⏳ Import en cours...' : '📤 Importer'}
        </button>
    </section>

    {#if error}
        <div class="error">
            ❌ {error}
        </div>
    {/if}

    {#if result}
        <section class="result">
            <h2>✅ Import réussi !</h2>
            <p>
                <strong>{result.positions_imported}</strong> positions importées
                (source détectée: {result.detected_source})
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

            <a href="/" class="btn">Voir le dashboard</a>
        </section>
    {/if}
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

    .instructions {
        display: grid;
        gap: 15px;
    }

    .instruction-card {
        background: #f8f9fa;
        padding: 15px;
        border-radius: 8px;
    }

    .instruction-card h3 {
        margin: 0 0 10px 0;
    }

    .instruction-card ol {
        margin: 0;
        padding-left: 20px;
    }

    .instruction-card li {
        margin-bottom: 5px;
    }

    .note {
        font-size: 0.85em;
        color: #666;
        margin-top: 10px;
        margin-bottom: 0;
    }

    .form-group {
        margin-bottom: 20px;
    }

    label {
        display: block;
        margin-bottom: 5px;
        font-weight: 500;
    }

    select, input[type="file"] {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 1em;
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
</style>
