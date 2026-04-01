import { prisma } from "../db/prismaClient.ts"
import { HashicorpProvider } from "../providers/hashicorp.provider.ts"
import { logger } from "../utils/logger.ts"

export class IngestionService {

  async syncAllProviders() {
    const providers = await prisma.provider.findMany()

    for (const provider of providers) {
      logger.info(`Syncing provider ${provider.name}`)

      const vault = new HashicorpProvider(
        provider.vaultAddr,
        provider.token,
        provider.mountPath
      )

      const secrets = await vault.fetchSecrets()

      const vaultPaths = new Set(secrets.map(s => s.path))

      // for (const secret of secrets) {

      //   const updateData: any = {
      //     lastSyncedAt: new Date(),
      //     status: "active"
      //   }
      //   if (secret.version !== undefined) {
      //     updateData.version = secret.version
      //   }

      //   const createData: any = {
      //     providerId: provider.id,
      //     path: secret.path,
      //     status: "active",
      //     lastSyncedAt: new Date()
      //   }
      //   if (secret.version !== undefined) {
      //     createData.version = secret.version
      //   }

      //   await prisma.secret.upsert({

      //     where: {
      //       providerId_path: {
      //         providerId: provider.id,
      //         path: secret.path
      //       }
      //     },

      //     update: updateData,

      //     create: createData

      //   })
      // }

      for (const secret of secrets) {

        const existingSecret = await prisma.secret.findUnique({
          where: {
            providerId_path: {
              providerId: provider.id,
              path: secret.path
            }
          }
        })

        if (!existingSecret) {

          const createData: any = {
            providerId: provider.id,
            path: secret.path,
            status: "active",
            lastSyncedAt: new Date()
          }

          if (secret.version !== undefined) {
            createData.version = secret.version
          }

          if (secret.createdTime !== undefined) {
            createData.createdTime = secret.createdTime
          }

          await prisma.secret.create({
            data: createData
          })

        } else {

            // Incremental sync: Only update if metadata changed

          if (
            secret.createdTime &&
            secret.createdTime > existingSecret.lastSyncedAt
          ) {

            const updateData: any = {
              lastSyncedAt: new Date(),
              status: "active"
            }

            if (secret.version !== undefined) {
              updateData.version = secret.version
            }

            if (secret.createdTime !== undefined) {
              updateData.createdTime = secret.createdTime
            }

            await prisma.secret.update({
              where: { id: existingSecret.id },
              data: updateData
            })

          }

        }

      }

      const dbSecrets = await prisma.secret.findMany({
        where: { providerId: provider.id }
      })

      for (const dbSecret of dbSecrets) {

        if (!vaultPaths.has(dbSecret.path)) {

          await prisma.secret.update({
            where: { id: dbSecret.id },
            data: { status: "revoked" }
          })
        }
      }

      try {
        const tokens = await vault.fetchTokens()

        for (const token of tokens) {

          await prisma.token.upsert({

            where: {
              accessor: token.accessor
            },

            update: {
              ttl: token.ttl ?? null,
              lastSyncedAt: new Date()
            },

            create: {
              providerId: provider.id,
              accessor: token.accessor,
              policies: token.policies,
              ttl: token.ttl ?? null,
              createdTime: token.createdTime ?? null,
              status: "active",
              lastSyncedAt: new Date()
            }

          })

        }
      } catch (err) {
        logger.warn("Token ingestion skipped due to permissions")
      }


      logger.info(`Finished syncing provider ${provider.name}`)

    }

  }
}