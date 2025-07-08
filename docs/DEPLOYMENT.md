# Deployment Guide for CommerceCrafted on Vercel

## Prerequisites
- GitHub repository connected to Vercel
- PostgreSQL database (e.g., Vercel Postgres, Neon, or Supabase)
- Google Cloud project with BigQuery API enabled
- Amazon SP-API credentials (optional for real-time data)

## Environment Variables Setup

### 1. Database Configuration
```bash
DATABASE_URL="postgresql://..."  # Your PostgreSQL connection string
DIRECT_URL="postgresql://..."    # Direct connection for migrations
```

### 2. Authentication
```bash
NEXTAUTH_URL="https://commercecrafted.com"
NEXTAUTH_SECRET="..."  # Generate with: openssl rand -base64 32
```

### 3. Google BigQuery
```bash
# IMPORTANT: In Vercel, store the entire JSON as a single string
GOOGLE_APPLICATION_CREDENTIALS_JSON='{"type":"service_account","project_id":"commercecrafted",...}'
BIGQUERY_PROJECT_ID="commercecrafted"
BIGQUERY_DATASET="amazon_analytics"
```

### 4. Amazon SP-API (Optional)
```bash
AMAZON_SP_API_REGION="na"
AMAZON_SP_API_ACCESS_KEY="..."
AMAZON_SP_API_SECRET_KEY="..."
AMAZON_SP_API_REFRESH_TOKEN="..."
AMAZON_SP_API_ROLE_ARN="..."
AMAZON_SP_API_CLIENT_ID="..."
AMAZON_SP_API_CLIENT_SECRET="..."
```

### 5. Other Services (Optional)
```bash
OPENAI_API_KEY="..."
STRIPE_SECRET_KEY="..."
STRIPE_WEBHOOK_SECRET="..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="..."
```

## Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Production deployment with BigQuery integration"
git push origin main
```

### 2. Configure Vercel
1. Go to your Vercel dashboard
2. Import the project from GitHub if not already done
3. Navigate to Settings → Environment Variables
4. Add all environment variables from `.env.production.example`
5. Use the `@` syntax in `vercel.json` to reference secrets

### 3. Database Setup
1. Create a PostgreSQL database
2. Run Prisma migrations:
   ```bash
   npx prisma migrate deploy
   ```

### 4. BigQuery Setup
1. Ensure BigQuery table exists:
   - Project: `commercecrafted`
   - Dataset: `amazon_analytics`
   - Table: `search_terms`
2. Verify service account has BigQuery Data Editor role

### 5. Deploy
```bash
npx vercel --prod
```

Or push to your main branch for automatic deployment.

## Post-Deployment Checklist

- [ ] Verify database connection
- [ ] Test API endpoints:
  - `/api/analytics/search-terms/v2`
  - `/api/analytics/trending`
- [ ] Check BigQuery integration
- [ ] Verify authentication flow
- [ ] Test production domain: https://commercecrafted.com

## Monitoring

### API Endpoints
- Search Terms: `/api/analytics/search-terms/v2?limit=10`
- Trending: `/api/analytics/trending?days=7&limit=20`
- Batch Search: POST `/api/analytics/search-terms/v2` with `{ keywords: ["term1", "term2"] }`

### BigQuery Status
- Total Records: 294,347+ search terms
- Data freshness: Weekly updates
- Query performance: < 1s for most queries

## Troubleshooting

### BigQuery Connection Issues
1. Verify `GOOGLE_APPLICATION_CREDENTIALS_JSON` is set correctly
2. Check service account permissions
3. Ensure BigQuery API is enabled

### Build Failures
1. Check Prisma schema compatibility
2. Verify all dependencies are installed
3. Review build logs in Vercel dashboard

### API Errors
1. Check environment variables are set
2. Verify database connection
3. Review API logs in Vercel Functions tab