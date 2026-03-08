import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Package, Users, ShoppingCart, AlertTriangle, TrendingUp } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { formatCurrency, formatDate } from "@/lib/utils"

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
    PENDIENTE: { label: "Pendiente", className: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20" },
    EN_PROCESO: { label: "En proceso", className: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
    ENVIADO: { label: "Enviado", className: "bg-orange-500/15 text-orange-400 border-orange-500/20" },
    ENTREGADO: { label: "Entregado", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
    CANCELADO: { label: "Cancelado", className: "bg-red-500/15 text-red-400 border-red-500/20" },
}

export const metadata = { title: "Dashboard" }

async function getDashboardData() {
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
        totalProducts,
        lowStockProducts,
        totalClients,
        monthlyOrders,
        recentOrders,
    ] = await Promise.all([
        prisma.product.count({ where: { active: true } }),
        prisma.product.count({ where: { active: true, stock: { lt: 5, gte: 0 } } }),
        prisma.client.count(),
        prisma.order.aggregate({
            where: { createdAt: { gte: firstDayOfMonth } },
            _count: true,
            _sum: { total: true },
        }),
        prisma.order.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            include: {
                client: { select: { fullName: true } },
            },
        }),
    ])

    return { totalProducts, lowStockProducts, totalClients, monthlyOrders, recentOrders }
}

function KpiCard({
    icon: Icon,
    label,
    value,
    sub,
    alert,
    accentClass,
}: {
    icon: any
    label: string
    value: string | number
    sub?: string
    alert?: boolean
    accentClass?: string
}) {
    return (
        <div className={`surface rounded-xl p-5 relative overflow-hidden group hover:border-white/[0.1] transition-colors ${alert ? "border-yellow-500/20" : ""}`}>
            <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-[0.06] ${accentClass || "bg-indigo-500"}`} />
            <div className="flex items-start justify-between">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${alert ? "bg-yellow-500/15" : "bg-indigo-500/15"}`}>
                    <Icon className={`w-5 h-5 ${alert ? "text-yellow-400" : "text-indigo-400"}`} />
                </div>
                {alert && (
                    <span className="text-xs bg-yellow-500/15 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded-full">
                        Alerta
                    </span>
                )}
            </div>
            <div className="mt-4">
                <p className="text-3xl font-bold text-white">{value}</p>
                <p className="text-sm text-slate-400 mt-1">{label}</p>
                {sub && <p className="text-xs text-slate-600 mt-0.5">{sub}</p>}
            </div>
        </div>
    )
}

export default async function DashboardPage() {
    const session = await getServerSession(authOptions)
    if (!session) redirect("/login")

    const { totalProducts, lowStockProducts, totalClients, monthlyOrders, recentOrders } =
        await getDashboardData()

    const monthName = format(new Date(), "MMMM yyyy", { locale: es })

    return (
        <div className="animate-fade-in space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                <p className="text-sm text-slate-400 mt-1">
                    Bienvenido, {session.user?.name} ·{" "}
                    {format(new Date(), "EEEE dd 'de' MMMM", { locale: es })}
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                    icon={Package}
                    label="Productos en inventario"
                    value={totalProducts}
                    sub="Productos activos"
                />
                <KpiCard
                    icon={AlertTriangle}
                    label="Stock bajo (< 5 unid.)"
                    value={lowStockProducts}
                    sub="Requieren reposición"
                    alert={lowStockProducts > 0}
                    accentClass="bg-yellow-500"
                />
                <KpiCard
                    icon={Users}
                    label="Clientes registrados"
                    value={totalClients}
                    accentClass="bg-emerald-500"
                />
                <KpiCard
                    icon={ShoppingCart}
                    label={`Pedidos — ${monthName}`}
                    value={monthlyOrders._count}
                    sub={`Total: ${formatCurrency(monthlyOrders._sum.total || 0)}`}
                    accentClass="bg-blue-500"
                />
            </div>

            {/* Recent orders */}
            <div>
                <h2 className="text-base font-semibold text-white mb-4">Últimos pedidos</h2>
                <div className="surface rounded-xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/[0.06]">
                                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">N° Pedido</th>
                                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Cliente</th>
                                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Fecha</th>
                                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Estado</th>
                                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                            {recentOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-slate-500 text-sm">
                                        No hay pedidos aún
                                    </td>
                                </tr>
                            ) : (
                                recentOrders.map((order: typeof recentOrders[0]) => {
                                    const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDIENTE
                                    return (
                                        <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-4 py-3">
                                                <span className="text-sm font-mono font-semibold text-white">
                                                    #{String(order.orderNumber).padStart(5, "0")}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-sm text-white">{order.client.fullName}</span>
                                            </td>
                                            <td className="px-4 py-3 hidden md:table-cell">
                                                <span className="text-sm text-slate-400">
                                                    {format(order.createdAt, "dd MMM yyyy", { locale: es })}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.className}`}>
                                                    {cfg.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className="text-sm font-semibold text-white">{formatCurrency(order.total)}</span>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
