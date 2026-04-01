import { Router } from "express"
import { prisma } from "../db/prismaClient.ts"

const router = Router()

router.get("/", async (req, res) => {
  const { providerId } = req.query
  const secrets = await prisma.secret.findMany({
    where: {
      ...(providerId && { providerId: providerId as string })
    }
  })
  res.json(secrets)
})

router.get("/:id", async (req, res) => {
  const secret = await prisma.secret.findUnique({
    where: { id: req.params.id }
  })
  res.json(secret)
})

export default router