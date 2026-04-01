import cron from "node-cron"
import { IngestionService } from "../ingestion/ingestion.service.ts"
import { logger } from "../utils/logger.ts"

export function startScheduler() {

  const interval = process.env.SYNC_INTERVAL || "5"

  logger.info(`Starting sync scheduler. Interval: ${interval} minutes`)

  const ingestion = new IngestionService()

  cron.schedule(`*/${interval} * * * *`, async () => {

    logger.info("Starting scheduled provider sync")

    const start = Date.now()

    try {

      await ingestion.syncAllProviders()

      const duration = Date.now() - start

      logger.info(`Scheduled sync completed in ${duration} ms`)

    } catch (error: any) {

      logger.error(`Scheduled sync failed: ${error.message}`)

    }

  })
}