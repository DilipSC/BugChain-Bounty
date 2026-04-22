import Link from "next/link"
import prisma from "@/lib/prisma"
import { Coins, ExternalLink, Search } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function BountiesPage() {
  const listings = await prisma.repoListing.findMany({
    where: {
      isActive: true,
      isDiscoverable: true,
      repoIsPrivate: false,
    },
    include: {
      owner: {
        select: {
          username: true,
          avatar: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  })

  return (
    <div className="min-h-screen bg-grid">
      <div className="absolute inset-0 bg-linear-to-br from-background via-background to-primary/5" />
      <main className="relative container mx-auto px-6 py-12 space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-primary mb-3">Contributor Marketplace</p>
            <h1 className="font-display text-5xl font-bold mb-3">Browse Public Bounties</h1>
            <p className="text-muted-foreground max-w-3xl">
              These listings are discoverable to contributors. Connect MetaMask on Base Sepolia, pick a repo,
              submit a pull request, and get paid if your contribution is merged.
            </p>
          </div>
          <Link href="/main" className="cyber-button px-4 py-3 rounded-md text-sm text-primary inline-flex items-center gap-2">
            <Coins className="h-4 w-4" />
            Owner Dashboard
          </Link>
        </div>

        {listings.length === 0 ? (
          <div className="glass rounded-xl p-10 border-glow text-center text-muted-foreground">
            No public bounties are live yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {listings.map((listing) => (
              <article key={listing.id} className="glass rounded-xl p-6 border-glow">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-display text-2xl text-primary">{listing.repoFullName}</h2>
                    <p className="text-sm text-muted-foreground mt-2">
                      {listing.repoDescription || "No description provided."}
                    </p>
                  </div>
                  <span className="rounded-full border border-primary/30 px-3 py-1 text-xs text-primary whitespace-nowrap">
                    {listing.bountyAmount} {listing.currencySymbol}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3 mt-4 text-xs text-muted-foreground">
                  <span>Chain ID {listing.chainId}</span>
                  <span>Maintainer @{listing.owner.username}</span>
                  <span>Updated {new Date(listing.updatedAt).toLocaleDateString()}</span>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href={`/bounties/${listing.id}`}
                    className="cyber-button-solid px-4 py-3 rounded-md text-sm inline-flex items-center gap-2"
                  >
                    <Search className="h-4 w-4" />
                    View Bounty
                  </Link>
                  <a
                    href={listing.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="cyber-button px-4 py-3 rounded-md text-sm text-primary inline-flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open Repository
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
