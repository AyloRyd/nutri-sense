import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'

export const Route = createFileRoute('/_authenticated/library')({
  component: Library,
})

function Library() {
  return (
    <div className="flex flex-col gap-8 h-[70vh] items-center justify-center">
      <Card className="brutal-border brutal-shadow rounded-none bg-black max-w-lg w-full text-center py-12">
        <CardHeader className="relative">
          <CardTitle className="text-3xl font-black font-mono tracking-tighter uppercase text-white">
            Library.<span className="text-primary">System</span>
          </CardTitle>
          <CardDescription className="text-muted-foreground font-mono uppercase text-xs tracking-widest mt-2">
            Module offline
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-primary font-mono text-sm uppercase opacity-80 border border-primary/20 bg-primary/5 py-4 mt-6">
            <span className="animate-pulse mr-2">_</span>
            This feature is currently in development.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
