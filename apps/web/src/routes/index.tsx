import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { Button } from '../components/ui/button'

const ANDROID_APK_URL =
  'https://github.com/AyloRyd/nutri-sense/releases/latest/download/NutriSense.apk'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    if (localStorage.getItem('token')) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: Landing,
})

function Landing() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <section className="w-full max-w-5xl border-4 border-[#333333] brutal-shadow p-12 lg:p-24 bg-black relative z-10">
        <div className="absolute top-0 right-0 w-26 h-26 md:w-48 md:h-48 bg-primary transform translate-x-16 -translate-y-16 border-4 border-[#333333] -z-10" />
        <div className="absolute bottom-0 left-0 w-26 h-26 md:w-36 md:h-36 bg-primary transform -translate-x-20 translate-y-20 border-4 border-[#333333] -z-10" />

        <h1 className="text-4xl md:text-8xl font-black font-mono tracking-tighter uppercase mb-6 leading-none selection:bg-primary selection:text-black">
          Nutri<span className="text-primary">Sense</span>
        </h1>
        <p className="max-w-2xl text-xl md:text-2xl font-mono text-muted-foreground mb-12 uppercase tracking-wide selection:bg-primary selection:text-black">
          Your personal nutrition & meal tracking system. No fluff. Just data.
        </p>

        <div className="flex flex-wrap gap-6">
          <Button
            render={
              <Link
                to="/auth/login"
                className="no-underline hover:no-underline hover:bg-transparent hover:text-black outline-none border-none"
              >
                LOGIN_
              </Link>
            }
            size="lg"
            className="brutal-shadow brutal-border bg-primary text-black hover:bg-white text-xl uppercase font-bold py-8 px-12"
          />
          <Button
            render={
              <Link
                to="/auth/register"
                className="no-underline hover:no-underline hover:bg-primary outline-none border-none"
              >
                REGISTER_
              </Link>
            }
            size="lg"
            variant="outline"
            className="brutal-shadow brutal-border bg-black text-white hover:bg-primary hover:text-black hover:border-black text-xl uppercase font-bold py-8 px-12"
          />
        </div>

        <div className="mt-10 border-t-2 border-white/20 pt-6">
          <a
            href={ANDROID_APK_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-3 brutal-border brutal-shadow bg-black text-white hover:bg-primary hover:text-black transition-colors px-6 py-3 font-mono font-black uppercase tracking-widest text-sm"
          >
            Download Android APK_
          </a>
        </div>
      </section>

      <div
        className="absolute inset-0 z-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(#39FF14 1px, transparent 1px), linear-gradient(90deg, #39FF14 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
    </main>
  )
}
