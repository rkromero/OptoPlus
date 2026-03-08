import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

        const role = (session.user as any)?.role
        if (role !== "ADMIN") return NextResponse.json({ error: "Solo administradores" }, { status: 403 })

        const { name } = await req.json()
        if (!name?.trim()) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 })

        const category = await prisma.category.update({
            where: { id: params.id },
            data: { name: name.trim() },
        })
        return NextResponse.json(category)
    } catch {
        return NextResponse.json({ error: "Error interno" }, { status: 500 })
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

        const role = (session.user as any)?.role
        if (role !== "ADMIN") return NextResponse.json({ error: "Solo administradores" }, { status: 403 })

        await prisma.category.delete({ where: { id: params.id } })
        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json({ error: "Error interno" }, { status: 500 })
    }
}
