"use client"

import { useEffect, useState } from "react"
import { Loader2, ShoppingCart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { formatCurrency } from "@/lib/utils"

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
    PENDIENTE: { label: "Pendiente", className: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20" },
    EN_PROCESO: { label: "En proceso", className: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
    ENVIADO: { label: "Enviado", className: "bg-orange-500/15 text-orange-400 border-orange-500/20" },
    ENTREGADO: { label: "Entregado", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
    CANCELADO: { label: "Cancelado", className: "bg-red-500/15 text-red-400 border-red-500/20" },
}

export default function ClientDetail({ clientId }: { clientId: string }) {
    const [client, setClient] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch(`/api/clients/${clientId}`)
            .then((r) => r.json())
            .then(setClient)
            .catch(() => toast.error("Error cargando datos del cliente"))
            .finally(() => setLoading(false))
    }, [clientId])

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
            </div>
        )
    }

    if (!client) return null

    return (
        <div className="space-y-6">
            {/* Profile */}
            <div className="flex items-start gap-4 p-4 surface rounded-xl">
                <div className="w-12 h-12 rounded-full bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-indigo-300">
                        {client.fullName.charAt(0).toUpperCase()}
                    </span>
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-white">{client.fullName}</h3>
                    {client.dni && <p className="text-sm text-slate-400">DNI: {client.dni}</p>}
                    <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                        {client.email && <p className="text-slate-400">{client.email}</p>}
                        {client.phone && <p className="text-slate-400">{client.phone}</p>}
                        {client.city && (
                            <p className="text-slate-500">
                                {client.city}{client.province ? `, ${client.province}` : ""}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Prescription */}
            {(client.odSphere || client.oiSphere) && (
                <div className="surface rounded-xl p-4">
                    <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Graduación</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-slate-500 mb-2">Ojo Derecho</p>
                            <div className="text-sm text-slate-300 space-y-1">
                                <p>Esfera: <span className="text-white">{client.odSphere ?? "—"}</span></p>
                                <p>Cilindro: <span className="text-white">{client.odCylinder ?? "—"}</span></p>
                                <p>Eje: <span className="text-white">{client.odAxis ?? "—"}</span></p>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 mb-2">Ojo Izquierdo</p>
                            <div className="text-sm text-slate-300 space-y-1">
                                <p>Esfera: <span className="text-white">{client.oiSphere ?? "—"}</span></p>
                                <p>Cilindro: <span className="text-white">{client.oiCylinder ?? "—"}</span></p>
                                <p>Eje: <span className="text-white">{client.oiAxis ?? "—"}</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Order history */}
            <div>
                <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
                    Historial de Pedidos ({client.orders?.length || 0})
                </h4>
                {client.orders?.length === 0 ? (
                    <div className="text-center py-8 surface rounded-xl">
                        <ShoppingCart className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">Sin pedidos registrados</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {client.orders?.map((order: any) => {
                            const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDIENTE
                            return (
                                <div key={order.id} className="surface rounded-xl p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-white">Pedido #{order.orderNumber}</p>
                                            <p className="text-xs text-slate-500">
                                                {format(new Date(order.createdAt), "dd MMM yyyy", { locale: es })}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge className={`text-xs ${statusCfg.className}`}>{statusCfg.label}</Badge>
                                            <span className="text-sm font-semibold text-white">{formatCurrency(order.total)}</span>
                                        </div>
                                    </div>
                                    {order.items?.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-1">
                                            {order.items.map((item: any) => (
                                                <div key={item.id} className="flex justify-between text-xs text-slate-400">
                                                    <span>{item.product.name} × {item.quantity}</span>
                                                    <span>{formatCurrency(item.unitPrice * item.quantity)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
