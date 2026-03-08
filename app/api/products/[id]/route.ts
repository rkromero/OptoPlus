import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateSchema = z.object({
    name: z.string().min(1).optional(),
    model: z.string().min(1).optional(),
    color: z.string().optional(),
    brand: z.string().optional(),
    description: z.string().optional(),
    imageUrl: z.string().optional(),
    priceList: z.number().min(0).optional(),
    priceCost: z.number().optional(),
    stock: z.number().int().min(0).optional(),
    active: z.boolean().optional(),
    categoryId: z.string().optional(),
})

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

        const product = await prisma.product.findUnique({
            where: { id: params.id },
            include: { category: true },
        })

        if (!product) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
        return NextResponse.json(product)
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

        const product = await prisma.product.update({
            where: { id: params.id },
            data,
            include: { category: true },
        })

        return NextResponse.json(product)
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
            return NextResponse.json({ error: "Solo administradores pueden eliminar productos" }, { status: 403 })
        }

        // Soft delete
        await prisma.product.update({
            where: { id: params.id },
            data: { active: false },
        })

        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json({ error: "Error interno" }, { status: 500 })
    }
}
