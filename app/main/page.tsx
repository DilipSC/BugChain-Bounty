"use client"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Shield, LogOut, Github, Star, GitFork, Lock, Globe, ExternalLink, RefreshCw } from "lucide-react"

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

const MainPage = () => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [repos, setRepos] = useState<Repo[]>([])
  const [loadingRepos, setLoadingRepos] = useState(true)
  const [repoError, setRepoError] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  const loadRepos = async () => {
    setLoadingRepos(true)
    setRepoError("")

    try {
      const response = await fetch("/api/repos", { cache: "no-store" })
      if (!response.ok) {
        throw new Error("Could not load repositories")
      }
      const data = (await response.json()) as Repo[]
      setRepos(data)
    } catch {
      setRepoError("Failed to load repositories. Try refreshing.")
    } finally {
      setLoadingRepos(false)
    }
  }

  useEffect(() => {
    if (status === "authenticated") {
      loadRepos()
    }
  }, [status])

  const repoSummary = useMemo(() => {
    return {
      total: repos.length,
      privateCount: repos.filter((repo) => repo.private).length,
      publicCount: repos.filter((repo) => !repo.private).length,
    }
  }, [repos])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-grid">
        <div className="absolute inset-0 bg-linear-to-br from-background via-background to-primary/5" />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative"
        >
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-primary" />
                <span className="font-display text-xl font-bold tracking-widest text-primary text-glow-cyan">
                  CHAINGUARD
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-3">
                  {session.user?.image && (
                    <img 
                      src={session.user.image} 
                      alt={session.user.name || "User"} 
                      className="h-10 w-10 rounded-full border-2 border-primary/50"
                    />
                  )}
                  <div className="text-right">
                    <p className="font-semibold text-sm">{session.user?.name}</p>
                    <p className="text-xs text-muted-foreground">{session.user?.email}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="cyber-button px-4 py-2 rounded-md text-sm text-primary inline-flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-display text-4xl font-bold mb-2">
              Welcome back, <span className="text-primary text-glow-cyan">{session.user?.name?.split(" ")[0]}</span>
            </h1>
            <p className="text-muted-foreground mb-12">
              Connected repositories and quick project context
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="glass rounded-xl p-6 border-glow"
              >
                <div className="flex items-center justify-between mb-4">
                  <Github className="h-8 w-8 text-primary" />
                  <span className="text-3xl font-bold text-primary">{repoSummary.total}</span>
                </div>
                <h3 className="font-display font-semibold">Total Repositories</h3>
                <p className="text-sm text-muted-foreground">Fetched from your GitHub account</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="glass rounded-xl p-6 border-glow"
              >
                <div className="flex items-center justify-between mb-4">
                  <Lock className="h-8 w-8 text-primary" />
                  <span className="text-3xl font-bold text-primary">{repoSummary.privateCount}</span>
                </div>
                <h3 className="font-display font-semibold">Private Repositories</h3>
                <p className="text-sm text-muted-foreground">Potential internal security targets</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="glass rounded-xl p-6 border-glow"
              >
                <div className="flex items-center justify-between mb-4">
                  <Globe className="h-8 w-8 text-primary" />
                  <span className="text-3xl font-bold text-primary">{repoSummary.publicCount}</span>
                </div>
                <h3 className="font-display font-semibold">Public Repositories</h3>
                <p className="text-sm text-muted-foreground">Open-source repos in your profile</p>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="glass rounded-xl p-6 border-glow"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl font-bold">Your Repositories</h2>
                <button
                  onClick={loadRepos}
                  className="cyber-button px-4 py-2 rounded-md text-xs text-primary inline-flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </button>
              </div>

              {loadingRepos ? (
                <div className="text-center py-12">
                  <Shield className="h-10 w-10 text-primary mx-auto mb-4 animate-pulse" />
                  <p className="text-muted-foreground">Loading repositories...</p>
                </div>
              ) : repoError ? (
                <div className="text-center py-12">
                  <p className="text-destructive">{repoError}</p>
                </div>
              ) : repos.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No repositories found for this account.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {repos.map((repo) => (
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
                          <Star className="h-3.5 w-3.5" /> {repo.stargazers_count}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <GitFork className="h-3.5 w-3.5" /> {repo.forks_count}
                        </span>
                        {repo.language ? <span>{repo.language}</span> : null}
                        <span>Updated {new Date(repo.updated_at).toLocaleDateString()}</span>
                      </div>

                      <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        Open on GitHub <ExternalLink className="h-4 w-4" />
                      </a>
                    </article>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  )
}

export default MainPage
