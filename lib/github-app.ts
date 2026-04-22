import crypto from "crypto"
import prisma from "@/lib/prisma"

type GitHubAppTokenResponse = {
  token: string
  expires_at: string
}

type GitHubInstallationResponse = {
  id: number
  app_slug?: string
  account: {
    login: string
    type: string
  }
  target_type: string
}

type GitHubInstallationRepo = {
  id: number
  name: string
  full_name: string
  html_url: string
  description: string | null
  private: boolean
  owner: {
    login: string
  }
  stargazers_count?: number
  forks_count?: number
  language?: string | null
  updated_at?: string
  permissions?: {
    admin?: boolean
    maintain?: boolean
    push?: boolean
  }
}

type GitHubPullRequest = {
  id: number
  number: number
  title: string
  html_url: string
  state: "open" | "closed"
  draft?: boolean
  merged_at?: string | null
  user: {
    id: number
    login: string
    avatar_url?: string
  }
  created_at: string
  updated_at: string
}

function base64UrlEncode(value: string | Buffer) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "")
}

function getRequiredEnv(name: string) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing ${name}`)
  }

  return value
}

function normalizePrivateKey(privateKey: string) {
  return privateKey.includes("\\n") ? privateKey.replace(/\\n/g, "\n") : privateKey
}

export function getGitHubAppConfig() {
  const appId = process.env.GITHUB_APP_ID
  const clientId = process.env.GITHUB_APP_CLIENT_ID
  const clientSecret = process.env.GITHUB_APP_CLIENT_SECRET
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY
  const slug = process.env.GITHUB_APP_SLUG

  if (!appId || !clientId || !clientSecret || !privateKey || !slug) {
    return null
  }

  return {
    appId,
    clientId,
    clientSecret,
    privateKey: normalizePrivateKey(privateKey),
    slug,
  }
}

export function isGitHubAppConfigured() {
  return getGitHubAppConfig() !== null
}

export function createGitHubAppJwt() {
  const config = getGitHubAppConfig()

  if (!config) {
    throw new Error("GitHub App is not fully configured")
  }

  const now = Math.floor(Date.now() / 1000)
  const header = { alg: "RS256", typ: "JWT" }
  const payload = {
    iat: now - 60,
    exp: now + 9 * 60,
    iss: config.appId,
  }

  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))
  const unsigned = `${encodedHeader}.${encodedPayload}`
  const signature = crypto.createSign("RSA-SHA256").update(unsigned).end().sign(config.privateKey)

  return `${unsigned}.${base64UrlEncode(signature)}`
}

async function githubAppRequest<T>(path: string, init?: RequestInit) {
  const jwt = createGitHubAppJwt()

  const response = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${jwt}`,
      "User-Agent": "BugChain-Bounty",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`GitHub App request failed (${response.status}): ${errorText}`)
  }

  return response.json() as Promise<T>
}

export async function getInstallationAccessToken(installationId: number) {
  const response = await githubAppRequest<GitHubAppTokenResponse>(
    `/app/installations/${installationId}/access_tokens`,
    {
      method: "POST",
    }
  )

  return response
}

export async function listInstallationRepositories(installationId: number) {
  const tokenResponse = await getInstallationAccessToken(installationId)

  const response = await fetch("https://api.github.com/installation/repositories?per_page=100", {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${tokenResponse.token}`,
      "User-Agent": "BugChain-Bounty",
    },
    cache: "no-store",
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`GitHub installation repo request failed (${response.status}): ${errorText}`)
  }

  const data = await response.json() as {
    repositories: GitHubInstallationRepo[]
  }

  return data.repositories
}

export async function getInstallationRepository(installationId: number, repoId: number) {
  const repositories = await listInstallationRepositories(installationId)
  return repositories.find((repo) => repo.id === repoId) ?? null
}

export async function listRepositoryPullRequests(params: {
  installationId: number
  owner: string
  repo: string
}) {
  const tokenResponse = await getInstallationAccessToken(params.installationId)

  const response = await fetch(
    `https://api.github.com/repos/${params.owner}/${params.repo}/pulls?state=all&sort=updated&direction=desc&per_page=25`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${tokenResponse.token}`,
        "User-Agent": "BugChain-Bounty",
      },
      cache: "no-store",
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`GitHub pull request request failed (${response.status}): ${errorText}`)
  }

  const pullRequests = await response.json() as GitHubPullRequest[]

  return pullRequests.map((pullRequest) => ({
    id: pullRequest.id,
    number: pullRequest.number,
    title: pullRequest.title,
    url: pullRequest.html_url,
    state: pullRequest.merged_at ? "merged" : pullRequest.state,
    draft: Boolean(pullRequest.draft),
    mergedAt: pullRequest.merged_at ?? null,
    createdAt: pullRequest.created_at,
    updatedAt: pullRequest.updated_at,
    contributor: {
      id: pullRequest.user.id,
      username: pullRequest.user.login,
      avatarUrl: pullRequest.user.avatar_url ?? null,
    },
  }))
}

export async function getInstallationDetails(installationId: number) {
  return githubAppRequest<GitHubInstallationResponse>(`/app/installations/${installationId}`)
}

export async function listAppInstallations() {
  return githubAppRequest<{
    installations: GitHubInstallationResponse[]
  }>("/app/installations?per_page=100").then((data) => data.installations)
}

export async function ensureUserInstallation(params: {
  userId: string
  username: string
}) {
  const existing = await prisma.gitHubAppInstallation.findFirst({
    where: { userId: params.userId },
    orderBy: { updatedAt: "desc" },
  })

  if (existing) {
    return existing
  }

  if (!isGitHubAppConfigured()) {
    return null
  }

  const installations = await listAppInstallations()
  const matched = installations.find(
    (installation) => installation.account.login.toLowerCase() === params.username.toLowerCase()
  )

  if (!matched) {
    return null
  }

  return prisma.gitHubAppInstallation.upsert({
    where: { installationId: matched.id },
    update: {
      userId: params.userId,
      accountLogin: matched.account.login,
      accountType: matched.account.type,
      targetType: matched.target_type,
      appSlug: matched.app_slug ?? null,
    },
    create: {
      userId: params.userId,
      installationId: matched.id,
      accountLogin: matched.account.login,
      accountType: matched.account.type,
      targetType: matched.target_type,
      appSlug: matched.app_slug ?? null,
    },
  })
}

export function getGitHubAppInstallUrl(state: string) {
  const config = getGitHubAppConfig()

  if (!config) {
    throw new Error("GitHub App is not fully configured")
  }

  return `https://github.com/apps/${config.slug}/installations/new?state=${encodeURIComponent(state)}`
}

export function createInstallState(userId: string) {
  const raw = JSON.stringify({
    userId,
    nonce: crypto.randomUUID(),
    timestamp: Date.now(),
  })

  return base64UrlEncode(raw)
}

export function parseInstallState(state: string | null) {
  if (!state) {
    return null
  }

  try {
    const decoded = Buffer.from(state.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8")
    const parsed = JSON.parse(decoded) as { userId?: string }
    return parsed.userId ? parsed : null
  } catch {
    return null
  }
}
