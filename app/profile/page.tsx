import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { Activity, ArrowUpRight, CheckCircle2, Clock3, Github, Shield, Wallet } from "lucide-react"
import prisma from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { listAuthenticatedUserPullRequests } from "@/lib/github-oauth"

type ActivityItem = {
  id: number
  number: number
  title: string
  url: string
  state: "open" | "closed" | "merged"
  createdAt: string
  updatedAt: string
  mergedAt: string | null
  repository: {
    fullName: string
    url: string
  }
  contributor: {
    username: string
    avatarUrl: string | null
  }
}

function shortAddress(address?: string | null) {
  if (!address) {
    return "Not connected"
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id || !session.user.username) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      username: true,
      walletAddress: true,
      avatar: true,
      listings: {
        select: {
          id: true,
          repoFullName: true,
        },
      },
    },
  })

  if (!user) {
    redirect("/login")
  }

  let activities: ActivityItem[] = []
  let activityError = ""

  if (session.accessToken) {
    try {
      activities = await listAuthenticatedUserPullRequests({
        accessToken: session.accessToken,
        username: user.username,
        limit: 25,
      })
    } catch (error) {
      activityError = error instanceof Error ? error.message : "Could not load GitHub pull requests"
    }
  } else {
    activityError = "Missing GitHub access token for PR activity"
  }

  const payouts = await prisma.payout.findMany({
    where: {
      OR: [
        { maintainerId: user.id },
        { contributorId: user.id },
        { contributorGithubId: session.githubId },
      ],
    },
    select: {
      id: true,
      pullRequestNumber: true,
      pullRequestTitle: true,
      pullRequestUrl: true,
      contributorUsername: true,
      contributorWalletAddress: true,
      amount: true,
      currencySymbol: true,
      status: true,
      mergedAt: true,
      paidAt: true,
      txHash: true,
      listing: {
        select: {
          repoFullName: true,
          repoUrl: true,
        },
      },
    },
    orderBy: { mergedAt: "desc" },
  })

  const payoutByUrl = new Map(payouts.map((payout) => [payout.pullRequestUrl, payout]))
  const mergedActivities = activities.filter((item) => item.state === "merged")
  const repoCounts = new Map<string, { created: number; merged: number; url: string }>()

  for (const activity of activities) {
    const current = repoCounts.get(activity.repository.fullName) ?? {
      created: 0,
      merged: 0,
      url: activity.repository.url,
    }

    current.created += 1

    if (activity.state === "merged") {
      current.merged += 1
    }

    repoCounts.set(activity.repository.fullName, current)
  }

  const repoSummaries = Array.from(repoCounts.entries())
    .map(([repoFullName, counts]) => ({
      repoFullName,
      ...counts,
    }))
    .sort((a, b) => b.created - a.created)

  return (
    <div className="min-h-screen bg-grid">
      <div className="absolute inset-0 bg-linear-to-br from-background via-background to-primary/5" />
      <main className="relative container mx-auto px-6 py-12 space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-primary mb-3">Profile Tracking</p>
            <h1 className="font-display text-5xl font-bold mb-3">@{user.username}</h1>
            <p className="text-muted-foreground max-w-3xl">
              Track the pull requests you created, which ones were merged, the repositories involved,
              and whether a payout record exists for each merged contribution.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/main" className="cyber-button px-4 py-3 rounded-md text-sm text-primary inline-flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Dashboard
            </Link>
            <Link href="/bounties" className="cyber-button px-4 py-3 rounded-md text-sm text-primary inline-flex items-center gap-2">
              <Github className="h-4 w-4" />
              Bounties
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
          <div className="glass rounded-xl p-6 border-glow">
            <div className="flex items-center justify-between mb-4">
              <Activity className="h-8 w-8 text-primary" />
              <span className="text-3xl font-bold text-primary">{activities.length}</span>
            </div>
            <h3 className="font-display font-semibold">PRs Created</h3>
            <p className="text-sm text-muted-foreground">Recent pull requests authored by this account</p>
          </div>

          <div className="glass rounded-xl p-6 border-glow">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle2 className="h-8 w-8 text-primary" />
              <span className="text-3xl font-bold text-primary">{mergedActivities.length}</span>
            </div>
            <h3 className="font-display font-semibold">PRs Merged</h3>
            <p className="text-sm text-muted-foreground">Merged pull requests from your recent activity</p>
          </div>

          <div className="glass rounded-xl p-6 border-glow">
            <div className="flex items-center justify-between mb-4">
              <Clock3 className="h-8 w-8 text-primary" />
              <span className="text-3xl font-bold text-primary">{payouts.filter((payout) => payout.status === "PENDING_WALLET").length}</span>
            </div>
            <h3 className="font-display font-semibold">Pending Wallet</h3>
            <p className="text-sm text-muted-foreground">Merged PR payouts waiting for a wallet address</p>
          </div>

          <div className="glass rounded-xl p-6 border-glow">
            <div className="flex items-center justify-between mb-4">
              <Wallet className="h-8 w-8 text-primary" />
              <span className="text-lg font-mono text-primary">{shortAddress(user.walletAddress)}</span>
            </div>
            <h3 className="font-display font-semibold">Saved Wallet</h3>
            <p className="text-sm text-muted-foreground">Current receiving wallet for automated payouts</p>
          </div>

          <div className="glass rounded-xl p-6 border-glow">
            <div className="flex items-center justify-between mb-4">
              <Github className="h-8 w-8 text-primary" />
              <span className="text-3xl font-bold text-primary">{repoSummaries.length}</span>
            </div>
            <h3 className="font-display font-semibold">Repos Touched</h3>
            <p className="text-sm text-muted-foreground">Repositories where you have opened recent PRs</p>
          </div>
        </div>

        {activityError ? (
          <div className="glass rounded-xl p-4 border border-rose-500/30 text-rose-300">
            {activityError}
          </div>
        ) : null}

        <section className="glass rounded-xl p-6 border-glow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl font-bold">Repo Breakdown</h2>
              <p className="text-sm text-muted-foreground mt-1">
                How many PRs you created and how many merged for each repository.
              </p>
            </div>
          </div>

          {repoSummaries.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">No PR activity found yet.</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {repoSummaries.map((repo) => (
                <a
                  key={repo.repoFullName}
                  href={repo.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-border/60 p-5 bg-secondary/25 hover:border-primary/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-lg text-primary">{repo.repoFullName}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Created {repo.created} PRs, merged {repo.merged}.
                      </p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-primary" />
                  </div>
                </a>
              ))}
            </div>
          )}
        </section>

        <section className="glass rounded-xl p-6 border-glow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl font-bold">Pull Request Activity</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Recent PRs authored by this GitHub account, with payout tracking when a local payout record exists.
              </p>
            </div>
          </div>

          {activities.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">No pull requests found for this account.</div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => {
                const payout = payoutByUrl.get(activity.url)

                return (
                  <article key={activity.id} className="rounded-lg border border-border/60 p-5 bg-secondary/25">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="font-display text-lg text-primary">
                            PR #{activity.number}: {activity.title}
                          </h3>
                          <span className="rounded-full border border-primary/30 px-3 py-1 text-xs text-primary">
                            {activity.state.toUpperCase()}
                          </span>
                          {payout ? (
                            <span className="rounded-full border border-emerald-400/30 px-3 py-1 text-xs text-emerald-300">
                              PAYOUT {payout.status.replaceAll("_", " ")}
                            </span>
                          ) : activity.state === "merged" ? (
                            <span className="rounded-full border border-amber-400/30 px-3 py-1 text-xs text-amber-300">
                              NO PAYOUT RECORD
                            </span>
                          ) : null}
                        </div>

                        <p className="text-sm text-muted-foreground">
                          Repository: <a href={activity.repository.url} target="_blank" rel="noreferrer" className="text-primary hover:underline">{activity.repository.fullName}</a>
                        </p>

                        <p className="text-sm text-muted-foreground">
                          Contributor: <span className="text-foreground">@{activity.contributor.username}</span>
                        </p>

                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                          <span>Created {new Date(activity.createdAt).toLocaleString()}</span>
                          <span>Updated {new Date(activity.updatedAt).toLocaleString()}</span>
                          {activity.mergedAt ? <span>Merged {new Date(activity.mergedAt).toLocaleString()}</span> : null}
                          {payout?.paidAt ? <span>Paid {new Date(payout.paidAt).toLocaleString()}</span> : null}
                        </div>

                        {payout ? (
                          <p className="text-sm text-muted-foreground">
                            Payout: <span className="text-foreground">{payout.amount} {payout.currencySymbol}</span>
                            {" · "}
                            Wallet: <span className="font-mono text-foreground">{shortAddress(payout.contributorWalletAddress)}</span>
                          </p>
                        ) : null}
                      </div>

                      <a
                        href={activity.url}
                        target="_blank"
                        rel="noreferrer"
                        className="cyber-button px-4 py-2 rounded-md text-xs text-primary inline-flex items-center gap-2 self-start"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                        Open PR
                      </a>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
