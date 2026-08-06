import { Sidebar } from "@/components/layout/sidebar"
import { BottomNav } from "@/components/layout/bottom-nav"
import { MobileHeader } from "@/components/layout/mobile-header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen w-full bg-transparent flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <MobileHeader />
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0 px-2 md:px-0">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
