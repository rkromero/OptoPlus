"use client"

import dynamic from "next/dynamic"
import { useState } from "react"
import { Loader2, Tag, Users, Building2, ShieldAlert } from "lucide-react"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"

const CategoriesTab = dynamic(() => import("@/components/configuracion/CategoriesTab"), {
    loading: () => <TabLoading />,
})
const UsersTab = dynamic(() => import("@/components/configuracion/UsersTab"), {
    loading: () => <TabLoading />,
})
const SettingsTab = dynamic(() => import("@/components/configuracion/SettingsTab"), {
    loading: () => <TabLoading />,
})

function TabLoading() {
    return (
        <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500/50" />
        </div>
    )
}

const TABS = [
    { id: "categorias", label: "Categorías", icon: Tag, description: "Organizá tus productos" },
    { id: "usuarios", label: "Usuarios", icon: Users, description: "Accesos y permisos" },
    { id: "empresa", label: "Empresa", icon: Building2, description: "Datos de la óptica" },
]

export default function ConfiguracionPage() {
    const { data: session } = useSession()
    const isAdmin = (session?.user as any)?.role === "ADMIN"
    const [activeTab, setActiveTab] = useState(TABS[0].id)

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center py-24">
                <ShieldAlert className="w-16 h-16 text-red-400 mb-6" />
                <h2 className="text-2xl font-bold text-white mb-2">Acceso denegado</h2>
                <p className="text-zinc-400 max-w-md text-center">
                    No tenés los permisos suficientes para acceder a la configuración.
                </p>
            </div>
        )
    }

    const activeTabData = TABS.find(t => t.id === activeTab)!

    return (
        <div className="flex gap-8 min-h-[calc(100vh-8rem)]">

            {/* ── Left nav ─────────────────────────────────── */}
            <aside className="w-52 shrink-0">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-3 px-3">
                    Configuración
                </p>
                <nav className="space-y-0.5">
                    {TABS.map((tab) => {
                        const Icon = tab.icon
                        const active = activeTab === tab.id
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left cursor-pointer",
                                    active
                                        ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                                        : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent"
                                )}
                            >
                                <Icon className={cn("w-4 h-4 shrink-0", active ? "text-indigo-400" : "text-slate-500")} />
                                {tab.label}
                            </button>
                        )
                    })}
                </nav>
            </aside>

            {/* ── Divider ──────────────────────────────────── */}
            <div className="w-px bg-white/[0.06] shrink-0" />

            {/* ── Content ──────────────────────────────────── */}
            <div className="flex-1 min-w-0">
                <div className="mb-6">
                    <h1 className="text-xl font-semibold text-white">{activeTabData.label}</h1>
                    <p className="text-sm text-slate-400 mt-0.5">{activeTabData.description}</p>
                </div>

                {activeTab === "categorias" && <CategoriesTab />}
                {activeTab === "usuarios" && <UsersTab />}
                {activeTab === "empresa" && <SettingsTab />}
            </div>
        </div>
    )
}
