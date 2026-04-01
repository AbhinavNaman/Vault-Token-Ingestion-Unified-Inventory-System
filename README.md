# Vault Token Ingestion & Unified Inventory System (Backend)

backend service that connects to secret management systems (starting with **HashiCorp Vault**), ingests secrets and metadata, stores them in a database, and exposes a unified **inventory API**.

This project implements a **polling-based ingestion engine**, a **normalized data model**, and **REST APIs** to analyze secret inventory across vault providers.

---

# Architecture Overview

The system is designed around an **ingestion pipeline** that periodically synchronizes secret metadata from Vault providers.

```
                    +----------------------+
                    |  Vault Providers     |
                    |  (Hashicorp Vault)   |
                    +----------+-----------+
                               |
                               |
                        Fetch secrets
                               |
                               v
                    +----------------------+
                    | Provider Layer       |
                    | (Vault Adapter)      |
                    +----------+-----------+
                               |
                               v
                    +----------------------+
                    | Ingestion Engine     |
                    | (Polling Service)    |
                    +----------+-----------+
                               |
                               v
                    +----------------------+
                    | PostgreSQL Database  |
                    +----------+-----------+
                               |
                               v
                    +----------------------+
                    | REST API Layer       |
                    | inventory / stats    |
                    +----------+-----------+
                               |
                               v
                    +----------------------+
                    | Frontend Dashboard   |
                    +----------------------+
```

---

# Key Features

### Vault Integration

Supports **Hashicorp Vault KV v2**.

Capabilities:

* Recursive secret discovery
* Metadata extraction
* Permission error handling
* Version tracking

Extracted metadata:

* Secret path
* Version
* Created time
* Status
* Last sync timestamp

---

### Ingestion Engine

A background polling service periodically synchronizes vault data.

Capabilities:

* Periodic polling via cron
* Idempotent ingestion
* Deduplication of secrets
* Change detection
* Revoked secret detection

If a secret is removed from Vault, it is marked as:

```
status = revoked
```

---

### Data Modeling

Two core entities are used.

#### Provider

Represents a connected vault instance.

```
Provider
--------
id
name
type
vaultAddr
token
mountPath
createdAt
```

#### Secret

Represents secret metadata discovered from providers.

```
Secret
------
id
providerId
path
version
createdTime
ttl
status
riskScore
lastSyncedAt
```

Unique constraint:

```
providerId + path
```

---

### REST API

The service exposes APIs for interacting with the inventory.

---

#### Add Provider

```
POST /providers
```

Request:

```json
{
  "name": "Local Vault",
  "vaultAddr": "http://localhost:8200",
  "token": "hvs.xxxxx",
  "mountPath": "secret"
}
```

Response:

```json
{
  "id": "...",
  "name": "Local Vault"
}
```

---

#### List Providers

```
GET /providers
```

Returns all configured vault providers.

---

#### Inventory API

```
GET /inventory
```

Returns all discovered secrets.

Example:

```json
[
  {
    "path": "secret/prod/db",
    "version": 1,
    "status": "active"
  }
]
```

Optional filter:

```
GET /inventory?providerId=<id>
```

---

#### Stats API

```
GET /stats
```

Returns analytics about secret inventory.

Example response:

```json
{
  "totalSecrets": 120,
  "expiredSecrets": 10,
  "revokedSecrets": 5,
  "highRiskSecrets": 6
}
```

---

#### Manual Sync

```
POST /sync
```

Triggers ingestion manually.

---

#### Health Check

```
GET /health
```

Used for monitoring.

Response:

```json
{
  "status": "ok"
}
```

---

# Polling Engine

The ingestion system runs periodically using **cron scheduling**.

Configurable interval:

```
SYNC_INTERVAL=5
```

This means:

```
Sync every 5 minutes
```

The scheduler ensures:

* ingestion runs automatically
* failures do not crash the service
* logs capture sync metrics

---

# Security Considerations

The system **never exposes secret values** through the API.

Only metadata is stored.

Security measures include:

* secret values not logged
* minimal vault permissions required
* token storage isolated to providers

---

# Observability

The system includes structured logging using **Pino**.

Example logs:

```
Starting provider sync
Syncing provider Local Vault
Scheduled sync completed in 320ms
```

Metrics tracked:

* sync duration
* ingestion errors
* provider sync status

---

# Project Structure

```
src
│
├── api
│   ├── providers.routes.ts
│   ├── inventory.routes.ts
│   ├── stats.routes.ts
│   └── sync.routes.ts
│
├── db
│   └── prismaClient.ts
│
├── ingestion
│   └── ingestion.service.ts
│
├── providers
│   ├── provider.interface.ts
│   └── hashicorp.provider.ts
│
├── scheduler
│   └── sync.scheduler.ts
│
├── utils
│   └── logger.ts
│
└── server.ts
```

---

# Setup Instructions

### Install Dependencies

```
npm install
```

---

### Configure Environment

Create `.env`.

Example:

```
PORT=3000

DATABASE_URL="postgresql://postgres:password@localhost:5432/vault_inventory"

SYNC_INTERVAL=5
```

---

### Run Database Migration

```
npx prisma migrate dev
```

---

### Start Backend

```
npm run dev
```

Server runs on:

```
http://localhost:3000
```

---

# Running Hashicorp Vault (Local)

Run Vault in development mode:

```
docker run -d \
-p 8200:8200 \
-e VAULT_DEV_ROOT_TOKEN_ID=root \
hashicorp/vault
```

Add secrets:

```
vault kv put secret/prod/db password=123
vault kv put secret/prod/api key=abc
vault kv put secret/dev/db password=xyz
```

---

# Deployment

The backend can be deployed using Docker.

Example:

```
docker build -t vault-inventory .
docker run -p 3000:3000 vault-inventory
```

---

### Idempotent Ingestion

Secrets are upserted using:

```
providerId + path
```

This prevents duplication across sync runs.

---

# Demo Flow

Suggested demo steps:

1. Start Vault
2. Add provider via API
3. Trigger sync
4. View inventory
5. View stats dashboard
