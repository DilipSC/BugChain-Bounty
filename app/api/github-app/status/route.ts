import { NextResponse } from "next/server"
import { requireCurrentUser } from "@/lib/auth"
import { isGitHubAppConfigured } from "@/lib/github-app"

export async function GET() {
  const current = await requireCurrentUser()

  if (!current) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return NextResponse.json({
    configured: isGitHubAppConfigured(),
    installations: current.user.installations.map((installation) => ({
      id: installation.id,
      installationId: installation.installationId,
      accountLogin: installation.accountLogin,
      accountType: installation.accountType,
      targetType: installation.targetType,
    })),
  })
}
