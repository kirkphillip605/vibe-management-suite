"use client"

import { useEffect, useState } from "react"
import { Calendar, MapPin, User, Clock, DollarSign } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { format } from "date-fns"

interface Gig {
  id: number
  eventDate: string
  startTime: string
  endTime: string
  status: string
  eventType?: string
  rate?: number
  deposit?: number
  balance?: number
  notes?: string
  customer: {
    id: number
    name: string
    email?: string
    phone?: string
  }
  venue: {
    id: number
    name: string
    venueType: string
    address?: string
    city?: string
    state?: string
  }
}

export default function DjGigsPage() {
  const [gigs, setGigs] = useState<Gig[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchGigs()
  }, [])

  const fetchGigs = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/dj/gigs")
      if (response.ok) {
        const data = await response.json()
        setGigs(data)
      } else {
        toast.error("Failed to fetch gigs")
      }
    } catch (error) {
      toast.error("Failed to fetch gigs")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "confirmed":
        return "default"
      case "scheduled":
        return "secondary"
      case "completed":
        return "outline"
      case "cancelled":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "text-green-600"
      case "scheduled":
        return "text-blue-600"
      case "completed":
        return "text-gray-600"
      case "cancelled":
        return "text-red-600"
      default:
        return "text-gray-600"
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
      <div>
        <h1 className="text-3xl font-bold">My Gigs</h1>
        <p className="text-muted-foreground">
          View all gigs you&apos;ve been assigned to
        </p>
      </div>

      {gigs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No gigs yet</h3>
            <p className="text-muted-foreground text-center">
              You haven&apos;t been assigned to any gigs yet. Check back later!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {gigs.map((gig) => (
            <Card key={gig.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      {format(new Date(gig.eventDate), "MMMM dd, yyyy")}
                    </CardTitle>
                    <CardDescription>
                      {gig.eventType || "Event"}
                    </CardDescription>
                  </div>
                  <Badge variant={getStatusVariant(gig.status)}>
                    {gig.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Time</p>
                      <p className="text-sm text-muted-foreground">
                        {gig.startTime} - {gig.endTime}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Customer</p>
                      <p className="text-sm text-muted-foreground">
                        {gig.customer.name}
                      </p>
                      {gig.customer.phone && (
                        <p className="text-xs text-muted-foreground">
                          {gig.customer.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Venue</p>
                      <p className="text-sm text-muted-foreground">
                        {gig.venue.name}
                      </p>
                      {gig.venue.address && (
                        <p className="text-xs text-muted-foreground">
                          {gig.venue.address}
                          {gig.venue.city && `, ${gig.venue.city}`}
                          {gig.venue.state && `, ${gig.venue.state}`}
                        </p>
                      )}
                    </div>
                  </div>

                  {gig.rate && (
                    <div className="flex items-start gap-3">
                      <DollarSign className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Payment</p>
                        <p className="text-sm text-muted-foreground">
                          Rate: ${parseFloat(gig.rate.toString()).toFixed(2)}
                        </p>
                        {gig.deposit && (
                          <p className="text-xs text-muted-foreground">
                            Deposit: ${parseFloat(gig.deposit.toString()).toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {gig.notes && (
                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium mb-1">Notes</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {gig.notes}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
