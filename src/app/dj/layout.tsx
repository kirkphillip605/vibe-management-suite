"use client"

import { User, Calendar, LogOut } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useEffect, useState } from "react"
import Image from "next/image"

const navigation = [
  { name: "My Profile", href: "/dj/profile", icon: User },
  { name: "My Gigs", href: "/dj/gigs", icon: Calendar },
]

export default function DjLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [userName, setUserName] = useState<string>("")
  const [userEmail, setUserEmail] = useState<string>("")

  useEffect(() => {
    // Fetch user info
    fetch("/api/dj/profile")
      .then((res) => res.json())
      .then((data) => {
        setUserName(data.name || "DJ")
        setUserEmail(data.email || "")
      })
      .catch(() => {
        setUserName("DJ")
      })
  }, [])

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" })
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/vibe_logo-1761330536515.png?width=200&height=200&resize=contain"
                alt="Vibe Logo"
                width={40}
                height={40}
                className="rounded"
              />
              <div>
                <h1 className="text-xl font-bold">Vibe DJ Portal</h1>
                <p className="text-xs text-muted-foreground">Your DJ Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback>
                    {userName?.charAt(0).toUpperCase() || "D"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="text-xs text-muted-foreground">{userEmail}</p>
                </div>
              </div>
              <Separator orientation="vertical" className="h-8" />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4">
        <nav className="flex gap-2 py-4 border-b">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className="gap-2"
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Button>
              </Link>
            )
          })}
        </nav>

        <main className="py-6">{children}</main>
      </div>
    </div>
  )
}