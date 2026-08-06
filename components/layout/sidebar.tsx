"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, AlertCircle, Calculator, Wallet, Settings, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { logout } from "@/app/login/actions"
import { Crown } from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()

  const navItems = [
    { href: "/supervisor", icon: Home, label: "Dashboard Dueño" },
    { href: "/operaciones", icon: Wallet, label: "Operaciones" },
    { href: "/prestamos/nuevo", icon: Calculator, label: "Nuevo Préstamo" },
    { href: "/clientes", icon: Users, label: "Clientes" },
    { href: "/mora", icon: AlertCircle, label: "Mora / Alertas" },
  ]

  return (
    <aside className="hidden w-64 flex-col border-r border-outline-variant glass-panel md:flex m-4 rounded-2xl shadow-2xl relative z-10 overflow-hidden">
      <div className="flex h-20 items-center justify-center px-8 border-b border-outline-variant bg-surface-variant/20 relative">
        <div className="flex flex-col items-center justify-center">
          <Crown className="h-6 w-6 text-[#facc15] drop-shadow-[0_0_10px_rgba(250,204,21,0.6)] mb-1" />
          <h1 className="text-3xl font-black tracking-widest text-white drop-shadow-sm leading-none">MR</h1>
        </div>
      </div>
      <nav className="flex-1 space-y-2 px-4 py-6">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 overflow-hidden",
                isActive
                  ? "text-on-surface shadow-[0_0_15px_rgba(56,189,248,0.15)]"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/30"
              )}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-100" />
              )}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_10px_rgba(56,189,248,0.8)]" />
              )}
              <item.icon className={cn("h-5 w-5 transition-transform duration-300 relative z-10", isActive ? "text-primary scale-110" : "group-hover:scale-110 group-hover:text-primary")} />
              <span className="relative z-10">{item.label}</span>
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-outline-variant p-4 space-y-2 bg-surface-variant/20">
        <Link href="/configuracion" className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-on-surface hover:bg-surface-variant/30 transition-colors">
          <Settings className="h-5 w-5 text-on-surface-variant" />
          Configuración
        </Link>
        <form action={logout}>
          <button type="submit" className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-error hover:bg-error/10 transition-colors group">
            <LogOut className="h-5 w-5 group-hover:animate-pulse" />
            Cerrar Sesión
          </button>
        </form>
      </div>
    </aside>
  )
}
