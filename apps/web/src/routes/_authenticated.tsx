import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { Button } from '../components/ui/button'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: () => {
    if (!localStorage.getItem('token')) {
      throw redirect({
        to: '/auth/login',
      })
    }
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  return (
    <div className="min-h-screen bg-black">
      <header className="border-b-4 border-(--border) px-6 py-4 flex justify-between items-center bg-black sticky top-0 z-50">
        <h2 className="font-black text-white font-mono uppercase tracking-tighter text-2xl">
          Nutri<span className="text-primary">Sense</span>
        </h2>
        <Button
          variant="outline"
          onClick={() => {
            localStorage.removeItem('token')
            window.location.href = '/'
          }}
          className="brutal-border hover:bg-destructive hover:text-white rounded-none font-bold uppercase font-mono h-10 transition-none"
        >
          Logout_
        </Button>
      </header>
      <main className="p-6 md:p-12 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  )
}
