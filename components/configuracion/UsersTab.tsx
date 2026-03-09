"use client"

import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2, Loader2, Users, Search, UserX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import Slideover from "@/components/layout/Slideover"

interface User { id: string; name: string; email: string; role: string; active: boolean }

export default function UsersTab() {
    const [users, setUsers] = useState<User[]>([])
    const [filteredUsers, setFilteredUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [isSlideoverOpen, setIsSlideoverOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<User | null>(null)
    const [form, setForm] = useState({ name: "", email: "", password: "", role: "VENDEDOR", active: true })
    const [saving, setSaving] = useState(false)

    const fetch_ = async () => {
        setLoading(true)
        const res = await fetch("/api/users")
        if (res.ok) {
            const data = await res.json()
            setUsers(data)
            setFilteredUsers(data)
        }
        setLoading(false)
    }

    useEffect(() => { fetch_() }, [])

    useEffect(() => {
        if (!searchQuery.trim()) { setFilteredUsers(users); return }
        const lower = searchQuery.toLowerCase()
        setFilteredUsers(users.filter(u =>
            u.name.toLowerCase().includes(lower) ||
            u.email.toLowerCase().includes(lower) ||
            u.role.toLowerCase().includes(lower)
        ))
    }, [searchQuery, users])

    const openCreateForm = () => {
        setEditingUser(null)
        setForm({ name: "", email: "", password: "", role: "VENDEDOR", active: true })
        setIsSlideoverOpen(true)
    }

    const openEditForm = (user: User) => {
        setEditingUser(user)
        setForm({ name: user.name, email: user.email, password: "", role: user.role, active: user.active })
        setIsSlideoverOpen(true)
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.name || !form.email || (!editingUser && !form.password)) {
            toast.error("Completá todos los campos requeridos")
            return
        }
        setSaving(true)
        try {
            const url = editingUser ? `/api/users/${editingUser.id}` : "/api/users"
            const method = editingUser ? "PUT" : "POST"
            const payload: any = { ...form }
            if (editingUser && !form.password) delete payload.password
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
            if (!res.ok) {
                const d = await res.json()
                throw new Error(d.error || "Error")
            }
            setIsSlideoverOpen(false)
            toast.success(editingUser ? "Usuario actualizado" : "Usuario creado")
            fetch_()
        } catch (err: any) {
            toast.error(err.message || "Error al guardar usuario")
        } finally {
            setSaving(false)
        }
    }

    const toggleStatus = async (user: User) => {
        try {
            const res = await fetch(`/api/users/${user.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ active: !user.active }),
            })
            if (!res.ok) throw new Error()
            toast.success(`Usuario ${!user.active ? 'activado' : 'desactivado'}`)
            fetch_()
        } catch {
            toast.error("Error al cambiar estado")
        }
    }

    const confirmDelete = async (id: string) => {
        if (!confirm("¿Eliminar este usuario definitivamente?")) return
        try {
            await fetch(`/api/users/${id}`, { method: "DELETE" })
            toast.success("Usuario eliminado")
            fetch_()
        } catch { toast.error("Error al eliminar") }
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input
                        placeholder="Buscar por nombre, email o rol..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-white/[0.04] border-white/[0.08] focus:border-indigo-500/60 text-white w-full"
                    />
                </div>
                <Button onClick={openCreateForm} className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2 w-full sm:w-auto shrink-0">
                    <Plus className="w-4 h-4" />
                    Nuevo usuario
                </Button>
            </div>

            {loading ? (
                <div className="flex items-center gap-3 justify-center py-14 text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Cargando...</span>
                </div>
            ) : filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 rounded-xl border border-dashed border-white/[0.08] text-center px-4">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                        <UserX className="w-8 h-8 text-zinc-500" />
                    </div>
                    <h4 className="text-white font-medium mb-1">No se encontraron usuarios</h4>
                    <p className="text-sm text-zinc-400 max-w-sm">
                        {searchQuery ? "No hay coincidencias para tu búsqueda actual." : "Creá el primer usuario para dar acceso al sistema."}
                    </p>
                </div>
            ) : (
                <div className="rounded-xl border border-white/[0.06] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                                    <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Usuario</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider hidden md:table-cell">Email</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider hidden sm:table-cell">Rol</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${user.role === "ADMIN" ? "bg-indigo-500/20 text-indigo-400" : "bg-zinc-700 text-zinc-300"}`}>
                                                    <span className="text-sm font-bold">{user.name.charAt(0).toUpperCase()}</span>
                                                </div>
                                                <span className="text-sm font-medium text-white">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400 hidden md:table-cell">{user.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                                            <Badge className={`text-xs px-2.5 py-0.5 font-medium ${user.role === "ADMIN"
                                                ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20"
                                                : "bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700"}`}>
                                                {user.role}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge className={`text-xs px-2.5 py-0.5 font-medium ${user.active
                                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                                                {user.active ? "Activo" : "Inactivo"}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => toggleStatus(user)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${user.active
                                                        ? "bg-white/5 text-zinc-400 hover:bg-red-500/10 hover:text-red-400"
                                                        : "bg-white/5 text-zinc-400 hover:bg-emerald-500/10 hover:text-emerald-400"}`}
                                                >
                                                    {user.active ? "Desactivar" : "Activar"}
                                                </button>
                                                <button
                                                    onClick={() => openEditForm(user)}
                                                    className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                                                    title="Editar"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => confirmDelete(user.id)}
                                                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <Slideover
                isOpen={isSlideoverOpen}
                onClose={() => setIsSlideoverOpen(false)}
                title={editingUser ? "Editar usuario" : "Crear nuevo usuario"}
                description={editingUser ? "Modificá los datos del usuario o su nivel de acceso." : "Completá los datos para registrar un nuevo integrante del equipo."}
                width="lg"
            >
                <form onSubmit={handleSave} className="flex flex-col flex-1">
                    <div className="flex-1 space-y-6 pb-8">
                        <div>
                            <Label className="text-slate-400 text-xs font-medium mb-1.5 block uppercase tracking-wide">Nombre completo *</Label>
                            <Input
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="bg-white/[0.04] border-white/[0.08] focus:border-indigo-500/60 text-white"
                                placeholder="Ej: Juan García"
                                required
                            />
                        </div>
                        <div>
                            <Label className="text-slate-400 text-xs font-medium mb-1.5 block uppercase tracking-wide">Correo electrónico *</Label>
                            <Input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="bg-white/[0.04] border-white/[0.08] focus:border-indigo-500/60 text-white"
                                placeholder="juan@optovision.com"
                                required
                            />
                        </div>
                        <div>
                            <Label className="text-slate-400 text-xs font-medium mb-1.5 block uppercase tracking-wide">
                                {editingUser ? "Nueva contraseña (opcional)" : "Contraseña *"}
                            </Label>
                            <Input
                                type="password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                className="bg-white/[0.04] border-white/[0.08] focus:border-indigo-500/60 text-white"
                                placeholder={editingUser ? "Dejar en blanco para no cambiar" : "Mínimo 6 caracteres"}
                                required={!editingUser}
                                minLength={6}
                            />
                        </div>
                        <div>
                            <Label className="text-slate-400 text-xs font-medium mb-1.5 block uppercase tracking-wide">Nivel de acceso *</Label>
                            <select
                                value={form.role}
                                onChange={(e) => setForm({ ...form, role: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] focus:border-indigo-500/60 text-white text-sm outline-none transition-all"
                            >
                                <option value="VENDEDOR">Vendedor (Acceso limitado)</option>
                                <option value="ADMIN">Administrador (Acceso total)</option>
                            </select>
                        </div>
                        {editingUser && (
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setForm({ ...form, active: !form.active })}
                                    className={`relative w-10 h-5 rounded-full transition-colors duration-200 shrink-0 ${form.active ? "bg-indigo-500" : "bg-zinc-700"}`}
                                    role="switch"
                                    aria-checked={form.active}
                                >
                                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${form.active ? "translate-x-5" : "translate-x-0.5"}`} />
                                </button>
                                <div>
                                    <p className="text-sm font-medium text-white">Usuario activo</p>
                                    <p className="text-xs text-zinc-400">Si se desactiva, el usuario no podrá iniciar sesión.</p>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="sticky bottom-0 mt-auto bg-[#0D0D14] py-4 px-6 border-t border-white/[0.06] flex justify-end gap-3 z-10 -mx-6 -mb-6">
                        <Button type="button" variant="ghost" onClick={() => setIsSlideoverOpen(false)} className="text-zinc-400 hover:text-white hover:bg-white/5">
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-500 text-white min-w-[140px]">
                            {saving ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Guardando...</>
                            ) : (
                                editingUser ? "Actualizar usuario" : "Crear usuario"
                            )}
                        </Button>
                    </div>
                </form>
            </Slideover>
        </div>
    )
}
