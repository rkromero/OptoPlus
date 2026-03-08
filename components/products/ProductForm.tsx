"use client"

import { useEffect, useState, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Upload, X, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import Image from "next/image"

const schema = z.object({
    name: z.string().min(1, "Nombre requerido"),
    model: z.string().min(1, "Modelo requerido"),
    color: z.string().optional(),
    brand: z.string().optional(),
    description: z.string().optional(),
    priceList: z.coerce.number().min(0, "Precio requerido"),
    priceCost: z.coerce.number().optional(),
    stock: z.coerce.number().int().min(0, "Stock requerido"),
    categoryId: z.string().min(1, "Categoría requerida"),
    active: z.boolean().default(true),
})

type FormData = z.infer<typeof schema>

interface Category {
    id: string
    name: string
}

interface ProductFormProps {
    product?: any
    onSuccess: () => void
    onCancel: () => void
}

export default function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
    const [categories, setCategories] = useState<Category[]>([])
    const [imageUrl, setImageUrl] = useState(product?.imageUrl || "")
    const [imagePreview, setImagePreview] = useState(product?.imageUrl || "")
    const [uploading, setUploading] = useState(false)
    const [loading, setLoading] = useState(false)

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema) as any,
        defaultValues: {
            name: product?.name || "",
            model: product?.model || "",
            color: product?.color || "",
            brand: product?.brand || "",
            description: product?.description || "",
            priceList: product?.priceList || 0,
            priceCost: product?.priceCost || undefined,
            stock: product?.stock || 0,
            categoryId: product?.categoryId || "",
            active: product?.active ?? true,
        },
    })

    useEffect(() => {
        fetch("/api/categories")
            .then((r) => r.json())
            .then(setCategories)
            .catch(() => toast.error("Error cargando categorías"))
    }, [])

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
            const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

            const formData = new FormData()
            formData.append("file", file)
            formData.append("upload_preset", preset || "ml_default")

            const res = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                { method: "POST", body: formData }
            )
            const data = await res.json()
            setImageUrl(data.secure_url)
            setImagePreview(data.secure_url)
            toast.success("Imagen subida")
        } catch {
            toast.error("Error al subir imagen")
        } finally {
            setUploading(false)
        }
    }

    const onSubmit = async (data: FormData) => {
        setLoading(true)
        try {
            const url = product ? `/api/products/${product.id}` : "/api/products"
            const method = product ? "PUT" : "POST"

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...data, imageUrl: imageUrl || null }),
            })

            if (!res.ok) throw new Error()
            toast.success(product ? "Producto actualizado" : "Producto creado")
            onSuccess()
        } catch {
            toast.error("Error al guardar el producto")
        } finally {
            setLoading(false)
        }
    }

    const activeValue = watch("active")

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-24">
            {/* Image upload */}
            <div>
                <Label className="text-slate-300 mb-2 block">Foto del producto</Label>
                <div className="flex items-start gap-4">
                    <div className="w-20 h-20 rounded-lg bg-white/[0.03] border border-white/[0.08] flex items-center justify-center overflow-hidden flex-shrink-0">
                        {imagePreview ? (
                            <div className="relative w-full h-full">
                                <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                                <button
                                    type="button"
                                    onClick={() => { setImageUrl(""); setImagePreview("") }}
                                    className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center hover:bg-black cursor-pointer"
                                >
                                    <X className="w-3 h-3 text-white" />
                                </button>
                            </div>
                        ) : (
                            <ImageIcon className="w-6 h-6 text-slate-600" />
                        )}
                    </div>
                    <label className="flex-1">
                        <div className="flex items-center gap-2 px-3 py-2 border border-white/[0.08] border-dashed rounded-lg hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-colors cursor-pointer">
                            {uploading ? (
                                <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                            ) : (
                                <Upload className="w-4 h-4 text-slate-500" />
                            )}
                            <span className="text-sm text-slate-400">
                                {uploading ? "Subiendo..." : "Subir imagen"}
                            </span>
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={handleImageUpload}
                            disabled={uploading}
                        />
                    </label>
                </div>
            </div>

            {/* Name & Model */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="name" className="text-slate-300 text-sm">Nombre *</Label>
                    <Input
                        id="name"
                        {...register("name")}
                        className="mt-1.5 bg-white/[0.03] border-white/[0.08] focus:border-indigo-500/50 text-white"
                        placeholder="Ej: Ray-Ban Wayfarer"
                    />
                    {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
                </div>
                <div>
                    <Label htmlFor="model" className="text-slate-300 text-sm">Modelo *</Label>
                    <Input
                        id="model"
                        {...register("model")}
                        className="mt-1.5 bg-white/[0.03] border-white/[0.08] focus:border-indigo-500/50 text-white"
                        placeholder="Ej: RB2140"
                    />
                    {errors.model && <p className="text-xs text-red-400 mt-1">{errors.model.message}</p>}
                </div>
            </div>

            {/* Color & Brand */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="color" className="text-slate-300 text-sm">Color</Label>
                    <Input
                        id="color"
                        {...register("color")}
                        className="mt-1.5 bg-white/[0.03] border-white/[0.08] focus:border-indigo-500/50 text-white"
                        placeholder="Ej: Negro mate"
                    />
                </div>
                <div>
                    <Label htmlFor="brand" className="text-slate-300 text-sm">Marca</Label>
                    <Input
                        id="brand"
                        {...register("brand")}
                        className="mt-1.5 bg-white/[0.03] border-white/[0.08] focus:border-indigo-500/50 text-white"
                        placeholder="Ej: Ray-Ban"
                    />
                </div>
            </div>

            {/* Category */}
            <div>
                <Label className="text-slate-300 text-sm">Categoría *</Label>
                <Select
                    defaultValue={product?.categoryId}
                    onValueChange={(v) => setValue("categoryId", v)}
                >
                    <SelectTrigger className="mt-1.5 bg-white/[0.03] border-white/[0.08] text-white">
                        <SelectValue placeholder="Seleccioná una categoría" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111118] border-white/[0.08]">
                        {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id} className="text-slate-200">
                                {cat.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.categoryId && <p className="text-xs text-red-400 mt-1">{errors.categoryId.message}</p>}
            </div>

            {/* Prices & Stock */}
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <Label htmlFor="priceList" className="text-slate-300 text-sm">Precio Lista *</Label>
                    <div className="relative mt-1.5">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
                        <Input
                            id="priceList"
                            type="number"
                            step="0.01"
                            {...register("priceList")}
                            className="pl-7 bg-white/[0.03] border-white/[0.08] focus:border-indigo-500/50 text-white"
                        />
                    </div>
                    {errors.priceList && <p className="text-xs text-red-400 mt-1">{errors.priceList.message}</p>}
                </div>
                <div>
                    <Label htmlFor="priceCost" className="text-slate-300 text-sm">Precio Costo</Label>
                    <div className="relative mt-1.5">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
                        <Input
                            id="priceCost"
                            type="number"
                            step="0.01"
                            {...register("priceCost")}
                            className="pl-7 bg-white/[0.03] border-white/[0.08] focus:border-indigo-500/50 text-white"
                        />
                    </div>
                </div>
                <div>
                    <Label htmlFor="stock" className="text-slate-300 text-sm">Stock *</Label>
                    <Input
                        id="stock"
                        type="number"
                        {...register("stock")}
                        className="mt-1.5 bg-white/[0.03] border-white/[0.08] focus:border-indigo-500/50 text-white"
                    />
                    {errors.stock && <p className="text-xs text-red-400 mt-1">{errors.stock.message}</p>}
                </div>
            </div>

            {/* Description */}
            <div>
                <Label htmlFor="description" className="text-slate-300 text-sm">Descripción</Label>
                <Textarea
                    id="description"
                    {...register("description")}
                    rows={3}
                    className="mt-1.5 bg-white/[0.03] border-white/[0.08] focus:border-indigo-500/50 text-white resize-none"
                    placeholder="Descripción opcional del producto..."
                />
            </div>

            {/* Active toggle */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                <button
                    type="button"
                    onClick={() => setValue("active", !activeValue)}
                    className={`relative w-10 h-5 rounded-full transition-colors duration-200 flex-shrink-0 cursor-pointer ${activeValue ? "bg-indigo-500" : "bg-white/10"
                        }`}
                    aria-checked={activeValue}
                    role="switch"
                >
                    <span
                        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${activeValue ? "translate-x-5" : "translate-x-0.5"
                            }`}
                    />
                </button>
                <div>
                    <p className="text-sm text-slate-200 font-medium">Producto activo</p>
                    <p className="text-xs text-slate-500">Los productos inactivos no aparecen en pedidos</p>
                </div>
            </div>

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
                    disabled={loading || uploading}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white min-w-[120px]"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Guardando...
                        </>
                    ) : product ? (
                        "Actualizar producto"
                    ) : (
                        "Crear producto"
                    )}
                </Button>
            </div>
        </form>
    )
}
