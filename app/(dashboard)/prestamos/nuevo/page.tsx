"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

export default function NuevoPrestamoPage() {
  const [clientName, setClientName] = useState("")
  const [clientPhone, setClientPhone] = useState("")
  const [clientBusiness, setClientBusiness] = useState("")
  const [clientAddress, setClientAddress] = useState("")
  const [clientDocument, setClientDocument] = useState("")
  const [amount, setAmount] = useState<number | "">("")
  const [interest, setInterest] = useState<number | "">(15)
  const [loanType, setLoanType] = useState("FIJO") // FIJO or REVOLVENTE
  const [modality, setModality] = useState("monthly") // daily, weekly, biweekly, monthly
  const [installmentsCount, setInstallmentsCount] = useState<number | "">(4)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClient()

  const generateAmortization = () => {
    const safeAmount = Number(amount) || 0
    const safeInterest = Number(interest) || 0
    const safeCount = Number(installmentsCount) || 1

    const totalInterest = safeAmount * (safeInterest / 100)
    const totalPayment = safeAmount + totalInterest
    const schedule = []
    const currentDate = new Date()

    if (loanType === "REVOLVENTE") {
      if (modality === "daily") currentDate.setDate(currentDate.getDate() + 1)
      else if (modality === "weekly") currentDate.setDate(currentDate.getDate() + 7)
      else if (modality === "biweekly") currentDate.setDate(currentDate.getDate() + 14)
      else if (modality === "monthly") currentDate.setMonth(currentDate.getMonth() + 1)

      schedule.push({
        installment: 1,
        date: new Date(currentDate),
        amount: totalInterest, // La cuota es solo el interés
      })
    } else {
      const paymentPerInstallment = totalPayment / safeCount
      for (let i = 1; i <= safeCount; i++) {
        if (modality === "daily") currentDate.setDate(currentDate.getDate() + 1)
        else if (modality === "weekly") currentDate.setDate(currentDate.getDate() + 7)
        else if (modality === "biweekly") currentDate.setDate(currentDate.getDate() + 14)
        else if (modality === "monthly") currentDate.setMonth(currentDate.getMonth() + 1)

        schedule.push({
          installment: i,
          date: new Date(currentDate),
          amount: paymentPerInstallment,
        })
      }
    }

    return { schedule, totalPayment }
  }

  const handleRegister = async () => {
    setIsSubmitting(true)

    // 1. Check if Client already exists or Insert
    const cedula = clientDocument || 'V-PENDING'
    let clienteId: string | null = null

    // Buscamos si ya existe usando dni_cif
    const { data: existingClient } = await supabase
      .from('clientes')
      .select('id')
      .eq('dni_cif', cedula)
      .single()

    if (existingClient) {
      clienteId = existingClient.id
    } else {
      const payload = {
        full_name: clientName,
        name: clientName,
        nombre: clientName,
        document: cedula,
        dni_cif: cedula,
        phone: clientPhone,
        telefono: clientPhone,
        email: "",
        address: clientAddress,
        business_name: clientBusiness,
        notes: "",
        status: 'ACTIVO'
      }
      
      const { data: newClient, error: clientError } = await supabase.from('clientes').insert([payload]).select().single()
  
      if (clientError || !newClient) {
        alert("Error al registrar cliente: " + (clientError?.message || "Desconocido"))
        setIsSubmitting(false)
        return
      }
      clienteId = newClient.id
    }

    // 2. Insert Loan
    const { schedule, totalPayment } = generateAmortization()
    const startDate = new Date()
    
    // Map modality to Spanish enum
    const modalidadMap: Record<string, string> = {
      'daily': 'DIARIO',
      'weekly': 'SEMANAL',
      'biweekly': 'QUINCENAL',
      'monthly': 'MENSUAL'
    }

    const { data: newLoan, error: loanError } = await supabase.from('prestamos').insert([
      {
        cliente_id: clienteId,
        monto_prestado: Number(amount),
        tasa_interes: Number(interest),
        frecuencia_pago: modalidadMap[modality] || 'MENSUAL',
        tipo_prestamo: loanType,
        total_cuotas: loanType === 'REVOLVENTE' ? 1 : Number(installmentsCount),
        monto_cuota: loanType === 'REVOLVENTE' ? (Number(amount) * (Number(interest) / 100)) : (totalPayment / Number(installmentsCount)),
        monto_total_pagar: totalPayment,
        saldo_pendiente: totalPayment,
        fecha_inicio: startDate.toISOString().split('T')[0],
        estado: 'ACTIVO'
      }
    ]).select().single()

    if (loanError || !newLoan) {
      alert("Error al registrar préstamo: " + (loanError?.message || "Desconocido"))
      setIsSubmitting(false)
      return
    }

    // 3. Insertar las cuotas
    const cuotasPayload = schedule.map((item) => {
      // Ajuste para la zona horaria local y evitar desfasaje de fecha
      const localDate = new Date(item.date.getTime() - (item.date.getTimezoneOffset() * 60000))
      return {
        prestamo_id: newLoan.id,
        numero_cuota: item.installment,
        fecha_vencimiento: localDate.toISOString().split('T')[0],
        monto: item.amount,
        estado: 'PENDIENTE'
      }
    })

    const { error: cuotasError } = await supabase.from('cuotas').insert(cuotasPayload)

    if (cuotasError) {
      alert("Préstamo creado pero hubo un error generando cuotas: " + cuotasError.message)
      setIsSubmitting(false)
      return
    }

    setShowSuccess(true)
    setTimeout(() => {
      setShowSuccess(false)
      // Reset form
      setClientName("")
      setClientPhone("")
      setClientBusiness("")
      setClientAddress("")
      setClientDocument("")
      setAmount("")
      setInterest(15)
      setInstallmentsCount(4)
    }, 2500)
    setIsSubmitting(false)
  }

  const { schedule, totalPayment } = generateAmortization()

  return (
    <div className="flex w-full flex-col space-y-6 p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="flex flex-col space-y-2">
        <h1 className="text-display-lg text-primary tracking-tight">Nuevo Préstamo</h1>
        <p className="text-body-base text-on-surface-variant">Calculadora y creación de crédito</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Datos del Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-on-surface">Nombre Completo</label>
                <Input placeholder="Ej. Juan Pérez" value={clientName} onChange={(e) => setClientName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-on-surface">Cédula / Documento</label>
                <Input placeholder="Ej. V-12345678" value={clientDocument} onChange={(e) => setClientDocument(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-on-surface">Teléfono</label>
                <Input placeholder="Ej. 0414-1234567" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-on-surface">Nombre del Negocio (Opcional)</label>
                <Input placeholder="Ej. Bodega La Bendición" value={clientBusiness} onChange={(e) => setClientBusiness(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-on-surface">Dirección</label>
                <Input placeholder="Ej. Calle 4, Local 12" value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
          <CardHeader>
            <CardTitle>Datos del Préstamo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-on-surface">Monto Solicitado</label>
              <Input type="number" placeholder="Ej. 1000" value={amount} onChange={(e) => setAmount(Number(e.target.value) || "")} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-on-surface">Interés Fijo (%)</label>
              <Input type="number" value={interest} onChange={(e) => setInterest(Number(e.target.value) || "")} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-on-surface">Tipo de Préstamo</label>
              <select 
                className="flex h-10 w-full rounded-md border border-outline-variant bg-surface-container-low px-3 py-2 text-sm text-on-surface focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                value={loanType}
                onChange={(e) => setLoanType(e.target.value)}
              >
                <option value="FIJO">Amortización Fija (Clásico)</option>
                <option value="REVOLVENTE">Solo Intereses (Revolvente)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-on-surface">Modalidad de Pago</label>
              <select 
                className="flex h-10 w-full rounded-md border border-outline-variant bg-surface-container-low px-3 py-2 text-sm text-on-surface focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                value={modality}
                onChange={(e) => setModality(e.target.value)}
              >
                <option value="daily">Diario</option>
                <option value="weekly">Semanal</option>
                <option value="biweekly">Quincenal</option>
                <option value="monthly">Mensual</option>
              </select>
            </div>
            {loanType === "FIJO" && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <label className="text-sm font-medium text-on-surface">Número de Cuotas</label>
                <Input type="number" value={installmentsCount} onChange={(e) => setInstallmentsCount(Number(e.target.value) || "")} />
              </div>
            )}
          </CardContent>
          <CardFooter>
            {showSuccess ? (
              <div className="w-full text-center rounded-md bg-[#00E676]/20 p-2 text-sm font-medium text-[#00E676]">
                ¡Préstamo registrado exitosamente!
              </div>
            ) : (
              <Button 
                className="w-full transition-transform active:scale-95 glow-primary font-bold" 
                onClick={handleRegister}
                disabled={!clientName || !clientDocument || !clientPhone || !amount || !interest || (loanType === "FIJO" && !installmentsCount) || isSubmitting}
              >
                {isSubmitting ? "Registrando..." : "Registrar Cliente y Préstamo"}
              </Button>
            )}
          </CardFooter>
        </Card>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Tabla de Amortización</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-outline-variant overflow-hidden">
              <table className="w-full text-sm text-left text-on-surface">
                <thead className="text-xs text-on-surface-variant uppercase bg-surface-variant">
                  <tr>
                    <th className="px-4 py-3">Cuota</th>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3 text-right">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.length > 0 ? schedule.map((item, idx) => (
                    <tr key={item.installment} className="border-b border-outline-variant hover:bg-surface-container-highest transition-colors animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${idx * 50}ms` }}>
                      <td className="px-4 py-3">{item.installment}</td>
                      <td className="px-4 py-3 text-mono-data">{formatDate(item.date)}</td>
                      <td className="px-4 py-3 text-right font-medium text-mono-data">{formatCurrency(item.amount)}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-on-surface-variant">Ingresa los datos para generar la tabla</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-between items-center rounded-lg bg-primary/10 p-4">
              <span className="font-medium text-primary">Total a Pagar:</span>
              <span className="text-xl font-bold text-primary">{formatCurrency(totalPayment)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
