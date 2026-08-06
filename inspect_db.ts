import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

async function inspectDB() {
  const { data: prestamos, error: error1 } = await supabase.from('prestamos').select('*').limit(1)
  const { data: pagos, error: error2 } = await supabase.from('pagos').select('*').limit(1)
  const { data: clientes, error: error3 } = await supabase.from('clientes').select('*').limit(1)
  
  // Try to query cuotas to see if it exists
  const { data: cuotas, error: error4 } = await supabase.from('cuotas').select('*').limit(1)
  
  console.log('Prestamos columns:', prestamos ? Object.keys(prestamos[0] || {}) : error1?.message)
  console.log('Pagos columns:', pagos ? Object.keys(pagos[0] || {}) : error2?.message)
  console.log('Clientes columns:', clientes ? Object.keys(clientes[0] || {}) : error3?.message)
  console.log('Cuotas table exists?', cuotas ? 'Yes' : 'No', cuotas ? Object.keys(cuotas[0] || {}) : error4?.message)
}

inspectDB()
