import { NextResponse } from "next/server"
import { requireCurrentUser } from "@/lib/auth"
import { createInstallState, getGitHubAppInstallUrl, isGitHubAppConfigured } from "@/lib/github-app"

export async function GET() {
  const current = await requireCurrentUser()

  if (!current) {
    return NextResponse.redirect(new URL("/login", process.env.NEXTAUTH_URL ?? "http://localhost:3000"))
  }

  if (!isGitHubAppConfigured()) {
    return NextResponse.json({ error: "GitHub App is not configured" }, { status: 500 })
  }

  const state = createInstallState(current.user.id)
  return NextResponse.redirect(getGitHubAppInstallUrl(state))
}

