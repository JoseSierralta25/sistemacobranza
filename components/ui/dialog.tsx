"use client"
import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

export function Dialog({ open, onOpenChange, children }: { open: boolean; onOpenChange: (open: boolean) => void; children: React.ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      {children}
    </div>
  )
}

export function DialogContent({ className, children, onClose }: { className?: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className={cn("relative w-full max-w-lg rounded-xl border border-outline-variant bg-surface-container p-6 shadow-lg sm:rounded-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200", className)}>
      <button onClick={onClose} className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary">
        <X className="h-5 w-5 text-on-surface" />
        <span className="sr-only">Cerrar</span>
      </button>
      {children}
    </div>
  )
}

export function DialogHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left mb-4", className)}>
      {children}
    </div>
  )
}

export function DialogTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <h2 className={cn("text-headline-md-mobile font-semibold leading-none tracking-tight text-on-surface", className)}>
      {children}
    </h2>
  )
}
