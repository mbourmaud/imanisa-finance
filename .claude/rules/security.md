# Security Rules - CRITICAL

> **This repository is PUBLIC. NEVER commit sensitive data.**

## Files Forbidden in Git

- `.env`, `.env.local`, `.env.production` - Environment variables
- `.ralph/` - Ralph folder with test data (real transactions, names, amounts)
- `*.pem`, `*.key`, `*.crt` - Certificates and keys
- `credentials.json`, `secrets.json` - Secret files
- Screenshots with personal data

## Pre-Commit Checks

```bash
# Check that no secret is staged
git diff --cached | grep -E "(password|secret|api_key|token|DATABASE_URL|SUPABASE)" || echo "OK"

# Check added files
git status | grep -E "\.env|credential|secret|\.ralph"
```

## Data That Must Never Be Logged/Committed

- Database URLs with credentials
- Supabase, Vercel, GitHub tokens
- Real household member names in code (use placeholders)
- Real transaction/account amounts in tests
- Bank account numbers

## Required .gitignore

```gitignore
.env*
.ralph/
*.pem
*.key
credentials*.json
```

## In Case of Leak

If a secret was committed by mistake:
1. **Immediately revoke** the concerned secret (regenerate the token)
2. Use `git filter-branch` or BFG Repo-Cleaner to remove from history
3. Force push after cleanup
