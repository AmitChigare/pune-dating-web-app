# Production Deployment Guide (PaaS)

This guide documents the final production setup connecting a Next.js Frontend (Vercel) to a FastAPI Backend (Render) utilizing Supabase (PostgreSQL) and Upstash (Redis).

## 1. Supabase (Database)
We use Supabase as our managed PostgreSQL provider.
1. Create a **New Project** in Supabase and note the Database Password.
2. Navigate to **Project Settings -> Database**.
3. Locate **Connection String**.
4. **CRITICAL FLAG**: Check the **Use connection pooling** toggle, and ensure the **Session pooler** is elected. 
5. Under URI, copy the IPv4 connection string (`aws-0-[region].pooler.supabase.com`) and port (`6543` or `5432` depending on pooler version).
6. Note the `POSTGRES_USER` directly underneath the pooler URL. It's often modified (e.g., `postgres.project_id`).

## 2. Upstash (Redis)
We use Upstash as our managed Redis provider for Rate Limiting.
1. Create a **New Database** in Upstash.
2. Select an AWS region close to your Supabase/Render regions (e.g. Mumbai ap-south-1).
3. Copy the **Endpoint** (`REDIS_HOST`), **Port** (`REDIS_PORT`), and **Password** (`REDIS_PASSWORD`).
   - The connection string will use `rediss://` to communicate TLS-encryption back to Render.

## 3. Render (Backend Application)
Render mounts the FastAPI application via a Docker container on the Free Tier.
1. Create a **New Web Service** pointing to your GitHub repository.
2. Name it (e.g., `pune-dating-api`).
3. Set the Environment to **Docker**.
4. In the Render Environment Variables tab, inject your application strings:
    - `ENVIRONMENT`: `production`
    - `POSTGRES_DB`: `postgres`
    - `POSTGRES_USER`: (The one from the Supabase pooler)
    - `POSTGRES_PASSWORD`: (Your Supabase password)
        - Note: The application intelligently runs `urllib.parse.quote_plus()` to map special characters to percent-encoded HTTP symbols safely to circumvent Alembic interpolation crashes.
    - `POSTGRES_HOST`: (The IPv4 Pooler host from Supabase `aws-0...`)
    - `POSTGRES_PORT`: (The pooler port, e.g., `5432`)
    - `REDIS_HOST`: (Upstash Endpoint)
    - `REDIS_PASSWORD`: (Upstash Password)
    - `REDIS_PORT`: (Upstash Port)
    - `SECRET_KEY`: `your-random-secure-string`
5. **Auto-Migration:** A `start.sh` entrypoint shell script automatically executes `alembic upgrade head` before booting `uvicorn` on every build to guarantee table syncing, bypassing the lack of shell access on Free Tiers.

## 4. Vercel (Frontend Application)
Vercel is mapped to directly serve our Next.js edge-network.
1. Create a **New Project** pointing to your GitHub repository.
2. Adjust the **Root Directory** internally to the internal `frontend` folder.
3. Overwrite the **Build Command** to: `npm run build`
4. Set your Environment Variables:
    - `NEXT_PUBLIC_API_URL`: `https://[your-render-app-name].onrender.com/api/v1`
    - `NEXT_PUBLIC_WS_URL`: `wss://[your-render-app-name].onrender.com/api/v1`
5. Deploy.

## 5. Deployment Verification Flow
Watch the network pane upon first load.
- If `/api/v1/auth/login` 404s, ensure Vercel variable ends meticulously with `/api/v1`.
- If `/api/v1/auth/register` throws a 500 error, ensure Supabase pooler is properly configured as IPv4.
- If Render crashes entirely at boot, confirm Upstash Auth syntax.

🎉 The application is online across the open globe explicitly constrained to the Pune geo-boundaries.
