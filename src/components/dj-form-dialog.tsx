"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

const djSchema = z.object({
  // User fields
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  name: z.string().min(1, "Name is required"),
  // DJ Profile fields
  stageName: z.string().optional(),
  bio: z.string().optional(),
  phone: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  genres: z.string().optional(),
  equipment: z.string().optional(),
  hourlyRate: z.string().optional(),
})

type DjFormData = z.infer<typeof djSchema>

interface DjFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  djProfile?: any
  onSuccess: () => void
}

export function DjFormDialog({
  open,
  onOpenChange,
  djProfile,
  onSuccess,
}: DjFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEdit = !!djProfile

  const form = useForm<DjFormData>({
    resolver: zodResolver(djSchema),
    defaultValues: {
      email: djProfile?.user?.email || "",
      password: "",
      name: djProfile?.user?.name || "",
      stageName: djProfile?.stageName || "",
      bio: djProfile?.bio || "",
      phone: djProfile?.phone || "",
      emergencyContact: djProfile?.emergencyContact || "",
      emergencyPhone: djProfile?.emergencyPhone || "",
      genres: djProfile?.genres?.join(", ") || "",
      equipment: djProfile?.equipment?.join(", ") || "",
      hourlyRate: djProfile?.hourlyRate?.toString() || "",
    },
  })

  const onSubmit = async (data: DjFormData) => {
    setIsSubmitting(true)
    try {
      const payload = {
        ...data,
        genres: data.genres ? data.genres.split(",").map(g => g.trim()).filter(Boolean) : [],
        equipment: data.equipment ? data.equipment.split(",").map(e => e.trim()).filter(Boolean) : [],
      }

      const url = isEdit 
        ? `/api/dj-profiles/${djProfile.id}`
        : "/api/dj-users"
      const method = isEdit ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error("Failed to save DJ")

      toast.success(
        isEdit ? "DJ updated successfully" : "DJ created successfully"
      )
      onSuccess()
      onOpenChange(false)
      form.reset()
    } catch (error) {
      toast.error("Failed to save DJ")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit DJ Profile" : "Create DJ User"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update DJ profile information"
              : "Add a new DJ user and profile"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">User Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="dj@example.com"
                          disabled={isEdit}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {!isEdit && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password *</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Minimum 6 characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">DJ Profile</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="stageName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stage Name</FormLabel>
                      <FormControl>
                        <Input placeholder="DJ Cool" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="555-1234" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Professional DJ with 10+ years of experience..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="emergencyContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Contact</FormLabel>
                      <FormControl>
                        <Input placeholder="Jane Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emergencyPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="555-5678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="genres"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Genres</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="House, Hip Hop, Top 40 (comma separated)"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter genres separated by commas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="equipment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Equipment</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Pioneer DDJ-1000, JBL Speakers (comma separated)"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter equipment separated by commas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hourlyRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hourly Rate ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="150.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : isEdit ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
