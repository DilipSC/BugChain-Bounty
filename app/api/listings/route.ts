import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireCurrentUser } from "@/lib/auth"
import { getInstallationRepository } from "@/lib/github-app"

type GitHubRepo = {
  id: number
  name: string
  full_name: string
  html_url: string
  description: string | null
  private: boolean
  owner: {
    login: string
  }
  permissions?: {
    admin?: boolean
    maintain?: boolean
    push?: boolean
  }
}

export async function GET() {
  const current = await requireCurrentUser()

  if (!current) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const listings = await prisma.repoListing.findMany({
    where: { ownerId: current.user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      payouts: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  })

  return NextResponse.json(listings)
}

export async function POST(request: Request) {
  const current = await requireCurrentUser()

  if (!current) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const installation = current.user.installations[0]

  if (!installation) {
    return NextResponse.json({ error: "Install the GitHub App before creating a listing" }, { status: 400 })
  }

  const body = await request.json().catch(() => null) as {
    repoId?: number
    bountyAmount?: string
    chainId?: number
    currencySymbol?: string
  } | null

  if (!body?.repoId || !body?.bountyAmount || !body?.chainId || !body?.currencySymbol) {
    return NextResponse.json(
      { error: "repoId, bountyAmount, chainId, and currencySymbol are required" },
      { status: 400 }
    )
  }

  const chainId = Number(body.chainId)
  const bountyAmount = body.bountyAmount.trim()
  const currencySymbol = body.currencySymbol.trim().toUpperCase()

  if (!Number.isInteger(chainId) || chainId <= 0) {
    return NextResponse.json({ error: "Invalid chainId" }, { status: 400 })
  }

  if (!/^\d+(\.\d+)?$/.test(bountyAmount) || Number(bountyAmount) <= 0) {
    return NextResponse.json({ error: "Bounty amount must be a positive number" }, { status: 400 })
  }

  const repo = await getInstallationRepository(installation.installationId, body.repoId)

  if (!repo) {
    return NextResponse.json({ error: "Could not verify repository access through the GitHub App installation" }, { status: 400 })
  }

  const canManageRepo =
    installation.accountLogin.toLowerCase() === current.user.username.toLowerCase() ||
    repo.owner.login.toLowerCase() === current.user.username.toLowerCase() ||
    repo.permissions?.admin ||
    repo.permissions?.maintain ||
    repo.permissions?.push ||
    repo.permissions === undefined

  if (!canManageRepo) {
    return NextResponse.json(
      { error: "You do not have permission to create a bounty for this repository" },
      { status: 403 }
    )
  }

  const listing = await prisma.repoListing.upsert({
    where: { repoGithubId: repo.id },
    update: {
      repoName: repo.name,
      repoFullName: repo.full_name,
      repoUrl: repo.html_url,
      repoDescription: repo.description,
      repoOwnerLogin: repo.owner.login,
      repoIsPrivate: repo.private,
      bountyAmount,
      chainId,
      currencySymbol,
      isActive: true,
      isDiscoverable: !repo.private,
      ownerId: current.user.id,
    },
    create: {
      ownerId: current.user.id,
      repoGithubId: repo.id,
      repoName: repo.name,
      repoFullName: repo.full_name,
      repoUrl: repo.html_url,
      repoDescription: repo.description,
      repoOwnerLogin: repo.owner.login,
      repoIsPrivate: repo.private,
      bountyAmount,
      chainId,
      currencySymbol,
      isActive: true,
      isDiscoverable: !repo.private,
    },
  })

  return NextResponse.json(listing)
}

export async function PUT(request: Request) {
  const current = await requireCurrentUser()

  if (!current) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => null) as {
    listingId?: string
    isDiscoverable?: boolean
    isActive?: boolean
  } | null

  if (!body?.listingId) {
    return NextResponse.json({ error: "listingId is required" }, { status: 400 })
  }

  const listing = await prisma.repoListing.findFirst({
    where: {
      id: body.listingId,
      ownerId: current.user.id,
    },
  })

  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 })
  }

  const updated = await prisma.repoListing.update({
    where: { id: listing.id },
    data: {
      ...(typeof body.isDiscoverable === "boolean" ? { isDiscoverable: body.isDiscoverable } : {}),
      ...(typeof body.isActive === "boolean" ? { isActive: body.isActive } : {}),
    },
  })

  return NextResponse.json(updated)
}
