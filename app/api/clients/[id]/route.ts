import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateSchema = z.object({
    fullName: z.string().min(1).optional(),
    dni: z.string().optional(),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    province: z.string().optional(),
    notes: z.string().optional(),
    odSphere: z.coerce.number().optional().nullable(),
    odCylinder: z.coerce.number().optional().nullable(),
    odAxis: z.coerce.number().int().optional().nullable(),
    oiSphere: z.coerce.number().optional().nullable(),
    oiCylinder: z.coerce.number().optional().nullable(),
    oiAxis: z.coerce.number().int().optional().nullable(),
})

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

        const client = await prisma.client.findUnique({
            where: { id: params.id },
            include: {
                orders: {
                    orderBy: { createdAt: "desc" },
                    include: { items: { include: { product: true } } },
                },
            },
        })

        if (!client) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
        return NextResponse.json(client)
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
        const data = updateSchema.parse(body)

        const client = await prisma.client.update({
            where: { id: params.id },
            data,
        })
        return NextResponse.json(client)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 })
        }
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
        if (role !== "ADMIN") {
            return NextResponse.json({ error: "Solo administradores" }, { status: 403 })
        }

        await prisma.client.delete({ where: { id: params.id } })
        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json({ error: "Error interno" }, { status: 500 })
    }
}
