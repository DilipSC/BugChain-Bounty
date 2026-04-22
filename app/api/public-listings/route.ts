import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  const listings = await prisma.repoListing.findMany({
    where: {
      isActive: true,
      isDiscoverable: true,
      repoIsPrivate: false,
    },
    orderBy: { updatedAt: "desc" },
    include: {
      owner: {
        select: {
          username: true,
          avatar: true,
        },
      },
      payouts: {
        orderBy: { createdAt: "desc" },
        take: 3,
      },
    },
  })

  return NextResponse.json(listings)
}
