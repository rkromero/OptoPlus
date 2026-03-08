"use client"

import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2, Loader2, Users, FolderOpen, Building2, ShieldAlert, Search, FolderX, UserX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import Slideover from "@/components/layout/Slideover"

// ─── Types ────────────────────────────────────────────────────────────────────
interface Category { id: string; name: string; _count?: { products: number } }
interface User { id: string; name: string; email: string; role: string; active: boolean }

// ─── Categories Tab ───────────────────────────────────────────────────────────
function CategoriesTab() {
    const [categories, setCategories] = useState<Category[]>([])
    const [newName, setNewName] = useState("")
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const fetch_ = async () => {
        setLoading(true)
        const res = await fetch("/api/categories")
        setCategories(await res.json())
        setLoading(false)
    }

    useEffect(() => { fetch_() }, [])

    const handleSave = async () => {
        if (!newName.trim()) return
        setSaving(true)
        try {
            const url = editingCategory ? `/api/categories/${editingCategory.id}` : "/api/categories"
            const method = editingCategory ? "PUT" : "POST"

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newName.trim() }),
            })
            if (!res.ok) throw new Error()

            setNewName("")
            setEditingCategory(null)
            toast.success(editingCategory ? "Categoría actualizada" : "Categoría creada")
            fetch_()
        } catch {
            toast.error(editingCategory ? "Error al actualizar" : "Error al crear categoría")
        } finally {
            setSaving(false)
        }
    }

    const startEdit = (cat: Category) => {
        setEditingCategory(cat)
        setNewName(cat.name)
        // Scroll to top for mobile
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    const cancelEdit = () => {
        setEditingCategory(null)
        setNewName("")
    }

    const confirmDelete = async () => {
        if (!deletingCategory) return
        try {
            await fetch(`/api/categories/${deletingCategory.id}`, { method: "DELETE" })
            toast.success("Categoría eliminada")
            fetch_()
        } catch {
            toast.error("Error al eliminar")
        } finally {
            setDeletingCategory(null)
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deletingCategory && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setDeletingCategory(null)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            className="relative bg-zinc-900 border border-white/10 p-6 rounded-2xl shadow-xl w-full max-w-md"
                        >
                            <h3 className="text-xl font-semibold text-white mb-2">Eliminar categoría</h3>
                            <p className="text-sm text-zinc-400 mb-6">
                                ¿Estás seguro que querés eliminar la categoría <span className="text-white font-medium">"{deletingCategory.name}"</span>?
                                {deletingCategory._count && deletingCategory._count.products > 0 && (
                                    <span className="block mt-2 text-red-400">
                                        ⚠️ Advertencia: Hay {deletingCategory._count.products} productos asociados a esta categoría.
                                    </span>
                                )}
                            </p>
                            <div className="flex justify-end gap-3">
                                <Button variant="ghost" onClick={() => setDeletingCategory(null)} className="text-zinc-400 hover:text-white">
                                    Cancelar
                                </Button>
                                <Button onClick={confirmDelete} className="bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300">
                                    Eliminar definitivamente
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Left Column (40%) - Form */}
            <div className="lg:col-span-2">
                <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 sticky top-6">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-white">
                            {editingCategory ? "Editar categoría" : "Nueva categoría"}
                        </h3>
                        <p className="text-sm text-zinc-400 mt-1">
                            {editingCategory ? "Modificá el nombre de la categoría seleccionada." : "Creá una agrupación para tus productos."}
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <Label className="text-zinc-300 text-sm mb-2 block">Nombre de la categoría</Label>
                            <Input
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                                placeholder="Ej: Contactología, Sol, Receta..."
                                className="bg-zinc-800 border-zinc-700 focus:border-indigo-500 text-white transition-colors"
                            />
                            <p className="text-xs text-zinc-500 mt-2">
                                Ej: Receta, Sol, Contactología, Deportivos
                            </p>
                        </div>

                        <div className="pt-2 flex flex-col gap-2">
                            <Button
                                onClick={handleSave}
                                disabled={saving || !newName.trim()}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                                {editingCategory ? "Guardar cambios" : "Crear categoría"}
                            </Button>

                            {editingCategory && (
                                <Button
                                    variant="ghost"
                                    onClick={cancelEdit}
                                    className="w-full text-zinc-400 hover:text-white hover:bg-white/5"
                                >
                                    Cancelar edición
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column (60%) - List */}
            <div className="lg:col-span-3 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                    <h3 className="text-lg font-semibold text-white">Categorías existentes</h3>
                    <Badge className="bg-white/5 text-zinc-400 border-white/10 px-3 py-1 font-medium">
                        {categories.length} {categories.length === 1 ? 'categoría' : 'categorías'}
                    </Badge>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 bg-white/5 rounded-2xl border border-white/10 border-dashed">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-500/50 mb-4" />
                        <p className="text-sm text-zinc-400">Cargando categorías...</p>
                    </div>
                ) : categories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 bg-white/5 rounded-2xl border border-white/10 border-dashed text-center px-4">
                        <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4">
                            <FolderX className="w-8 h-8 text-indigo-400" />
                        </div>
                        <h4 className="text-white font-medium mb-1">Aún no hay categorías</h4>
                        <p className="text-sm text-zinc-400 max-w-xs">
                            Creá la primera categoría usando el formulario de la izquierda para comenzar a organizar tus productos.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {categories.map((cat) => (
                            <div
                                key={cat.id}
                                className={`flex items-center justify-between p-5 rounded-xl border transition-all duration-200 ${editingCategory?.id === cat.id
                                    ? "bg-indigo-500/10 border-indigo-500/30"
                                    : "bg-white/5 border-white/10 hover:bg-white/10"
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                                        <FolderOpen className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-medium">{cat.name}</h4>
                                        <p className="text-xs text-zinc-400 mt-1">
                                            {cat._count?.products || 0} {(cat._count?.products === 1) ? 'producto' : 'productos'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => startEdit(cat)}
                                        className="p-2 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                                        title="Editar categoría"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <div className="w-px h-6 bg-white/10 mx-1"></div>
                                    <button
                                        onClick={() => setDeletingCategory(cat)}
                                        className="p-2 rounded-lg hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                                        title="Eliminar categoría"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

// ─── Users Tab ────────────────────────────────────────────────────────────────
function UsersTab() {
    const [users, setUsers] = useState<User[]>([])
    const [filteredUsers, setFilteredUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    // Slideover State
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
        if (!searchQuery.trim()) {
            setFilteredUsers(users)
            return
        }
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
            if (editingUser && !form.password) {
                delete payload.password // Don't send empty password if editing
            }

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
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-zinc-900 border border-white/10 p-4 rounded-2xl">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input
                        placeholder="Buscar por nombre, email o rol..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-zinc-800 border-zinc-700 focus:border-indigo-500 text-white w-full"
                    />
                </div>
                <Button onClick={openCreateForm} className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2 w-full sm:w-auto shrink-0">
                    <Plus className="w-4 h-4" />
                    Nuevo usuario
                </Button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-zinc-900 rounded-2xl border border-white/10">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500/50 mb-4" />
                    <p className="text-sm text-zinc-400">Cargando usuarios...</p>
                </div>
            ) : filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-zinc-900 rounded-2xl border border-white/10 border-dashed text-center px-4">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                        <UserX className="w-8 h-8 text-zinc-500" />
                    </div>
                    <h4 className="text-white font-medium mb-1">No se encontraron usuarios</h4>
                    <p className="text-sm text-zinc-400 max-w-sm">
                        {searchQuery ? "No hay coincidencias para tu búsqueda actual." : "Creá el primer usuario para dar acceso al sistema."}
                    </p>
                </div>
            ) : (
                <div className="bg-zinc-900 rounded-2xl border border-white/10 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/[0.02]">
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
                                                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${user.role === "ADMIN" ? "bg-indigo-500/20 text-indigo-400" : "bg-zinc-700 text-zinc-300"
                                                    }`}>
                                                    <span className="text-sm font-bold">{user.name.charAt(0).toUpperCase()}</span>
                                                </div>
                                                <span className="text-sm font-medium text-white">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400 hidden md:table-cell">
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                                            <Badge className={`text-xs px-2.5 py-0.5 font-medium ${user.role === "ADMIN"
                                                ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20"
                                                : "bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700"
                                                }`}>
                                                {user.role}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge className={`text-xs px-2.5 py-0.5 font-medium ${user.active
                                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                : "bg-red-500/10 text-red-400 border-red-500/20"
                                                }`}>
                                                {user.active ? "Activo" : "Inactivo"}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => toggleStatus(user)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${user.active
                                                        ? "bg-white/5 text-zinc-400 hover:bg-red-500/10 hover:text-red-400"
                                                        : "bg-white/5 text-zinc-400 hover:bg-emerald-500/10 hover:text-emerald-400"
                                                        }`}
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
                            <Label className="text-zinc-300 text-sm mb-2 block">Nombre completo *</Label>
                            <Input
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="bg-zinc-800 border-zinc-700 focus:border-indigo-500 text-white"
                                placeholder="Ej: Juan García"
                                required
                            />
                        </div>
                        <div>
                            <Label className="text-zinc-300 text-sm mb-2 block">Correo electrónico *</Label>
                            <Input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="bg-zinc-800 border-zinc-700 focus:border-indigo-500 text-white"
                                placeholder="juan@optovision.com"
                                required
                            />
                        </div>
                        <div>
                            <Label className="text-zinc-300 text-sm mb-2 block">
                                {editingUser ? "Nueva contraseña (opcional)" : "Contraseña *"}
                            </Label>
                            <Input
                                type="password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                className="bg-zinc-800 border-zinc-700 focus:border-indigo-500 text-white"
                                placeholder={editingUser ? "Dejar en blanco para no cambiar" : "Mínimo 6 caracteres"}
                                required={!editingUser}
                                minLength={6}
                            />
                        </div>
                        <div>
                            <Label className="text-zinc-300 text-sm mb-2 block">Nivel de acceso *</Label>
                            <select
                                value={form.role}
                                onChange={(e) => setForm({ ...form, role: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 focus:border-indigo-500 text-white text-sm outline-none transition-colors"
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

                    {/* Sticky Footer */}
                    <div className="sticky bottom-0 mt-auto bg-[#0D0D14] py-4 px-6 border-t border-white/[0.06] flex justify-end gap-3 z-10 -mx-6 -mb-6">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsSlideoverOpen(false)}
                            className="text-zinc-400 hover:text-white hover:bg-white/5"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={saving}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white min-w-[140px]"
                        >
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
            toast.success("Configuración guardada satisfactoriamente")
        } catch {
            toast.error("Error al guardar")
        } finally {
            setSaving(false)
        }
    }

    if (!settings) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-zinc-900 rounded-2xl border border-white/10 max-w-2xl mx-auto">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500/50 mb-4" />
                <p className="text-sm text-zinc-400">Cargando configuración de la empresa...</p>
            </div>
        )
    }

    const inputClass = "bg-zinc-800 border-zinc-700 focus:border-indigo-500 text-white transition-colors"
    const labelClass = "text-zinc-300 text-sm font-medium mb-2 block"

    return (
        <div className="max-w-2xl mx-auto bg-zinc-900 border border-white/10 rounded-2xl p-6 md:p-8 relative">
            <h3 className="text-xl font-semibold text-white mb-2">Perfil de la Óptica</h3>
            <p className="text-sm text-zinc-400 mb-8">Estos datos aparecerán en los remitos, facturas y correos enviados a tus clientes.</p>

            <div className="space-y-8">
                {/* Section 1: Info General */}
                <section>
                    <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Información general</h4>
                    <div className="space-y-4">
                        <div>
                            <Label className={labelClass}>Nombre Comercial de la Empresa</Label>
                            <Input
                                value={settings.name || ""}
                                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                                className={inputClass}
                                placeholder="Ej: Optovision Plus S.A."
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label className={labelClass}>Teléfono de contacto</Label>
                                <Input
                                    value={settings.phone || ""}
                                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                                    className={inputClass}
                                    placeholder="+54 11 1234-5678"
                                />
                            </div>
                            <div>
                                <Label className={labelClass}>Email comercial</Label>
                                <Input
                                    type="email"
                                    value={settings.email || ""}
                                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                                    className={inputClass}
                                    placeholder="contacto@optica.com"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 2: Dirección */}
                <section>
                    <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Dirección Física</h4>
                    <div className="space-y-4">
                        <div>
                            <Label className={labelClass}>Calle y número</Label>
                            <Input
                                value={settings.address || ""}
                                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                                className={inputClass}
                                placeholder="Av. Corrientes 1234, CABA"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label className={labelClass}>Provincia / Estado</Label>
                                <Input
                                    className={inputClass}
                                    placeholder="Buenos Aires"
                                />
                            </div>
                            <div>
                                <Label className={labelClass}>Código Postal</Label>
                                <Input
                                    className={inputClass}
                                    placeholder="1043"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 3: Logo */}
                <section>
                    <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Identidad Visual</h4>
                    <div>
                        <Label className={labelClass}>Logo de la empresa</Label>
                        <div className="flex items-start gap-4">
                            <div className="w-24 h-24 rounded-xl bg-zinc-800 border border-white/10 border-dashed flex items-center justify-center shrink-0">
                                <Building2 className="w-8 h-8 text-zinc-600" />
                            </div>
                            <div className="flex-1">
                                <Label className="inline-flex items-center justify-center px-4 py-2 border border-white/10 rounded-lg bg-zinc-800 hover:bg-zinc-700 hover:text-white text-sm text-zinc-300 transition-colors cursor-pointer cursor-not-allowed opacity-50">
                                    Subir nuevo logo
                                    <input type="file" className="hidden" disabled />
                                </Label>
                                <p className="text-xs text-zinc-500 mt-2">
                                    Recomendado: Archivo PNG o JPG con fondo transparente. Tamaño máximo 2MB. Función en desarrollo.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    size="lg"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white min-w-[200px]"
                >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                    Guardar configuración
                </Button>
            </div>
        </div>
    )
}

// ─── Custom Pill Tabs ────────────────────────────────────────────────────────
interface Tab {
    id: string
    label: string
    icon: React.ElementType
}

const TABS: Tab[] = [
    { id: "categorias", label: "Categorías", icon: FolderOpen },
    { id: "usuarios", label: "Usuarios", icon: Users },
    { id: "empresa", label: "Empresa", icon: Building2 },
]

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ConfiguracionPage() {
    const { data: session } = useSession()
    const isAdmin = (session?.user as any)?.role === "ADMIN"
    const [activeTab, setActiveTab] = useState(TABS[0].id)

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center py-24">
                <ShieldAlert className="w-16 h-16 text-red-400 mb-6" />
                <h2 className="text-2xl font-bold text-white mb-2">Acceso denegado</h2>
                <p className="text-zinc-400 max-w-md text-center">No tenés los permisos suficientes para acceder a la configuración del sistema. Contactá a un administrador.</p>
            </div>
        )
    }

    return (
        <div className="animate-fade-in pb-10">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white tracking-tight">Configuración General</h1>
                <p className="text-base text-zinc-400 mt-2">Administrá los ajustes fundamentales de tu óptica, inventario y equipo.</p>
            </div>

            {/* Pill Tabs Navigation */}
            <div className="mb-8 overflow-x-auto pb-2 scrollbar-hide">
                <div className="flex space-x-2 bg-zinc-900/50 p-1.5 rounded-full border border-white/5 inline-flex backdrop-blur-sm">
                    {TABS.map((tab) => {
                        const Icon = tab.icon
                        const isActive = activeTab === tab.id

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 outline-none
                                    ${isActive ? 'text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'}
                                `}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="pill-bubble"
                                        className="absolute inset-0 bg-indigo-600/20 border border-indigo-500/30 rounded-full"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <Icon className={`w-4 h-4 relative z-10 ${isActive ? 'text-indigo-400' : ''}`} />
                                <span className="relative z-10">{tab.label}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Tab Content with Animation */}
            <div className="relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                        {activeTab === "categorias" && <CategoriesTab />}
                        {activeTab === "usuarios" && <UsersTab />}
                        {activeTab === "empresa" && <SettingsTab />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}
