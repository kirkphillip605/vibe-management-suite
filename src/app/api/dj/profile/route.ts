import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { createAuditLog } from "@/lib/audit"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "dj") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = parseInt(session.user.id)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        djProfile: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Failed to fetch DJ profile:", error)
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "dj") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = parseInt(session.user.id)
    const body = await request.json()

    const oldProfile = await prisma.djProfile.findUnique({
      where: { userId },
    })

    if (!oldProfile) {
      return NextResponse.json({ error: "DJ Profile not found" }, { status: 404 })
    }

    const { hourlyRate, ...rest } = body

    const profile = await prisma.djProfile.update({
      where: { userId },
      data: {
        ...rest,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
      },
      include: {
        user: true,
      },
    })

    await createAuditLog({
      userId,
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
    console.error("Failed to update DJ profile:", error)
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    )
  }
}
