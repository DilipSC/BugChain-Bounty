import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireCurrentUser } from "@/lib/auth"

export async function GET() {
  const current = await requireCurrentUser()

  if (!current) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const payouts = await prisma.payout.findMany({
    where: {
      OR: [
        { maintainerId: current.user.id },
        { contributorId: current.user.id },
        { contributorGithubId: current.user.githubId },
      ],
    },
    orderBy: { mergedAt: "desc" },
    include: {
      listing: {
        select: {
          repoFullName: true,
          repoUrl: true,
        },
      },
    },
  })

  return NextResponse.json(payouts)
}

