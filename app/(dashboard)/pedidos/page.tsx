"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, ShoppingCart, FileDown, ChevronDown, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import Slideover from "@/components/layout/Slideover"
import OrderForm from "@/components/orders/OrderForm"
import { toast } from "sonner"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { formatCurrency } from "@/lib/utils"
import { pdf } from "@react-pdf/renderer"
import OrderPDF from "@/components/orders/OrderPDF"

const STATUS_FLOW = ["PENDIENTE", "EN_PROCESO", "ENVIADO", "ENTREGADO", "CANCELADO"] as const
const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
    PENDIENTE: { label: "Pendiente", className: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20" },
    EN_PROCESO: { label: "En proceso", className: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
    ENVIADO: { label: "Enviado", className: "bg-orange-500/15 text-orange-400 border-orange-500/20" },
    ENTREGADO: { label: "Entregado", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
    CANCELADO: { label: "Cancelado", className: "bg-red-500/15 text-red-400 border-red-500/20" },
}

interface Order {
    id: string
    orderNumber: number
    client: { fullName: string }
    status: string
    total: number
    createdAt: string
    items: { product: { name: string }; quantity: number }[]
}

export default function PedidosPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState("")
    const [page, setPage] = useState(1)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [downloadingId, setDownloadingId] = useState<string | null>(null)
    const [updatingId, setUpdatingId] = useState<string | null>(null)

    const limit = 15

    const fetchOrders = useCallback(async () => {
        setLoading(true)
        const params = new URLSearchParams({
            page: String(page),
            limit: String(limit),
            ...(statusFilter && { status: statusFilter }),
        })
        try {
            const res = await fetch(`/api/orders?${params}`)
            const data = await res.json()
            setOrders(data.orders)
            setTotal(data.total)
        } catch {
            toast.error("Error cargando pedidos")
        } finally {
            setLoading(false)
        }
    }, [page, statusFilter])

    useEffect(() => {
        fetchOrders()
    }, [fetchOrders])

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        setUpdatingId(orderId)
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            })
            if (!res.ok) throw new Error()
            toast.success("Estado actualizado")
            fetchOrders()
        } catch {
            toast.error("Error al actualizar estado")
        } finally {
            setUpdatingId(null)
        }
    }

    const handleDownloadPDF = async (orderId: string) => {
        setDownloadingId(orderId)
        try {
            const [orderRes, settingsRes] = await Promise.all([
                fetch(`/api/orders/${orderId}`),
                fetch("/api/settings"),
            ])
            const [order, company] = await Promise.all([orderRes.json(), settingsRes.json()])

            const blob = await pdf(<OrderPDF order={order} company={company} />).toBlob()
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `remito-${String(order.orderNumber).padStart(5, "0")}.pdf`
            a.click()
            URL.revokeObjectURL(url)
            toast.success("PDF descargado")
        } catch {
            toast.error("Error generando PDF")
        } finally {
            setDownloadingId(null)
        }
    }

    const totalPages = Math.ceil(total / limit)

    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">Pedidos</h1>
                    <p className="text-sm text-slate-400 mt-1">Gestioná los pedidos de clientes</p>
                </div>
                <Button
                    onClick={() => setIsFormOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Nuevo Pedido
                </Button>
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-2 mb-6 flex-wrap">
                <button
                    onClick={() => { setStatusFilter(""); setPage(1) }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${!statusFilter
                            ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                            : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]"
                        }`}
                >
                    Todos
                </button>
                {STATUS_FLOW.map((status) => {
                    const cfg = STATUS_CONFIG[status]
                    return (
                        <button
                            key={status}
                            onClick={() => { setStatusFilter(status); setPage(1) }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${statusFilter === status
                                    ? `${cfg.className} border`
                                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]"
                                }`}
                        >
                            {cfg.label}
                        </button>
                    )
                })}
                <span className="text-xs text-slate-500 ml-auto">
                    {total} pedido{total !== 1 ? "s" : ""}
                </span>
            </div>

            {/* Table */}
            <div className="surface rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/[0.06]">
                            <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">N° Pedido</th>
                            <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Cliente</th>
                            <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Fecha</th>
                            <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Estado</th>
                            <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Total</th>
                            <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                        {loading ? (
                            Array.from({ length: 8 }).map((_, i) => (
                                <tr key={i}>
                                    <td className="px-4 py-3" colSpan={6}>
                                        <Skeleton className="h-10 w-full bg-white/[0.04]" />
                                    </td>
                                </tr>
                            ))
                        ) : orders.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-16">
                                    <ShoppingCart className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                                    <p className="text-slate-400 font-medium">No hay pedidos</p>
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => {
                                const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDIENTE
                                const currentIdx = STATUS_FLOW.indexOf(order.status as any)
                                const nextStatus = STATUS_FLOW[currentIdx + 1]

                                return (
                                    <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-4 py-3">
                                            <span className="text-sm font-mono font-semibold text-white">
                                                #{String(order.orderNumber).padStart(5, "0")}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm text-white">{order.client.fullName}</p>
                                            <p className="text-xs text-slate-500">
                                                {order.items.length} producto{order.items.length !== 1 ? "s" : ""}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell">
                                            <span className="text-sm text-slate-400">
                                                {format(new Date(order.createdAt), "dd MMM yyyy", { locale: es })}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <Badge className={`text-xs ${cfg.className}`}>{cfg.label}</Badge>
                                                {nextStatus && order.status !== "CANCELADO" && (
                                                    <button
                                                        onClick={() => handleStatusChange(order.id, nextStatus)}
                                                        disabled={updatingId === order.id}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-slate-500 hover:text-indigo-300 cursor-pointer"
                                                        title={`→ ${STATUS_CONFIG[nextStatus].label}`}
                                                    >
                                                        {updatingId === order.id ? (
                                                            <Loader2 className="w-3 h-3 animate-spin" />
                                                        ) : (
                                                            <ChevronDown className="w-3 h-3 rotate-[-90deg]" />
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span className="text-sm font-semibold text-white">{formatCurrency(order.total)}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleDownloadPDF(order.id)}
                                                    disabled={downloadingId === order.id}
                                                    className="p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                                                    aria-label="Descargar PDF"
                                                >
                                                    {downloadingId === order.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <FileDown className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                    <p className="text-xs text-slate-500">
                        Mostrando {Math.min((page - 1) * limit + 1, total)} — {Math.min(page * limit, total)} de {total}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                            className="px-3 py-1.5 text-xs rounded-lg border border-white/[0.08] text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                            Anterior
                        </button>
                        <span className="text-xs text-slate-400">{page} / {totalPages}</span>
                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage(page + 1)}
                            className="px-3 py-1.5 text-xs rounded-lg border border-white/[0.08] text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            )}

            {/* Slideover */}
            <Slideover
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title="Nuevo Pedido"
                description="Seleccioná el cliente, agregá productos y confirmá"
                width="xl"
            >
                <OrderForm
                    onSuccess={() => { setIsFormOpen(false); fetchOrders() }}
                    onCancel={() => setIsFormOpen(false)}
                />
            </Slideover>
        </div>
    )
}
