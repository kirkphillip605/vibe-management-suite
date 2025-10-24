import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { createAuditLog } from "@/lib/audit"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "dj") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = parseInt(session.user.id)
    const formData = await request.formData()
    const file = formData.get("file") as File
    const documentType = formData.get("type") as string // "w9" or "contract"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!documentType || !["w9", "contract"].includes(documentType)) {
      return NextResponse.json({ error: "Invalid document type" }, { status: 400 })
    }

    // Get DJ profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { djProfile: true },
    })

    if (!user?.djProfile) {
      return NextResponse.json({ error: "DJ profile not found" }, { status: 404 })
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads", "documents")
    await mkdir(uploadsDir, { recursive: true })

    // Generate unique filename
    const timestamp = Date.now()
    const filename = `${documentType}-${userId}-${timestamp}-${file.name}`
    const filepath = join(uploadsDir, filename)

    // Write file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Store relative path in database
    const relativePath = `/uploads/documents/${filename}`

    // Update DJ profile based on document type
    const oldProfile = { ...user.djProfile }
    const updateData = documentType === "w9"
      ? { w9Uploaded: true, w9FilePath: relativePath }
      : { contractSigned: true, contractPath: relativePath }

    const updatedProfile = await prisma.djProfile.update({
      where: { userId },
      data: updateData,
    })

    await createAuditLog({
      userId,
      entityType: "DjProfile",
      entityId: user.djProfile.id,
      action: "UPDATE",
      changes: {
        before: oldProfile,
        after: updatedProfile,
      },
    })

    return NextResponse.json({
      success: true,
      path: relativePath,
      type: documentType,
    })
  } catch (error) {
    console.error("Failed to upload document:", error)
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 }
    )
  }
}
