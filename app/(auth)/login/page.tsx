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
    email: z.string().email("Email inválido"),
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
        <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-3xl" />
                <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                        backgroundSize: "40px 40px",
                    }}
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="relative w-full max-w-sm"
            >
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center mb-4 relative">
                        <div className="absolute inset-0 rounded-2xl bg-indigo-500/5 blur-xl" />
                        <svg
                            viewBox="0 0 24 24"
                            className="w-7 h-7 text-indigo-400 relative z-10"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                        >
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
                            <circle cx="12" cy="12" r="3" />
                            <path d="M12 9v6M9 12h6" strokeWidth="2" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-bold text-white">
                        Optovision<span className="text-indigo-400">Plus</span>
                    </h1>
                    <p className="mt-1 text-sm text-slate-400">
                        Sistema de Gestión Óptica
                    </p>
                </div>

                {/* Card */}
                <div className="bg-[#111118] border border-white/[0.06] rounded-2xl p-6 shadow-2xl">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* Email */}
                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-slate-300 text-sm font-medium">
                                Email
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@optovision.com"
                                    autoComplete="email"
                                    {...register("email")}
                                    className="pl-9 bg-white/[0.03] border-white/[0.08] focus:border-indigo-500/50 focus:ring-indigo-500/20 text-white placeholder:text-slate-600"
                                />
                            </div>
                            {errors.email && (
                                <p className="text-xs text-red-400">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-slate-300 text-sm font-medium">
                                Contraseña
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    {...register("password")}
                                    className="pl-9 pr-10 bg-white/[0.03] border-white/[0.08] focus:border-indigo-500/50 focus:ring-indigo-500/20 text-white placeholder:text-slate-600"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                                    tabIndex={-1}
                                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-xs text-red-400">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        {/* Submit */}
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold h-10 transition-all duration-200 shadow-lg shadow-indigo-500/20"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Iniciando sesión...
                                </>
                            ) : (
                                "Iniciar sesión"
                            )}
                        </Button>
                    </form>
                </div>

                <p className="text-center mt-6 text-xs text-slate-600">
                    © {new Date().getFullYear()} OptovisionPlus
                </p>
            </motion.div>
        </div>
    )
}
