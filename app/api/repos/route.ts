import { NextResponse } from "next/server"
import { requireCurrentUser } from "@/lib/auth"
import { listInstallationRepositories } from "@/lib/github-app"

export async function GET() {
    const current = await requireCurrentUser()

    if (!current) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const installation = current.user.installations[0]

    if (!installation) {
        return NextResponse.json({
            requiresInstallation: true,
            repositories: [],
        })
    }

    try {
        const repositories = await listInstallationRepositories(installation.installationId)

        return NextResponse.json({
            requiresInstallation: false,
            repositories,
            installation: {
                accountLogin: installation.accountLogin,
                installationId: installation.installationId,
            },
        })
    } catch (error) {
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "Failed to fetch repositories from GitHub App installation",
            },
            { status: 500 }
        )
    }
}
