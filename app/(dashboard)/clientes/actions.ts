'use server'

import { createClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from 'next/cache'

export async function getClientsWithStatus() {
  noStore();
  const supabase = await createClient();
  
  // 1. Fetch all clients
  const { data: clientes } = await supabase
    .from('clientes')
    .select('*')
    .order('nombre', { ascending: true })
    
  // 2. Fetch all cuotas in arrears or due today
  const localDateObj = new Date(new Date().getTime() - (4 * 3600 * 1000))
  const hoy = localDateObj.toISOString().split('T')[0]

  const { data: cuotasVencidas } = await supabase
    .from('cuotas')
    .select('*, prestamos(*, clientes(*))')
    .eq('estado', 'PENDIENTE')
    .lte('fecha_vencimiento', hoy)
    
  if (!clientes) return [];

  return clientes.map((client: any) => {
    let computedStatus = "success";
    
    if (cuotasVencidas && cuotasVencidas.length > 0) {
      const cuotasDelCliente = cuotasVencidas.filter(
        (cuota: any) => cuota.prestamos?.cliente_id === client.id
      );

      if (cuotasDelCliente.length > 0) {
        const hasMora = cuotasDelCliente.some((c: any) => c.fecha_vencimiento < hoy);
        if (hasMora) {
          computedStatus = "danger";
        } else {
          computedStatus = "warning";
        }
      }
    }
    
    return { ...client, computedStatus };
  });
}
