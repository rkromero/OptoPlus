import { PrismaClient as PC } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PC()

async function main() {
    console.log("🌱 Starting seed...")

    const receta = await prisma.category.upsert({
        where: { name: "Receta" },
        update: {},
        create: { name: "Receta" },
    })

    const sol = await prisma.category.upsert({
        where: { name: "Sol" },
        update: {},
        create: { name: "Sol" },
    })

    console.log(`✅ Categories created: ${receta.name}, ${sol.name}`)

    const hashedPassword = await bcrypt.hash("admin123", 12)
    const admin = await prisma.user.upsert({
        where: { email: "admin@optovision.com" },
        update: {},
        create: {
            name: "Administrador",
            email: "admin@optovision.com",
            password: hashedPassword,
            role: "ADMIN",
        },
    })

    console.log(`✅ Admin user created: ${admin.email}`)

    await prisma.companySettings.upsert({
        where: { id: "default" },
        update: {},
        create: {
            id: "default",
            name: "OptovisionPlus",
            address: "Av. Óptica 123, Buenos Aires",
            phone: "+54 11 1234-5678",
            email: "info@optovisionplus.com",
        },
    })

    console.log("✅ Company settings created")
    console.log("\n🎉 Seed completed!")
    console.log("  Email: admin@optovision.com")
    console.log("  Password: admin123")
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:", e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
