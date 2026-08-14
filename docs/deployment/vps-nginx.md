# VPS Deployment With Nginx

Target shape:

```text
internet
  -> nginx on Ubuntu host
    -> 127.0.0.1:3000 portal container
    -> 127.0.0.1:4001 device-gateway container
postgres stays inside Docker / localhost only
```

## 1. Prepare The Server

- Install Docker Engine and the Docker Compose plugin.
- Install nginx.
- Point DNS records to the VPS:
  - `attendance.example.com`
  - `devices.attendance.example.com`
- Allow only SSH, HTTP, and HTTPS through the VPS firewall.
- Do not expose Postgres to the public internet.

## 2. Create Production Environment

```bash
cp .env.prod.example .env.prod
```

Edit `.env.prod` and replace every `replace-with-*` value.

Use long random values for:

- `POSTGRES_PASSWORD`
- `SESSION_SECRET`

`POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` initialize PostgreSQL. `DATABASE_URL`
is the connection URL used inside the application containers and must use `postgres` as its
hostname. Keep its credentials synchronized with the PostgreSQL values. Percent-encode any
URI-special characters in the password when placing it in `DATABASE_URL`.

`POSTGRES_VOLUME_NAME` gives production storage a stable name independent of the checkout
directory or Compose project name. Never change it on an existing deployment unless you are
deliberately migrating or restoring the database. When upgrading a deployment created with
the former shared `docker-compose.yml`, find its existing volume with `docker volume ls` and
set `POSTGRES_VOLUME_NAME` to that exact name before starting the new production stack.

Keep these binds unless you intentionally move nginx into Docker:

```dotenv
PORTAL_BIND=127.0.0.1:3000
DEVICE_GATEWAY_BIND=127.0.0.1:4001
POSTGRES_BIND=127.0.0.1:5432
```

## 3. Validate Compose Config

```bash
docker compose -p workforce-prod --env-file .env.prod -f docker-compose.prod.yml config
```

## 4. Build Images And Start PostgreSQL

```bash
docker compose -p workforce-prod --env-file .env.prod -f docker-compose.prod.yml build
docker compose -p workforce-prod --env-file .env.prod -f docker-compose.prod.yml up -d postgres
```

## 5. Run Database Migrations

Run migrations after the database is healthy and before sending traffic to the app:

```bash
docker compose -p workforce-prod --env-file .env.prod -f docker-compose.prod.yml run --rm portal pnpm db:migrate:deploy
```

Do not run `pnpm db:seed` in production. The bundled seed is development-only.

## 6. Start Application Services

```bash
docker compose -p workforce-prod --env-file .env.prod -f docker-compose.prod.yml up -d
```

Check container health before directing traffic to a new deployment:

```bash
docker compose -p workforce-prod --env-file .env.prod -f docker-compose.prod.yml ps
```

## 7. Configure Nginx

Copy the sample config:

```bash
sudo cp infra/nginx/workforce-portal.conf /etc/nginx/sites-available/workforce-portal.conf
sudo ln -s /etc/nginx/sites-available/workforce-portal.conf /etc/nginx/sites-enabled/workforce-portal.conf
```

Replace `attendance.example.com` and `devices.attendance.example.com` with real domains.
Update the `ssl_certificate` paths to match the certificates issued on the server.

Validate and reload:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 8. Device Provisioning

Every physical device must have:

- A unique `Device.id`.
- A unique random device secret.
- `Device.apiKeyHash` set to the SHA-256 hex digest of that secret.

The device signs requests as documented in `docs/architecture/device-protocol.md`.

## 9. Backups

The repo includes `infra/backups/postgres-backup.sh`. Run it from an environment that has
`pg_dump`, `gzip`, `DATABASE_URL`, and write access to `BACKUP_DIR`.

Example cron entry:

```cron
15 2 * * * cd /opt/workforce-platform && DATABASE_URL='postgresql://...' BACKUP_DIR=/var/backups/attendance ./infra/backups/postgres-backup.sh
```

Test restore procedures before relying on backups.
