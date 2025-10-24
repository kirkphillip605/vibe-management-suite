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
import { VenueFormDialog } from "@/components/venue-form-dialog"
import { AuditLogDialog } from "@/components/audit-log-dialog"
import { toast } from "sonner"

export default function VenuesPage() {
  const [venues, setVenues] = useState<any[]>([])
  const [filteredVenues, setFilteredVenues] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"table" | "card">("table")
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [auditDialogOpen, setAuditDialogOpen] = useState(false)
  const [selectedVenue, setSelectedVenue] = useState<any>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [venueToDelete, setVenueToDelete] = useState<any>(null)
  const [auditLogsMap, setAuditLogsMap] = useState<Record<number, boolean>>({})

  useEffect(() => {
    fetchVenues()
  }, [])

  useEffect(() => {
    const filtered = venues.filter(
      (venue) =>
        venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.venueType?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredVenues(filtered)
  }, [searchQuery, venues])

  const fetchVenues = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/venues")
      if (response.ok) {
        const data = await response.json()
        setVenues(data)
        setFilteredVenues(data)
        
        data.forEach((venue: any) => {
          checkAuditLogs(venue.id)
        })
      }
    } catch (error) {
      toast.error("Failed to fetch venues")
    } finally {
      setIsLoading(false)
    }
  }

  const checkAuditLogs = async (venueId: number) => {
    try {
      const response = await fetch(`/api/venues/${venueId}/audit-logs`)
      if (response.ok) {
        const logs = await response.json()
        setAuditLogsMap((prev) => ({ ...prev, [venueId]: logs.length > 0 }))
      }
    } catch (error) {
      console.error("Failed to check audit logs:", error)
    }
  }

  const handleDelete = async () => {
    if (!venueToDelete) return

    try {
      const response = await fetch(`/api/venues/${venueToDelete.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Venue deleted successfully")
        fetchVenues()
      } else {
        toast.error("Failed to delete venue")
      }
    } catch (error) {
      toast.error("Failed to delete venue")
    } finally {
      setDeleteDialogOpen(false)
      setVenueToDelete(null)
    }
  }

  const formatVenueType = (type: string) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading venues...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Venues</h1>
          <p className="text-muted-foreground">Manage your venue locations</p>
        </div>
        <Button onClick={() => { setSelectedVenue(null); setFormDialogOpen(true) }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Venue
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder="Search venues..."
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
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVenues.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No venues found
                  </TableCell>
                </TableRow>
              ) : (
                filteredVenues.map((venue) => (
                  <TableRow key={venue.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {venue.name}
                        {auditLogsMap[venue.id] && (
                          <Badge variant="secondary" className="text-xs">
                            Has Changes
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{formatVenueType(venue.venueType)}</TableCell>
                    <TableCell>
                      {venue.city && venue.state
                        ? `${venue.city}, ${venue.state}`
                        : venue.city || venue.state || "-"}
                    </TableCell>
                    <TableCell>{venue.capacity || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {auditLogsMap[venue.id] && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => { setSelectedVenue(venue); setAuditDialogOpen(true) }}
                          >
                            <History className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => { setSelectedVenue(venue); setFormDialogOpen(true) }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => { setVenueToDelete(venue); setDeleteDialogOpen(true) }}
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
          {filteredVenues.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No venues found
            </div>
          ) : (
            filteredVenues.map((venue) => (
              <Card key={venue.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {venue.name}
                        {auditLogsMap[venue.id] && (
                          <Badge variant="secondary" className="text-xs">
                            Changes
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {formatVenueType(venue.venueType)}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    {venue.address && (
                      <div>
                        <span className="text-muted-foreground">Address:</span>{" "}
                        {venue.address}
                      </div>
                    )}
                    {(venue.city || venue.state) && (
                      <div>
                        <span className="text-muted-foreground">Location:</span>{" "}
                        {venue.city && venue.state
                          ? `${venue.city}, ${venue.state}`
                          : venue.city || venue.state}
                      </div>
                    )}
                    {venue.capacity && (
                      <div>
                        <span className="text-muted-foreground">Capacity:</span>{" "}
                        {venue.capacity}
                      </div>
                    )}
                    {venue.phone && (
                      <div>
                        <span className="text-muted-foreground">Phone:</span>{" "}
                        {venue.phone}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {auditLogsMap[venue.id] && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setSelectedVenue(venue); setAuditDialogOpen(true) }}
                        className="flex-1"
                      >
                        <History className="h-4 w-4 mr-2" />
                        History
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setSelectedVenue(venue); setFormDialogOpen(true) }}
                      className="flex-1"
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setVenueToDelete(venue); setDeleteDialogOpen(true) }}
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

      <VenueFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        venue={selectedVenue}
        onSuccess={fetchVenues}
      />

      {selectedVenue && (
        <AuditLogDialog
          open={auditDialogOpen}
          onOpenChange={setAuditDialogOpen}
          entityType="Venue"
          entityId={selectedVenue.id}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the venue &quot;{venueToDelete?.name}&quot;
              and all associated data. This action cannot be undone.
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
