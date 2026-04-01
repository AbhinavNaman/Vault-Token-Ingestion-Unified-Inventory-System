import express from "express"
import dotenv from "dotenv"
import cors from "cors"

import inventoryRoutes from "./api/inventory.routes.ts"
import providersRoutes from "./api/providers.routes.ts"
import syncRoutes from "./api/sync.routes.ts"
import statsRoutes from "./api/stats.routes.ts"

import { startScheduler } from "./scheduler/sync.scheduler.ts"

dotenv.config()

const app = express()

app.use(cors({
  origin: "http://localhost:5173"
}))

app.use(express.json())

app.get("/health", (req, res) => {
  res.json({ status: "ok" })
})

app.use("/inventory", inventoryRoutes)
app.use("/providers", providersRoutes)
app.use("/stats", statsRoutes)
app.use("/sync", syncRoutes)

app.listen(process.env.PORT, () => {

  console.log(`Server running on port ${process.env.PORT}`)

  startScheduler()

})