import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const productSchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
    model: z.string().min(1, "El modelo es requerido"),
    color: z.string().nullable().optional(),
    brand: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    imageUrl: z.string().nullable().optional(),
    priceList: z.number().min(0),
    priceCost: z.number().nullable().optional(),
    stock: z.number().int().min(0),
    active: z.boolean().default(true),
    categoryId: z.string().min(1, "La categoría es requerida"),
})

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

        const { searchParams } = new URL(req.url)
        const search = searchParams.get("search") || ""
        const categoryId = searchParams.get("categoryId") || ""
        const stockFilter = searchParams.get("stock") || ""
        const page = parseInt(searchParams.get("page") || "1")
        const limit = parseInt(searchParams.get("limit") || "20")
        const skip = (page - 1) * limit

        const where: any = { active: true }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { model: { contains: search, mode: "insensitive" } },
                { brand: { contains: search, mode: "insensitive" } },
            ]
        }

        if (categoryId) where.categoryId = categoryId
        if (stockFilter === "sinstock") where.stock = { lte: 0 }
        if (stockFilter === "disponible") where.stock = { gt: 0 }

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: { category: true },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.product.count({ where }),
        ])

        return NextResponse.json({ products, total, page, limit })
    } catch (error) {
        return NextResponse.json({ error: "Error interno" }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

        const body = await req.json()
        const data = productSchema.parse(body)

        const product = await prisma.product.create({
            data,
            include: { category: true },
        })

        return NextResponse.json(product, { status: 201 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 })
        }
        return NextResponse.json({ error: "Error interno" }, { status: 500 })
    }
}

