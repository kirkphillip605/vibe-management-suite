import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { createAuditLog } from "@/lib/audit"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const venues = await prisma.venue.findMany({
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(venues)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch venues" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const venue = await prisma.venue.create({
      data: body,
    })

    await createAuditLog({
      userId: parseInt(session.user.id),
      entityType: "Venue",
      entityId: venue.id,
      action: "CREATE",
      changes: {
        after: venue,
      },
    })

    return NextResponse.json(venue, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create venue" },
      { status: 500 }
    )
  }
}
