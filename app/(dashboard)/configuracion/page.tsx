"use client"

import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2, Loader2, Settings, Users, FolderOpen, Building2, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useSession } from "next-auth/react"

// ─── Types ────────────────────────────────────────────────────────────────────
interface Category { id: string; name: string; _count?: { products: number } }
interface User { id: string; name: string; email: string; role: string; active: boolean }

// ─── Categories Tab ───────────────────────────────────────────────────────────
function CategoriesTab() {
    const [categories, setCategories] = useState<Category[]>([])
    const [newName, setNewName] = useState("")
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editName, setEditName] = useState("")
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const fetch_ = async () => {
        setLoading(true)
        const res = await fetch("/api/categories")
        setCategories(await res.json())
        setLoading(false)
    }

    useEffect(() => { fetch_() }, [])

    const handleCreate = async () => {
        if (!newName.trim()) return
        setSaving(true)
        try {
            const res = await fetch("/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newName.trim() }),
            })
            if (!res.ok) throw new Error()
            setNewName("")
            toast.success("Categoría creada")
            fetch_()
        } catch { toast.error("Error al crear categoría") }
        finally { setSaving(false) }
    }

    const handleUpdate = async (id: string) => {
        if (!editName.trim()) return
        try {
            await fetch(`/api/categories/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: editName.trim() }),
            })
            setEditingId(null)
            toast.success("Categoría actualizada")
            fetch_()
        } catch { toast.error("Error al actualizar") }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("¿Eliminar esta categoría?")) return
        try {
            await fetch(`/api/categories/${id}`, { method: "DELETE" })
            toast.success("Categoría eliminada")
            fetch_()
        } catch { toast.error("Error al eliminar") }
    }

    return (
        <div className="space-y-6">
            {/* Create */}
            <div className="surface rounded-xl p-4">
                <h3 className="text-sm font-semibold text-white mb-3">Nueva categoría</h3>
                <div className="flex gap-3">
                    <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                        placeholder="Ej: Contactología, Deportivos..."
                        className="bg-white/[0.03] border-white/[0.08] text-white"
                    />
                    <Button
                        onClick={handleCreate}
                        disabled={saving || !newName.trim()}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white flex-shrink-0"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Crear
                    </Button>
                </div>
            </div>

            {/* List */}
            {loading ? (
                <p className="text-sm text-slate-500 text-center py-8">Cargando...</p>
            ) : (
                <div className="space-y-2">
                    {categories.map((cat) => (
                        <div key={cat.id} className="surface rounded-xl p-4 flex items-center justify-between">
                            {editingId === cat.id ? (
                                <div className="flex items-center gap-3 flex-1">
                                    <Input
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === "Enter") handleUpdate(cat.id); if (e.key === "Escape") setEditingId(null) }}
                                        className="bg-white/[0.03] border-white/[0.08] text-white"
                                        autoFocus
                                    />
                                    <Button size="sm" onClick={() => handleUpdate(cat.id)} className="bg-indigo-600 hover:bg-indigo-500">Guardar</Button>
                                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="text-slate-400">Cancelar</Button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-3">
                                        <FolderOpen className="w-4 h-4 text-indigo-400" />
                                        <span className="text-sm font-medium text-white">{cat.name}</span>
                                        {cat._count && (
                                            <Badge className="text-xs bg-white/[0.05] text-slate-400 border-white/[0.06]">
                                                {cat._count.products} productos
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => { setEditingId(cat.id); setEditName(cat.name) }}
                                            className="p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(cat.id)}
                                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// ─── Users Tab ────────────────────────────────────────────────────────────────
function UsersTab() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({ name: "", email: "", password: "", role: "VENDEDOR" })
    const [saving, setSaving] = useState(false)

    const fetch_ = async () => {
        setLoading(true)
        const res = await fetch("/api/users")
        if (res.ok) setUsers(await res.json())
        setLoading(false)
    }

    useEffect(() => { fetch_() }, [])

    const handleCreate = async () => {
        if (!form.name || !form.email || !form.password) {
            toast.error("Completá todos los campos")
            return
        }
        setSaving(true)
        try {
            const res = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            })
            if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Error") }
            setShowForm(false)
            setForm({ name: "", email: "", password: "", role: "VENDEDOR" })
            toast.success("Usuario creado")
            fetch_()
        } catch (err: any) {
            toast.error(err.message || "Error al crear usuario")
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Usuarios del sistema</h3>
                <Button onClick={() => setShowForm(!showForm)} className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2">
                    <Plus className="w-4 h-4" />
                    Nuevo usuario
                </Button>
            </div>

            {showForm && (
                <div className="surface rounded-xl p-5 space-y-4">
                    <h4 className="text-sm font-semibold text-white">Crear usuario</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-slate-300 text-sm">Nombre</Label>
                            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1.5 bg-white/[0.03] border-white/[0.08] text-white" placeholder="Juan García" />
                        </div>
                        <div>
                            <Label className="text-slate-300 text-sm">Email</Label>
                            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1.5 bg-white/[0.03] border-white/[0.08] text-white" placeholder="juan@optovision.com" />
                        </div>
                        <div>
                            <Label className="text-slate-300 text-sm">Contraseña</Label>
                            <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="mt-1.5 bg-white/[0.03] border-white/[0.08] text-white" placeholder="Mín. 6 caracteres" />
                        </div>
                        <div>
                            <Label className="text-slate-300 text-sm">Rol</Label>
                            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="mt-1.5 w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white text-sm cursor-pointer">
                                <option value="VENDEDOR">VENDEDOR</option>
                                <option value="ADMIN">ADMIN</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setShowForm(false)} className="text-slate-400">Cancelar</Button>
                        <Button onClick={handleCreate} disabled={saving} className="bg-indigo-600 hover:bg-indigo-500 text-white">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Crear usuario
                        </Button>
                    </div>
                </div>
            )}

            {loading ? (
                <p className="text-sm text-slate-500 text-center py-8">Cargando...</p>
            ) : (
                <div className="surface rounded-xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/[0.06]">
                                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Usuario</th>
                                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Email</th>
                                <th className="text-center text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Rol</th>
                                <th className="text-center text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-white/[0.02]">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-7 h-7 rounded-full bg-indigo-500/15 flex items-center justify-center">
                                                <span className="text-xs font-bold text-indigo-300">{user.name.charAt(0)}</span>
                                            </div>
                                            <span className="text-sm text-white">{user.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-400">{user.email}</td>
                                    <td className="px-4 py-3 text-center">
                                        <Badge className={`text-xs ${user.role === "ADMIN" ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/20" : "bg-slate-500/15 text-slate-400 border-slate-500/20"}`}>
                                            {user.role}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <Badge className={`text-xs ${user.active ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" : "bg-red-500/15 text-red-400 border-red-500/20"}`}>
                                            {user.active ? "Activo" : "Inactivo"}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────
function SettingsTab() {
    const [settings, setSettings] = useState<any>(null)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetch("/api/settings").then((r) => r.json()).then(setSettings)
    }, [])

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await fetch("/api/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            })
            if (!res.ok) throw new Error()
            toast.success("Configuración guardada")
        } catch {
            toast.error("Error al guardar")
        } finally {
            setSaving(false)
        }
    }

    if (!settings) return <div className="text-center py-8 text-slate-500 text-sm">Cargando...</div>

    const inputClass = "mt-1.5 bg-white/[0.03] border-white/[0.08] text-white"

    return (
        <div className="space-y-6 max-w-lg">
            <div>
                <Label className="text-slate-300 text-sm">Nombre de la empresa</Label>
                <Input value={settings.name || ""} onChange={(e) => setSettings({ ...settings, name: e.target.value })} className={inputClass} />
            </div>
            <div>
                <Label className="text-slate-300 text-sm">Dirección</Label>
                <Input value={settings.address || ""} onChange={(e) => setSettings({ ...settings, address: e.target.value })} className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label className="text-slate-300 text-sm">Teléfono</Label>
                    <Input value={settings.phone || ""} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} className={inputClass} />
                </div>
                <div>
                    <Label className="text-slate-300 text-sm">Email</Label>
                    <Input value={settings.email || ""} onChange={(e) => setSettings({ ...settings, email: e.target.value })} className={inputClass} />
                </div>
            </div>
            <Button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-500 text-white">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Guardar cambios
            </Button>
        </div>
    )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ConfiguracionPage() {
    const { data: session } = useSession()
    const isAdmin = (session?.user as any)?.role === "ADMIN"

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center py-24">
                <ShieldAlert className="w-12 h-12 text-red-400 mb-4" />
                <h2 className="text-lg font-semibold text-white">Acceso denegado</h2>
                <p className="text-sm text-slate-400 mt-1">Solo administradores pueden acceder a esta sección.</p>
            </div>
        )
    }

    return (
        <div className="animate-fade-in">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">Configuración</h1>
                <p className="text-sm text-slate-400 mt-1">Administrá categorías, usuarios y datos de la empresa</p>
            </div>

            <Tabs defaultValue="categorias" className="space-y-6">
                <TabsList className="bg-white/[0.03] border border-white/[0.06] p-1 rounded-xl">
                    <TabsTrigger value="categorias" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300 text-slate-400 rounded-lg gap-2">
                        <FolderOpen className="w-4 h-4" />
                        Categorías
                    </TabsTrigger>
                    <TabsTrigger value="usuarios" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300 text-slate-400 rounded-lg gap-2">
                        <Users className="w-4 h-4" />
                        Usuarios
                    </TabsTrigger>
                    <TabsTrigger value="empresa" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300 text-slate-400 rounded-lg gap-2">
                        <Building2 className="w-4 h-4" />
                        Empresa
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="categorias">
                    <CategoriesTab />
                </TabsContent>

                <TabsContent value="usuarios">
                    <UsersTab />
                </TabsContent>

                <TabsContent value="empresa">
                    <SettingsTab />
                </TabsContent>
            </Tabs>
        </div>
    )
}
