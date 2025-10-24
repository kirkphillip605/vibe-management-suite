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
    const gigId = parseInt(id)
    const body = await request.json()

    const oldGig = await prisma.gig.findUnique({
      where: { id: gigId },
    })

    if (!oldGig) {
      return NextResponse.json({ error: "Gig not found" }, { status: 404 })
    }

    const { rate, deposit, balance, ...rest } = body

    const gig = await prisma.gig.update({
      where: { id: gigId },
      data: {
        ...rest,
        rate: rate ? parseFloat(rate) : null,
        deposit: deposit ? parseFloat(deposit) : null,
        balance: balance ? parseFloat(balance) : null,
      },
      include: {
        customer: true,
        venue: true,
        djProfile: {
          include: {
            user: true,
          },
        },
      },
    })

    await createAuditLog({
      userId: parseInt(session.user.id),
      entityType: "Gig",
      entityId: gig.id,
      action: "UPDATE",
      changes: {
        before: oldGig,
        after: gig,
      },
    })

    return NextResponse.json(gig)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update gig" },
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
    const gigId = parseInt(id)

    const oldGig = await prisma.gig.findUnique({
      where: { id: gigId },
    })

    if (!oldGig) {
      return NextResponse.json({ error: "Gig not found" }, { status: 404 })
    }

    await prisma.gig.delete({
      where: { id: gigId },
    })

    await createAuditLog({
      userId: parseInt(session.user.id),
      entityType: "Gig",
      entityId: gigId,
      action: "DELETE",
      changes: {
        before: oldGig,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete gig" },
      { status: 500 }
    )
  }
}
