<script>
    let error = null;
    
    const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    error = urlParams.get('error');
</script>

<svelte:head>
    <title>Connexion - Imanisa Finance</title>
</svelte:head>

<main>
    <div class="login-container">
        <div class="login-card">
            <h1>💰 Imanisa Finance</h1>
            <p class="subtitle">Connectez-vous pour accéder à votre patrimoine</p>
            
            {#if error}
                <div class="error">
                    {#if error === 'unauthorized'}
                        Votre email n'est pas autorisé. Contactez l'administrateur.
                    {:else if error === 'failed'}
                        Erreur de connexion. Veuillez réessayer.
                    {:else}
                        {error}
                    {/if}
                </div>
            {/if}

            <a href="/api/auth/login" class="google-btn">
                <svg viewBox="0 0 24 24" width="24" height="24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Se connecter avec Google
            </a>
        </div>
    </div>
</main>

<style>
    main {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .login-container {
        padding: 20px;
    }

    .login-card {
        background: white;
        padding: 40px;
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        text-align: center;
        max-width: 400px;
    }

    h1 {
        margin: 0 0 10px 0;
        font-size: 2em;
    }

    .subtitle {
        color: #666;
        margin-bottom: 30px;
    }

    .error {
        background: #f8d7da;
        color: #721c24;
        padding: 12px;
        border-radius: 8px;
        margin-bottom: 20px;
        font-size: 0.9em;
    }

    .google-btn {
        display: inline-flex;
        align-items: center;
        gap: 12px;
        padding: 12px 24px;
        background: white;
        border: 2px solid #ddd;
        border-radius: 8px;
        font-size: 1em;
        font-weight: 500;
        color: #333;
        text-decoration: none;
        transition: all 0.2s;
    }

    .google-btn:hover {
        border-color: #4285F4;
        box-shadow: 0 2px 8px rgba(66, 133, 244, 0.3);
    }
</style>
