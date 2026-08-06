"use client"
import Link from "next/link"
import { Crown, Settings } from "lucide-react"

export function MobileHeader() {
  return (
    <header className="flex h-16 items-center justify-between px-4 border-b border-outline-variant bg-surface-variant/20 md:hidden sticky top-0 z-40 backdrop-blur-md">
      <Link href="/supervisor" className="flex items-center gap-2">
        <Crown className="h-5 w-5 text-[#facc15] drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
        <span className="text-xl font-black tracking-widest text-on-surface leading-none">MR</span>
      </Link>
      
      <Link href="/configuracion" className="p-2 rounded-full hover:bg-surface-variant/30 text-on-surface-variant transition-colors">
        <Settings className="h-5 w-5" />
      </Link>
    </header>
  )
}
