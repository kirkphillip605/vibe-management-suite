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

    const gigs = await prisma.gig.findMany({
      include: {
        customer: true,
        venue: true,
        djProfile: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { eventDate: "desc" },
    })

    return NextResponse.json(gigs)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch gigs" },
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
    const { rate, deposit, balance, ...rest } = body

    const gig = await prisma.gig.create({
      data: {
        ...rest,
        rate: rate ? parseFloat(rate) : null,
        deposit: deposit ? parseFloat(deposit) : null,
        balance: balance ? parseFloat(balance) : null,
        createdById: parseInt(session.user.id),
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
      action: "CREATE",
      changes: {
        after: gig,
      },
    })

    return NextResponse.json(gig, { status: 201 })
  } catch (error) {
    console.error("Failed to create gig:", error)
    return NextResponse.json(
      { error: "Failed to create gig" },
      { status: 500 }
    )
  }
}
