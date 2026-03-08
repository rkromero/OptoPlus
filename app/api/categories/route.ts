import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

        const categories = await prisma.category.findMany({
            orderBy: { name: "asc" },
            include: { _count: { select: { products: true } } },
        })

        return NextResponse.json(categories)
    } catch {
        return NextResponse.json({ error: "Error interno" }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

        const role = (session.user as any)?.role
        if (role !== "ADMIN") {
            return NextResponse.json({ error: "Solo administradores" }, { status: 403 })
        }

        const { name } = await req.json()
        if (!name?.trim()) {
            return NextResponse.json({ error: "Nombre requerido" }, { status: 400 })
        }

        const category = await prisma.category.create({ data: { name: name.trim() } })
        return NextResponse.json(category, { status: 201 })
    } catch {
        return NextResponse.json({ error: "Error interno" }, { status: 500 })
    }
}

