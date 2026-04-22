import Link from "next/link"
import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { ExternalLink, Github, GitPullRequest, Wallet } from "lucide-react"
import { WalletConnectPanel } from "@/components/bounties/WalletConnectPanel"

export const dynamic = "force-dynamic"

export default async function BountyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const listing = await prisma.repoListing.findFirst({
    where: {
      id,
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
      payouts: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  })

  if (!listing) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-grid">
      <div className="absolute inset-0 bg-linear-to-br from-background via-background to-primary/5" />
      <main className="relative container mx-auto px-6 py-12 space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-primary mb-3">Public Bounty</p>
            <h1 className="font-display text-5xl font-bold mb-3">{listing.repoFullName}</h1>
            <p className="text-muted-foreground max-w-3xl">
              {listing.repoDescription || "No description provided."}
            </p>
          </div>
          <Link href="/bounties" className="cyber-button px-4 py-3 rounded-md text-sm text-primary inline-flex items-center gap-2">
            <Github className="h-4 w-4" />
            Back To Bounties
          </Link>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-8">
          <section className="glass rounded-xl p-6 border-glow space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-lg border border-border/60 bg-secondary/20 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">Bounty</p>
                <p className="font-display text-3xl text-primary">{listing.bountyAmount} {listing.currencySymbol}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-secondary/20 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">Network</p>
                <p className="font-display text-3xl text-primary">Base Sepolia</p>
                <p className="text-xs text-muted-foreground mt-1">Chain ID {listing.chainId}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-secondary/20 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">Maintainer</p>
                <p className="font-display text-3xl text-primary">@{listing.owner.username}</p>
              </div>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold mb-3">How To Participate</h2>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>1. Open the repository on GitHub and understand the project or open issues.</p>
                <p>2. Connect MetaMask on Base Sepolia and save your wallet address.</p>
                <p>3. Fork the repository and submit a pull request.</p>
                <p>4. If the maintainer merges your pull request, the app creates a payout record and attempts the bounty payment.</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href={listing.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="cyber-button-solid px-4 py-3 rounded-md text-sm inline-flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Open Repository
              </a>
              <Link
                href="/main"
                className="cyber-button px-4 py-3 rounded-md text-sm text-primary inline-flex items-center gap-2"
              >
                <GitPullRequest className="h-4 w-4" />
                Maintainer Dashboard
              </Link>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold mb-3">Recent Payout Activity</h2>
              {listing.payouts.length === 0 ? (
                <div className="rounded-lg border border-border/60 bg-secondary/20 p-4 text-sm text-muted-foreground">
                  No merged pull requests recorded yet for this listing.
                </div>
              ) : (
                <div className="space-y-3">
                  {listing.payouts.map((payout) => (
                    <div key={payout.id} className="rounded-lg border border-border/60 bg-secondary/20 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm text-foreground">
                          PR #{payout.pullRequestNumber}: {payout.pullRequestTitle}
                        </p>
                        <span className="text-xs text-primary">{payout.status.replaceAll("_", " ")}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Contributor @{payout.contributorUsername} • {payout.amount} {payout.currencySymbol}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="space-y-6">
            <WalletConnectPanel />

            <div className="glass rounded-xl p-6 border-glow">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="font-display text-2xl font-bold">Contributor Requirements</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    These are the minimum conditions for the payout automation to work.
                  </p>
                </div>
                <Wallet className="h-6 w-6 text-primary" />
              </div>

              <div className="space-y-3 text-sm text-muted-foreground">
                <p>- Use MetaMask or another injected EVM wallet.</p>
                <p>- Save a wallet address in the app before or after your PR is merged.</p>
                <p>- Stay on Base Sepolia so the bounty chain matches the payout wallet.</p>
                <p>- Make sure the PR is merged into this listed repository, not just opened.</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
