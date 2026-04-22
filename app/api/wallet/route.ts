import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireCurrentUser } from "@/lib/auth"
import { getPayoutConfig, normalizeWalletAddress, sendNativePayout } from "@/lib/blockchain"

export async function GET() {
  const current = await requireCurrentUser()

  if (!current) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return NextResponse.json({
    walletAddress: current.user.walletAddress,
  })
}

export async function PUT(request: Request) {
  const current = await requireCurrentUser()

  if (!current) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => null) as { walletAddress?: string } | null

  if (!body?.walletAddress) {
    return NextResponse.json({ error: "walletAddress is required" }, { status: 400 })
  }

  let walletAddress: string

  try {
    walletAddress = normalizeWalletAddress(body.walletAddress)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid wallet address" },
      { status: 400 }
    )
  }

  const existingOwner = await prisma.user.findFirst({
    where: {
      walletAddress,
      id: { not: current.user.id },
    },
    select: { id: true },
  })

  if (existingOwner) {
    return NextResponse.json(
      { error: "This wallet is already linked to another user" },
      { status: 409 }
    )
  }

  const user = await prisma.user.update({
    where: { id: current.user.id },
    data: { walletAddress },
    select: {
      walletAddress: true,
    },
  })

  const pendingPayouts = await prisma.payout.findMany({
    where: {
      contributorGithubId: current.user.githubId,
      contributorWalletAddress: null,
      status: "PENDING_WALLET",
    },
  })

  if (pendingPayouts.length > 0) {
    await prisma.payout.updateMany({
      where: {
        id: {
          in: pendingPayouts.map((payout) => payout.id),
        },
      },
      data: {
        contributorId: current.user.id,
        contributorWalletAddress: walletAddress,
        status: "READY_TO_PAY",
      },
    })
  }

  if (getPayoutConfig()) {
    const readyPayouts = await prisma.payout.findMany({
      where: {
        contributorGithubId: current.user.githubId,
        contributorWalletAddress: walletAddress,
        status: "READY_TO_PAY",
      },
    })

    await Promise.all(
      readyPayouts.map(async (payout) => {
        try {
          const txHash = await sendNativePayout({
            recipientAddress: walletAddress,
            amount: payout.amount,
            chainId: payout.chainId,
          })

          await prisma.payout.update({
            where: { id: payout.id },
            data: {
              txHash,
              status: "PAID",
              paidAt: new Date(),
              txError: null,
            },
          })
        } catch (error) {
          await prisma.payout.update({
            where: { id: payout.id },
            data: {
              status: "FAILED",
              txError: error instanceof Error ? error.message : "Payout failed after wallet connection",
            },
          })
        }
      })
    )
  }

  return NextResponse.json(user)
}
