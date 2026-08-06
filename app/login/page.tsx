'use client'

import { useActionState } from 'react'
import { login } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Crown, AlertCircle, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, null)

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background decorations for neuromarketing visual appeal */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-md p-8 rounded-3xl bg-surface/50 backdrop-blur-xl border border-white/10 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="flex flex-col items-center space-y-4 text-center mb-8">
          <div className="flex flex-col items-center justify-center p-4 bg-surface-variant/30 rounded-full border border-outline-variant shadow-inner">
            <Crown className="h-10 w-10 text-[#facc15] drop-shadow-[0_0_15px_rgba(250,204,21,0.6)] mb-2" />
            <h1 className="text-display-md font-black text-white tracking-widest leading-none">MR</h1>
          </div>
          <p className="text-body-base text-on-surface-variant max-w-sm">
            Inicia sesión para gestionar el capital y las operaciones de MR.
          </p>
        </div>

        <form action={formAction} className="space-y-6">
          {state?.error && (
            <div className="p-4 rounded-xl bg-error/10 border border-error/20 flex items-start gap-3 animate-in slide-in-from-top-2">
              <AlertCircle className="h-5 w-5 text-error mt-0.5 shrink-0" />
              <p className="text-sm text-error font-medium">{state.error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-on-surface-variant">Correo Electrónico</label>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              required 
              placeholder="administradora@empresa.com"
              className="bg-background/50 border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all h-12"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-on-surface-variant">Contraseña</label>
            <Input 
              id="password" 
              name="password" 
              type="password" 
              required 
              placeholder="••••••••"
              className="bg-background/50 border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all h-12"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full h-12 text-md font-semibold bg-primary hover:bg-primary/90 text-on-primary shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              'Ingresar al Sistema'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
