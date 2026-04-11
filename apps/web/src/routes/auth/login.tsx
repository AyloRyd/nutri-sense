import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Eye, EyeOff, AlertTriangle } from 'lucide-react'
import { useAuthControllerLogin } from '../../api/endpoints/auth/auth'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'

export const Route = createFileRoute('/auth/login')({
  component: Login,
})

function Login() {
  const navigate = useNavigate()
  const loginMutation = useAuthControllerLogin()

  const [showPassword, setShowPassword] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      setGlobalError(null)
      try {
        const resp = await loginMutation.mutateAsync({
          data: value,
        })
        if (resp.access_token) {
          localStorage.setItem('token', resp.access_token)
          navigate({ to: '/dashboard' })
        }
      } catch (err: any) {
        console.error(err)
        const errorMessage =
          err?.response?.data?.message ||
          err?.message ||
          'Failed to authenticate sequence.'
        setGlobalError(errorMessage)
      }
    },
  })

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

        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="flex flex-col gap-6"
        >
          {globalError && (
            <div className="brutal-border bg-red-950 text-red-500 font-mono text-xs uppercase p-3 flex items-center gap-2">
              <AlertTriangle size={16} />
              <span>{globalError}</span>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <form.Field
              name="email"
              validators={{
                onChange: z
                  .string()
                  .min(1, 'Email is required.')
                  .email('Invalid email address format.'),
              }}
              children={(field) => (
                <>
                  <Label
                    htmlFor="email"
                    className={`uppercase font-bold tracking-widest text-xs font-mono flex justify-between ${field.state.meta.errors.length ? 'text-red-500' : ''}`}
                  >
                    <span>Email</span>
                    {field.state.meta.errors.length > 0 && (
                      <span className="text-red-500 normal-case">
                        {
                          field.state.meta.errors
                            .map((e: any) =>
                              typeof e === 'string' ? e : e.message,
                            )
                            .filter(Boolean)[0]
                        }
                      </span>
                    )}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className={`brutal-border focus-visible:ring-primary focus-visible:ring-2 bg-black text-white font-mono rounded-none h-12 ${field.state.meta.errors.length ? 'border-red-500' : ''}`}
                  />
                </>
              )}
            />
          </div>

          <div className="flex flex-col gap-2">
            <form.Field
              name="password"
              validators={{
                onChange: z.string().min(1, 'Password is required.'),
              }}
              children={(field) => (
                <>
                  <Label
                    htmlFor="password"
                    className={`uppercase font-bold tracking-widest text-xs font-mono flex justify-between ${field.state.meta.errors.length ? 'text-red-500' : ''}`}
                  >
                    <span>Password</span>
                    {field.state.meta.errors.length > 0 && (
                      <span className="text-red-500 normal-case">
                        {
                          field.state.meta.errors
                            .map((e: any) =>
                              typeof e === 'string' ? e : e.message,
                            )
                            .filter(Boolean)[0]
                        }
                      </span>
                    )}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className={`brutal-border focus-visible:ring-primary focus-visible:ring-2 bg-black text-white font-mono rounded-none h-12 pr-10 ${field.state.meta.errors.length ? 'border-red-500' : ''}`}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </>
              )}
            />
          </div>

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                disabled={!canSubmit || loginMutation.isPending || isSubmitting}
                className="w-full brutal-shadow brutal-border bg-primary text-black hover:bg-white hover:text-black uppercase font-bold tracking-widest mt-4 h-12 rounded-none transition-none"
              >
                {loginMutation.isPending || isSubmitting
                  ? 'Authenticating...'
                  : 'Submit_'}
              </Button>
            )}
          />
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
