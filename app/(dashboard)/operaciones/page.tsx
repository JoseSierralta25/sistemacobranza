"use client"
import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Search, DollarSign, Upload, CheckCircle2, Calendar } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

export default function OperacionesDashboard() {
  const [search, setSearch] = useState("")
  const [selectedLoan, setSelectedLoan] = useState<any | null>(null)
  const [loans, setLoans] = useState<any[]>([])
  
  const [cuotas, setCuotas] = useState<any[]>([])
  const [selectedCuotas, setSelectedCuotas] = useState<string[]>([])
  const [paymentAmount, setPaymentAmount] = useState<number | "">("")
  const [paymentMethod, setPaymentMethod] = useState("cash_usd")
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const supabase = createClient()

  const fetchLoans = async () => {
    const { data } = await supabase.from('prestamos').select('*, clientes(*)')
    if (data) setLoans(data)
  }

  useEffect(() => {
    fetchLoans()
  }, [])

  useEffect(() => {
    if (selectedLoan) {
      supabase.from('cuotas').select('*').eq('prestamo_id', selectedLoan.id).order('numero_cuota', { ascending: true })
        .then(({ data }) => setCuotas(data || []))
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCuotas([])
      setSelectedCuotas([])
    }
  }, [selectedLoan, supabase])

  const [showSuccess, setShowSuccess] = useState(false)

  // Computed data
  const filteredLoans = useMemo(() => {
    if (!search) return []
    const term = search.toLowerCase()
    return loans.filter((loan) => {
      const client = loan.clientes
      if (!client) return false
      const nombre = client.nombre || client.name || client.full_name || ""
      const doc = client.dni_cif || client.document || ""
      return nombre.toLowerCase().includes(term) || doc.toLowerCase().includes(term)
    })
  }, [search, loans])

  const toggleCuota = (id: string) => {
    setSelectedCuotas(prev => {
      const isSelected = prev.includes(id)
      const newSelected = isSelected ? prev.filter(c => c !== id) : [...prev, id]
      
      const newAmount = newSelected.reduce((sum, currentId) => {
        const c = cuotas.find(x => x.id === currentId)
        return sum + (c?.monto || 0)
      }, 0)
      setPaymentAmount(newAmount || "")
      
      return newSelected
    })
  }

  const handlePayment = async () => {
    if (!selectedLoan) return
    const amount = Number(paymentAmount)
    if (!amount || amount <= 0) return

    setIsUploading(true)
    let receiptUrl = null

    if (file) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${selectedLoan.id}-${Math.random()}.${fileExt}`
      const { data: uploadData,  } = await supabase.storage
        .from('comprobantes')
        .upload(fileName, file)
      
      if (uploadData) {
        const { data: publicUrlData } = supabase.storage.from('comprobantes').getPublicUrl(fileName)
        receiptUrl = publicUrlData.publicUrl
      }
    }

    const metodoMap: Record<string, string> = {
      'transfer': 'TRANSFERENCIA',
      'cash_usd': 'EFECTIVO_USD', 
      'cash_local': 'EFECTIVO_LOCAL'
    }

    // 1. Register Payment
    const { error } = await supabase.from('pagos').insert([
      { 
        prestamo_id: selectedLoan.id, 
        monto_pagado: amount, 
        metodo_pago: metodoMap[paymentMethod] || 'TRANSFERENCIA', 
        comprobante_url: receiptUrl 
      }
    ])

    if (!error) {
      // 2. Update Cuotas
      if (selectedCuotas.length > 0) {
        await supabase.from('cuotas').update({ estado: 'PAGADA', fecha_pago: new Date().toISOString() }).in('id', selectedCuotas)
      }

      // 3. Update Prestamo
      let newBalance = Number(selectedLoan.saldo_pendiente)
      let loanState = selectedLoan.estado

      // Si NO es revolvente, resta directo. Si es revolvente y están liquidando, también resta.
      // Pero si usan un botón especial de "Renovación", llamarán a otra función.
      newBalance = newBalance - amount
      loanState = newBalance <= 0 ? 'COMPLETADO' : selectedLoan.estado

      await supabase.from('prestamos').update({
        saldo_pendiente: newBalance,
        estado: loanState
      }).eq('id', selectedLoan.id)

      setShowSuccess(true)
      fetchLoans()
      
      setTimeout(() => {
        setShowSuccess(false)
        setSelectedLoan(null)
        setSearch("")
        setFile(null)
      }, 2000)
    } else {
      alert("Error al procesar pago: " + error.message)
    }
    setIsUploading(false)
  }

  const handleRenovacion = async () => {
    if (!selectedLoan || selectedCuotas.length === 0) return
    const amount = Number(paymentAmount)
    if (!amount || amount <= 0) return

    setIsUploading(true)
    let receiptUrl = null

    if (file) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${selectedLoan.id}-renov-${Math.random()}.${fileExt}`
      const { data: uploadData } = await supabase.storage.from('comprobantes').upload(fileName, file)
      if (uploadData) receiptUrl = supabase.storage.from('comprobantes').getPublicUrl(fileName).data.publicUrl
    }

    const metodoMap: Record<string, string> = { 'transfer': 'TRANSFERENCIA', 'cash_usd': 'EFECTIVO_USD', 'cash_local': 'EFECTIVO_LOCAL' }

    // 1. Registrar el pago (solo del interés)
    const { error } = await supabase.from('pagos').insert([{ 
      prestamo_id: selectedLoan.id, monto_pagado: amount, metodo_pago: metodoMap[paymentMethod] || 'TRANSFERENCIA', comprobante_url: receiptUrl 
    }])

    if (!error) {
      // 2. Marcar cuotas como pagadas
      await supabase.from('cuotas').update({ estado: 'PAGADA', fecha_pago: new Date().toISOString() }).in('id', selectedCuotas)

      // 3. Generar la NUEVA cuota para el próximo mes (Renovación)
      const lastCuota = cuotas[cuotas.length - 1]
      const nextDate = new Date(lastCuota.fecha_vencimiento)
      const freq = selectedLoan.frecuencia_pago
      if (freq === 'DIARIO') nextDate.setDate(nextDate.getDate() + 1)
      else if (freq === 'SEMANAL') nextDate.setDate(nextDate.getDate() + 7)
      else if (freq === 'QUINCENAL') nextDate.setDate(nextDate.getDate() + 14)
      else nextDate.setMonth(nextDate.getMonth() + 1)

      // Ajuste de timezone
      const localNextDate = new Date(nextDate.getTime() - (nextDate.getTimezoneOffset() * 60000))

      let newCuotaAmount = selectedLoan.monto_cuota
      let shouldUpdatePrestamo = false

      if (selectedLoan.tipo_prestamo !== 'REVOLVENTE') {
        newCuotaAmount = selectedLoan.monto_prestado * (selectedLoan.tasa_interes / 100)
        shouldUpdatePrestamo = true
      }

      await supabase.from('cuotas').insert([{
        prestamo_id: selectedLoan.id,
        numero_cuota: lastCuota.numero_cuota + 1,
        fecha_vencimiento: localNextDate.toISOString().split('T')[0],
        monto: newCuotaAmount,
        estado: 'PENDIENTE'
      }])

      if (shouldUpdatePrestamo) {
        await supabase.from('prestamos')
          .update({ tipo_prestamo: 'REVOLVENTE', monto_cuota: newCuotaAmount })
          .eq('id', selectedLoan.id)
      }

      // NOTA: No reducimos el saldo_pendiente porque el capital sigue igual
      setShowSuccess(true)
      fetchLoans()
      setTimeout(() => { setShowSuccess(false); setSelectedLoan(null); setSearch(""); setFile(null); }, 2000)
    } else {
      alert("Error al procesar renovación: " + error.message)
    }
    setIsUploading(false)
  }

  const newBalance = selectedLoan 
    ? selectedLoan.saldo_pendiente - (Number(paymentAmount) || 0)
    : 0

  return (
    <div className="flex w-full flex-col space-y-6 p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="flex flex-col space-y-2">
        <h1 className="text-display-lg text-primary tracking-tight">Operaciones</h1>
        <p className="text-body-base text-on-surface-variant">Gestión de pagos por cuotas</p>
      </div>

      <Tabs defaultValue="cobranza">
        <TabsList className="mb-4">
          <TabsTrigger value="cobranza">Cobranza de Cuotas</TabsTrigger>
          <TabsTrigger value="arqueo">Arqueo y Divisas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="cobranza" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Buscador de Clientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-on-surface-variant" />
                <Input
                  placeholder="Buscar por Nombre o Cédula..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {search && (
                <div className="mt-4 space-y-3">
                  {filteredLoans.length > 0 ? (
                    filteredLoans.map((loan) => {
                      const client = loan.clientes
                      return (
                        <div key={loan.id} className="flex items-center justify-between rounded-lg border border-outline-variant p-4 transition-all hover:bg-surface-container-highest hover:shadow-md">
                          <div>
                            <div className="font-medium text-on-surface">{client?.nombre || client?.name || client?.full_name}</div>
                            <div className="text-sm text-on-surface-variant">{client?.dni_cif || client?.document}</div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="font-bold text-on-surface">{formatCurrency(loan.saldo_pendiente)}</div>
                              <div className="text-xs text-on-surface-variant">Pendiente de {formatCurrency(loan.monto_prestado)}</div>
                            </div>
                            <Button 
                              size="sm" 
                              variant={loan.estado === "MORA" ? "destructive" : "default"}
                              onClick={() => setSelectedLoan(loan)}
                            >
                              Ver Cuotas
                            </Button>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center py-4 text-on-surface-variant">No se encontraron préstamos para ese cliente</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="arqueo">
          <Card>
            <CardHeader>
              <CardTitle>Registro de Divisas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-on-surface-variant">Módulo de compra y venta de divisas en construcción.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedLoan} onOpenChange={(open) => !open && setSelectedLoan(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" onClose={() => setSelectedLoan(null)}>
          {showSuccess ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4 animate-in zoom-in duration-300">
              <div className="rounded-full bg-[#00E676]/20 p-4">
                <CheckCircle2 className="h-12 w-12 text-[#00E676]" />
              </div>
              <h2 className="text-xl font-bold text-on-surface">¡Pago Registrado!</h2>
              <p className="text-on-surface-variant">Las cuotas seleccionadas fueron marcadas como pagadas.</p>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Abonar Cuotas - {selectedLoan?.clientes?.nombre}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 pt-4">
                
                {/* Cuotas List */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-on-surface">Selecciona las cuotas a pagar:</h3>
                  <div className="max-h-48 overflow-y-auto rounded-lg border border-outline-variant p-2 space-y-1">
                    {cuotas.length === 0 ? (
                      <div className="p-4 text-center text-sm text-on-surface-variant">Cargando cuotas o no encontradas...</div>
                    ) : (
                      cuotas.map((cuota) => (
                        <label 
                          key={cuota.id} 
                          className={`flex items-center justify-between p-3 rounded-md border cursor-pointer transition-colors ${cuota.estado === 'PAGADA' ? 'bg-surface-variant/50 border-transparent opacity-60' : 'hover:bg-surface-container-high border-outline-variant'} ${selectedCuotas.includes(cuota.id) ? 'border-primary bg-primary/5 ring-1 ring-primary' : ''}`}
                        >
                          <div className="flex items-center gap-3">
                            <input 
                              type="checkbox" 
                              disabled={cuota.estado === 'PAGADA'}
                              checked={selectedCuotas.includes(cuota.id) || cuota.estado === 'PAGADA'}
                              onChange={() => toggleCuota(cuota.id)}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <div>
                              <div className="text-sm font-medium">Cuota {cuota.numero_cuota}</div>
                              <div className="text-xs flex items-center gap-1 text-on-surface-variant">
                                <Calendar className="h-3 w-3" />
                                {formatDate(cuota.fecha_vencimiento)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-on-surface">{formatCurrency(cuota.monto)}</div>
                            <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${cuota.estado === 'PAGADA' ? 'bg-[#00E676]/20 text-[#00E676]' : cuota.estado === 'MORA' ? 'bg-error/20 text-error' : 'bg-secondary/20 text-secondary'}`}>
                              {cuota.estado}
                            </div>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-lg bg-surface-variant p-4 space-y-2">
                    <label className="text-sm font-medium text-on-surface-variant block">Monto a Abonar</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3.5 h-4 w-4 text-on-surface-variant" />
                      <Input
                        type="number"
                        className="pl-9 font-bold text-lg h-11 bg-surface-container-low"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(Number(e.target.value) || "")}
                      />
                    </div>
                  </div>
                  <div className="rounded-lg bg-surface-variant p-4 flex flex-col justify-center">
                    <div className="text-sm text-on-surface-variant">Saldo Restante</div>
                    <div className="text-2xl font-bold text-on-surface">
                      {formatCurrency(newBalance > 0 ? newBalance : 0)}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-on-surface">Método de Pago</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-outline-variant bg-surface-container-low px-3 py-2 text-sm text-on-surface focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="transfer">Transferencia Banco</option>
                    <option value="cash_usd">Efectivo (USD)</option>
                    <option value="cash_local">Efectivo (Moneda Local)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-on-surface">Comprobante (Opcional)</label>
                  <label className="flex w-full items-center justify-center rounded-md border border-dashed border-outline-variant py-6 hover:bg-surface-variant/50 transition-colors cursor-pointer">
                    <div className="flex flex-col items-center space-y-2 text-on-surface-variant">
                      <Upload className="h-6 w-6" />
                      <span className="text-xs">{file ? file.name : "Haz clic para subir foto"}</span>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*,.pdf"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                  </label>
                </div>


                <div className="flex flex-col sm:flex-row gap-2 mt-4">
                  <Button 
                    className="w-full transition-transform active:scale-95 glow-primary font-bold" 
                    size="lg" 
                    variant="default" 
                    onClick={handleRenovacion} 
                    title="Cobra el interés, no reduce el capital y genera un nuevo mes."
                    disabled={!paymentAmount || Number(paymentAmount) <= 0 || isUploading || selectedCuotas.length === 0}
                  >
                    {isUploading ? "Procesando..." : `Solo Interés (Renovar)`}
                  </Button>
                  <Button 
                    className="w-full transition-transform active:scale-95 glow-success font-bold" 
                    size="lg" 
                    variant="success" 
                    onClick={handlePayment} 
                    title="Paga las cuotas y resta el monto del capital pendiente."
                    disabled={!paymentAmount || Number(paymentAmount) <= 0 || isUploading}
                  >
                    {isUploading ? "Procesando..." : (selectedLoan?.tipo_prestamo === 'REVOLVENTE' ? 'Liquidar / Abonar' : `Abonar al Capital`)}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
