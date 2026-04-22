import prisma from "@/lib/prisma"
import { getPayoutConfig, sendNativePayout } from "@/lib/blockchain"
import { listRepositoryPullRequests } from "@/lib/github-app"

type ListingForPayout = {
  id: string
  ownerId: string
  repoName: string
  repoOwnerLogin: string
  repoFullName: string
  bountyAmount: string
  currencySymbol: string
  chainId: number
  isActive: boolean
}

type MergedPullRequestInput = {
  number: number
  title: string
  url: string
  mergedAt: string
  contributor: {
    id: number
    username: string
  }
}

export async function attemptPayoutSend(params: {
  payoutId: string
  recipientAddress: string | null
  amount: string
  chainId: number
}) {
  if (!params.recipientAddress || !getPayoutConfig()) {
    return
  }

  try {
    const txHash = await sendNativePayout({
      recipientAddress: params.recipientAddress,
      amount: params.amount,
      chainId: params.chainId,
    })

    await prisma.payout.update({
      where: { id: params.payoutId },
      data: {
        txHash,
        status: "PAID",
        paidAt: new Date(),
        txError: null,
      },
    })
  } catch (error) {
    await prisma.payout.update({
      where: { id: params.payoutId },
      data: {
        status: "FAILED",
        txError: error instanceof Error ? error.message : "Payout failed",
      },
    })
  }
}

export async function createOrUpdateMergedPullRequestPayout(params: {
  listing: ListingForPayout
  pullRequest: MergedPullRequestInput
}) {
  const contributorGithubId = String(params.pullRequest.contributor.id)
  const contributor = await prisma.user.findUnique({
    where: { githubId: contributorGithubId },
  })

  const existingPayout = await prisma.payout.findUnique({
    where: {
      listingId_pullRequestNumber: {
        listingId: params.listing.id,
        pullRequestNumber: params.pullRequest.number,
      },
    },
  })

  if (existingPayout) {
    return { payout: existingPayout, created: false }
  }

  const payout = await prisma.payout.create({
    data: {
      listingId: params.listing.id,
      maintainerId: params.listing.ownerId,
      contributorId: contributor?.id,
      contributorGithubId,
      contributorUsername: params.pullRequest.contributor.username,
      contributorWalletAddress: contributor?.walletAddress ?? null,
      pullRequestNumber: params.pullRequest.number,
      pullRequestTitle: params.pullRequest.title,
      pullRequestUrl: params.pullRequest.url,
      amount: params.listing.bountyAmount,
      currencySymbol: params.listing.currencySymbol,
      chainId: params.listing.chainId,
      status: contributor?.walletAddress ? "READY_TO_PAY" : "PENDING_WALLET",
      mergedAt: new Date(params.pullRequest.mergedAt),
    },
  })

  await attemptPayoutSend({
    payoutId: payout.id,
    recipientAddress: contributor?.walletAddress ?? null,
    amount: params.listing.bountyAmount,
    chainId: params.listing.chainId,
  })

  return { payout, created: true }
}

export async function syncMergedPullRequestPayouts(params: {
  installationId: number
  maintainerId: string
}) {
  const listings = await prisma.repoListing.findMany({
    where: {
      ownerId: params.maintainerId,
      isActive: true,
    },
    select: {
      id: true,
      ownerId: true,
      repoName: true,
      repoOwnerLogin: true,
      repoFullName: true,
      bountyAmount: true,
      currencySymbol: true,
      chainId: true,
      isActive: true,
    },
    orderBy: { updatedAt: "desc" },
  })

  let createdCount = 0
  let mergedCount = 0

  for (const listing of listings) {
    const pullRequests = await listRepositoryPullRequests({
      installationId: params.installationId,
      owner: listing.repoOwnerLogin,
      repo: listing.repoName,
    })

    const mergedPullRequests = pullRequests.filter((pullRequest) => pullRequest.mergedAt)
    mergedCount += mergedPullRequests.length

    for (const pullRequest of mergedPullRequests) {
      const result = await createOrUpdateMergedPullRequestPayout({
        listing,
        pullRequest: {
          number: pullRequest.number,
          title: pullRequest.title,
          url: pullRequest.url,
          mergedAt: pullRequest.mergedAt!,
          contributor: {
            id: pullRequest.contributor.id,
            username: pullRequest.contributor.username,
          },
        },
      })

      if (result.created) {
        createdCount += 1
      }
    }
  }

  return {
    listingsScanned: listings.length,
    mergedPullRequestsScanned: mergedCount,
    createdCount,
  }
}
