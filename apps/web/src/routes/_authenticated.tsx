import { createFileRoute, Outlet, redirect, Link } from '@tanstack/react-router'
import { Button } from '../components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover'
import { Menu } from 'lucide-react'

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
        <nav className="hidden md:flex gap-6 font-mono text-sm uppercase tracking-widest font-bold">
          <Link to="/dashboard" className="text-muted-foreground hover:text-primary [&.active]:text-primary [&.active]:border-b-2 [&.active]:border-primary pb-1">Dashboard</Link>
          <Link to="/diary" className="text-muted-foreground hover:text-primary [&.active]:text-primary [&.active]:border-b-2 [&.active]:border-primary pb-1">Diary</Link>
          <Link to="/library" className="text-muted-foreground hover:text-primary [&.active]:text-primary [&.active]:border-b-2 [&.active]:border-primary pb-1">Library</Link>
          <Link to="/measurements" className="text-muted-foreground hover:text-primary [&.active]:text-primary [&.active]:border-b-2 [&.active]:border-primary pb-1">Measurements</Link>
          <Link to="/plans" className="text-muted-foreground hover:text-primary [&.active]:text-primary [&.active]:border-b-2 [&.active]:border-primary pb-1">Plans</Link>
          <Link to="/settings" className="text-muted-foreground hover:text-primary [&.active]:text-primary [&.active]:border-b-2 [&.active]:border-primary pb-1">Settings</Link>
        </nav>
        
        <div className="flex items-center gap-4">
          <div className="md:hidden">
            <Popover>
              <PopoverTrigger className="inline-flex items-center justify-center brutal-border hover:bg-primary transition-none rounded-none h-10 w-10 border-2 border-white bg-black text-white outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <Menu className="h-5 w-5" />
              </PopoverTrigger>
              <PopoverContent className="w-48 p-0 brutal-border bg-black rounded-none" align="end">
                <div className="flex flex-col font-mono text-sm uppercase tracking-widest font-bold">
                  <Link to="/dashboard" className="p-4 border-b border-white/20 text-muted-foreground hover:text-primary hover:bg-white/5 [&.active]:text-primary transition-colors">Dashboard</Link>
                  <Link to="/diary" className="p-4 border-b border-white/20 text-muted-foreground hover:text-primary hover:bg-white/5 [&.active]:text-primary transition-colors">Diary</Link>
                  <Link to="/library" className="p-4 border-b border-white/20 text-muted-foreground hover:text-primary hover:bg-white/5 [&.active]:text-primary transition-colors">Library</Link>
                  <Link to="/measurements" className="p-4 border-b border-white/20 text-muted-foreground hover:text-primary hover:bg-white/5 [&.active]:text-primary transition-colors">Measurements</Link>
                  <Link to="/plans" className="p-4 border-b border-white/20 text-muted-foreground hover:text-primary hover:bg-white/5 [&.active]:text-primary transition-colors">Plans</Link>
                  <Link to="/settings" className="p-4 text-muted-foreground hover:text-primary hover:bg-white/5 [&.active]:text-primary transition-colors">Settings</Link>
                </div>
              </PopoverContent>
            </Popover>
          </div>

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
        </div>
      </header>
      <main className="p-6 md:p-12 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  )
}
