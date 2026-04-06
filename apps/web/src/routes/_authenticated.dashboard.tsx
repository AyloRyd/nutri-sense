import { createFileRoute } from '@tanstack/react-router'
import { getUsersControllerGetMeQueryOptions } from '../api/endpoints/users/users'
import { useQuery } from '@tanstack/react-query'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../components/ui/card'

export const Route = createFileRoute('/_authenticated/dashboard')({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(getUsersControllerGetMeQueryOptions()),
  component: Dashboard,
})

function Dashboard() {
  const { data: user } = useQuery(getUsersControllerGetMeQueryOptions())

  return (
    <div className="flex flex-col gap-8">
      <Card className="brutal-border brutal-shadow rounded-none bg-black">
        <CardHeader className="border-b-2 border-white pb-6 relative">
          <CardTitle className="text-3xl font-black font-mono tracking-tighter uppercase text-white">
            System.<span className="text-primary">User</span>
          </CardTitle>
          <CardDescription className="text-muted-foreground font-mono uppercase text-xs tracking-widest mt-2">
            Active session payload for {user?.username}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-6 lg:p-8 overflow-x-auto bg-[#0a0a0a]">
            <pre className="font-mono text-primary text-sm leading-relaxed whitespace-pre-wrap wrap-break-word">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Active_Plans', value: '3', desc: 'Diet strategies' },
          { label: 'Meals_Logged', value: '14', desc: 'Past 7 days' },
          { label: 'Consistency', value: '100%', desc: 'Streak score' },
        ].map((item, i) => (
          <Card
            key={i}
            className="brutal-border brutal-shadow rounded-none bg-black"
          >
            <CardHeader className="pb-2 border-b border-(--border) relative">
              <div className="w-full h-1 bg-primary absolute top-0 left-0" />
              <CardTitle className="text-xs font-bold font-mono tracking-widest uppercase text-muted-foreground pt-2">
                {item.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-5xl font-black font-mono text-white mb-2">
                {item.value}
              </div>
              <p className="text-xs font-mono text-primary uppercase tracking-wider">
                {item.desc}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
