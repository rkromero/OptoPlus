"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Search, Users, Pencil, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import Slideover from "@/components/layout/Slideover"
import ClientForm from "@/components/clients/ClientForm"
import ClientDetail from "@/components/clients/ClientDetail"
import { toast } from "sonner"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Client {
    id: string
    fullName: string
    dni?: string
    email?: string
    phone?: string
    city?: string
    createdAt: string
    _count: { orders: number }
}

export default function ClientesPage() {
    const [clients, setClients] = useState<Client[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [page, setPage] = useState(1)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [isDetailOpen, setIsDetailOpen] = useState(false)
    const [editingClient, setEditingClient] = useState<Client | null>(null)
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null)

    const limit = 15

    const fetchClients = useCallback(async () => {
        setLoading(true)
        const params = new URLSearchParams({
            page: String(page),
            limit: String(limit),
            ...(search && { search }),
        })
        try {
            const res = await fetch(`/api/clients?${params}`)
            const data = await res.json()
            setClients(data.clients)
            setTotal(data.total)
        } catch {
            toast.error("Error cargando clientes")
        } finally {
            setLoading(false)
        }
    }, [page, search])

    useEffect(() => {
        fetchClients()
    }, [fetchClients])

    const handleSuccess = () => {
        setIsFormOpen(false)
        setEditingClient(null)
        fetchClients()
    }

    const totalPages = Math.ceil(total / limit)

    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">Clientes</h1>
                    <p className="text-sm text-slate-400 mt-1">Gestioná la cartera de clientes</p>
                </div>
                <Button
                    onClick={() => { setEditingClient(null); setIsFormOpen(true) }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Nuevo Cliente
                </Button>
            </div>

            {/* Search */}
            <div className="flex items-center gap-3 mb-6">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                        placeholder="Buscar por nombre, DNI o email..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                        className="pl-9 bg-white/[0.03] border-white/[0.08] text-white placeholder:text-slate-600"
                    />
                </div>
                <span className="text-xs text-slate-500 ml-auto">
                    {total} cliente{total !== 1 ? "s" : ""}
                </span>
            </div>

            {/* Table */}
            <div className="surface rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/[0.06]">
                            <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Cliente</th>
                            <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">DNI / CUIT</th>
                            <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Contacto</th>
                            <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Ciudad</th>
                            <th className="text-center text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Pedidos</th>
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
                        ) : clients.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-16">
                                    <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                                    <p className="text-slate-400 font-medium">No hay clientes</p>
                                    <p className="text-sm text-slate-600 mt-1">
                                        {search ? "Probá con otra búsqueda" : "Creá tu primer cliente"}
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            clients.map((client) => (
                                <tr key={client.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                                                <span className="text-xs font-semibold text-indigo-300">
                                                    {client.fullName.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-white">{client.fullName}</p>
                                                <p className="text-xs text-slate-500">
                                                    Alta: {format(new Date(client.createdAt), "dd MMM yyyy", { locale: es })}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 hidden md:table-cell">
                                        <span className="text-sm text-slate-400">{client.dni || "—"}</span>
                                    </td>
                                    <td className="px-4 py-3 hidden lg:table-cell">
                                        <div className="text-sm text-slate-400">
                                            <p>{client.email || "—"}</p>
                                            <p className="text-xs text-slate-600">{client.phone || ""}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 hidden lg:table-cell">
                                        <span className="text-sm text-slate-400">{client.city || "—"}</span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <Badge className="bg-slate-500/15 text-slate-400 border-slate-500/20 text-xs">
                                            {client._count.orders}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => { setSelectedClientId(client.id); setIsDetailOpen(true) }}
                                                className="p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                                                aria-label="Ver detalle"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => { setEditingClient(client); setIsFormOpen(true) }}
                                                className="p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                                                aria-label="Editar cliente"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
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
                            className="px-3 py-1.5 text-xs rounded-lg border border-white/[0.08] text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        >
                            Anterior
                        </button>
                        <span className="text-xs text-slate-400">{page} / {totalPages}</span>
                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage(page + 1)}
                            className="px-3 py-1.5 text-xs rounded-lg border border-white/[0.08] text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            )}

            {/* Form Slideover */}
            <Slideover
                isOpen={isFormOpen}
                onClose={() => { setIsFormOpen(false); setEditingClient(null) }}
                title={editingClient ? "Editar Cliente" : "Nuevo Cliente"}
                width="xl"
            >
                <ClientForm
                    client={editingClient}
                    onSuccess={handleSuccess}
                    onCancel={() => { setIsFormOpen(false); setEditingClient(null) }}
                />
            </Slideover>

            {/* Detail Slideover */}
            <Slideover
                isOpen={isDetailOpen}
                onClose={() => { setIsDetailOpen(false); setSelectedClientId(null) }}
                title="Detalle del Cliente"
                width="xl"
            >
                {selectedClientId && (
                    <ClientDetail clientId={selectedClientId} />
                )}
            </Slideover>
        </div>
    )
}
