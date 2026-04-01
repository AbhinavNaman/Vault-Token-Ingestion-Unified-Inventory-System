import { Router } from "express"
import { prisma } from "../db/prismaClient.ts"

const router = Router()

router.get("/", async (req, res) => {
  const total = await prisma.secret.count()
  const expired = await prisma.secret.count({
    where: { status: "expired" }
  })
  const highRisk = await prisma.secret.count({
    where: { ttl: null }
  })
  const revokedSecrets = await prisma.secret.count({
    where: { status: "revoked" }
  })

  const totalTokens = await prisma.token.count()
  res.json({
    totalSecrets: total,
    expiredSecrets: expired,
    highRiskSecrets: highRisk,
    revokedSecrets: revokedSecrets,
    totalTokens: totalTokens
  })
})

export default router