import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/password"
import { createAuditLog } from "@/lib/audit"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { 
      email, 
      password, 
      name, 
      stageName, 
      bio, 
      phone, 
      emergencyContact, 
      emergencyPhone,
      genres,
      equipment,
      hourlyRate 
    } = body

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user with DJ profile
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "dj",
        djProfile: {
          create: {
            stageName: stageName || null,
            bio: bio || null,
            phone: phone || null,
            emergencyContact: emergencyContact || null,
            emergencyPhone: emergencyPhone || null,
            genres: genres || [],
            equipment: equipment || [],
            hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
            isActive: true,
          },
        },
      },
      include: {
        djProfile: true,
      },
    })

    await createAuditLog({
      userId: parseInt(session.user.id),
      entityType: "DjProfile",
      entityId: user.djProfile!.id,
      action: "CREATE",
      changes: {
        after: user.djProfile,
      },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error("Failed to create DJ user:", error)
    return NextResponse.json(
      { error: "Failed to create DJ user" },
      { status: 500 }
    )
  }
}
