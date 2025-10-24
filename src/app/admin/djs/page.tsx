"use client"

import { useEffect, useState } from "react"
import { Plus, LayoutGrid, Table as TableIcon, Pencil, Trash2, History, FileText, Upload } from "lucide-react"
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
import { DjFormDialog } from "@/components/dj-form-dialog"
import { AuditLogDialog } from "@/components/audit-log-dialog"
import { toast } from "sonner"

export default function DjProfilesPage() {
  const [djProfiles, setDjProfiles] = useState<any[]>([])
  const [filteredProfiles, setFilteredProfiles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"table" | "card">("table")
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [auditDialogOpen, setAuditDialogOpen] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<any>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [profileToDelete, setProfileToDelete] = useState<any>(null)
  const [auditLogsMap, setAuditLogsMap] = useState<Record<number, boolean>>({})

  useEffect(() => {
    fetchDjProfiles()
  }, [])

  useEffect(() => {
    const filtered = djProfiles.filter(
      (profile) =>
        profile.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.user?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.stageName?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredProfiles(filtered)
  }, [searchQuery, djProfiles])

  const fetchDjProfiles = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/dj-profiles")
      if (response.ok) {
        const data = await response.json()
        setDjProfiles(data)
        setFilteredProfiles(data)
        
        data.forEach((profile: any) => {
          checkAuditLogs(profile.id)
        })
      }
    } catch (error) {
      toast.error("Failed to fetch DJ profiles")
    } finally {
      setIsLoading(false)
    }
  }

  const checkAuditLogs = async (profileId: number) => {
    try {
      const response = await fetch(`/api/dj-profiles/${profileId}/audit-logs`)
      if (response.ok) {
        const logs = await response.json()
        setAuditLogsMap((prev) => ({ ...prev, [profileId]: logs.length > 0 }))
      }
    } catch (error) {
      console.error("Failed to check audit logs:", error)
    }
  }

  const handleDelete = async () => {
    if (!profileToDelete) return

    try {
      const response = await fetch(`/api/dj-profiles/${profileToDelete.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("DJ profile deleted successfully")
        fetchDjProfiles()
      } else {
        toast.error("Failed to delete DJ profile")
      }
    } catch (error) {
      toast.error("Failed to delete DJ profile")
    } finally {
      setDeleteDialogOpen(false)
      setProfileToDelete(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading DJ profiles...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">DJ Profiles</h1>
          <p className="text-muted-foreground">
            Manage DJ users and their profiles
          </p>
        </div>
        <Button onClick={() => { setSelectedProfile(null); setFormDialogOpen(true) }}>
          <Plus className="h-4 w-4 mr-2" />
          Add DJ
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder="Search DJs..."
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
                <TableHead>Name / Stage Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Hourly Rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProfiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No DJ profiles found
                  </TableCell>
                </TableRow>
              ) : (
                filteredProfiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div>
                          <div>{profile.user?.name}</div>
                          {profile.stageName && (
                            <div className="text-sm text-muted-foreground">
                              {profile.stageName}
                            </div>
                          )}
                        </div>
                        {auditLogsMap[profile.id] && (
                          <Badge variant="secondary" className="text-xs">
                            Has Changes
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{profile.user?.email}</TableCell>
                    <TableCell>{profile.phone || "-"}</TableCell>
                    <TableCell>
                      {profile.hourlyRate
                        ? `$${parseFloat(profile.hourlyRate).toFixed(2)}/hr`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={profile.isActive ? "default" : "secondary"}
                      >
                        {profile.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {auditLogsMap[profile.id] && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => { setSelectedProfile(profile); setAuditDialogOpen(true) }}
                          >
                            <History className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => { setSelectedProfile(profile); setFormDialogOpen(true) }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => { setProfileToDelete(profile); setDeleteDialogOpen(true) }}
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
          {filteredProfiles.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No DJ profiles found
            </div>
          ) : (
            filteredProfiles.map((profile) => (
              <Card key={profile.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {profile.user?.name}
                        {auditLogsMap[profile.id] && (
                          <Badge variant="secondary" className="text-xs">
                            Changes
                          </Badge>
                        )}
                      </CardTitle>
                      {profile.stageName && (
                        <CardDescription>{profile.stageName}</CardDescription>
                      )}
                    </div>
                    <Badge
                      variant={profile.isActive ? "default" : "secondary"}
                    >
                      {profile.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Email:</span>{" "}
                      {profile.user?.email}
                    </div>
                    {profile.phone && (
                      <div>
                        <span className="text-muted-foreground">Phone:</span>{" "}
                        {profile.phone}
                      </div>
                    )}
                    {profile.hourlyRate && (
                      <div>
                        <span className="text-muted-foreground">Rate:</span> $
                        {parseFloat(profile.hourlyRate).toFixed(2)}/hr
                      </div>
                    )}
                    {profile.genres && profile.genres.length > 0 && (
                      <div>
                        <span className="text-muted-foreground">Genres:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {profile.genres.slice(0, 3).map((genre: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {genre}
                            </Badge>
                          ))}
                          {profile.genres.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{profile.genres.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    {profile.bio && (
                      <div>
                        <span className="text-muted-foreground">Bio:</span>
                        <p className="text-xs mt-1 line-clamp-2">
                          {profile.bio}
                        </p>
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      {profile.w9Uploaded && (
                        <Badge variant="outline" className="text-xs">
                          <FileText className="h-3 w-3 mr-1" />
                          W9
                        </Badge>
                      )}
                      {profile.contractSigned && (
                        <Badge variant="outline" className="text-xs">
                          <FileText className="h-3 w-3 mr-1" />
                          Contract
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {auditLogsMap[profile.id] && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setSelectedProfile(profile); setAuditDialogOpen(true) }}
                        className="flex-1"
                      >
                        <History className="h-4 w-4 mr-2" />
                        History
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setSelectedProfile(profile); setFormDialogOpen(true) }}
                      className="flex-1"
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setProfileToDelete(profile); setDeleteDialogOpen(true) }}
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

      <DjFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        djProfile={selectedProfile}
        onSuccess={fetchDjProfiles}
      />

      {selectedProfile && (
        <AuditLogDialog
          open={auditDialogOpen}
          onOpenChange={setAuditDialogOpen}
          entityType="DjProfile"
          entityId={selectedProfile.id}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the DJ profile for &quot;{profileToDelete?.user?.name}&quot;
              and their user account. This action cannot be undone.
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
