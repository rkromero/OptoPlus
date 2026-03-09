"use client"

import dynamic from "next/dynamic"
import { useState } from "react"
import { Loader2, FolderOpen, Users, Building2, ShieldAlert } from "lucide-react"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"

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
        <div className="flex flex-col items-center justify-center py-20 bg-zinc-900 rounded-2xl border border-white/10">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500/50 mb-4" />
            <p className="text-sm text-zinc-400">Cargando...</p>
        </div>
    )
}

interface Tab { id: string; label: string; icon: React.ElementType }

const TABS: Tab[] = [
    { id: "categorias", label: "Categorías", icon: FolderOpen },
    { id: "usuarios", label: "Usuarios", icon: Users },
    { id: "empresa", label: "Empresa", icon: Building2 },
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
                <p className="text-zinc-400 max-w-md text-center">No tenés los permisos suficientes para acceder a la configuración del sistema. Contactá a un administrador.</p>
            </div>
        )
    }

    return (
        <div className="animate-fade-in pb-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white tracking-tight">Configuración General</h1>
                <p className="text-base text-zinc-400 mt-2">Administrá los ajustes fundamentales de tu óptica, inventario y equipo.</p>
            </div>

            <div className="mb-8 overflow-x-auto pb-2 scrollbar-hide">
                <div className="flex space-x-2 bg-zinc-900/50 p-1.5 rounded-full border border-white/5 inline-flex backdrop-blur-sm">
                    {TABS.map((tab) => {
                        const Icon = tab.icon
                        const isActive = activeTab === tab.id
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 outline-none ${isActive ? 'text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'}`}
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
