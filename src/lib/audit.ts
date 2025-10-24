import { prisma } from './prisma'

type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE'

interface AuditLogData {
  userId: number
  entityType: string
  entityId: number
  action: AuditAction
  changes?: {
    before?: Record<string, any>
    after?: Record<string, any>
  }
}

export async function createAuditLog({
  userId,
  entityType,
  entityId,
  action,
  changes,
}: AuditLogData) {
  return await prisma.auditLog.create({
    data: {
      userId,
      entityType,
      entityId,
      action,
      changes: changes || {},
    },
  })
}

export async function getEntityAuditLogs(
  entityType: string,
  entityId: number
) {
  return await prisma.auditLog.findMany({
    where: {
      entityType,
      entityId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      timestamp: 'desc',
    },
  })
}

export async function hasAuditLogs(
  entityType: string,
  entityId: number
): Promise<boolean> {
  const count = await prisma.auditLog.count({
    where: {
      entityType,
      entityId,
    },
  })
  return count > 0
}
