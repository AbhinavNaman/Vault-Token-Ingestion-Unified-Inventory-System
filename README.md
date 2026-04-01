                 +---------------------+
                 |  Hashicorp Vault    |
                 +----------+----------+
                            |
                            |
                     Fetch Secrets
                            |
                            v
                 +---------------------+
                 | Provider Layer      |
                 | (Vault Adapter)     |
                 +----------+----------+
                            |
                            v
                 +---------------------+
                 | Ingestion Engine    |
                 | (Polling Service)   |
                 +----------+----------+
                            |
                            v
                 +---------------------+
                 | PostgreSQL Database |
                 +----------+----------+
                            |
                            v
                 +---------------------+
                 | REST API Layer      |
                 | /inventory /stats   |
                 +---------------------+