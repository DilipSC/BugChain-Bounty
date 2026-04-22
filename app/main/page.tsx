"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  CheckCircle2,
  Coins,
  ExternalLink,
  Github,
  Link2,
  Lock,
  LogOut,
  RefreshCw,
  Rocket,
  Shield,
  Star,
  Wallet,
  Search,
} from "lucide-react"

type Repo = {
  id: number
  name: string
  full_name: string
  description: string | null
  private: boolean
  html_url: string
  stargazers_count: number
  forks_count: number
  language: string | null
  updated_at: string
}

type Listing = {
  id: string
  repoGithubId: number
  repoName: string
  repoFullName: string
  repoUrl: string
  repoDescription: string | null
  repoIsPrivate: boolean
  bountyAmount: string
  currencySymbol: string
  chainId: number
  isActive: boolean
  isDiscoverable: boolean
  updatedAt: string
  payouts: {
    id: string
    status: string
  }[]
}

type RepoPullRequest = {
  id: number
  number: number
  title: string
  url: string
  state: "open" | "closed" | "merged"
  draft: boolean
  mergedAt: string | null
  createdAt: string
  updatedAt: string
  contributor: {
    id: number
    username: string
    avatarUrl: string | null
  }
}

type Payout = {
  id: string
  status: "PENDING_WALLET" | "READY_TO_PAY" | "PAID" | "FAILED"
  contributorUsername: string
  contributorWalletAddress: string | null
  amount: string
  currencySymbol: string
  chainId: number
  pullRequestNumber: number
  pullRequestTitle: string
  pullRequestUrl: string
  mergedAt: string
  paidAt: string | null
  txHash: string | null
  txError: string | null
  listing: {
    repoFullName: string
    repoUrl: string
  }
}

type GitHubAppStatus = {
  configured: boolean
  installations: {
    id: string
    installationId: number
    accountLogin: string
    accountType: string
    targetType: string
  }[]
}

type RepoResponse = {
  requiresInstallation: boolean
  repositories: Repo[]
  installation?: {
    accountLogin: string
    installationId: number
  }
}

const statusStyles: Record<Payout["status"], string> = {
  PENDING_WALLET: "border-amber-400/40 text-amber-300 bg-amber-500/10",
  READY_TO_PAY: "border-sky-400/40 text-sky-300 bg-sky-500/10",
  PAID: "border-emerald-400/40 text-emerald-300 bg-emerald-500/10",
  FAILED: "border-rose-400/40 text-rose-300 bg-rose-500/10",
}

