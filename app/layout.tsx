import type { Metadata } from "next"
import "./globals.css"
import AuthProvider from "@/components/providers/AuthProvider"
import { Toaster } from "sonner"

export const metadata: Metadata = {
  title: {
    default: "OptovisionPlus — Sistema de Gestión Óptica",
    template: "%s | OptovisionPlus",
  },
  description:
    "Sistema de gestión profesional para ópticas. Administrá inventario, clientes y pedidos.",
  keywords: ["óptica", "gestión", "inventario", "anteojos"],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-foreground antialiased" suppressHydrationWarning>
        <AuthProvider>
          {children}
          <Toaster
            position="bottom-right"
            theme="dark"
            toastOptions={{
              style: {
                background: "#111118",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#F8FAFC",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}
