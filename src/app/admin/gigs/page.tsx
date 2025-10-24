"use client"

import { useEffect, useState } from "react"
import { Plus, LayoutGrid, Table as TableIcon, Pencil, Trash2, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { GigFormDialog } from "@/components/gig-form-dialog"
import { AuditLogDialog } from "@/components/audit-log-dialog"
import { toast } from "sonner"
import { format } from "date-fns"

export default function GigsPage() {
  const [gigs, setGigs] = useState<any[]>([])
  const [filteredGigs, setFilteredGigs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"table" | "card">("table")
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [auditDialogOpen, setAuditDialogOpen] = useState(false)
  const [selectedGig, setSelectedGig] = useState<any>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [gigToDelete, setGigToDelete] = useState<any>(null)
  const [auditLogsMap, setAuditLogsMap] = useState<Record<number, boolean>>({})

  useEffect(() => {
    fetchGigs()
  }, [])

  useEffect(() => {
    const filtered = gigs.filter(
      (gig) =>
        gig.customer?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gig.venue?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gig.eventType?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredGigs(filtered)
  }, [searchQuery, gigs])

  const fetchGigs = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/gigs")
      if (response.ok) {
        const data = await response.json()
        setGigs(data)
        setFilteredGigs(data)
        
        data.forEach((gig: any) => {
          checkAuditLogs(gig.id)
        })
      }
    } catch (error) {
      toast.error("Failed to fetch gigs")
    } finally {
      setIsLoading(false)
    }
  }

  const checkAuditLogs = async (gigId: number) => {
    try {
      const response = await fetch(`/api/gigs/${gigId}/audit-logs`)
      if (response.ok) {
        const logs = await response.json()
        setAuditLogsMap((prev) => ({ ...prev, [gigId]: logs.length > 0 }))
      }
    } catch (error) {
      console.error("Failed to check audit logs:", error)
    }
  }

  const handleDelete = async () => {
    if (!gigToDelete) return

    try {
      const response = await fetch(`/api/gigs/${gigToDelete.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Gig deleted successfully")
        fetchGigs()
      } else {
        toast.error("Failed to delete gig")
      }
    } catch (error) {
      toast.error("Failed to delete gig")
    } finally {
      setDeleteDialogOpen(false)
      setGigToDelete(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-500"
      case "confirmed":
        return "bg-green-500"
      case "completed":
        return "bg-gray-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading gigs...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gigs</h1>
          <p className="text-muted-foreground">Manage your event bookings</p>
        </div>
        <Button onClick={() => { setSelectedGig(null); setFormDialogOpen(true) }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Gig
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder="Search gigs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-2 ml-auto">
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("table")}
          >
            <TableIcon className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "card" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("card")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {viewMode === "table" ? (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>DJ</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGigs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No gigs found
                  </TableCell>
                </TableRow>
              ) : (
                filteredGigs.map((gig) => (
                  <TableRow key={gig.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {format(new Date(gig.eventDate), "MMM dd, yyyy")}
                        {auditLogsMap[gig.id] && (
                          <Badge variant="secondary" className="text-xs">
                            Has Changes
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{gig.customer?.name || "-"}</TableCell>
                    <TableCell>{gig.venue?.name || "-"}</TableCell>
                    <TableCell>
                      {gig.djProfile?.stageName || gig.djProfile?.user?.name || "Unassigned"}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(gig.status)}>
                        {gig.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {auditLogsMap[gig.id] && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => { setSelectedGig(gig); setAuditDialogOpen(true) }}
                          >
                            <History className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => { setSelectedGig(gig); setFormDialogOpen(true) }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => { setGigToDelete(gig); setDeleteDialogOpen(true) }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGigs.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No gigs found
            </div>
          ) : (
            filteredGigs.map((gig) => (
              <Card key={gig.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {format(new Date(gig.eventDate), "MMM dd, yyyy")}
                        {auditLogsMap[gig.id] && (
                          <Badge variant="secondary" className="text-xs">
                            Changes
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {gig.startTime} - {gig.endTime}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(gig.status)}>
                      {gig.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Customer:</span>{" "}
                      {gig.customer?.name}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Venue:</span>{" "}
                      {gig.venue?.name}
                    </div>
                    <div>
                      <span className="text-muted-foreground">DJ:</span>{" "}
                      {gig.djProfile?.stageName || gig.djProfile?.user?.name || "Unassigned"}
                    </div>
                    {gig.eventType && (
                      <div>
                        <span className="text-muted-foreground">Type:</span>{" "}
                        {gig.eventType}
                      </div>
                    )}
                    {gig.rate && (
                      <div>
                        <span className="text-muted-foreground">Rate:</span> $
                        {parseFloat(gig.rate).toFixed(2)}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {auditLogsMap[gig.id] && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setSelectedGig(gig); setAuditDialogOpen(true) }}
                        className="flex-1"
                      >
                        <History className="h-4 w-4 mr-2" />
                        History
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setSelectedGig(gig); setFormDialogOpen(true) }}
                      className="flex-1"
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setGigToDelete(gig); setDeleteDialogOpen(true) }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      <GigFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        gig={selectedGig}
        onSuccess={fetchGigs}
      />

      {selectedGig && (
        <AuditLogDialog
          open={auditDialogOpen}
          onOpenChange={setAuditDialogOpen}
          entityType="Gig"
          entityId={selectedGig.id}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this gig. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
