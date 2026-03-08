import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const clientSchema = z.object({
    fullName: z.string().min(1, "Nombre requerido"),
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

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

        const { searchParams } = new URL(req.url)
        const search = searchParams.get("search") || ""
        const page = parseInt(searchParams.get("page") || "1")
        const limit = parseInt(searchParams.get("limit") || "20")
        const skip = (page - 1) * limit

        const where: any = {}
        if (search) {
            where.OR = [
                { fullName: { contains: search, mode: "insensitive" } },
                { dni: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { phone: { contains: search, mode: "insensitive" } },
            ]
        }

        const [clients, total] = await Promise.all([
            prisma.client.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
                include: { _count: { select: { orders: true } } },
            }),
            prisma.client.count({ where }),
        ])

        return NextResponse.json({ clients, total, page, limit })
    } catch {
        return NextResponse.json({ error: "Error interno" }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

        const body = await req.json()
        const data = clientSchema.parse(body)

        const client = await prisma.client.create({ data })
        return NextResponse.json(client, { status: 201 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 })
        }
        return NextResponse.json({ error: "Error interno" }, { status: 500 })
    }
}
