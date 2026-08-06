"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, MessageSquare, Phone, Calendar as CalendarIcon, ShieldAlert, CheckCircle2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency, formatDate } from "@/lib/utils"

export default function MoraPage() {
  const [loansInArrears, setLoansInArrears] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedLoan, setSelectedLoan] = useState<any | null>(null)
  const [promesaFecha, setPromesaFecha] = useState("")
  const [promesaNotas, setPromesaNotas] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const supabase = createClient()

  const fetchArrears = async () => {
    setIsLoading(true)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Fetch all pending cuotas before today
    const { data: cuotasData, error } = await supabase
      .from('cuotas')
      .select('*, prestamos(*, clientes(*))')
      .eq('estado', 'PENDIENTE')
      .lt('fecha_vencimiento', today.toISOString())
      .order('fecha_vencimiento', { ascending: true })

    if (cuotasData) {
      // Group by loan
      const grouped = cuotasData.reduce((acc: any, cuota: any) => {
        const pId = cuota.prestamo_id
        if (!acc[pId]) {
          acc[pId] = {
            prestamo: cuota.prestamos,
            cliente: cuota.prestamos.clientes,
            cuotasVencidas: [],
            montoTotalVencido: 0,
            diasMora: 0,
          }
        }
        acc[pId].cuotasVencidas.push(cuota)
        acc[pId].montoTotalVencido += Number(cuota.monto)
        
        // Calculate days overdue based on the oldest cuota
        const due = new Date(cuota.fecha_vencimiento)
        const diffTime = Math.abs(today.getTime() - due.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        if (diffDays > acc[pId].diasMora) {
          acc[pId].diasMora = diffDays
        }
        
        return acc
      }, {})

      setLoansInArrears(Object.values(grouped).sort((a: any, b: any) => b.diasMora - a.diasMora))
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchArrears()
  }, [])

  const earlyArrears = loansInArrears.filter(l => l.diasMora >= 1 && l.diasMora <= 3)
  const warningArrears = loansInArrears.filter(l => l.diasMora >= 4 && l.diasMora <= 15)
  const criticalArrears = loansInArrears.filter(l => l.diasMora > 15)

  const handleWhatsApp = (loan: any, level: 'early' | 'warning' | 'critical') => {
    const client = loan.cliente
    let message = ""
    
    if (level === 'early') {
      message = `Hola ${client.nombre}, ¡saludos! Te escribimos de MR para recordarte amigablemente que tienes un pago pendiente de ${formatCurrency(loan.montoTotalVencido)}. Por favor contáctanos para ponernos al día.`
    } else if (level === 'warning') {
      message = `Aviso: Hola ${client.nombre}, tu cuenta presenta un atraso de ${loan.diasMora} días. El saldo vencido es de ${formatCurrency(loan.montoTotalVencido)}. Evita cargos adicionales por mora comunicándote hoy mismo.`
    } else {
      message = `AVISO URGENTE: ${client.nombre}, tu cuenta tiene ${loan.diasMora} días de atraso crítico (${formatCurrency(loan.montoTotalVencido)}). Por favor comunícate de inmediato para evitar el traslado de tu cuenta a recuperación.`
    }

    const encoded = encodeURIComponent(message)
    window.open(`https://wa.me/${client.telefono || client.phone}?text=${encoded}`, '_blank')
  }

  const handleSavePromesa = async () => {
    if (!selectedLoan || !promesaFecha) return
    
    const { error } = await supabase
      .from('prestamos')
      .update({
        promesa_pago_fecha: promesaFecha,
        promesa_pago_notas: promesaNotas
      })
      .eq('id', selectedLoan.prestamo.id)

    if (!error) {
      setShowSuccess(true)
      fetchArrears() // Refresh to reflect any changes if needed
      setTimeout(() => {
        setShowSuccess(false)
        setSelectedLoan(null)
        setPromesaFecha("")
        setPromesaNotas("")
      }, 2000)
    } else {
      alert("Error al guardar promesa: " + error.message)
    }
  }

  const renderBucket = (loans: any[], level: 'early' | 'warning' | 'critical') => {
    if (loans.length === 0) {
      return <div className="text-center py-12 text-on-surface-variant">No hay cuentas en este nivel de mora. ¡Excelente!</div>
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loans.map((l, idx) => (
          <Card key={l.prestamo.id} className="relative overflow-hidden group">
            <div className={`absolute top-0 left-0 w-1 h-full ${level === 'early' ? 'bg-[#38bdf8]' : level === 'warning' ? 'bg-[#facc15]' : 'bg-[#f43f5e]'}`} />
            
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">{l.cliente.nombre || l.cliente.name}</CardTitle>
                  <p className="text-xs text-on-surface-variant mt-1">{l.prestamo.id.split('-')[0].toUpperCase()}</p>
                </div>
                <Badge variant="outline" className={`${level === 'early' ? 'text-[#38bdf8] border-[#38bdf8]/30' : level === 'warning' ? 'text-[#facc15] border-[#facc15]/30' : 'text-[#f43f5e] border-[#f43f5e]/30'}`}>
                  {l.diasMora} días
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-on-surface-variant">Vencido:</div>
                <div className="text-xl font-bold text-error">{formatCurrency(l.montoTotalVencido)}</div>
              </div>
              <div className="flex items-center gap-2 text-xs text-on-surface-variant bg-black/20 p-2 rounded-md">
                <ShieldAlert className="h-4 w-4" />
                <span>{l.cuotasVencidas.length} cuotas atrasadas</span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full text-xs" 
                  onClick={() => setSelectedLoan(l)}
                >
                  <CalendarIcon className="mr-2 h-3 w-3" /> Promesa
                </Button>
                <Button 
                  size="sm" 
                  className="w-full text-xs bg-[#25D366] hover:bg-[#25D366]/90 text-white border-none"
                  onClick={() => handleWhatsApp(l, level)}
                >
                  <MessageSquare className="mr-2 h-3 w-3" /> Cobrar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col space-y-6 p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="flex flex-col space-y-2">
        <h1 className="text-display-lg text-primary tracking-tight">Recuperación</h1>
        <p className="text-body-base text-on-surface-variant">Centro inteligente de gestión de mora y promesas de pago</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Cargando datos de mora...</div>
      ) : (
        <Tabs defaultValue="early" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md bg-black/20 p-1 rounded-xl">
            <TabsTrigger value="early" className="rounded-lg data-[state=active]:bg-[#38bdf8]/20 data-[state=active]:text-[#38bdf8]">
              Temprana (1-3)
            </TabsTrigger>
            <TabsTrigger value="warning" className="rounded-lg data-[state=active]:bg-[#facc15]/20 data-[state=active]:text-[#facc15]">
              Riesgo (4-15)
            </TabsTrigger>
            <TabsTrigger value="critical" className="rounded-lg data-[state=active]:bg-[#f43f5e]/20 data-[state=active]:text-[#f43f5e]">
              Crítico (+15)
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
            <TabsContent value="early">
              {renderBucket(earlyArrears, 'early')}
            </TabsContent>
            <TabsContent value="warning">
              {renderBucket(warningArrears, 'warning')}
            </TabsContent>
            <TabsContent value="critical">
              {renderBucket(criticalArrears, 'critical')}
            </TabsContent>
          </div>
        </Tabs>
      )}

      {/* Modal Promesa de Pago */}
      <Dialog open={!!selectedLoan} onOpenChange={(open) => !open && setSelectedLoan(null)}>
        <DialogContent className="glass-panel border-white/10" onClose={() => setSelectedLoan(null)}>
          {showSuccess ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4 animate-in zoom-in duration-300">
              <div className="rounded-full bg-[#10b981]/20 p-4">
                <CheckCircle2 className="h-12 w-12 text-[#10b981] glow-success" />
              </div>
              <h2 className="text-xl font-bold text-white">¡Promesa Anotada!</h2>
              <p className="text-on-surface-variant text-center text-sm">Recuerda hacer seguimiento en esta fecha.</p>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Anotar Promesa de Pago</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="text-sm bg-primary/10 text-primary p-3 rounded-lg flex gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <p>Cliente: <strong>{selectedLoan?.cliente?.nombre}</strong><br/>Debe: <strong>{formatCurrency(selectedLoan?.montoTotalVencido || 0)}</strong></p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-on-surface">Fecha prometida de pago</label>
                  <Input 
                    type="date" 
                    value={promesaFecha} 
                    onChange={(e) => setPromesaFecha(e.target.value)} 
                    className="bg-black/20 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-on-surface">Notas / Acuerdos</label>
                  <Input 
                    placeholder="Ej. Dijo que le pagan la quincena el viernes..." 
                    value={promesaNotas} 
                    onChange={(e) => setPromesaNotas(e.target.value)} 
                    className="bg-black/20 border-white/10"
                  />
                </div>
                <Button 
                  className="w-full mt-4" 
                  size="lg" 
                  variant="default"
                  onClick={handleSavePromesa} 
                  disabled={!promesaFecha}
                >
                  Guardar Promesa
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
