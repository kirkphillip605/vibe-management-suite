import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { createAuditLog } from "@/lib/audit"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const venueId = parseInt(id)
    const body = await request.json()

    const oldVenue = await prisma.venue.findUnique({
      where: { id: venueId },
    })

    if (!oldVenue) {
      return NextResponse.json({ error: "Venue not found" }, { status: 404 })
    }

    const venue = await prisma.venue.update({
      where: { id: venueId },
      data: body,
    })

    await createAuditLog({
      userId: parseInt(session.user.id),
      entityType: "Venue",
      entityId: venue.id,
      action: "UPDATE",
      changes: {
        before: oldVenue,
        after: venue,
      },
    })

    return NextResponse.json(venue)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update venue" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const venueId = parseInt(id)

    const oldVenue = await prisma.venue.findUnique({
      where: { id: venueId },
    })

    if (!oldVenue) {
      return NextResponse.json({ error: "Venue not found" }, { status: 404 })
    }

    await prisma.venue.delete({
      where: { id: venueId },
    })

    await createAuditLog({
      userId: parseInt(session.user.id),
      entityType: "Venue",
      entityId: venueId,
      action: "DELETE",
      changes: {
        before: oldVenue,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete venue" },
      { status: 500 }
    )
  }
}
