import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

        const role = (session.user as any)?.role
        if (role !== "ADMIN") return NextResponse.json({ error: "Solo administradores" }, { status: 403 })

        const users = await prisma.user.findMany({
            select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
            orderBy: { createdAt: "desc" },
        })

        return NextResponse.json(users)
    } catch {
        return NextResponse.json({ error: "Error interno" }, { status: 500 })
    }
}

const createSchema = z.object({
    name: z.string().min(1, "Nombre requerido"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Mínimo 6 caracteres"),
    role: z.enum(["ADMIN", "VENDEDOR"]).default("VENDEDOR"),
})

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

        const role = (session.user as any)?.role
        if (role !== "ADMIN") return NextResponse.json({ error: "Solo administradores" }, { status: 403 })

        const body = await req.json()
        const data = createSchema.parse(body)

        const hashedPassword = await bcrypt.hash(data.password, 12)

        const user = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
                role: data.role,
            },
            select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
        })

        return NextResponse.json(user, { status: 201 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 })
        }
        return NextResponse.json({ error: "Error interno" }, { status: 500 })
    }
}

