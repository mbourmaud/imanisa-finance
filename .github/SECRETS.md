# GitHub Secrets Configuration

This project uses GitHub Actions for CI/CD. The following secrets must be configured in your repository settings.

## Required Secrets

### Codecov
| Secret | Description |
|--------|-------------|
| `CODECOV_TOKEN` | Token from [codecov.io](https://codecov.io) for coverage uploads |

### Vercel Deployment
| Secret | Description |
|--------|-------------|
| `VERCEL_TOKEN` | Personal access token from [Vercel Account Settings](https://vercel.com/account/settings/tokens) |
| `VERCEL_ORG_ID` | Organization ID (found in Vercel project settings) |
| `VERCEL_PROJECT_ID` | Project ID (found in Vercel project settings) |

### Supabase Deployment
| Secret | Description |
|--------|-------------|
| `SUPABASE_ACCESS_TOKEN` | Personal access token from [Supabase Dashboard](https://app.supabase.com/account/tokens) |
| `SUPABASE_PROJECT_REF` | Project reference ID (found in project settings) |
| `DATABASE_URL` | Direct PostgreSQL connection string for migrations |

## How to Add Secrets

1. Go to your repository on GitHub
2. Navigate to **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**
4. Add each secret with its corresponding value

## Environment Setup

For production deployments, create a GitHub Environment named `production`:

1. Go to **Settings** > **Environments**
2. Click **New environment**
3. Name it `production`
4. Configure protection rules as needed (e.g., required reviewers)

## Local Development

For local development, copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```
