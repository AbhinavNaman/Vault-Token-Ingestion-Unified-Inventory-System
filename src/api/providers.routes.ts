import { Router } from "express"
import { prisma } from "../db/prismaClient.ts"

const router = Router()

router.post("/", async (req, res) => {
  const { name, vaultAddr, token, mountPath } = req.body
  const provider = await prisma.provider.create({
    data: {
      name,
      type: "hashicorp",
      vaultAddr,
      token,
      mountPath
    }
  })
  res.json(provider)
})

router.get("/", async (req, res) => {
  const providers = await prisma.provider.findMany()
  res.json(providers)
})

export default router