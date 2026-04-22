import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireCurrentUser } from "@/lib/auth"
import { listRepositoryPullRequests } from "@/lib/github-app"

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const current = await requireCurrentUser()

  if (!current) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await context.params

  const listing = await prisma.repoListing.findFirst({
    where: {
      id,
      ownerId: current.user.id,
    },
  })

  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 })
  }

  const installation = current.user.installations[0]

  if (!installation) {
    return NextResponse.json({ error: "Install the GitHub App before loading pull requests" }, { status: 400 })
  }

  try {
    const pullRequests = await listRepositoryPullRequests({
      installationId: installation.installationId,
      owner: listing.repoOwnerLogin,
      repo: listing.repoName,
    })

    return NextResponse.json(pullRequests)
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch pull requests",
      },
      { status: 500 }
    )
  }
}
