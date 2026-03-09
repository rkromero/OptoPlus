"use client"

import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2, Loader2, FolderOpen, FolderX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

interface Category { id: string; name: string; _count?: { products: number } }

export default function CategoriesTab() {
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
                            <p className="text-xs text-zinc-500 mt-2">Ej: Receta, Sol, Contactología, Deportivos</p>
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
                                <Button variant="ghost" onClick={cancelEdit} className="w-full text-zinc-400 hover:text-white hover:bg-white/5">
                                    Cancelar edición
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

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
