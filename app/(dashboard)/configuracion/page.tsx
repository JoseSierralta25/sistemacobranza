"use client"
import { useState } from "react"
import { useTheme } from "next-themes"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Lock, ShieldCheck } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function ConfiguracionPage() {
  const { theme, setTheme } = useTheme()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [message, setMessage] = useState({ text: "", type: "" })
  const supabase = createClient()

  const handleUpdatePassword = async () => {
    if (!password) {
      setMessage({ text: "Ingresa una nueva contraseña", type: "error" })
      return
    }
    if (password !== confirmPassword) {
      setMessage({ text: "Las contraseñas no coinciden", type: "error" })
      return
    }
    if (password.length < 6) {
      setMessage({ text: "La contraseña debe tener al menos 6 caracteres", type: "error" })
      return
    }

    setIsUpdating(true)
    setMessage({ text: "", type: "" })

    const { error } = await supabase.auth.updateUser({
      password: password
    })

    if (error) {
      setMessage({ text: error.message, type: "error" })
    } else {
      setMessage({ text: "Contraseña actualizada exitosamente", type: "success" })
      setPassword("")
      setConfirmPassword("")
    }
    setIsUpdating(false)
  }

  return (
    <div className="flex w-full flex-col space-y-6 p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="flex flex-col space-y-2">
        <h1 className="text-display-lg text-primary tracking-tight">Configuración</h1>
        <p className="text-body-base text-on-surface-variant">Preferencias visuales y seguridad de la cuenta</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Apariencia */}
        <Card className="glass-panel relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-primary dark:hidden" />
              <Moon className="h-5 w-5 text-primary hidden dark:block" />
              Apariencia
            </CardTitle>
            <CardDescription>Personaliza cómo se ve MR en tu dispositivo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl border border-outline-variant bg-surface-variant/20">
              <div>
                <p className="font-medium text-on-surface">Tema de la Aplicación</p>
                <p className="text-sm text-on-surface-variant">Cambiar entre modo claro y oscuro</p>
              </div>
              <div className="flex gap-2 bg-surface-container-low p-1 rounded-lg border border-outline-variant">
                <button 
                  onClick={() => setTheme("light")}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${theme === 'light' ? 'bg-primary text-white shadow-md' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                  Claro
                </button>
                <button 
                  onClick={() => setTheme("dark")}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${theme === 'dark' ? 'bg-primary text-white shadow-md' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                  Oscuro
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seguridad */}
        <Card className="glass-panel relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-secondary" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-secondary" />
              Seguridad
            </CardTitle>
            <CardDescription>Cambia la contraseña de acceso a tu panel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-on-surface">Nueva Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-on-surface-variant" />
                <Input 
                  type="password" 
                  placeholder="Mínimo 6 caracteres" 
                  className="pl-9 bg-surface-container-low border-outline-variant"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-on-surface">Confirmar Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-on-surface-variant" />
                <Input 
                  type="password" 
                  placeholder="Vuelve a escribir la contraseña" 
                  className="pl-9 bg-surface-container-low border-outline-variant"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            {message.text && (
              <div className={`p-3 rounded-lg text-sm ${message.type === 'error' ? 'bg-error/20 text-error' : 'bg-secondary/20 text-secondary'}`}>
                {message.text}
              </div>
            )}

            <Button 
              className="w-full glow-success" 
              variant="success" 
              onClick={handleUpdatePassword}
              disabled={isUpdating || !password || !confirmPassword}
            >
              {isUpdating ? "Actualizando..." : "Actualizar Contraseña"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
