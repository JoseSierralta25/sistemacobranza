import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { TrendingUp, AlertTriangle, MessageCircle, CircleDollarSign, LineChart } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'

export default async function SupervisorDashboard() {
  const supabase = await createClient()
  
  // Ajuste para zona horaria local (UTC-4 Venezuela)
  const localDateObj = new Date(new Date().getTime() - (4 * 3600 * 1000))
  const hoy = localDateObj.toISOString().split('T')[0]

  // Fetch overdue and today's cuotas dynamically
  const { data: cuotasVencidas } = await supabase
    .from('cuotas')
    .select('*, prestamos(*, clientes(*))')
    .eq('estado', 'PENDIENTE')
    .lte('fecha_vencimiento', hoy) // Use lte to include today's due payments

  const cuotasEnMora = cuotasVencidas || []
  const moraPorPrestamo = new Map()
  
  for (const cuota of cuotasEnMora) {
    const loan = cuota.prestamos
    if (!loan) continue
    const client = loan.clientes
    if (!client) continue
    
    const prestamoId = loan.id
    if (!moraPorPrestamo.has(prestamoId)) {
      moraPorPrestamo.set(prestamoId, {
        loan,
        client,
        montoMora: 0,
        cuotasPendientes: 0,
        fechaMasAntigua: cuota.fecha_vencimiento
      })
    }
    
    const data = moraPorPrestamo.get(prestamoId)
    data.montoMora += Number(cuota.monto)
    data.cuotasPendientes += 1
    if (cuota.fecha_vencimiento < data.fechaMasAntigua) {
      data.fechaMasAntigua = cuota.fecha_vencimiento;
    }
  }
  
  const overdueLoans = Array.from(moraPorPrestamo.values())

  // Simple aggregations for KPIs dynamically querying from actual tables
  // Use local timezone start of day for accurate 'today' collected
  const startOfToday = new Date(localDateObj.setHours(0,0,0,0)).toISOString()
  
  const { data: pagosHoy } = await supabase
    .from('pagos')
    .select('monto_pagado')
    .gte('created_at', startOfToday)

  const todayCollected = pagosHoy?.reduce((sum, pago) => sum + Number(pago.monto_pagado), 0) || 0;

  const { data: prestamosActivos } = await supabase
    .from('prestamos')
    .select('saldo_pendiente')
    .in('estado', ['ACTIVO', 'MORA'])

  const totalInStreet = prestamosActivos?.reduce((sum, p) => sum + Number(p.saldo_pendiente), 0) || 0;
  
  // Example fallback if no DB rows
  const { data: kpiData } = await supabase.from('caja_bancos').select('*').single()
  const dailyExpected = kpiData?.daily_expected || 450;
  
  const totalProfits = kpiData?.total_profits || 0;

  return (
    <div className="flex w-full flex-col space-y-6 p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="flex flex-col space-y-2">
        <h1 className="text-display-lg text-primary tracking-tight">Hola, Jefe</h1>
        <p className="text-body-base text-on-surface-variant">Resumen financiero de hoy</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Recaudo del Día */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-label-sm font-medium uppercase text-on-surface-variant">
              Recaudo del Día
            </CardTitle>
            <div className="rounded-full bg-secondary/10 p-2 text-secondary">
              <CircleDollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-headline-md text-secondary">{formatCurrency(todayCollected)}</div>
            <div className="mt-3 space-y-1">
              <div className="flex items-center justify-between text-xs text-on-surface-variant">
                <span>Progreso</span>
                <span>{formatCurrency(dailyExpected)} meta</span>
              </div>
              <Progress value={todayCollected} max={dailyExpected} />
            </div>
          </CardContent>
        </Card>

        {/* Capital en la Calle */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-label-sm font-medium uppercase text-on-surface-variant">
              Capital en la Calle
            </CardTitle>
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-headline-md">{formatCurrency(totalInStreet)}</div>
            <p className="text-xs text-on-surface-variant mt-1">Dinero total prestado activo</p>
          </CardContent>
        </Card>

        {/* Ganancias */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-label-sm font-medium uppercase text-on-surface-variant">
              Ganancias (Mes)
            </CardTitle>
            <div className="rounded-full bg-secondary/10 p-2 text-secondary">
              <LineChart className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-headline-md">{formatCurrency(totalProfits)}</div>
            <p className="text-xs text-secondary mt-1 flex items-center">
              <TrendingUp className="mr-1 h-3 w-3" />
              +12% vs mes anterior
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-error animate-pulse" />
          <h2 className="text-headline-md-mobile text-on-surface">Cobros de Hoy y Atrasos</h2>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {overdueLoans && overdueLoans.length > 0 ? (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            overdueLoans.map((item: any) => {
              const client = item.client
              const loan = item.loan
              const nombre = client.nombre || client.name || client.full_name;
              const doc = client.dni_cif || client.document;
              const tlf = client.telefono || client.phone;
              
              const diffTime = new Date(hoy).getTime() - new Date(item.fechaMasAntigua).getTime();
              const diasAtraso = Math.floor(diffTime / (1000 * 60 * 60 * 24));
              const diasText = diasAtraso > 0 ? ` (con ${diasAtraso} día(s) de atraso)` : ' (Vence hoy)';
              
              const whatsappMsg = encodeURIComponent(`Hola ${nombre}, te escribimos de MR para recordarte que presentas un saldo pendiente de ${item.cuotasPendientes} cuota(s)${diasAtraso > 0 ? ` con ${diasAtraso} día(s) de atraso` : ''} por un monto total de ${formatCurrency(item.montoMora)}. Por favor comunícate con nosotros.`)
              
              return (
                <Card key={loan.id} className={`border-error/50 bg-error/5 hover:border-error/80 hover:bg-error/10 transition-colors ${diasAtraso === 0 ? 'border-secondary/50 bg-secondary/5 hover:border-secondary/80 hover:bg-secondary/10' : ''}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-on-surface leading-tight">{nombre}</CardTitle>
                        <p className="text-sm text-on-surface-variant mt-1">{doc}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <Badge variant={diasAtraso > 0 ? "destructive" : "secondary"} className="animate-pulse whitespace-nowrap">
                          {item.cuotasPendientes} Cuota(s)
                        </Badge>
                        <span className={`text-[10px] font-bold ${diasAtraso > 0 ? 'text-error' : 'text-secondary'}`}>
                          {diasAtraso > 0 ? `${diasAtraso} DÍAS MORA` : 'COBRO HOY'}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-on-surface-variant">Monto Pendiente:</span>
                      <span className={`font-bold ${diasAtraso > 0 ? 'text-error' : 'text-secondary'}`}>{formatCurrency(item.montoMora)}</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <a
                      href={`https://wa.me/${tlf}?text=${whatsappMsg}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-9 w-full items-center justify-center gap-2 whitespace-nowrap rounded-md bg-error px-4 py-2 text-sm font-medium text-on-error transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Contactar por WhatsApp
                    </a>
                  </CardFooter>
                </Card>
              )
            })
          ) : (
            <div className="col-span-full py-8 text-center text-on-surface-variant">
              ¡Felicidades! No hay clientes con cuotas atrasadas.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