function shortAddress(address?: string | null) {
  if (!address) {
    return "Not connected"
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

const MainPage = () => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [repos, setRepos] = useState<Repo[]>([])
  const [listings, setListings] = useState<Listing[]>([])
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [githubAppStatus, setGitHubAppStatus] = useState<GitHubAppStatus | null>(null)
  const [listingPullRequests, setListingPullRequests] = useState<Record<string, RepoPullRequest[]>>({})
  const [loadingPullRequests, setLoadingPullRequests] = useState<Record<string, boolean>>({})
  const [pullRequestErrors, setPullRequestErrors] = useState<Record<string, string>>({})
  const [requiresInstallation, setRequiresInstallation] = useState(false)
  const [loadingDashboard, setLoadingDashboard] = useState(true)
  const [walletLoading, setWalletLoading] = useState(false)
  const [submittingListing, setSubmittingListing] = useState(false)
  const [syncingPayouts, setSyncingPayouts] = useState(false)
  const [repoError, setRepoError] = useState("")
  const [walletError, setWalletError] = useState("")
  const [listingError, setListingError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [selectedRepoId, setSelectedRepoId] = useState<number | "">("")
  const [bountyAmount, setBountyAmount] = useState("0.05")
  const [chainId, setChainId] = useState("84532")
  const [currencySymbol, setCurrencySymbol] = useState("ETH")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    const githubAppState = new URLSearchParams(window.location.search).get("githubApp")

    if (githubAppState === "installed" || githubAppState === "created") {
      setSuccessMessage("GitHub App installation connected. You can now create repository bounties from installed repos.")
    }
  }, [])

  const loadDashboard = useCallback(async () => {
    setLoadingDashboard(true)
    setRepoError("")

    try {
      const [repoResponse, walletResponse, listingsResponse, payoutsResponse, githubAppResponse] = await Promise.all([
        fetch("/api/repos", { cache: "no-store" }),
        fetch("/api/wallet", { cache: "no-store" }),
        fetch("/api/listings", { cache: "no-store" }),
        fetch("/api/payouts", { cache: "no-store" }),
        fetch("/api/github-app/status", { cache: "no-store" }),
      ])

      if (!repoResponse.ok || !walletResponse.ok || !listingsResponse.ok || !payoutsResponse.ok || !githubAppResponse.ok) {
        throw new Error("Could not load dashboard")
      }

      const [repoData, walletData, listingData, payoutData, githubAppData] = await Promise.all([
        repoResponse.json() as Promise<RepoResponse>,
        walletResponse.json() as Promise<{ walletAddress: string | null }>,
        listingsResponse.json() as Promise<Listing[]>,
        payoutsResponse.json() as Promise<Payout[]>,
        githubAppResponse.json() as Promise<GitHubAppStatus>,
      ])

      setRepos(repoData.repositories ?? [])
      setRequiresInstallation(repoData.requiresInstallation)
      setWalletAddress(walletData.walletAddress)
      setListings(listingData)
      setPayouts(payoutData)
      setGitHubAppStatus(githubAppData)

      if (selectedRepoId === "" && repoData.repositories.length > 0) {
        setSelectedRepoId(repoData.repositories[0].id)
      }
    } catch {
      setRepoError("Failed to load dashboard data. Refresh and try again.")
    } finally {
      setLoadingDashboard(false)
    }
  }, [selectedRepoId])

  useEffect(() => {
    if (status === "authenticated") {
      void loadDashboard()
    }
  }, [status, loadDashboard])

  const repoSummary = useMemo(() => {
    return {
      total: repos.length,
      privateCount: repos.filter((repo) => repo.private).length,
      listedCount: listings.length,
      discoverableCount: listings.filter((listing) => listing.isDiscoverable).length,
      paidCount: payouts.filter((payout) => payout.status === "PAID").length,
    }
  }, [repos, listings, payouts])

  const nextSelectedRepo = useMemo(() => {
    return repos.find((repo) => repo.id === selectedRepoId) ?? null
  }, [repos, selectedRepoId])

  const connectWallet = async () => {
    setWalletError("")
    setSuccessMessage("")

    if (!window.ethereum) {
      setWalletError("No injected wallet found. Install MetaMask or another EVM wallet.")
      return
    }

    setWalletLoading(true)

    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" }) as string[]
      const address = accounts[0]

      if (!address) {
        throw new Error("Wallet returned no address")
      }

      const response = await fetch("/api/wallet", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ walletAddress: address }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Could not save wallet")
      }

      setWalletAddress(data.walletAddress)
      setSuccessMessage("Wallet connected and saved for bounty payouts.")
      await loadDashboard()
    } catch (error) {
      setWalletError(error instanceof Error ? error.message : "Could not connect wallet")
    } finally {
      setWalletLoading(false)
    }
  }

  const createListing = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setListingError("")
    setSuccessMessage("")

    if (selectedRepoId === "") {
      setListingError("Pick a repository first.")
      return
    }

    setSubmittingListing(true)

    try {
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repoId: selectedRepoId,
          bountyAmount,
          chainId: Number(chainId),
          currencySymbol,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Could not create listing")
      }

      setSuccessMessage(`Bounty listed for ${data.repoFullName}.`)
      await loadDashboard()
    } catch (error) {
      setListingError(error instanceof Error ? error.message : "Could not create listing")
    } finally {
      setSubmittingListing(false)
    }
  }

  const toggleListingVisibility = async (listingId: string, nextValue: boolean) => {
    const response = await fetch("/api/listings", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        listingId,
        isDiscoverable: nextValue,
      }),
    })

    if (response.ok) {
      await loadDashboard()
    }
  }

  const loadListingPullRequests = async (listingId: string) => {
    setPullRequestErrors((currentErrors) => ({
      ...currentErrors,
      [listingId]: "",
    }))
    setLoadingPullRequests((currentLoading) => ({
      ...currentLoading,
      [listingId]: true,
    }))

    try {
      const response = await fetch(`/api/listings/${listingId}/pull-requests`, {
        cache: "no-store",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Could not load pull requests")
      }

      setListingPullRequests((currentPullRequests) => ({
        ...currentPullRequests,
        [listingId]: data as RepoPullRequest[],
      }))
    } catch (error) {
      setPullRequestErrors((currentErrors) => ({
        ...currentErrors,
        [listingId]: error instanceof Error ? error.message : "Could not load pull requests",
      }))
    } finally {
      setLoadingPullRequests((currentLoading) => ({
        ...currentLoading,
        [listingId]: false,
      }))
    }
  }

  const syncMergedPayouts = async () => {
    setRepoError("")
    setSuccessMessage("")
    setSyncingPayouts(true)

    try {
      const response = await fetch("/api/payouts/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Could not sync merged pull requests")
      }

      setSuccessMessage(
        data.createdCount > 0
          ? `Synced ${data.createdCount} missing payout record(s) from ${data.mergedPullRequestsScanned} merged pull request(s).`
          : `No missing payouts found. Scanned ${data.mergedPullRequestsScanned} merged pull request(s).`
      )
      await loadDashboard()
    } catch (error) {
      setRepoError(error instanceof Error ? error.message : "Could not sync merged pull requests")
    } finally {
      setSyncingPayouts(false)
    }
  }

  if (status === "loading" || loadingDashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-grid">
        <div className="absolute inset-0 bg-linear-to-br from-background via-background to-primary/5" />
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative">
          <Shield className="h-12 w-12 text-primary animate-pulse" />
        </motion.div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-grid">
      <div className="absolute inset-0 bg-linear-to-br from-background via-background to-primary/5" />

      <div className="relative">
        <header className="border-b border-border/50 backdrop-blur-sm bg-background/50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-primary" />
                <span className="font-display text-xl font-bold tracking-widest text-primary text-glow-cyan">
                  CHAINGUARD
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/profile"
                  className="cyber-button px-4 py-2 rounded-md text-sm text-primary inline-flex items-center gap-2"
                >
                  <Github className="h-4 w-4" />
                  Profile
                </Link>
                <Link
                  href="/bounties"
                  className="cyber-button px-4 py-2 rounded-md text-sm text-primary inline-flex items-center gap-2"
                >
                  <Search className="h-4 w-4" />
                  Browse Bounties
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="cyber-button px-4 py-2 rounded-md text-sm text-primary inline-flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-12 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4"
          >
            <div>
              <h1 className="font-display text-4xl font-bold mb-2">
                Manage listings, installs, and <span className="text-primary text-glow-cyan">merged PR payouts</span>
              </h1>
              <p className="text-muted-foreground max-w-3xl">
                Install the GitHub App, select one of the installed repos, publish a bounty, and let merged PR
                events trigger payout records for connected contributors.
              </p>
            </div>

            <button
              onClick={() => void loadDashboard()}
              className="cyber-button px-4 py-2 rounded-md text-xs text-primary inline-flex items-center gap-2 self-start lg:self-auto"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Dashboard
            </button>
          </motion.div>

          {repoError ? (
            <div className="glass rounded-xl p-4 border border-rose-500/30 text-rose-300">
              {repoError}
            </div>
          ) : null}

          {successMessage ? (
            <div className="glass rounded-xl p-4 border border-emerald-500/30 text-emerald-300 inline-flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              {successMessage}
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
            <div className="glass rounded-xl p-6 border-glow">
              <div className="flex items-center justify-between mb-4">
                <Github className="h-8 w-8 text-primary" />
                <span className="text-3xl font-bold text-primary">{repoSummary.total}</span>
              </div>
              <h3 className="font-display font-semibold">Installed Repositories</h3>
              <p className="text-sm text-muted-foreground">Repos available through your GitHub App installation</p>
            </div>

            <div className="glass rounded-xl p-6 border-glow">
              <div className="flex items-center justify-between mb-4">
                <Lock className="h-8 w-8 text-primary" />
                <span className="text-3xl font-bold text-primary">{repoSummary.privateCount}</span>
              </div>
              <h3 className="font-display font-semibold">Private Repositories</h3>
              <p className="text-sm text-muted-foreground">Private repos can still be managed, but should stay hidden</p>
            </div>

            <div className="glass rounded-xl p-6 border-glow">
              <div className="flex items-center justify-between mb-4">
                <Coins className="h-8 w-8 text-primary" />
                <span className="text-3xl font-bold text-primary">{repoSummary.listedCount}</span>
              </div>
              <h3 className="font-display font-semibold">Active Listings</h3>
              <p className="text-sm text-muted-foreground">Repos configured to pay after merged pull requests</p>
            </div>

            <div className="glass rounded-xl p-6 border-glow">
              <div className="flex items-center justify-between mb-4">
                <Search className="h-8 w-8 text-primary" />
                <span className="text-3xl font-bold text-primary">{repoSummary.discoverableCount}</span>
              </div>
              <h3 className="font-display font-semibold">Publicly Discoverable</h3>
              <p className="text-sm text-muted-foreground">Listings visible to contributors in the bounty marketplace</p>
            </div>

            <div className="glass rounded-xl p-6 border-glow">
              <div className="flex items-center justify-between mb-4">
                <CheckCircle2 className="h-8 w-8 text-primary" />
                <span className="text-3xl font-bold text-primary">{repoSummary.paidCount}</span>
              </div>
              <h3 className="font-display font-semibold">Paid Payouts</h3>
              <p className="text-sm text-muted-foreground">Merged pull requests already paid on-chain</p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-8">
            <section className="glass rounded-xl p-6 border-glow space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl font-bold">GitHub App</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Install the app on the repos you want to manage. Contributors do not do this. Maintainers do it once.
                  </p>
                </div>
                <Rocket className="h-6 w-6 text-primary" />
              </div>

              {!githubAppStatus?.configured ? (
                <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
                  GitHub App env vars are missing. Set `GITHUB_APP_ID`, `GITHUB_APP_CLIENT_ID`,
                  `GITHUB_APP_CLIENT_SECRET`, `GITHUB_APP_PRIVATE_KEY`, and `GITHUB_APP_SLUG`.
                </div>
              ) : requiresInstallation ? (
                <div className="space-y-4">
                  <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
                    No GitHub App installation found for your account yet. Install the app before creating a listing.
                  </div>
                  <a
                    href="/api/github-app/install"
                    className="cyber-button-solid px-5 py-3 rounded-md text-sm inline-flex items-center gap-2"
                  >
                    <Github className="h-4 w-4" />
                    Install GitHub App
                  </a>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg border border-border/60 bg-secondary/25 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">Connected installation</p>
                    <p className="font-display text-lg text-primary">
                      {githubAppStatus?.installations[0]?.accountLogin || "Installed"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href="/api/github-app/install"
                      className="cyber-button px-4 py-2 rounded-md text-sm text-primary inline-flex items-center gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Reinstall / Change Repo Access
                    </a>
                    <Link
                      href="/bounties"
                      className="cyber-button px-4 py-2 rounded-md text-sm text-primary inline-flex items-center gap-2"
                    >
                      <Search className="h-4 w-4" />
                      View Contributor Marketplace
                    </Link>
                  </div>
                </div>
              )}
            </section>

            <section className="glass rounded-xl p-6 border-glow space-y-6">
              <div>
                <h2 className="font-display text-2xl font-bold">Create Repository Bounty</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose a repo from your GitHub App installation, set the amount, and publish it for contributors.
                </p>
              </div>

              <form onSubmit={createListing} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm text-muted-foreground">Repository</span>
                  <select
                    value={selectedRepoId}
                    onChange={(event) => {
                      const value = event.target.value
                      setSelectedRepoId(value ? Number(value) : "")
                    }}
                    className="w-full rounded-md border border-border/60 bg-secondary/20 px-3 py-3 outline-none"
                    disabled={requiresInstallation}
                  >
                    <option value="">Select a repository</option>
                    {repos.map((repo) => (
                      <option key={repo.id} value={repo.id}>
                        {repo.full_name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-sm text-muted-foreground">Bounty Amount</span>
                  <input
                    value={bountyAmount}
                    onChange={(event) => setBountyAmount(event.target.value)}
                    placeholder="0.05"
                    className="w-full rounded-md border border-border/60 bg-secondary/20 px-3 py-3 outline-none"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm text-muted-foreground">Currency Symbol</span>
                  <input
                    value={currencySymbol}
                    onChange={(event) => setCurrencySymbol(event.target.value.toUpperCase())}
                    placeholder="ETH"
                    className="w-full rounded-md border border-border/60 bg-secondary/20 px-3 py-3 outline-none"
                  />
                </label>

                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm text-muted-foreground">Chain ID</span>
                  <input
                    value={chainId}
                    onChange={(event) => setChainId(event.target.value)}
                    placeholder="84532"
                    className="w-full rounded-md border border-border/60 bg-secondary/20 px-3 py-3 outline-none"
                  />
                </label>

                {listingError ? (
                  <div className="md:col-span-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
                    {listingError}
                  </div>
                ) : null}

                <div className="md:col-span-2 flex items-center justify-between gap-4">
                  <div className="text-sm text-muted-foreground">
                    {nextSelectedRepo ? `Selected: ${nextSelectedRepo.full_name}` : "Choose an installed repository to continue"}
                  </div>
                  <button
                    type="submit"
                    disabled={submittingListing || requiresInstallation}
                    className="cyber-button-solid px-5 py-3 rounded-md text-sm disabled:opacity-60"
                  >
                    {submittingListing ? "Saving..." : "Create Listing"}
                  </button>
                </div>
              </form>
            </section>
          </div>

          <section className="glass rounded-xl p-6 border-glow">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-2xl font-bold">Contributor Wallet</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Contributors connect MetaMask to store the receiving wallet address for payouts.
                </p>
              </div>
              <Wallet className="h-6 w-6 text-primary" />
            </div>

            <div className="rounded-lg border border-border/60 bg-secondary/25 p-4 mb-4">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">Connected wallet</p>
              <p className="font-mono text-lg text-primary">{shortAddress(walletAddress)}</p>
            </div>

            {walletError ? (
              <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300 mb-4">
                {walletError}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => void connectWallet()}
                disabled={walletLoading}
                className="cyber-button-solid px-5 py-3 rounded-md text-sm inline-flex items-center gap-2 disabled:opacity-60"
              >
                <Link2 className="h-4 w-4" />
                {walletLoading ? "Connecting..." : walletAddress ? "Reconnect Wallet" : "Connect Wallet"}
              </button>
              <Link
                href="/bounties"
                className="cyber-button px-5 py-3 rounded-md text-sm text-primary inline-flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                See Public Bounties
              </Link>
            </div>

            <div className="rounded-lg border border-amber-500/20 bg-amber-500/8 p-4 mt-4">
              <p className="text-sm text-amber-200 inline-flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                The backend payout wallet sends transactions automatically. MetaMask here is only for saving the receiving address.
              </p>
            </div>
          </section>

          <section className="glass rounded-xl p-6 border-glow">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-2xl font-bold">Active Listings</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Public contributors can discover listings that are active, public, and not private repos.
                </p>
              </div>
            </div>

            {listings.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                No bounty listings yet. Install the GitHub App and create one from the form above.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {listings.map((listing) => (
                  <article key={listing.id} className="rounded-lg border border-border/60 p-5 bg-secondary/25">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-display text-lg text-primary">{listing.repoFullName}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {listing.repoDescription || "No description provided."}
                        </p>
                      </div>
                      <span className="rounded-full border border-primary/30 px-3 py-1 text-xs text-primary">
                        {listing.bountyAmount} {listing.currencySymbol}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-4 text-xs text-muted-foreground">
                      <span>Chain ID {listing.chainId}</span>
                      <span>{listing.repoIsPrivate ? "Private repo" : "Public repo"}</span>
                      <span>{listing.isDiscoverable ? "Discoverable" : "Hidden from contributors"}</span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      {!listing.repoIsPrivate ? (
                        <button
                          onClick={() => void toggleListingVisibility(listing.id, !listing.isDiscoverable)}
                          className="cyber-button px-4 py-2 rounded-md text-xs text-primary"
                        >
                          {listing.isDiscoverable ? "Hide From Marketplace" : "Publish To Marketplace"}
                        </button>
                      ) : null}
                      <button
                        onClick={() => void loadListingPullRequests(listing.id)}
                        className="cyber-button px-4 py-2 rounded-md text-xs text-primary"
                      >
                        {loadingPullRequests[listing.id] ? "Loading PRs..." : "Load Recent PRs"}
                      </button>
                      <Link
                        href={`/bounties/${listing.id}`}
                        className="cyber-button px-4 py-2 rounded-md text-xs text-primary inline-flex items-center gap-2"
                      >
                        <Search className="h-4 w-4" />
                        Open Public Detail
                      </Link>
                    </div>

                    <a
                      href={listing.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      Open repository <ExternalLink className="h-4 w-4" />
                    </a>

                    {pullRequestErrors[listing.id] ? (
                      <div className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
                        {pullRequestErrors[listing.id]}
                      </div>
                    ) : null}

                    {listingPullRequests[listing.id] ? (
                      <div className="mt-4 rounded-lg border border-border/60 bg-background/20 p-4">
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <h4 className="font-display text-sm text-primary">Recent Pull Requests</h4>
                          <span className="text-xs text-muted-foreground">
                            {listingPullRequests[listing.id].length} shown
                          </span>
                        </div>

                        {listingPullRequests[listing.id].length === 0 ? (
                          <p className="text-sm text-muted-foreground">No pull requests found for this repository.</p>
                        ) : (
                          <div className="space-y-3">
                            {listingPullRequests[listing.id].map((pullRequest) => (
                              <a
                                key={pullRequest.id}
                                href={pullRequest.url}
                                target="_blank"
                                rel="noreferrer"
                                className="block rounded-lg border border-border/60 bg-secondary/20 p-3 hover:border-primary/40"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-sm text-foreground">
                                      PR #{pullRequest.number}: {pullRequest.title}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                      Contributor @{pullRequest.contributor.username}
                                    </p>
                                  </div>
                                  <span className="rounded-full border border-primary/30 px-2.5 py-1 text-[11px] text-primary whitespace-nowrap">
                                    {pullRequest.state.toUpperCase()}
                                  </span>
                                </div>

                                <div className="mt-2 text-xs text-muted-foreground">
                                  Updated {new Date(pullRequest.updatedAt).toLocaleString()}
                                </div>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="glass rounded-xl p-6 border-glow">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-2xl font-bold">Merged PR Payouts</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Populated by the GitHub App webhook whenever a listed repository has a pull request merged.
                  If GitHub missed a delivery, you can backfill merged PR payouts from the button below.
                </p>
              </div>
              <button
                onClick={() => void syncMergedPayouts()}
                disabled={syncingPayouts}
                className="cyber-button px-4 py-2 rounded-md text-xs text-primary inline-flex items-center gap-2 disabled:opacity-60"
              >
                <RefreshCw className={`h-4 w-4 ${syncingPayouts ? "animate-spin" : ""}`} />
                {syncingPayouts ? "Syncing..." : "Sync Missing Payouts"}
              </button>
            </div>

            {payouts.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                No payout events yet. Merge a PR on a listed repository after the GitHub App webhook is active.
              </div>
            ) : (
              <div className="space-y-4">
                {payouts.map((payout) => (
                  <article key={payout.id} className="rounded-lg border border-border/60 p-5 bg-secondary/25">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="font-display text-lg text-primary">{payout.listing.repoFullName}</h3>
                          <span className={`rounded-full border px-3 py-1 text-xs ${statusStyles[payout.status]}`}>
                            {payout.status.replaceAll("_", " ")}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          PR #{payout.pullRequestNumber}: {payout.pullRequestTitle}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Contributor: <span className="text-foreground">{payout.contributorUsername}</span>
                          {" • "}
                          Wallet: <span className="font-mono text-foreground">{shortAddress(payout.contributorWalletAddress)}</span>
                        </p>
                      </div>

                      <div className="text-left lg:text-right">
                        <p className="font-display text-2xl text-primary">
                          {payout.amount} {payout.currencySymbol}
                        </p>
                        <p className="text-xs text-muted-foreground">Chain ID {payout.chainId}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-4 text-xs text-muted-foreground">
                      <span>Merged {new Date(payout.mergedAt).toLocaleString()}</span>
                      {payout.paidAt ? <span>Paid {new Date(payout.paidAt).toLocaleString()}</span> : null}
                      {payout.txHash ? <span className="font-mono">Tx {shortAddress(payout.txHash)}</span> : null}
                    </div>

                    {payout.txError ? (
                      <div className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
                        {payout.txError}
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="glass rounded-xl p-6 border-glow">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-2xl font-bold">Installed GitHub Repositories</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  These are the repos visible through your GitHub App installation, not your raw OAuth token.
                </p>
              </div>
            </div>

            {requiresInstallation ? (
              <div className="text-center py-12 text-muted-foreground">
                Install the GitHub App to load repositories here.
              </div>
            ) : repos.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No repositories found for this installation.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {repos.map((repo) => {
                  const linkedListing = listings.find((listing) => listing.repoGithubId === repo.id)

                  return (
                    <article key={repo.id} className="rounded-lg border border-border/60 p-4 bg-secondary/30">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-display text-base text-primary wrap-break-word">{repo.full_name}</h3>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {repo.description || "No description provided."}
                          </p>
                        </div>
                        <span className="text-xs px-2 py-1 rounded border border-border/60 whitespace-nowrap">
                          {repo.private ? "Private" : "Public"}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Star className="h-3.5 w-3.5" /> {repo.stargazers_count ?? 0}
                        </span>
                        <span>{repo.language ?? "Unknown"}</span>
                        <span>Updated {new Date(repo.updated_at).toLocaleDateString()}</span>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <button
                          onClick={() => setSelectedRepoId(repo.id)}
                          className="cyber-button px-4 py-2 rounded-md text-xs text-primary"
                        >
                          {linkedListing ? "Update Listing" : "Use for Listing"}
                        </button>
                        {linkedListing ? (
                          <span className="text-xs rounded-full border border-primary/30 px-3 py-1 text-primary">
                            {linkedListing.bountyAmount} {linkedListing.currencySymbol} on chain {linkedListing.chainId}
                          </span>
                        ) : null}
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}

export default MainPage
