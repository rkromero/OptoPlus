import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import Sidebar from "@/components/layout/Sidebar"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/login")
    }

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
                <div className="p-6 md:p-8 min-h-full">{children}</div>
            </main>
        </div>
    )
}
