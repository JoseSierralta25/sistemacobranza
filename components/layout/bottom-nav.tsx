"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, AlertCircle, FileText, PlusCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    { href: "/supervisor", icon: Home, label: "Inicio" },
    { href: "/clientes", icon: Users, label: "Clientes" },
    { href: "/prestamos/nuevo", icon: PlusCircle, label: "Nuevo" },
    { href: "/operaciones", icon: FileText, label: "Reportes" },
    { href: "/mora", icon: AlertCircle, label: "Mora" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 w-full border-t border-outline-variant bg-surface-container-lowest pb-safe md:hidden">
      {navItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center space-y-1 transition-colors",
              isActive ? "text-primary" : "text-on-surface-variant hover:text-on-surface"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
