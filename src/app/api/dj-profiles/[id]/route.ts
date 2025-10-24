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
    const djProfileId = parseInt(id)
    const body = await request.json()

    const oldProfile = await prisma.djProfile.findUnique({
      where: { id: djProfileId },
    })

    if (!oldProfile) {
      return NextResponse.json({ error: "DJ Profile not found" }, { status: 404 })
    }

    const { hourlyRate, ...rest } = body

    const profile = await prisma.djProfile.update({
      where: { id: djProfileId },
      data: {
        ...rest,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
      },
      include: {
        user: true,
      },
    })

    await createAuditLog({
      userId: parseInt(session.user.id),
      entityType: "DjProfile",
      entityId: profile.id,
      action: "UPDATE",
      changes: {
        before: oldProfile,
        after: profile,
      },
    })

    return NextResponse.json(profile)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update DJ profile" },
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
    const djProfileId = parseInt(id)

    const oldProfile = await prisma.djProfile.findUnique({
      where: { id: djProfileId },
      include: { user: true },
    })

    if (!oldProfile) {
      return NextResponse.json({ error: "DJ Profile not found" }, { status: 404 })
    }

    // Delete the user (which will cascade delete the profile)
    await prisma.user.delete({
      where: { id: oldProfile.userId },
    })

    await createAuditLog({
      userId: parseInt(session.user.id),
      entityType: "DjProfile",
      entityId: djProfileId,
      action: "DELETE",
      changes: {
        before: oldProfile,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete DJ profile" },
      { status: 500 }
    )
  }
}
