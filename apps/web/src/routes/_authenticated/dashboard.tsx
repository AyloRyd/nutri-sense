import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'

import { getUsersControllerGetMeQueryOptions } from '../../api/endpoints/users/users'
import { getPlansControllerFindByDateQueryOptions } from '../../api/endpoints/plans/plans'
import { getMeasurementsControllerFindCurrentQueryOptions } from '../../api/endpoints/measurements/measurements'
import { getIotControllerGetStatusQueryOptions } from '../../api/endpoints/iot-scales/iot-scales'
import { getMealsControllerFindAllQueryOptions } from '../../api/endpoints/meals/meals'

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Progress } from '../../components/ui/progress'

export const Route = createFileRoute('/_authenticated/dashboard')({
  loader: async ({ context: { queryClient } }) => {
    const today = format(new Date(), 'yyyy-MM-dd')
    await Promise.all([
      queryClient.ensureQueryData(getUsersControllerGetMeQueryOptions({})),
      queryClient
        .ensureQueryData(getPlansControllerFindByDateQueryOptions(today, {}))
        .catch(() => null),
      queryClient
        .ensureQueryData(
          getMeasurementsControllerFindCurrentQueryOptions({}) as any,
        )
        .catch(() => null),
      queryClient
        .ensureQueryData(getIotControllerGetStatusQueryOptions({}) as any)
        .catch(() => null),
      queryClient
        .ensureQueryData(
          getMealsControllerFindAllQueryOptions(
            { start: today, end: today },
            {},
          ),
        )
        .catch(() => null),
    ])
  },
  component: Dashboard,
})

function Dashboard() {
  const today = format(new Date(), 'yyyy-MM-dd')

  const { data: user } = useQuery(getUsersControllerGetMeQueryOptions({}))
  const { data: plan } = useQuery(
    getPlansControllerFindByDateQueryOptions(today, {}),
  )
  const { data: currentMeasurement } = useQuery(
    getMeasurementsControllerFindCurrentQueryOptions({}) as any,
  )
  const { data: scaleStatus } = useQuery(
    getIotControllerGetStatusQueryOptions({}) as any,
  )
  const { data: meals } = useQuery(
    getMealsControllerFindAllQueryOptions({ start: today, end: today }, {}),
  )

  const actualCalories =
    meals?.reduce((acc, meal) => acc + meal.calories, 0) || 0
  const actualProtein = meals?.reduce((acc, meal) => acc + meal.protein, 0) || 0
  const actualFats = meals?.reduce((acc, meal) => acc + meal.fats, 0) || 0
  const actualCarbs = meals?.reduce((acc, meal) => acc + meal.carbs, 0) || 0

  const pCals = plan?.day_calories || 2000
  const pProt = plan?.day_protein || 100
  const pFat = plan?.day_fats || 50
  const pCarb = plan?.day_carbs || 200

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-black font-mono tracking-tighter uppercase text-white">
          System.<span className="text-primary">Dashboard</span>
        </h1>
        <p className="text-muted-foreground font-mono uppercase text-xs tracking-widest mt-1">
          Hello {user?.username}, active overview for {today}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="brutal-border brutal-shadow rounded-none bg-black">
          <CardHeader className="border-b-2 border-white pb-4 relative">
            <CardTitle className="text-sm font-black font-mono tracking-widest uppercase text-white">
              Daily_Target_Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between font-mono text-xs uppercase text-primary font-bold">
                <span>Calories</span>
                <span>
                  {actualCalories.toFixed(0)} / {pCals} kcal
                </span>
              </div>
              <Progress
                value={Math.min((actualCalories / pCals) * 100, 100)}
                className="h-4 rounded-none bg-neutral-900 border border-white"
              />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between font-mono text-xs uppercase text-white">
                <span>Protein</span>
                <span>
                  {actualProtein.toFixed(0)} / {pProt} g
                </span>
              </div>
              <Progress
                value={Math.min((actualProtein / pProt) * 100, 100)}
                className="h-2 rounded-none bg-neutral-900"
              />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between font-mono text-xs uppercase text-white">
                <span>Fats</span>
                <span>
                  {actualFats.toFixed(0)} / {pFat} g
                </span>
              </div>
              <Progress
                value={Math.min((actualFats / pFat) * 100, 100)}
                className="h-2 rounded-none bg-neutral-900"
              />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between font-mono text-xs uppercase text-white">
                <span>Carbs</span>
                <span>
                  {actualCarbs.toFixed(0)} / {pCarb} g
                </span>
              </div>
              <Progress
                value={Math.min((actualCarbs / pCarb) * 100, 100)}
                className="h-2 rounded-none bg-neutral-900"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-8">
          <Card className="brutal-border brutal-shadow rounded-none bg-black">
            <CardHeader className="border-b-2 border-white pb-4 relative">
              <CardTitle className="text-sm font-black font-mono tracking-widest uppercase text-white">
                Network.IoT_Scale
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex flex-col gap-4">
              <div className="flex justify-between items-center bg-[#0a0a0a] border border-white p-4">
                <span className="font-mono text-xs text-muted-foreground uppercase">
                  Status
                </span>
                {(scaleStatus as any)?.isLinked ? (
                  <span className="font-mono text-xs font-bold text-primary uppercase animate-pulse">
                    ● Linked
                  </span>
                ) : (
                  <span className="font-mono text-xs font-bold text-red-500 uppercase">
                    ○ Disconnected
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center bg-[#0a0a0a] border border-white p-4">
                <span className="font-mono text-xs text-muted-foreground uppercase">
                  Latest Weight
                </span>
                <span className="font-mono text-lg font-black text-white uppercase">
                  {(currentMeasurement as any)?.weight || '--'} kg
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="brutal-border brutal-shadow rounded-none bg-black">
            <CardHeader className="border-b-2 border-white pb-4 relative">
              <CardTitle className="text-sm font-black font-mono tracking-widest uppercase text-white">
                Quick_Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs font-mono uppercase border-b border-primary/30 pb-1 mb-1">
                  Meals Today
                </span>
                <span className="text-2xl font-bold font-mono text-white">
                  {meals?.length || 0}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs font-mono uppercase border-b border-primary/30 pb-1 mb-1">
                  BodyFat %
                </span>
                <span className="text-2xl font-bold font-mono text-white">
                  {(currentMeasurement as any)?.bodyFat || '--'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
