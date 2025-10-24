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
    const customerId = parseInt(id)
    const body = await request.json()

    // Get old data for audit log
    const oldCustomer = await prisma.customer.findUnique({
      where: { id: customerId },
    })

    if (!oldCustomer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    const customer = await prisma.customer.update({
      where: { id: customerId },
      data: body,
    })

    // Create audit log
    await createAuditLog({
      userId: parseInt(session.user.id),
      entityType: "Customer",
      entityId: customer.id,
      action: "UPDATE",
      changes: {
        before: oldCustomer,
        after: customer,
      },
    })

    return NextResponse.json(customer)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update customer" },
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
    const customerId = parseInt(id)

    // Get old data for audit log
    const oldCustomer = await prisma.customer.findUnique({
      where: { id: customerId },
    })

    if (!oldCustomer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    await prisma.customer.delete({
      where: { id: customerId },
    })

    // Create audit log
    await createAuditLog({
      userId: parseInt(session.user.id),
      entityType: "Customer",
      entityId: customerId,
      action: "DELETE",
      changes: {
        before: oldCustomer,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete customer" },
      { status: 500 }
    )
  }
}
