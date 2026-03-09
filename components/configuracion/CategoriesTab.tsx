"use client"

import { useState, useEffect, useRef } from "react"
import { Plus, Pencil, Trash2, Loader2, Check, X, Tag } from "lucide-react"
import { toast } from "sonner"

interface Category { id: string; name: string; _count?: { products: number } }

export default function CategoriesTab() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [newName, setNewName] = useState("")
    const [adding, setAdding] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editingName, setEditingName] = useState("")
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
    const newInputRef = useRef<HTMLInputElement>(null)
    const editInputRef = useRef<HTMLInputElement>(null)

    const load = async () => {
        setLoading(true)
        const res = await fetch("/api/categories")
        setCategories(await res.json())
        setLoading(false)
    }

    useEffect(() => { load() }, [])
    useEffect(() => { if (editingId) editInputRef.current?.focus() }, [editingId])

    const handleAdd = async () => {
        if (!newName.trim()) return
        setAdding(true)
        try {
            const res = await fetch("/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newName.trim() }),
            })
            if (!res.ok) throw new Error()
            setNewName("")
            toast.success("Categoría creada")
            load()
            newInputRef.current?.focus()
        } catch {
            toast.error("Error al crear categoría")
        } finally {
            setAdding(false)
        }
    }

    const handleEdit = async (id: string) => {
        if (!editingName.trim()) { cancelEdit(); return }
        try {
            const res = await fetch(`/api/categories/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: editingName.trim() }),
            })
            if (!res.ok) throw new Error()
            toast.success("Categoría actualizada")
            cancelEdit()
            load()
        } catch {
            toast.error("Error al actualizar")
        }
    }

    const startEdit = (cat: Category) => {
        setEditingId(cat.id)
        setEditingName(cat.name)
        setConfirmDeleteId(null)
    }

    const cancelEdit = () => {
        setEditingId(null)
        setEditingName("")
    }

    const handleDelete = async (id: string) => {
        setDeletingId(id)
        try {
            await fetch(`/api/categories/${id}`, { method: "DELETE" })
            toast.success("Categoría eliminada")
            setConfirmDeleteId(null)
            load()
        } catch {
            toast.error("Error al eliminar")
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <div className="max-w-xl space-y-4">

            {/* ── Add input ───────────────────────────────── */}
            <div className="flex gap-2">
                <input
                    ref={newInputRef}
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                    placeholder="Nueva categoría..."
                    className="flex-1 h-9 px-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500/60 focus:bg-white/[0.06] transition-all"
                />
                <button
                    onClick={handleAdd}
                    disabled={adding || !newName.trim()}
                    className="h-9 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                    {adding
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <Plus className="w-3.5 h-3.5" />}
                    Agregar
                </button>
            </div>

            {/* ── List ────────────────────────────────────── */}
            {loading ? (
                <div className="flex items-center gap-3 py-8 justify-center text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Cargando...</span>
                </div>
            ) : categories.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 rounded-xl border border-dashed border-white/[0.08] text-center">
                    <Tag className="w-8 h-8 text-slate-600 mb-3" />
                    <p className="text-sm text-slate-400 font-medium">Sin categorías</p>
                    <p className="text-xs text-slate-600 mt-1">Escribí un nombre arriba y presioná Agregar</p>
                </div>
            ) : (
                <div className="rounded-xl border border-white/[0.06] overflow-hidden divide-y divide-white/[0.04]">
                    {/* count header */}
                    <div className="px-4 py-2.5 bg-white/[0.02] flex items-center justify-between">
                        <span className="text-xs text-slate-500">
                            {categories.length} {categories.length === 1 ? "categoría" : "categorías"}
                        </span>
                    </div>

                    {categories.map((cat) => {
                        const isEditing = editingId === cat.id
                        const isConfirmingDelete = confirmDeleteId === cat.id
                        const isDeleting = deletingId === cat.id

                        return (
                            <div key={cat.id} className="flex items-center gap-3 px-4 py-3 group hover:bg-white/[0.02] transition-colors">

                                {isEditing ? (
                                    /* ── Inline edit mode ── */
                                    <>
                                        <input
                                            ref={editInputRef}
                                            value={editingName}
                                            onChange={(e) => setEditingName(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") handleEdit(cat.id)
                                                if (e.key === "Escape") cancelEdit()
                                            }}
                                            className="flex-1 h-8 px-2.5 rounded-md bg-white/[0.06] border border-indigo-500/40 text-sm text-white outline-none focus:border-indigo-500/80 transition-all"
                                        />
                                        <button
                                            onClick={() => handleEdit(cat.id)}
                                            className="p-1.5 rounded-md bg-indigo-500/15 text-indigo-400 hover:bg-indigo-500/25 transition-colors cursor-pointer"
                                            title="Guardar"
                                        >
                                            <Check className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={cancelEdit}
                                            className="p-1.5 rounded-md hover:bg-white/[0.06] text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                                            title="Cancelar"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </>
                                ) : isConfirmingDelete ? (
                                    /* ── Delete confirm mode ── */
                                    <>
                                        <span className="flex-1 text-sm text-slate-300">
                                            ¿Eliminar <span className="font-medium text-white">"{cat.name}"</span>?
                                            {cat._count && cat._count.products > 0 && (
                                                <span className="text-amber-400 ml-1">({cat._count.products} productos)</span>
                                            )}
                                        </span>
                                        <button
                                            onClick={() => handleDelete(cat.id)}
                                            disabled={isDeleting}
                                            className="px-3 h-7 rounded-md bg-red-500/15 text-red-400 hover:bg-red-500/25 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
                                        >
                                            {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : "Eliminar"}
                                        </button>
                                        <button
                                            onClick={() => setConfirmDeleteId(null)}
                                            className="px-3 h-7 rounded-md hover:bg-white/[0.06] text-slate-400 text-xs font-medium transition-colors cursor-pointer"
                                        >
                                            Cancelar
                                        </button>
                                    </>
                                ) : (
                                    /* ── Normal mode ── */
                                    <>
                                        <span className="flex-1 text-sm text-slate-200 font-medium">{cat.name}</span>
                                        <span className="text-xs text-slate-600 mr-2">
                                            {cat._count?.products ?? 0} prod.
                                        </span>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => startEdit(cat)}
                                                className="p-1.5 rounded-md hover:bg-white/[0.06] text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                                                title="Editar"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => setConfirmDeleteId(cat.id)}
                                                className="p-1.5 rounded-md hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
