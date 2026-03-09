"use client"

import { useState, useEffect } from "react"
import { Loader2, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function SettingsTab() {
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

    const inputClass = "bg-white/[0.04] border-white/[0.08] focus:border-indigo-500/60 text-white transition-all"
    const labelClass = "text-slate-400 text-xs font-medium mb-1.5 block uppercase tracking-wide"

    return (
        <div className="max-w-lg">
            <p className="text-sm text-slate-400 mb-6">Estos datos aparecerán en los remitos y documentos enviados a tus clientes.</p>

            <div className="space-y-8">
                <section>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 pb-2 border-b border-white/[0.06]">Información general</h4>
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

                <section>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 pb-2 border-b border-white/[0.06]">Dirección Física</h4>
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
                                <Input className={inputClass} placeholder="Buenos Aires" />
                            </div>
                            <div>
                                <Label className={labelClass}>Código Postal</Label>
                                <Input className={inputClass} placeholder="1043" />
                            </div>
                        </div>
                    </div>
                </section>

                <section>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 pb-2 border-b border-white/[0.06]">Identidad Visual</h4>
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

            <div className="mt-8 pt-5 border-t border-white/[0.06] flex justify-end">
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-6"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Guardar cambios
                </Button>
            </div>
        </div>
    )
}
