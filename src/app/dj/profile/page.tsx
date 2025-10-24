import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function DjProfilePage() {
  const session = await auth()
  
  const user = await prisma.user.findUnique({
    where: { id: parseInt(session!.user.id) },
    include: {
      djProfile: true,
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">View and manage your DJ profile</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Your personal and professional details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium">Name</p>
            <p className="text-lg">{user?.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Email</p>
            <p className="text-lg">{user?.email}</p>
          </div>
          {user?.djProfile && (
            <>
              <div>
                <p className="text-sm font-medium">Stage Name</p>
                <p className="text-lg">{user.djProfile.stageName || "Not set"}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Bio</p>
                <p className="text-lg">{user.djProfile.bio || "Not set"}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Hourly Rate</p>
                <p className="text-lg">${user.djProfile.hourlyRate?.toString() || "Not set"}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
