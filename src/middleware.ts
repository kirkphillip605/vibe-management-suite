import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth
  const userRole = req.auth?.user?.role

  // Public routes
  if (pathname === "/login") {
    if (isLoggedIn) {
      // Redirect based on role
      if (userRole === "admin") {
        return NextResponse.redirect(new URL("/admin/customers", req.url))
      } else {
        return NextResponse.redirect(new URL("/dj/profile", req.url))
      }
    }
    return NextResponse.next()
  }

  // Protected routes
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // Role-based access
  if (pathname.startsWith("/admin") && userRole !== "admin") {
    return NextResponse.redirect(new URL("/dj/profile", req.url))
  }

  if (pathname.startsWith("/dj") && userRole !== "dj") {
    return NextResponse.redirect(new URL("/admin/customers", req.url))
  }

  // Redirect root to appropriate dashboard
  if (pathname === "/") {
    if (userRole === "admin") {
      return NextResponse.redirect(new URL("/admin/customers", req.url))
    } else {
      return NextResponse.redirect(new URL("/dj/profile", req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
}
