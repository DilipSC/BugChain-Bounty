import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getInstallationDetails, parseInstallState } from "@/lib/github-app"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const installationIdValue = url.searchParams.get("installation_id")
  const setupAction = url.searchParams.get("setup_action")
  const state = parseInstallState(url.searchParams.get("state"))
  const baseUrl = url.origin

  if (!installationIdValue || !state?.userId) {
    return NextResponse.redirect(new URL("/main?githubApp=invalid", baseUrl))
  }

  const installationId = Number(installationIdValue)

  if (!Number.isInteger(installationId)) {
    return NextResponse.redirect(new URL("/main?githubApp=invalid", baseUrl))
  }

  try {
    const installation = await getInstallationDetails(installationId)

    await prisma.gitHubAppInstallation.upsert({
      where: { installationId },
      update: {
        userId: state.userId,
        accountLogin: installation.account.login,
        accountType: installation.account.type,
        targetType: installation.target_type,
        appSlug: installation.app_slug ?? null,
      },
      create: {
        userId: state.userId,
        installationId,
        accountLogin: installation.account.login,
        accountType: installation.account.type,
        targetType: installation.target_type,
        appSlug: installation.app_slug ?? null,
      },
    })
  } catch {
    return NextResponse.redirect(new URL("/main?githubApp=fetch_failed", baseUrl))
  }

  return NextResponse.redirect(new URL(`/main?githubApp=${setupAction ?? "installed"}`, baseUrl))
}
