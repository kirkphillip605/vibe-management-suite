import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { getEntityAuditLogs } from "@/lib/audit"

export async function GET(
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

    const auditLogs = await getEntityAuditLogs("Venue", venueId)

    return NextResponse.json(auditLogs)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch audit logs" },
      { status: 500 }
    )
  }
}
