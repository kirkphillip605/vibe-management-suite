"use client"

import { useEffect, useState } from "react"
import { User, Mail, Phone, Music, FileText, Upload, Save } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"

interface DjUser {
  id: number
  name: string
  email: string
  djProfile?: {
    id: number
    stageName?: string
    bio?: string
    phone?: string
    emergencyContact?: string
    emergencyPhone?: string
    genres: string[]
    equipment: string[]
    hourlyRate?: number
    w9Uploaded: boolean
    w9FilePath?: string
    contractSigned: boolean
    contractPath?: string
  }
}

export default function DjProfilePage() {
  const [user, setUser] = useState<DjUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState({
    stageName: "",
    bio: "",
    phone: "",
    emergencyContact: "",
    emergencyPhone: "",
    genres: "",
    equipment: "",
    hourlyRate: "",
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/dj/profile")
      if (response.ok) {
        const data = await response.json()
        setUser(data)
        if (data.djProfile) {
          setFormData({
            stageName: data.djProfile.stageName || "",
            bio: data.djProfile.bio || "",
            phone: data.djProfile.phone || "",
            emergencyContact: data.djProfile.emergencyContact || "",
            emergencyPhone: data.djProfile.emergencyPhone || "",
            genres: data.djProfile.genres?.join(", ") || "",
            equipment: data.djProfile.equipment?.join(", ") || "",
            hourlyRate: data.djProfile.hourlyRate?.toString() || "",
          })
        }
      } else {
        toast.error("Failed to fetch profile")
      }
    } catch (error) {
      toast.error("Failed to fetch profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/dj/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stageName: formData.stageName,
          bio: formData.bio,
          phone: formData.phone,
          emergencyContact: formData.emergencyContact,
          emergencyPhone: formData.emergencyPhone,
          genres: formData.genres
            .split(",")
            .map((g) => g.trim())
            .filter((g) => g),
          equipment: formData.equipment
            .split(",")
            .map((e) => e.trim())
            .filter((e) => e),
          hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : null,
        }),
      })

      if (response.ok) {
        toast.success("Profile updated successfully")
        setIsEditing(false)
        fetchProfile()
      } else {
        toast.error("Failed to update profile")
      }
    } catch (error) {
      toast.error("Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handleFileUpload = async (type: "w9" | "contract", file: File) => {
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", type)

      const response = await fetch("/api/dj/documents", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        toast.success(`${type === "w9" ? "W-9" : "Contract"} uploaded successfully`)
        fetchProfile()
      } else {
        toast.error("Failed to upload document")
      }
    } catch (error) {
      toast.error("Failed to upload document")
    } finally {
      setIsUploading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading profile...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Profile not found</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">Manage your DJ profile and information</p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => {
              setIsEditing(false)
              fetchProfile()
            }}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your basic profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={user.name} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={user.email} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stageName">Stage Name</Label>
                    <Input
                      id="stageName"
                      value={formData.stageName}
                      onChange={(e) => setFormData({ ...formData, stageName: e.target.value })}
                      placeholder="DJ Awesome"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Tell us about yourself and your DJ experience..."
                      rows={4}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Full Name</p>
                      <p className="font-medium">{user.name}</p>
                    </div>
                  </div>
                  {user.djProfile?.stageName && (
                    <div className="flex items-center gap-3">
                      <Music className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Stage Name</p>
                        <p className="font-medium">{user.djProfile.stageName}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{user.email}</p>
                    </div>
                  </div>
                  {user.djProfile?.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{user.djProfile.phone}</p>
                      </div>
                    </div>
                  )}
                  {user.djProfile?.bio && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Bio</p>
                      <p className="text-sm whitespace-pre-wrap">{user.djProfile.bio}</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Emergency Contact</CardTitle>
              <CardDescription>In case of emergency during events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
                    <Input
                      id="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
                    <Input
                      id="emergencyPhone"
                      value={formData.emergencyPhone}
                      onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                      placeholder="(555) 987-6543"
                    />
                  </div>
                </>
              ) : (
                <>
                  {user.djProfile?.emergencyContact ? (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium">{user.djProfile.emergencyContact}</p>
                      </div>
                      {user.djProfile.emergencyPhone && (
                        <div>
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <p className="font-medium">{user.djProfile.emergencyPhone}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">No emergency contact set</p>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Professional Details</CardTitle>
              <CardDescription>Your skills and rates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="genres">Music Genres</Label>
                    <Input
                      id="genres"
                      value={formData.genres}
                      onChange={(e) => setFormData({ ...formData, genres: e.target.value })}
                      placeholder="House, Techno, Hip Hop (comma separated)"
                    />
                    <p className="text-xs text-muted-foreground">Separate genres with commas</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="equipment">Equipment</Label>
                    <Input
                      id="equipment"
                      value={formData.equipment}
                      onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                      placeholder="Pioneer CDJ-2000, Mixer, Speakers (comma separated)"
                    />
                    <p className="text-xs text-muted-foreground">Separate equipment with commas</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      step="0.01"
                      value={formData.hourlyRate}
                      onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                      placeholder="150.00"
                    />
                  </div>
                </>
              ) : (
                <>
                  {user.djProfile?.genres && user.djProfile.genres.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Music Genres</p>
                      <div className="flex flex-wrap gap-2">
                        {user.djProfile.genres.map((genre, idx) => (
                          <Badge key={idx} variant="secondary">
                            {genre}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {user.djProfile?.equipment && user.djProfile.equipment.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Equipment</p>
                      <div className="flex flex-wrap gap-2">
                        {user.djProfile.equipment.map((item, idx) => (
                          <Badge key={idx} variant="outline">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {user.djProfile?.hourlyRate && (
                    <div>
                      <p className="text-sm text-muted-foreground">Hourly Rate</p>
                      <p className="text-2xl font-bold">
                        ${parseFloat(user.djProfile.hourlyRate.toString()).toFixed(2)}/hr
                      </p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>Upload required documents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>W-9 Form</Label>
                {user.djProfile?.w9Uploaded ? (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      Uploaded
                    </Badge>
                    {user.djProfile.w9FilePath && (
                      <a
                        href={user.djProfile.w9FilePath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        View
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileUpload("w9", file)
                      }}
                      disabled={isUploading}
                      className="cursor-pointer"
                    />
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Contract</Label>
                {user.djProfile?.contractSigned ? (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      Signed
                    </Badge>
                    {user.djProfile.contractPath && (
                      <a
                        href={user.djProfile.contractPath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        View
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileUpload("contract", file)
                      }}
                      disabled={isUploading}
                      className="cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {isUploading && (
                <div className="text-sm text-muted-foreground">
                  Uploading document...
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Profile Completeness</span>
                <span className="text-sm font-medium">
                  {(() => {
                    let completeness = 40 // Base for name and email
                    if (user.djProfile?.stageName) completeness += 10
                    if (user.djProfile?.bio) completeness += 10
                    if (user.djProfile?.phone) completeness += 10
                    if (user.djProfile?.genres?.length) completeness += 10
                    if (user.djProfile?.hourlyRate) completeness += 10
                    if (user.djProfile?.w9Uploaded) completeness += 5
                    if (user.djProfile?.contractSigned) completeness += 5
                    return `${completeness}%`
                  })()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Documents</span>
                <span className="text-sm font-medium">
                  {(user.djProfile?.w9Uploaded ? 1 : 0) + (user.djProfile?.contractSigned ? 1 : 0)} / 2
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}