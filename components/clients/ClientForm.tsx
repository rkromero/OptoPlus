"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

const schema = z.object({
    fullName: z.string().min(1, "El nombre es requerido"),
    dni: z.string().optional(),
    email: z.string().email("Email inválido").optional().or(z.literal("")),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    province: z.string().optional(),
    notes: z.string().optional(),
    odSphere: z.coerce.number().optional().nullable(),
    odCylinder: z.coerce.number().optional().nullable(),
    odAxis: z.coerce.number().int().optional().nullable(),
    oiSphere: z.coerce.number().optional().nullable(),
    oiCylinder: z.coerce.number().optional().nullable(),
    oiAxis: z.coerce.number().int().optional().nullable(),
})

type FormData = z.infer<typeof schema>

interface ClientFormProps {
    client?: any
    onSuccess: () => void
    onCancel: () => void
}

function FormField({
    label,
    id,
    error,
    children,
}: {
    label: string
    id?: string
    error?: string
    children: React.ReactNode
}) {
    return (
        <div>
            {id ? (
                <Label htmlFor={id} className="text-slate-300 text-sm">{label}</Label>
            ) : (
                <span className="text-slate-300 text-sm">{label}</span>
            )}
            <div className="mt-1.5">{children}</div>
            {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
        </div>
    )
}

export default function ClientForm({ client, onSuccess, onCancel }: ClientFormProps) {
    const [loading, setLoading] = useState(false)
    const [showPrescription, setShowPrescription] = useState(
        !!(client?.odSphere || client?.oiSphere)
    )

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema) as any,
        defaultValues: {
            fullName: client?.fullName || "",
            dni: client?.dni || "",
            email: client?.email || "",
            phone: client?.phone || "",
            address: client?.address || "",
            city: client?.city || "",
            province: client?.province || "",
            notes: client?.notes || "",
            odSphere: client?.odSphere ?? null,
            odCylinder: client?.odCylinder ?? null,
            odAxis: client?.odAxis ?? null,
            oiSphere: client?.oiSphere ?? null,
            oiCylinder: client?.oiCylinder ?? null,
            oiAxis: client?.oiAxis ?? null,
        },
    })

    const onSubmit = async (data: FormData) => {
        setLoading(true)
        try {
            const url = client ? `/api/clients/${client.id}` : "/api/clients"
            const method = client ? "PUT" : "POST"

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })

            if (!res.ok) throw new Error()
            toast.success(client ? "Cliente actualizado" : "Cliente creado")
            onSuccess()
        } catch {
            toast.error("Error al guardar el cliente")
        } finally {
            setLoading(false)
        }
    }

    const inputClass = "bg-white/[0.03] border-white/[0.08] focus:border-indigo-500/50 text-white"

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-24">
            {/* Personal info */}
            <FormField label="Nombre completo *" id="fullName" error={errors.fullName?.message}>
                <Input id="fullName" {...register("fullName")} className={inputClass} placeholder="Juan García" />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
                <FormField label="DNI / CUIT" id="dni">
                    <Input id="dni" {...register("dni")} className={inputClass} placeholder="20123456" />
                </FormField>
                <FormField label="Teléfono" id="phone">
                    <Input id="phone" {...register("phone")} className={inputClass} placeholder="+54 11 1234-5678" />
                </FormField>
            </div>

            <FormField label="Email" id="email" error={errors.email?.message}>
                <Input id="email" type="email" {...register("email")} className={inputClass} placeholder="juan@example.com" />
            </FormField>

            <FormField label="Dirección" id="address">
                <Input id="address" {...register("address")} className={inputClass} placeholder="Av. Rivadavia 1234" />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
                <FormField label="Ciudad" id="city">
                    <Input id="city" {...register("city")} className={inputClass} placeholder="Buenos Aires" />
                </FormField>
                <FormField label="Provincia" id="province">
                    <Input id="province" {...register("province")} className={inputClass} placeholder="Buenos Aires" />
                </FormField>
            </div>

            <FormField label="Notas / Observaciones" id="notes">
                <Textarea
                    id="notes"
                    {...register("notes")}
                    rows={2}
                    className={`${inputClass} resize-none`}
                    placeholder="Información adicional..."
                />
            </FormField>

            {/* Prescription section */}
            <div className="border border-white/[0.06] rounded-xl overflow-hidden">
                <button
                    type="button"
                    onClick={() => setShowPrescription(!showPrescription)}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/[0.03] transition-colors cursor-pointer"
                >
                    <span>Graduación (opcional)</span>
                    {showPrescription ? (
                        <ChevronUp className="w-4 h-4 text-slate-500" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                    )}
                </button>

                {showPrescription && (
                    <div className="px-4 pb-4 space-y-4 border-t border-white/[0.06]">
                        <div className="pt-4">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
                                OD — Ojo Derecho
                            </p>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <Label className="text-xs text-slate-400">Esfera</Label>
                                    <Input
                                        type="number"
                                        step="0.25"
                                        {...register("odSphere")}
                                        className={`mt-1 text-sm ${inputClass}`}
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs text-slate-400">Cilindro</Label>
                                    <Input
                                        type="number"
                                        step="0.25"
                                        {...register("odCylinder")}
                                        className={`mt-1 text-sm ${inputClass}`}
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs text-slate-400">Eje</Label>
                                    <Input
                                        type="number"
                                        {...register("odAxis")}
                                        className={`mt-1 text-sm ${inputClass}`}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
                                OI — Ojo Izquierdo
                            </p>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <Label className="text-xs text-slate-400">Esfera</Label>
                                    <Input
                                        type="number"
                                        step="0.25"
                                        {...register("oiSphere")}
                                        className={`mt-1 text-sm ${inputClass}`}
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs text-slate-400">Cilindro</Label>
                                    <Input
                                        type="number"
                                        step="0.25"
                                        {...register("oiCylinder")}
                                        className={`mt-1 text-sm ${inputClass}`}
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs text-slate-400">Eje</Label>
                                    <Input
                                        type="number"
                                        {...register("oiAxis")}
                                        className={`mt-1 text-sm ${inputClass}`}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
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
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white min-w-[120px]"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Guardando...
                        </>
                    ) : client ? (
                        "Actualizar cliente"
                    ) : (
                        "Crear cliente"
                    )}
                </Button>
            </div>
        </form>
    )
}
