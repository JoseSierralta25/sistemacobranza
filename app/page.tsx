import { redirect } from "next/navigation"

export default function Home() {
  // En un sistema real, aquí iría la validación de autenticación y rol.
  // Para propósitos de este prototipo funcional, redirigimos al Dashboard del Dueño.
  redirect("/supervisor")
}
