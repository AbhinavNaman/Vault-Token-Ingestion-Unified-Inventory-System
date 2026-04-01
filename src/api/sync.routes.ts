import { Router } from "express"
import { IngestionService } from "../ingestion/ingestion.service.ts"

const router = Router()

router.post("/", async (req, res) => {
  const ingestion = new IngestionService()
  await ingestion.syncAllProviders()
  res.json({ message: "Sync completed" })
})

export default router