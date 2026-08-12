"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { User, Phone, UserPlus, CheckCircle2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function ClientesPage() {
  const [clients, setClients] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<any | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [name, setName] = useState("")
  const [document, setDocument] = useState("")
  const [phone, setPhone] = useState("")
  const supabase = createClient()

  const fetchClients = async () => {
    const { data } = await supabase
      .from('clientes')
      .select('*, prestamos(cuotas(estado, fecha_vencimiento))')
      .order('nombre', { ascending: true })
      
    if (data) {
      // Ajuste para zona horaria local (UTC-4 Venezuela)
      const localDateObj = new Date(new Date().getTime() - (4 * 3600 * 1000))
      const hoy = localDateObj.toISOString().split('T')[0]

      const clientsWithStatus = data.map((client: any) => {
        let computedStatus = "success"; // Al Día
        
        if (client.prestamos && client.prestamos.length > 0) {
          for (const prestamo of client.prestamos) {
            if (prestamo.cuotas && prestamo.cuotas.length > 0) {
              for (const cuota of prestamo.cuotas) {
                if (cuota.estado === 'PENDIENTE') {
                  if (cuota.fecha_vencimiento < hoy) {
                    computedStatus = "danger"; // Mora
                    break;
                  } else if (cuota.fecha_vencimiento === hoy && computedStatus !== "danger") {
                    computedStatus = "warning"; // Cobro Hoy
                  }
                }
              }
            }
            if (computedStatus === "danger") break;
          }
        }
        
        return {
          ...client,
          computedStatus
        }
      });
      setClients(clientsWithStatus)
    }
  }

  useEffect(() => {
    fetchClients()
  }, [])

  const handleEditClick = (client: any) => {
    setEditingClient(client)
    setName(client.nombre || client.name || client.full_name || "")
    setDocument(client.dni_cif || client.document || "")
    setPhone(client.telefono || client.phone || "")
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setTimeout(() => {
      setEditingClient(null)
      setName("")
      setDocument("")
      setPhone("")
    }, 200)
  }

  const handleSaveClient = async () => {
    const payload = {
      full_name: name,
      name: name,
      nombre: name,
      document: document,
      dni_cif: document,
      phone: phone,
      telefono: phone,
      status: editingClient ? editingClient.status : 'ACTIVO' // Keep existing status if editing
    }
    
    let error
    if (editingClient) {
      const { error: err } = await supabase.from('clientes').update(payload).eq('id', editingClient.id)
      error = err
    } else {
      const { error: err } = await supabase.from('clientes').insert([payload])
      error = err
    }

    if (!error) {
      setShowSuccess(true)
      fetchClients()
      setTimeout(() => {
        setShowSuccess(false)
        handleCloseDialog()
      }, 2000)
    } else {
      alert("Error al guardar cliente: " + error.message)
    }
  }

  const handleDeleteClient = async () => {
    if (!editingClient) return
    
    if (confirm("¿Estás seguro de que deseas eliminar este cliente? Esta acción borrará todo su historial y no se puede deshacer.")) {
      const { error } = await supabase.from('clientes').delete().eq('id', editingClient.id)
      
      if (!error) {
        setShowSuccess(true)
        fetchClients()
        setTimeout(() => {
          setShowSuccess(false)
          handleCloseDialog()
        }, 2000)
      } else {
        alert("Error al eliminar cliente: " + error.message)
      }
    }
  }

  return (
    <div className="flex w-full flex-col space-y-6 p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col space-y-2">
          <h1 className="text-display-lg text-primary tracking-tight">Directorio de Clientes</h1>
          <p className="text-body-base text-on-surface-variant">Listado completo de prestatarios</p>
        </div>
        <Button onClick={() => { setEditingClient(null); setName(""); setDocument(""); setPhone(""); setIsDialogOpen(true); }} className="w-full sm:w-auto gap-2 transition-transform active:scale-95">
          <UserPlus className="h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {clients.map((client, idx) => (
          <div key={client.id} className="animate-in fade-in zoom-in-95 duration-500 cursor-pointer transition-transform hover:scale-[1.02]" style={{ animationDelay: `${idx * 50}ms` }} onClick={() => handleEditClick(client)}>
            <Card className="hover:border-primary/50 transition-colors">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-surface-variant p-2 text-on-surface">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-base text-on-surface">{client.nombre || client.name || client.full_name}</CardTitle>
                  <p className="text-xs text-on-surface-variant mt-0.5">{client.dni_cif || client.document}</p>
                </div>
              </div>
              <Badge variant={client.computedStatus === "danger" ? "destructive" : client.computedStatus === "warning" ? "warning" : "success"}>
                {client.computedStatus === "danger" ? "Mora" : client.computedStatus === "warning" ? "Cobro Hoy" : "Al Día"}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-on-surface-variant mt-2">
                <Phone className="h-3 w-3" />
                <span className="text-mono-data">+{client.telefono || client.phone}</span>
              </div>
            </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent onClose={handleCloseDialog}>
          {showSuccess ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4 animate-in zoom-in duration-300">
              <div className="rounded-full bg-[#00E676]/20 p-4">
                <CheckCircle2 className="h-12 w-12 text-[#00E676]" />
              </div>
              <h2 className="text-xl font-bold text-on-surface">¡{editingClient ? "Cliente Actualizado" : "Cliente Agregado"}!</h2>
              <p className="text-on-surface-variant">{editingClient ? "Los datos se han guardado." : "El nuevo cliente se ha registrado con éxito."}</p>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>{editingClient ? "Editar Cliente" : "Registrar Nuevo Cliente"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-on-surface">Nombre Completo</label>
                  <Input 
                    placeholder="Ej. Juan Pérez" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-on-surface">Cédula / Documento</label>
                  <Input 
                    placeholder="Ej. V-12345678" 
                    value={document} 
                    onChange={(e) => setDocument(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-on-surface">Teléfono (WhatsApp)</label>
                  <Input 
                    placeholder="Ej. 584141234567" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                  />
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <Button 
                    className="w-full transition-transform active:scale-95" 
                    size="lg" 
                    variant="success" 
                    onClick={handleSaveClient} 
                    disabled={!name || !document || !phone}
                  >
                    {editingClient ? "Guardar Cambios" : "Guardar Cliente"}
                  </Button>
                  
                  {editingClient && (
                    <Button 
                      className="w-full transition-transform active:scale-95 text-error hover:bg-error/10 hover:text-error" 
                      size="sm" 
                      variant="ghost" 
                      onClick={handleDeleteClient}
                    >
                      Eliminar Cliente
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
