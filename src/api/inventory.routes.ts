import { Router } from "express"
import { prisma } from "../db/prismaClient.ts"

const router = Router()

router.get("/", async (req, res) => {

  const {
    providerId,
    status,
    path,
    page = "1",
    limit = "20"
  } = req.query

  const secrets = await prisma.secret.findMany({

    where: {
      ...(providerId && { providerId: providerId as string }),
      ...(status && { status: status as string }),
      ...(path && { path: { contains: path as string } })
    },

    take: Number(limit),
    skip: (Number(page) - 1) * Number(limit)

  })

  res.json(secrets)

})

router.get("/:id", async (req, res) => {
  const secret = await prisma.secret.findUnique({
    where: { id: req.params.id }
  })

  if (!secret) {
    return res.status(404).json({ message: "Secret not found" })
  }
  res.json(secret)
})

export default router