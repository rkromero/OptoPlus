import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

        const order = await prisma.order.findUnique({
            where: { id: params.id },
            include: {
                client: true,
                items: { include: { product: { include: { category: true } } } },
            },
        })

        if (!order) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
        return NextResponse.json(order)
    } catch {
        return NextResponse.json({ error: "Error interno" }, { status: 500 })
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

        const body = await req.json()
        const { status, notes } = body

        const validStatuses = ["PENDIENTE", "EN_PROCESO", "ENVIADO", "ENTREGADO", "CANCELADO"]
        if (status && !validStatuses.includes(status)) {
            return NextResponse.json({ error: "Estado inválido" }, { status: 400 })
        }

        const order = await prisma.order.update({
            where: { id: params.id },
            data: {
                ...(status && { status }),
                ...(notes !== undefined && { notes }),
            },
            include: {
                client: true,
                items: { include: { product: true } },
            },
        })

        return NextResponse.json(order)
    } catch {
        return NextResponse.json({ error: "Error interno" }, { status: 500 })
    }
}
