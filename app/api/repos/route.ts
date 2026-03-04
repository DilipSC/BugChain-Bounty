import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "../auth/[...nextauth]/route"

export async function GET() {
    const session = await getServerSession(authOptions)

    if (!session?.accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const response = await fetch("https://api.github.com/user/repos?sort=updated&per_page=50", {
        headers: {
            Authorization: `Bearer ${session.accessToken}`,
            Accept: "application/vnd.github+json",
        },
        cache: "no-store",
    })

    if (!response.ok) {
        return NextResponse.json(
            { error: "Failed to fetch repositories from GitHub" },
            { status: response.status }
        )
    }

    const repos = await response.json()
    return NextResponse.json(repos)
}