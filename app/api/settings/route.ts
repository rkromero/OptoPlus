import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

        let settings = await prisma.companySettings.findFirst()
        if (!settings) {
            settings = await prisma.companySettings.create({
                data: { id: "default", name: "OptovisionPlus" },
            })
        }

        return NextResponse.json(settings)
    } catch {
        return NextResponse.json({ error: "Error interno" }, { status: 500 })
    }
}

export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

        const role = (session.user as any)?.role
        if (role !== "ADMIN") return NextResponse.json({ error: "Solo administradores" }, { status: 403 })

        const body = await req.json()
        const { name, address, phone, email, logoUrl } = body

        const settings = await prisma.companySettings.upsert({
            where: { id: "default" },
            update: { name, address, phone, email, logoUrl },
            create: { id: "default", name, address, phone, email, logoUrl },
        })

        return NextResponse.json(settings)
    } catch {
        return NextResponse.json({ error: "Error interno" }, { status: 500 })
    }
}

