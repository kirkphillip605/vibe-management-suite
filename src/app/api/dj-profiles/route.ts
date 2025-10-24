import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const djProfiles = await prisma.djProfile.findMany({
      include: {
        user: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(djProfiles)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch DJ profiles" },
      { status: 500 }
    )
  }
}
