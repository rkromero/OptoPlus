import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const orderItemSchema = z.object({
    productId: z.string(),
    quantity: z.number().int().min(1),
    unitPrice: z.number().min(0),
})

const orderSchema = z.object({
    clientId: z.string().min(1),
    items: z.array(orderItemSchema).min(1, "Al menos un producto requerido"),
    discount: z.number().min(0).max(100).optional().default(0),
    notes: z.string().optional(),
})

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

        const { searchParams } = new URL(req.url)
        const status = searchParams.get("status") || ""
        const page = parseInt(searchParams.get("page") || "1")
        const limit = parseInt(searchParams.get("limit") || "20")
        const skip = (page - 1) * limit

        const where: any = {}
        if (status) where.status = status

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                include: {
                    client: { select: { id: true, fullName: true, dni: true } },
                    items: { include: { product: { select: { name: true } } } },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.order.count({ where }),
        ])

        return NextResponse.json({ orders, total, page, limit })
    } catch {
        return NextResponse.json({ error: "Error interno" }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

        const body = await req.json()
        const data = orderSchema.parse(body)

        // Calculate total
        const subtotal = data.items.reduce(
            (sum, item) => sum + item.quantity * item.unitPrice,
            0
        )
        const discountAmount = subtotal * ((data.discount || 0) / 100)
        const total = subtotal - discountAmount

        // Create order + items + decrement stock in a transaction
        const order = await prisma.$transaction(async (tx: any) => {
            // Check and decrement stock for all items
            for (const item of data.items) {
                const product = await tx.product.findUnique({
                    where: { id: item.productId },
                    select: { stock: true, name: true },
                })
                if (!product) throw new Error(`Producto no encontrado: ${item.productId}`)
                if (product.stock < item.quantity) {
                    throw new Error(`Stock insuficiente para: ${product.name}`)
                }
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } },
                })
            }

            // Create order
            return tx.order.create({
                data: {
                    clientId: data.clientId,
                    discount: data.discount || 0,
                    total,
                    notes: data.notes,
                    items: {
                        create: data.items.map((item) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                        })),
                    },
                },
                include: {
                    client: true,
                    items: { include: { product: true } },
                },
            })
        })

        return NextResponse.json(order, { status: 201 })
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 })
        }
        if (error?.message?.includes("Stock insuficiente")) {
            return NextResponse.json({ error: error.message }, { status: 409 })
        }
        return NextResponse.json({ error: "Error interno" }, { status: 500 })
    }
}
