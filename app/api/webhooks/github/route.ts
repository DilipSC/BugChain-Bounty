import { headers } from "next/headers"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { verifyGitHubSignature } from "@/lib/github-webhook"
import { createOrUpdateMergedPullRequestPayout } from "@/lib/payouts"

type PullRequestWebhookPayload = {
  action: string
  repository: {
    id: number
    name: string
    full_name: string
    owner: {
      login: string
    }
  }
  pull_request: {
    number: number
    title: string
    html_url: string
    merged: boolean
    merged_at: string | null
    user: {
      id: number
      login: string
    }
  }
}

export async function POST(request: Request) {
  const rawBody = await request.text()
  const headersList = await headers()
  const signature = headersList.get("x-hub-signature-256")
  const event = headersList.get("x-github-event")

  try {
    if (!verifyGitHubSignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook configuration error" },
      { status: 500 }
    )
  }

  if (event !== "pull_request") {
    return NextResponse.json({ ok: true, ignored: true })
  }

  const payload = JSON.parse(rawBody) as PullRequestWebhookPayload

  if (payload.action !== "closed" || !payload.pull_request.merged || !payload.pull_request.merged_at) {
    return NextResponse.json({ ok: true, ignored: true })
  }

  const listing = await prisma.repoListing.findFirst({
    where: {
      OR: [
        { repoGithubId: payload.repository.id },
        { repoFullName: payload.repository.full_name },
      ],
    },
    include: { owner: true },
  })

  if (!listing || !listing.isActive) {
    return NextResponse.json({ ok: true, ignored: true, reason: "no-listing" })
  }

  const result = await createOrUpdateMergedPullRequestPayout({
    listing: {
      id: listing.id,
      ownerId: listing.ownerId,
      repoName: listing.repoName,
      repoOwnerLogin: listing.repoOwnerLogin,
      repoFullName: listing.repoFullName,
      bountyAmount: listing.bountyAmount,
      currencySymbol: listing.currencySymbol,
      chainId: listing.chainId,
      isActive: listing.isActive,
    },
    pullRequest: {
      number: payload.pull_request.number,
      title: payload.pull_request.title,
      url: payload.pull_request.html_url,
      mergedAt: payload.pull_request.merged_at,
      contributor: {
        id: payload.pull_request.user.id,
        username: payload.pull_request.user.login,
      },
    },
  })

  if (!result.created) {
    return NextResponse.json({ ok: true, ignored: true, reason: "already-processed", payoutId: result.payout.id })
  }

  return NextResponse.json({ ok: true, payoutId: result.payout.id })
}
