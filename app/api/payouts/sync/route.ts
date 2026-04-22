import { NextResponse } from "next/server"
import { requireCurrentUser } from "@/lib/auth"
import { syncMergedPullRequestPayouts } from "@/lib/payouts"

export async function POST() {
  const current = await requireCurrentUser()

  if (!current) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const installation = current.user.installations[0]

  if (!installation) {
    return NextResponse.json({ error: "Install the GitHub App before syncing payouts" }, { status: 400 })
  }

  try {
    const result = await syncMergedPullRequestPayouts({
      installationId: installation.installationId,
      maintainerId: current.user.id,
    })

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to sync merged pull request payouts",
      },
      { status: 500 }
    )
  }
}
