"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus } from "lucide-react"
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
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { CustomerFormDialog } from "@/components/customer-form-dialog"
import { VenueFormDialog } from "@/components/venue-form-dialog"
import { toast } from "sonner"

const gigSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  venueId: z.string().min(1, "Venue is required"),
  djProfileId: z.string().optional(),
  eventDate: z.string().min(1, "Event date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  status: z.string().min(1, "Status is required"),
  eventType: z.string().optional(),
  rate: z.string().optional(),
  deposit: z.string().optional(),
  balance: z.string().optional(),
  notes: z.string().optional(),
  requirements: z.string().optional(),
})

type GigFormData = z.infer<typeof gigSchema>

interface GigFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  gig?: any
  onSuccess: () => void
}

export function GigFormDialog({
  open,
  onOpenChange,
  gig,
  onSuccess,
}: GigFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customers, setCustomers] = useState<any[]>([])
  const [venues, setVenues] = useState<any[]>([])
  const [djProfiles, setDjProfiles] = useState<any[]>([])
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false)
  const [venueDialogOpen, setVenueDialogOpen] = useState(false)
  const isEdit = !!gig

  const form = useForm<GigFormData>({
    resolver: zodResolver(gigSchema),
    defaultValues: {
      customerId: gig?.customerId?.toString() || "",
      venueId: gig?.venueId?.toString() || "",
      djProfileId: gig?.djProfileId?.toString() || "",
      eventDate: gig?.eventDate ? gig.eventDate.split("T")[0] : "",
      startTime: gig?.startTime || "",
      endTime: gig?.endTime || "",
      status: gig?.status || "scheduled",
      eventType: gig?.eventType || "",
      rate: gig?.rate?.toString() || "",
      deposit: gig?.deposit?.toString() || "",
      balance: gig?.balance?.toString() || "",
      notes: gig?.notes || "",
      requirements: gig?.requirements || "",
    },
  })

  useEffect(() => {
    if (open) {
      fetchCustomers()
      fetchVenues()
      fetchDjProfiles()
    }
  }, [open])

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/customers")
      if (response.ok) {
        const data = await response.json()
        setCustomers(data)
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error)
    }
  }

  const fetchVenues = async () => {
    try {
      const response = await fetch("/api/venues")
      if (response.ok) {
        const data = await response.json()
        setVenues(data)
      }
    } catch (error) {
      console.error("Failed to fetch venues:", error)
    }
  }

  const fetchDjProfiles = async () => {
    try {
      const response = await fetch("/api/dj-profiles")
      if (response.ok) {
        const data = await response.json()
        setDjProfiles(data)
      }
    } catch (error) {
      console.error("Failed to fetch DJ profiles:", error)
    }
  }

  const onSubmit = async (data: GigFormData) => {
    setIsSubmitting(true)
    try {
      const payload = {
        customerId: parseInt(data.customerId),
        venueId: parseInt(data.venueId),
        djProfileId: data.djProfileId ? parseInt(data.djProfileId) : null,
        eventDate: new Date(data.eventDate).toISOString(),
        startTime: data.startTime,
        endTime: data.endTime,
        status: data.status,
        eventType: data.eventType || null,
        rate: data.rate || null,
        deposit: data.deposit || null,
        balance: data.balance || null,
        notes: data.notes || null,
        requirements: data.requirements || null,
      }

      const url = isEdit ? `/api/gigs/${gig.id}` : "/api/gigs"
      const method = isEdit ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error("Failed to save gig")

      toast.success(
        isEdit ? "Gig updated successfully" : "Gig created successfully"
      )
      onSuccess()
      onOpenChange(false)
      form.reset()
    } catch (error) {
      toast.error("Failed to save gig")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Gig" : "Create Gig"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Update gig information"
                : "Add a new gig to your schedule"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer *</FormLabel>
                      <div className="flex gap-2">
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Select customer" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {customers.map((customer) => (
                              <SelectItem
                                key={customer.id}
                                value={customer.id.toString()}
                              >
                                {customer.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setCustomerDialogOpen(true)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="venueId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Venue *</FormLabel>
                      <div className="flex gap-2">
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Select venue" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {venues.map((venue) => (
                              <SelectItem
                                key={venue.id}
                                value={venue.id.toString()}
                              >
                                {venue.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setVenueDialogOpen(true)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="djProfileId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assigned DJ</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select DJ (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {djProfiles.map((profile) => (
                            <SelectItem
                              key={profile.id}
                              value={profile.id.toString()}
                            >
                              {profile.stageName || profile.user.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="eventDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time *</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time *</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="eventType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Type</FormLabel>
                    <FormControl>
                      <Input placeholder="Wedding, Birthday, Corporate..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rate ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="500.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deposit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deposit ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="100.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="balance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Balance ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="400.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="requirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Requirements</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Equipment, setup requirements..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional notes..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

      <CustomerFormDialog
        open={customerDialogOpen}
        onOpenChange={setCustomerDialogOpen}
        customer={null}
        onSuccess={() => {
          fetchCustomers()
          setCustomerDialogOpen(false)
        }}
      />

      <VenueFormDialog
        open={venueDialogOpen}
        onOpenChange={setVenueDialogOpen}
        venue={null}
        onSuccess={() => {
          fetchVenues()
          setVenueDialogOpen(false)
        }}
      />
    </>
  )
}
