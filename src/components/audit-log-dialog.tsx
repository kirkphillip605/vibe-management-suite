"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

interface AuditLog {
  id: number
  action: string
  timestamp: string
  changes: {
    before?: Record<string, any>
    after?: Record<string, any>
  }
  user: {
    id: number
    name: string
    email: string
  }
}

interface AuditLogDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entityType: string
  entityId: number
}

export function AuditLogDialog({
  open,
  onOpenChange,
  entityType,
  entityId,
}: AuditLogDialogProps) {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open) {
      fetchLogs()
    }
  }, [open, entityType, entityId])

  const fetchLogs = async () => {
    setIsLoading(true)
    try {
      const url = `/api/${entityType.toLowerCase()}s/${entityId}/audit-logs`
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setLogs(data)
      }
    } catch (error) {
      console.error("Failed to fetch audit logs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case "CREATE":
        return "bg-green-500"
      case "UPDATE":
        return "bg-blue-500"
      case "DELETE":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const renderChanges = (log: AuditLog) => {
    if (!log.changes) return null

    const { before, after } = log.changes

    if (log.action === "CREATE") {
      return (
        <div className="mt-2 text-sm">
          <p className="font-medium text-green-600">Created with:</p>
          <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto">
            {JSON.stringify(after, null, 2)}
          </pre>
        </div>
      )
    }

    if (log.action === "DELETE") {
      return (
        <div className="mt-2 text-sm">
          <p className="font-medium text-red-600">Deleted data:</p>
          <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto">
            {JSON.stringify(before, null, 2)}
          </pre>
        </div>
      )
    }

    if (log.action === "UPDATE" && before && after) {
      const changedFields = Object.keys(after).filter(
        (key) => JSON.stringify(before[key]) !== JSON.stringify(after[key])
      )

      return (
        <div className="mt-2 text-sm space-y-2">
          {changedFields.map((field) => (
            <div key={field} className="p-2 bg-muted rounded">
              <p className="font-medium">{field}:</p>
              <div className="mt-1 space-y-1">
                <p className="text-red-600">
                  - {JSON.stringify(before[field])}
                </p>
                <p className="text-green-600">
                  + {JSON.stringify(after[field])}
                </p>
              </div>
            </div>
          ))}
        </div>
      )
    }

    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Audit Log History</DialogTitle>
          <DialogDescription>
            View all changes made to this {entityType.toLowerCase()}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading...
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No audit logs found
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <Badge className={getActionColor(log.action)}>
                      {log.action}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(log.timestamp), "PPpp")}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">{log.user.name}</span>
                    <span className="text-muted-foreground">
                      {" "}
                      ({log.user.email})
                    </span>
                  </div>
                  {renderChanges(log)}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
