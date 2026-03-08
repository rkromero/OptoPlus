"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Search, Package, AlertTriangle, Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import Slideover from "@/components/layout/Slideover"
import ProductForm from "@/components/products/ProductForm"
import { toast } from "sonner"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { formatCurrency } from "@/lib/utils"

interface Product {
    id: string
    name: string
    model: string
    color?: string
    brand?: string
    imageUrl?: string
    priceList: number
    stock: number
    active: boolean
    category: { id: string; name: string }
}

interface Category {
    id: string
    name: string
}

export default function InventarioPage() {
    const { data: session } = useSession()
    const isAdmin = (session?.user as any)?.role === "ADMIN"

    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [categoryFilter, setCategoryFilter] = useState("")
    const [stockFilter, setStockFilter] = useState("")
    const [page, setPage] = useState(1)
    const [isSlideoverOpen, setIsSlideoverOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)

    const limit = 15

    const fetchProducts = useCallback(async () => {
        setLoading(true)
        const params = new URLSearchParams({
            page: String(page),
            limit: String(limit),
            ...(search && { search }),
            ...(categoryFilter && { categoryId: categoryFilter }),
            ...(stockFilter && { stock: stockFilter }),
        })
        try {
            const res = await fetch(`/api/products?${params}`)
            const data = await res.json()
            setProducts(data.products)
            setTotal(data.total)
        } catch {
            toast.error("Error cargando productos")
        } finally {
            setLoading(false)
        }
    }, [page, search, categoryFilter, stockFilter])

    useEffect(() => {
        fetchProducts()
    }, [fetchProducts])

    useEffect(() => {
        fetch("/api/categories")
            .then((r) => r.json())
            .then(setCategories)
    }, [])

    const handleDelete = async (id: string) => {
        if (!confirm("¿Eliminar este producto?")) return
        try {
            await fetch(`/api/products/${id}`, { method: "DELETE" })
            toast.success("Producto eliminado")
            fetchProducts()
        } catch {
            toast.error("Error al eliminar")
        }
    }

    const handleEdit = (product: Product) => {
        setEditingProduct(product)
        setIsSlideoverOpen(true)
    }

    const handleSuccess = () => {
        setIsSlideoverOpen(false)
        setEditingProduct(null)
        fetchProducts()
    }

    const totalPages = Math.ceil(total / limit)

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">Inventario</h1>
                    <p className="text-sm text-slate-400 mt-1">Gestioná los anteojos y accesorios</p>
                </div>
                <Button
                    onClick={() => { setEditingProduct(null); setIsSlideoverOpen(true) }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Nuevo Producto
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                        placeholder="Buscar por nombre, modelo, marca..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                        className="pl-9 bg-white/[0.03] border-white/[0.08] text-white placeholder:text-slate-600"
                    />
                </div>

                {/* Category filter */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => { setCategoryFilter(""); setPage(1) }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${!categoryFilter
                                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                                : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]"
                            }`}
                    >
                        Todos
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => { setCategoryFilter(cat.id); setPage(1) }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${categoryFilter === cat.id
                                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]"
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Stock filter */}
                <select
                    value={stockFilter}
                    onChange={(e) => { setStockFilter(e.target.value); setPage(1) }}
                    className="px-3 py-1.5 rounded-lg text-xs bg-white/[0.03] border border-white/[0.08] text-slate-300 cursor-pointer"
                >
                    <option value="">Todo el stock</option>
                    <option value="disponible">Disponible</option>
                    <option value="sinstock">Sin stock</option>
                </select>

                <span className="text-xs text-slate-500 ml-auto">
                    {total} producto{total !== 1 ? "s" : ""}
                </span>
            </div>

            {/* Table */}
            <div className="surface rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/[0.06]">
                            <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Producto</th>
                            <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Modelo</th>
                            <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Categoría</th>
                            <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Precio</th>
                            <th className="text-center text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Stock</th>
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
                        ) : products.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-16">
                                    <Package className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                                    <p className="text-slate-400 font-medium">No hay productos</p>
                                    <p className="text-sm text-slate-600 mt-1">
                                        {search ? "Probá con otra búsqueda" : "Creá tu primer producto"}
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            products.map((product) => (
                                <tr key={product.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg overflow-hidden bg-white/[0.04] border border-white/[0.06] flex-shrink-0">
                                                {product.imageUrl ? (
                                                    <Image src={product.imageUrl} alt={product.name} width={36} height={36} className="object-cover w-full h-full" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Package className="w-4 h-4 text-slate-600" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-white">{product.name}</p>
                                                {product.color && <p className="text-xs text-slate-500">{product.color}</p>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 hidden md:table-cell">
                                        <span className="text-sm text-slate-400">{product.model}</span>
                                    </td>
                                    <td className="px-4 py-3 hidden lg:table-cell">
                                        <Badge variant="outline" className="text-xs border-white/[0.1] text-slate-400">
                                            {product.category.name}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <span className="text-sm font-medium text-white">{formatCurrency(product.priceList)}</span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {product.stock <= 0 ? (
                                            <Badge className="bg-red-500/15 text-red-400 border-red-500/20 text-xs">Sin stock</Badge>
                                        ) : product.stock < 5 ? (
                                            <Badge className="bg-yellow-500/15 text-yellow-400 border-yellow-500/20 text-xs gap-1">
                                                <AlertTriangle className="w-3 h-3" />
                                                {product.stock}
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20 text-xs">
                                                {product.stock}
                                            </Badge>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEdit(product)}
                                                className="p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                                                aria-label="Editar producto"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            {isAdmin && (
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                                                    aria-label="Eliminar producto"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
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
                        <span className="text-xs text-slate-400">
                            {page} / {totalPages}
                        </span>
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

            {/* Slideover */}
            <Slideover
                isOpen={isSlideoverOpen}
                onClose={() => { setIsSlideoverOpen(false); setEditingProduct(null) }}
                title={editingProduct ? "Editar Producto" : "Nuevo Producto"}
                description="Completá los datos del producto"
                width="xl"
            >
                <ProductForm
                    product={editingProduct}
                    onSuccess={handleSuccess}
                    onCancel={() => { setIsSlideoverOpen(false); setEditingProduct(null) }}
                />
            </Slideover>
        </div>
    )
}
