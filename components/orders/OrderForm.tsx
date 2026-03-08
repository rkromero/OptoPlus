"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Search, Plus, Minus, Trash2, Package, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"

interface OrderItem {
    productId: string
    productName: string
    quantity: number
    unitPrice: number
    stock: number
}

interface Client {
    id: string
    fullName: string
    dni?: string
}

interface Product {
    id: string
    name: string
    model: string
    priceList: number
    stock: number
    category: { name: string }
}

interface OrderFormProps {
    onSuccess: () => void
    onCancel: () => void
}

export default function OrderForm({ onSuccess, onCancel }: OrderFormProps) {
    const [loading, setLoading] = useState(false)
    const [clientSearch, setClientSearch] = useState("")
    const [clientResults, setClientResults] = useState<Client[]>([])
    const [selectedClient, setSelectedClient] = useState<Client | null>(null)
    const [productSearch, setProductSearch] = useState("")
    const [productResults, setProductResults] = useState<Product[]>([])
    const [items, setItems] = useState<OrderItem[]>([])
    const [discount, setDiscount] = useState(0)
    const [notes, setNotes] = useState("")
    const [showClientResults, setShowClientResults] = useState(false)
    const [showProductResults, setShowProductResults] = useState(false)

    // Search clients
    useEffect(() => {
        if (clientSearch.length < 2) { setClientResults([]); return }
        const t = setTimeout(async () => {
            const res = await fetch(`/api/clients?search=${encodeURIComponent(clientSearch)}&limit=8`)
            const data = await res.json()
            setClientResults(data.clients || [])
            setShowClientResults(true)
        }, 300)
        return () => clearTimeout(t)
    }, [clientSearch])

    // Search products
    useEffect(() => {
        if (productSearch.length < 2) { setProductResults([]); return }
        const t = setTimeout(async () => {
            const res = await fetch(`/api/products?search=${encodeURIComponent(productSearch)}&limit=8&stock=disponible`)
            const data = await res.json()
            setProductResults(data.products || [])
            setShowProductResults(true)
        }, 300)
        return () => clearTimeout(t)
    }, [productSearch])

    const addProduct = (product: Product) => {
        const existing = items.find((i) => i.productId === product.id)
        if (existing) {
            setItems(items.map((i) =>
                i.productId === product.id
                    ? { ...i, quantity: Math.min(i.quantity + 1, i.stock) }
                    : i
            ))
        } else {
            setItems([...items, {
                productId: product.id,
                productName: `${product.name} — ${product.model}`,
                quantity: 1,
                unitPrice: product.priceList,
                stock: product.stock,
            }])
        }
        setProductSearch("")
        setShowProductResults(false)
    }

    const updateQty = (productId: string, delta: number) => {
        setItems(items
            .map((i) => i.productId === productId
                ? { ...i, quantity: Math.max(1, Math.min(i.quantity + delta, i.stock)) }
                : i
            )
        )
    }

    const removeItem = (productId: string) => {
        setItems(items.filter((i) => i.productId !== productId))
    }

    const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0)
    const discountAmount = subtotal * (discount / 100)
    const total = subtotal - discountAmount

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedClient) { toast.error("Seleccioná un cliente"); return }
        if (items.length === 0) { toast.error("Agregá al menos un producto"); return }

        setLoading(true)
        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    clientId: selectedClient.id,
                    items: items.map(({ productId, quantity, unitPrice }) => ({
                        productId,
                        quantity,
                        unitPrice,
                    })),
                    discount,
                    notes,
                }),
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Error al crear pedido")
            toast.success(`Pedido #${data.orderNumber} creado`)
            onSuccess()
        } catch (err: any) {
            toast.error(err.message || "Error al crear el pedido")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 pb-24">
            {/* Step 1: Client */}
            <div>
                <Label className="text-slate-300 text-sm font-medium mb-2 block">
                    1. Seleccioná el cliente
                </Label>
                {selectedClient ? (
                    <div className="flex items-center justify-between p-3 surface rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/15 flex items-center justify-center">
                                <span className="text-xs font-bold text-indigo-300">
                                    {selectedClient.fullName.charAt(0)}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white">{selectedClient.fullName}</p>
                                {selectedClient.dni && <p className="text-xs text-slate-500">DNI: {selectedClient.dni}</p>}
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setSelectedClient(null)}
                            className="text-xs text-slate-500 hover:text-slate-300 cursor-pointer transition-colors"
                        >
                            Cambiar
                        </button>
                    </div>
                ) : (
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <Input
                            placeholder="Buscá por nombre o DNI..."
                            value={clientSearch}
                            onChange={(e) => setClientSearch(e.target.value)}
                            className="pl-9 bg-white/[0.03] border-white/[0.08] text-white"
                        />
                        {showClientResults && clientResults.length > 0 && (
                            <div className="absolute z-50 top-full mt-1 w-full bg-[#111118] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden">
                                {clientResults.map((client) => (
                                    <button
                                        key={client.id}
                                        type="button"
                                        onClick={() => { setSelectedClient(client); setClientSearch(""); setShowClientResults(false) }}
                                        className="w-full text-left px-4 py-2.5 hover:bg-white/[0.05] transition-colors cursor-pointer"
                                    >
                                        <p className="text-sm text-white">{client.fullName}</p>
                                        {client.dni && <p className="text-xs text-slate-500">DNI: {client.dni}</p>}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Step 2: Products */}
            <div>
                <Label className="text-slate-300 text-sm font-medium mb-2 block">
                    2. Agregá productos
                </Label>
                <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                        placeholder="Buscar producto por nombre o modelo..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="pl-9 bg-white/[0.03] border-white/[0.08] text-white"
                    />
                    {showProductResults && productResults.length > 0 && (
                        <div className="absolute z-50 top-full mt-1 w-full bg-[#111118] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden">
                            {productResults.map((product) => (
                                <button
                                    key={product.id}
                                    type="button"
                                    onClick={() => addProduct(product)}
                                    className="w-full text-left px-4 py-2.5 hover:bg-white/[0.05] transition-colors cursor-pointer"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-white">{product.name}</p>
                                            <p className="text-xs text-slate-500">{product.model} · {product.category.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-indigo-300">{formatCurrency(product.priceList)}</p>
                                            <p className="text-xs text-slate-500">Stock: {product.stock}</p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Selected items */}
                {items.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-white/[0.08] rounded-xl">
                        <Package className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                        <p className="text-sm text-slate-600">Usá el buscador para agregar productos</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {items.map((item) => (
                            <div key={item.productId} className="flex items-center gap-3 surface p-3 rounded-xl">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{item.productName}</p>
                                    <p className="text-xs text-slate-500">{formatCurrency(item.unitPrice)} c/u</p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => updateQty(item.productId, -1)}
                                        className="w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                                    >
                                        <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="w-8 text-center text-sm font-semibold text-white">{item.quantity}</span>
                                    <button
                                        type="button"
                                        onClick={() => updateQty(item.productId, 1)}
                                        disabled={item.quantity >= item.stock}
                                        className="w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer disabled:opacity-40"
                                    >
                                        <Plus className="w-3 h-3" />
                                    </button>
                                </div>
                                <span className="text-sm font-semibold text-white w-20 text-right">
                                    {formatCurrency(item.quantity * item.unitPrice)}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => removeItem(item.productId)}
                                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Step 3: Discount & Notes */}
            {items.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label className="text-slate-300 text-sm">Descuento (%)</Label>
                        <Input
                            type="number"
                            min="0"
                            max="100"
                            value={discount}
                            onChange={(e) => setDiscount(Number(e.target.value))}
                            className="mt-1.5 bg-white/[0.03] border-white/[0.08] text-white"
                        />
                    </div>
                    <div>
                        <Label className="text-slate-300 text-sm">Notas</Label>
                        <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={1}
                            className="mt-1.5 bg-white/[0.03] border-white/[0.08] text-white resize-none"
                            placeholder="Opcional..."
                        />
                    </div>
                </div>
            )}

            {/* Totals */}
            {items.length > 0 && (
                <div className="surface rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-sm text-slate-400">
                        <span>Subtotal</span>
                        <span>{formatCurrency(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                        <div className="flex justify-between text-sm text-emerald-400">
                            <span>Descuento ({discount}%)</span>
                            <span>- {formatCurrency(discountAmount)}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-base font-bold text-white border-t border-white/[0.08] pt-2 mt-2">
                        <span>Total</span>
                        <span className="text-indigo-300">{formatCurrency(total)}</span>
                    </div>
                </div>
            )}

            {/* Actions - Sticky Footer */}
            <div className="fixed bottom-0 right-0 left-0 bg-[#0D0D14] p-6 border-t border-white/[0.06] flex justify-end gap-3 z-10">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onCancel}
                    className="text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]"
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    disabled={loading || !selectedClient || items.length === 0}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white min-w-[140px]"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Creando pedido...
                        </>
                    ) : (
                        "Crear pedido"
                    )}
                </Button>
            </div>
        </form>
    )
}
