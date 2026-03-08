import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    function middleware(req) {
        const { nextUrl, nextauth } = req
        const isAdminRoute = nextUrl.pathname.startsWith("/configuracion")
        const role = nextauth?.token?.role

        // Block VENDEDOR from admin routes
        if (isAdminRoute && role !== "ADMIN") {
            return NextResponse.redirect(new URL("/dashboard", nextUrl))
        }

        return NextResponse.next()
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
        pages: {
            signIn: "/login",
        },
    }
)

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|login).*)",
    ],
}
