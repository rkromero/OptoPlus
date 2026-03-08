"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import {
    LayoutDashboard,
    Package,
    Users,
    ShoppingCart,
    Settings,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Eye,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/inventario", label: "Inventario", icon: Package },
    { href: "/clientes", label: "Clientes", icon: Users },
    { href: "/pedidos", label: "Pedidos", icon: ShoppingCart },
]

const adminItems = [
    { href: "/configuracion", label: "Configuración", icon: Settings },
]

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false)
    const pathname = usePathname()
    const { data: session } = useSession()
    const isAdmin = session?.user?.role === "ADMIN"

    const allItems = isAdmin ? [...navItems, ...adminItems] : navItems

    const getInitials = (name: string) =>
        name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)

    return (
        <motion.aside
            animate={{ width: collapsed ? 64 : 240 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="relative flex flex-col h-screen bg-[#0D0D14] border-r border-white/[0.06] flex-shrink-0 overflow-hidden z-30"
        >
            {/* Logo */}
            <div className="flex items-center h-16 px-4 border-b border-white/[0.06] flex-shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                        <Eye className="w-4 h-4 text-indigo-400" />
                    </div>
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.div
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "auto" }}
                                exit={{ opacity: 0, width: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                            >
                                <span className="text-sm font-semibold text-white whitespace-nowrap">
                                    Optovision
                                    <span className="text-indigo-400">Plus</span>
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
                {allItems.map((item) => {
                    const Icon = item.icon
                    const isActive =
                        pathname === item.href || pathname.startsWith(item.href + "/")

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer group relative",
                                isActive
                                    ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/20"
                                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]"
                            )}
                            title={collapsed ? item.label : undefined}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="sidebar-active"
                                    className="absolute inset-0 rounded-lg bg-indigo-500/10"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                                />
                            )}
                            <Icon className="w-5 h-5 flex-shrink-0 relative z-10" />
                            <AnimatePresence>
                                {!collapsed && (
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                        className="whitespace-nowrap relative z-10"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </Link>
                    )
                })}
            </nav>

            {/* User menu */}
            <div className="border-t border-white/[0.06] p-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            className={cn(
                                "flex items-center gap-3 w-full rounded-lg px-3 py-2.5 hover:bg-white/[0.05] transition-colors cursor-pointer",
                                collapsed ? "justify-center" : ""
                            )}
                        >
                            <Avatar className="w-7 h-7 flex-shrink-0">
                                <AvatarFallback className="bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/20">
                                    {session?.user?.name ? getInitials(session.user.name) : "U"}
                                </AvatarFallback>
                            </Avatar>
                            <AnimatePresence>
                                {!collapsed && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex-1 min-w-0 text-left"
                                    >
                                        <p className="text-xs font-medium text-slate-200 truncate">
                                            {session?.user?.name || "Usuario"}
                                        </p>
                                        <p className="text-[10px] text-slate-500 truncate">
                                            {(session?.user as any)?.role || "VENDEDOR"}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="top" align="start" className="w-48 bg-[#111118] border-white/[0.08]">
                        <DropdownMenuSeparator className="bg-white/[0.06]" />
                        <DropdownMenuItem
                            onClick={() => signOut({ callbackUrl: "/login" })}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Cerrar sesión
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Collapse toggle */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute right-0 top-16 translate-x-1/2 w-5 h-5 rounded-full bg-[#1A1A2E] border border-white/[0.1] flex items-center justify-center hover:bg-indigo-500/20 hover:border-indigo-500/30 transition-all duration-200 cursor-pointer z-40"
                aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
            >
                {collapsed ? (
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                ) : (
                    <ChevronLeft className="w-3 h-3 text-slate-400" />
                )}
            </button>
        </motion.aside>
    )
}
