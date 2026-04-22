type GitHubSearchPullRequestItem = {
  id: number
  number: number
  title: string
  html_url: string
  state: "open" | "closed"
  updated_at: string
  created_at: string
  repository_url: string
  pull_request?: {
    url: string
  }
}

type GitHubPullRequestDetail = {
  id: number
  number: number
  title: string
  html_url: string
  state: "open" | "closed"
  merged_at: string | null
  created_at: string
  updated_at: string
  user: {
    login: string
    avatar_url?: string
  }
  base: {
    repo: {
      full_name: string
      html_url: string
    }
  }
}

function getAuthHeaders(accessToken: string) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${accessToken}`,
    "User-Agent": "BugChain-Bounty",
  }
}

export async function listAuthenticatedUserPullRequests(params: {
  accessToken: string
  username: string
  limit?: number
}) {
  const limit = params.limit ?? 25

  const searchResponse = await fetch(
    `https://api.github.com/search/issues?q=${encodeURIComponent(`author:${params.username} is:pr`)}&sort=updated&order=desc&per_page=${limit}`,
    {
      headers: getAuthHeaders(params.accessToken),
      cache: "no-store",
    }
  )

  if (!searchResponse.ok) {
    const errorText = await searchResponse.text()
    throw new Error(`GitHub PR search failed (${searchResponse.status}): ${errorText}`)
  }

  const searchData = await searchResponse.json() as {
    items: GitHubSearchPullRequestItem[]
  }

  const detailPromises = searchData.items
    .filter((item) => Boolean(item.pull_request?.url))
    .map(async (item) => {
      const detailResponse = await fetch(item.pull_request!.url, {
        headers: getAuthHeaders(params.accessToken),
        cache: "no-store",
      })

      if (!detailResponse.ok) {
        const errorText = await detailResponse.text()
        throw new Error(`GitHub PR detail failed (${detailResponse.status}): ${errorText}`)
      }

      const detail = await detailResponse.json() as GitHubPullRequestDetail

      return {
        id: detail.id,
        number: detail.number,
        title: detail.title,
        url: detail.html_url,
        state: detail.merged_at ? "merged" : detail.state,
        createdAt: detail.created_at,
        updatedAt: detail.updated_at,
        mergedAt: detail.merged_at,
        repository: {
          fullName: detail.base.repo.full_name,
          url: detail.base.repo.html_url,
        },
        contributor: {
          username: detail.user.login,
          avatarUrl: detail.user.avatar_url ?? null,
        },
      }
    })

  return Promise.all(detailPromises)
}
