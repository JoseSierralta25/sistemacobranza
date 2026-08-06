<div align="center">
  <h1>👑 MR - Sistema de Gestión de Préstamos</h1>
  <p><strong>Plataforma integral, moderna y segura para la administración financiera, créditos y recuperación de cartera.</strong></p>
</div>

<br />

## 🌟 Descripción General

**MR Dashboard** es un sistema web progresivo diseñado para modernizar y agilizar las operaciones de prestamistas independientes y agencias de crédito. 
A través de una interfaz *premium* y altamente responsiva (Mobile-First), permite llevar un control milimétrico sobre el capital en la calle, clientes activos, modalidades de pago (Fijo vs. Revolvente) y un seguimiento agresivo de la mora mediante integración con WhatsApp.

## 🚀 Características Principales

*   📊 **Panel de Control (Supervisor):** Visión global e instantánea de la salud financiera (Capital prestado, proyecciones de ganancia, dinero en riesgo, rendimiento diario).
*   👥 **Gestión de Clientes:** Perfiles detallados, historial de pagos, reputación y métricas individuales.
*   💰 **Modelos de Préstamo Inteligentes:**
    *   **Préstamos Fijos:** Amortización clásica (Capital + Interés en cuotas).
    *   **Préstamos Revolventes (Solo Intereses):** Generación automática de intereses mes a mes conservando el capital intacto, con opción a *Rollover* (Renovación).
*   📲 **Módulo de Operaciones Avanzado:** Registro de pagos totales, parciales, cobro de intereses independientes y liquidación anticipada.
*   🚨 **Centro de Recuperación (Mora):** Clasificación automática por niveles (Temprana, Riesgo, Crítica). Integración de 1-clic con WhatsApp para notificaciones de cobranza.
*   🌙 **UI/UX Premium:** Modo oscuro nativo, interfaz limpia construida con Tailwind CSS, y adaptación perfecta a dispositivos móviles.

## 🛠️ Stack Tecnológico

Este proyecto está construido en el borde de la tecnología web moderna:

*   **Framework:** [Next.js 15 (App Router)](https://nextjs.org/)
*   **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
*   **Estilos y UI:** [Tailwind CSS](https://tailwindcss.com/) + [Shadcn/UI](https://ui.shadcn.com/) + Lucide Icons.
*   **Base de Datos & Auth:** [Supabase](https://supabase.com/) (PostgreSQL)
*   **Despliegue Recomendado:** [Vercel](https://vercel.com)

## ⚙️ Instalación Local

Si deseas correr este proyecto en tu máquina para realizar pruebas o desarrollo:

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/josesierralta25/sistemacobranza.git
   cd sistemacobranza
   ```

2. **Instala las dependencias:**
   ```bash
   pnpm install
   ```
   *(Si no tienes pnpm, puedes usar `npm install` o `yarn install`)*

3. **Configura las Variables de Entorno:**
   Crea un archivo `.env.local` en la raíz del proyecto y añade las credenciales de tu proyecto de Supabase:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=tu_anon_key_de_supabase
   ```

4. **Inicia el servidor de desarrollo:**
   ```bash
   pnpm run dev
   ```

5. **Abre el navegador:** Visita `http://localhost:3000` para ver la aplicación corriendo.

## 🔒 Privacidad y Seguridad

*   El código ignora proactivamente todas las credenciales y variables de entorno a través de un archivo `.gitignore` estricto.
*   La seguridad de la base de datos está gestionada a través de las Políticas de Seguridad de Filas (RLS) de Supabase.

---
<div align="center">
  <p>Desarrollado con 💻 para la excelencia financiera.</p>
</div>
