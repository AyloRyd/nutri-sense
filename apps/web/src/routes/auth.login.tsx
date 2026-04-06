import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useAuthControllerLogin } from '../api/endpoints/auth/auth'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'

export const Route = createFileRoute('/auth/login')({
  component: Login,
})

function Login() {
  const navigate = useNavigate()
  const loginMutation = useAuthControllerLogin()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const resp = await loginMutation.mutateAsync({
        data: { email, password },
      })
      if (resp.access_token) {
        localStorage.setItem('token', resp.access_token)
        navigate({ to: '/dashboard' })
      }
    } catch (err) {
      console.error(err)
      alert('Failed to login')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 relative">
      <div
        className="absolute inset-0 z-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(#39FF14 1px, transparent 1px), linear-gradient(90deg, #39FF14 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      <section className="w-full max-w-md brutal-border brutal-shadow bg-black p-8 relative z-10">
        <div className="absolute -top-4 -left-4 w-8 h-8 bg-primary brutal-border" />

        <h1 className="text-4xl font-black font-mono tracking-tighter uppercase mb-2">
          Login
        </h1>
        <p className="text-muted-foreground font-mono uppercase text-sm mb-8 relative pb-4">
          Access your terminal
          <span className="absolute bottom-0 left-0 w-16 h-1 bg-primary block" />
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="email"
              className="uppercase font-bold tracking-widest text-xs font-mono"
            >
              Email
            </Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="brutal-border focus-visible:ring-primary focus-visible:ring-2 bg-black text-white font-mono rounded-none h-12"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="password"
              className="uppercase font-bold tracking-widest text-xs font-mono"
            >
              Password
            </Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="brutal-border focus-visible:ring-primary focus-visible:ring-2 bg-black text-white font-mono rounded-none h-12"
            />
          </div>

          <Button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full brutal-shadow brutal-border bg-primary text-black hover:bg-white hover:text-black uppercase font-bold tracking-widest mt-4 h-12 rounded-none transition-none"
          >
            {loginMutation.isPending ? 'Authenticating...' : 'Submit_'}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-(--border) text-center font-mono text-xs uppercase">
          New user?{' '}
          <Link
            to="/auth/register"
            className="text-primary hover:text-white ml-2 hover:bg-transparent"
          >
            Register_
          </Link>
        </div>
      </section>
    </main>
  )
}
