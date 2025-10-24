import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "dj") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = parseInt(session.user.id)
    
    // Get DJ profile to find djProfileId
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { djProfile: true },
    })

    if (!user?.djProfile) {
      return NextResponse.json({ error: "DJ profile not found" }, { status: 404 })
    }

    // Get all gigs assigned to this DJ
    const gigs = await prisma.gig.findMany({
      where: {
        djProfileId: user.djProfile.id,
      },
      include: {
        customer: true,
        venue: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        eventDate: "desc",
      },
    })

    return NextResponse.json(gigs)
  } catch (error) {
    console.error("Failed to fetch DJ gigs:", error)
    return NextResponse.json(
      { error: "Failed to fetch gigs" },
      { status: 500 }
    )
  }
}
