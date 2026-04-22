import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"
import { ensureUserInstallation, isGitHubAppConfigured } from "@/lib/github-app"

export async function requireSession() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id || !session.githubId) {
    return null
  }

  return session
}

export async function requireCurrentUser() {
  const session = await requireSession()

  if (!session?.user?.id) {
    return null
  }

  let user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      installations: {
        orderBy: { updatedAt: "desc" },
      },
    },
  })

  if (!user) {
    return null
  }

  if (user.installations.length === 0 && isGitHubAppConfigured()) {
    try {
      await ensureUserInstallation({
        userId: user.id,
        username: user.username,
      })
    } catch (error) {
      console.error("Failed to sync GitHub App installation for user", {
        userId: user.id,
        username: user.username,
        error: error instanceof Error ? error.message : error,
      })
    }

    user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        installations: {
          orderBy: { updatedAt: "desc" },
        },
      },
    })
  }

  if (!user) {
    return null
  }

  return { session, user }
}
