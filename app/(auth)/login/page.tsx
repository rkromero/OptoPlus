"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { motion } from "framer-motion"

const schema = z.object({
    email: z.string().min(1, "El email es requerido").email("Email inválido"),
    password: z.string().min(1, "La contraseña es requerida"),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        mode: "onSubmit",
        reValidateMode: "onSubmit",
        defaultValues: {
            email: "",
            password: "",
        },
    })

    const onSubmit = async (data: FormData) => {
        setLoading(true)
        try {
            const result = await signIn("credentials", {
                email: data.email,
                password: data.password,
                redirect: false,
            })

            if (result?.error) {
                toast.error("Credenciales incorrectas")
            } else {
                toast.success("¡Bienvenido!")
                router.push("/dashboard")
                router.refresh()
            }
        } catch {
            toast.error("Error al iniciar sesión")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0A0A0F] flex relative overflow-hidden">
            {/* Left side: Premium branding & Visuals */}
            <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden bg-[#0D0D14] border-r border-white/[0.06]">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px]" />
                    <div
                        className="absolute inset-0 opacity-[0.03]"
                        style={{
                            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                            backgroundSize: "32px 32px",
                        }}
                    />
                </div>

                <div className="relative z-10 w-full flex flex-col justify-between p-12">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-500/10">
                            <svg viewBox="0 0 24 24" className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white focus:outline-none">
                            Optovision<span className="text-indigo-400">Plus</span>
                        </span>
                    </div>

                    <div className="max-w-xl">
                        <motion.h2
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-5xl font-bold text-white leading-tight"
                        >
                            La visión perfecta para el <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">crecimiento</span> de tu óptica.
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="mt-6 text-lg text-slate-400 font-light max-w-md"
                        >
                            Gestioná pacientes, stock y pedidos con una plataforma diseñada para la excelencia operativa y el diseño premium.
                        </motion.p>
                    </div>

                    <div className="flex items-center gap-6 text-slate-500 text-sm">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0D0D14] bg-slate-800" />
                            ))}
                        </div>
                        <span>+500 ópticas confían en nosotros</span>
                    </div>
                </div>
            </div>

            {/* Right side: Login Form */}
            <div className="flex-1 flex flex-col justify-center px-8 lg:px-24 xl:px-32 relative z-10 bg-[#0A0A0F]">
                {/* Mobile Logo */}
                <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
                            <circle cx="12" cy="12" r="3" />
                        </svg>
                    </div>
                    <span className="text-lg font-bold text-white">OptovisionPlus</span>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-[400px] mx-auto"
                >
                    <div className="mb-10 text-center lg:text-left">
                        <h1 className="text-3xl font-bold text-white tracking-tight">Iniciar Sesión</h1>
                        <p className="mt-2 text-slate-500">Bienvenido de nuevo. Ingresá tus credenciales.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-300 text-sm font-medium">Email</Label>
                            <div className="relative group">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@optovision.com"
                                    autoComplete="email"
                                    {...register("email")}
                                    className="h-12 pl-11 bg-white/[0.03] border-white/[0.08] focus:border-indigo-500/50 focus:ring-0 text-white placeholder:text-slate-600 rounded-xl transition-all"
                                />
                            </div>
                            {errors.email && (
                                <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-slate-300 text-sm font-medium">Contraseña</Label>
                                <a href="#" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">¿Olvidaste tu contraseña?</a>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    {...register("password")}
                                    className="h-12 pl-11 pr-11 bg-white/[0.03] border-white/[0.08] focus:border-indigo-500/50 focus:ring-0 text-white placeholder:text-slate-600 rounded-xl transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-12 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                                    Accediendo al sistema...
                                </>
                            ) : (
                                "Ingresar al Panel"
                            )}
                        </Button>
                    </form>

                    <div className="mt-12 pt-8 border-t border-white/[0.05] flex flex-col items-center lg:items-start gap-4">
                        <p className="text-xs text-slate-600 font-medium tracking-wider uppercase">Seguridad Garantizada</p>
                        <div className="flex gap-4 opacity-40">
                            {/* Simple icons placeholders */}
                            <div className="w-8 h-4 bg-slate-700 rounded-sm" />
                            <div className="w-8 h-4 bg-slate-700 rounded-sm" />
                            <div className="w-8 h-4 bg-slate-700 rounded-sm" />
                        </div>
                    </div>
                </motion.div>

                <footer className="mt-auto py-8 text-center lg:text-left">
                    <p className="text-xs text-slate-700">
                        &copy; {new Date().getFullYear()} OptovisionPlus. Todos los derechos reservados.
                    </p>
                </footer>
            </div>
        </div>
    )
}
