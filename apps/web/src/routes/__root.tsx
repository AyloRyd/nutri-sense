import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  Link,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import type { QueryClient } from '@tanstack/react-query'
import type { ErrorComponentProps } from '@tanstack/react-router'
import { AlertTriangle, RotateCcw, Home, SearchX } from 'lucide-react'

import '../styles.css'

interface RouterContext {
  queryClient: QueryClient
}

function GlobalErrorBoundary({ error, reset }: ErrorComponentProps) {
  const router = useRouter()
  const message =
    error instanceof Error ? error.message : 'An unexpected error occurred.'

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-8">
      <div
        className="max-w-lg w-full flex flex-col gap-6"
        style={{ animation: 'fadeIn 0.3s ease' }}
      >
        <div className="flex items-center gap-3 border-b-2 border-white pb-4">
          <AlertTriangle className="text-red-500 shrink-0" size={28} />
          <div>
            <h1 className="font-mono font-black uppercase tracking-widest text-white text-xl">
              System_Error
            </h1>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-0.5">
              Unhandled exception caught by root boundary
            </p>
          </div>
        </div>

        <div className="bg-neutral-950 brutal-border p-4 border-l-4 border-l-red-500">
          <p className="font-mono text-xs text-red-400 uppercase tracking-wider leading-relaxed break-all">
            {message}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              reset()
              router.invalidate()
            }}
            className="flex items-center gap-2 brutal-border px-5 py-2.5 font-mono text-xs uppercase font-bold tracking-widest text-white hover:bg-primary hover:text-black hover:border-primary transition-colors"
          >
            <RotateCcw size={14} />
            Retry_
          </button>
          <Link
            to="/dashboard"
            className="flex items-center gap-2 brutal-border px-5 py-2.5 font-mono text-xs uppercase font-bold tracking-widest text-muted-foreground hover:text-white transition-colors"
          >
            <Home size={14} />
            Dashboard_
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  )
}

function GlobalNotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-8">
      <div
        className="max-w-lg w-full flex flex-col gap-6"
        style={{ animation: 'fadeIn 0.3s ease' }}
      >
        <div className="flex items-center gap-3 border-b-2 border-white pb-4">
          <SearchX className="text-primary shrink-0" size={28} />
          <div>
            <h1 className="font-mono font-black uppercase tracking-widest text-white text-xl">
              404_Not_Found
            </h1>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-0.5">
              Route does not exist in this application
            </p>
          </div>
        </div>

        <div className="bg-neutral-950 brutal-border p-4 flex flex-col gap-1">
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
            Requested path:{' '}
            <span className="text-primary">{window.location.pathname}</span>
          </p>
          <p className="font-mono text-[10px] text-muted-foreground/60 uppercase tracking-wider">
            No matching route handler was registered.
          </p>
        </div>

        <Link
          to="/dashboard"
          className="flex items-center gap-2 brutal-border px-5 py-2.5 font-mono text-xs uppercase font-bold tracking-widest bg-primary text-black hover:bg-white transition-colors w-fit"
        >
          <Home size={14} />
          Return to Dashboard_
        </Link>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  )
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  errorComponent: GlobalErrorBoundary,
  notFoundComponent: GlobalNotFound,
})

function RootComponent() {
  return (
    <>
      <Outlet />
      <TanStackDevtools
        config={{
          position: 'bottom-right',
        }}
        plugins={[
          {
            name: 'TanStack Router',
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
    </>
  )
}
