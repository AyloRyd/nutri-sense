import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { formatDate } from '../../lib/date-format'
import { format } from 'date-fns'

import { getUsersControllerGetMeQueryOptions } from '../../api/endpoints/users/users'
import { getPlansControllerFindByDateQueryOptions } from '../../api/endpoints/plans/plans'
import { getIotControllerGetStatusQueryOptions } from '../../api/endpoints/iot-scales/iot-scales'
import { getMealsControllerFindAllQueryOptions } from '../../api/endpoints/meals/meals'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card'
import { Progress } from '../../components/ui/progress'

const ANDROID_APK_URL =
  'https://github.com/AyloRyd/nutri-sense/releases/latest/download/app-debug.apk'

export const Route = createFileRoute('/_authenticated/dashboard')({
  loader: async ({ context: { queryClient } }) => {
    const today = format(new Date(), 'yyyy-MM-dd')
    await Promise.all([
      queryClient.ensureQueryData(getUsersControllerGetMeQueryOptions({})),
      queryClient
        .ensureQueryData(getPlansControllerFindByDateQueryOptions(today, {}))
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
  const { t } = useTranslation()
  const todayRaw = new Date()
  const todayQuery = format(todayRaw, 'yyyy-MM-dd')
  const todayDisplay = formatDate(todayRaw, 'yyyy-MM-dd') // fallback just in case or formatting differently

  const { data: user } = useQuery(getUsersControllerGetMeQueryOptions({}))
  const { data: plan } = useQuery(
    getPlansControllerFindByDateQueryOptions(todayQuery, {}),
  )
  const { data: scaleStatus } = useQuery({
    ...(getIotControllerGetStatusQueryOptions({}) as any),
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  })
  const { data: meals } = useQuery(
    getMealsControllerFindAllQueryOptions(
      { start: todayQuery, end: todayQuery },
      {},
    ),
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
      <div className="text-center">
        <h1 className="text-3xl font-black font-mono tracking-tighter uppercase text-white">
          {t('dashboard.title')}
          <span className="text-primary">{t('dashboard.titleStrong')}</span>
        </h1>
        <p className="text-muted-foreground font-mono uppercase text-xs tracking-widest mt-1">
          {t('dashboard.hello', {
            username: user?.username || 'User',
            date: todayDisplay,
          })}
        </p>
      </div>

      <div className="flex flex-col gap-8 max-w-2xl mx-auto w-full">
        <Link
          to="/diary/$date"
          params={{ date: todayQuery }}
          className="group block transition-transform hover:scale-[1.01]"
        >
          <Card className="brutal-border brutal-shadow rounded-none bg-black overflow-hidden">
            <CardHeader className="border-b-2 border-white pb-6 relative bg-neutral-900/50">
              <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
              <div className="flex justify-between items-end pt-4">
                <div>
                  <CardTitle className="text-sm font-black font-mono tracking-widest uppercase text-muted-foreground mb-1">
                    {t('dashboard.dailyTarget')}
                  </CardTitle>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black font-mono text-white leading-none">
                      {actualCalories.toFixed(0)}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground uppercase">
                      / {pCals} {t('dashboard.kcal')}
                    </span>
                  </div>
                </div>
                <div className="bg-primary text-black px-3 py-1 font-mono text-xs font-black uppercase tracking-tighter">
                  {t('dashboard.mealsLogged', { count: meals?.length || 0 })}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 flex flex-col gap-8">
              {/* Main Progress */}
              <div className="flex flex-col gap-3">
                <Progress
                  value={Math.min((actualCalories / pCals) * 100, 100)}
                  className="h-6 rounded-none bg-neutral-900 border-2 border-white"
                />
              </div>

              {/* Individual Macros */}
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between font-mono text-xs uppercase text-white font-bold">
                    <span>{t('dashboard.protein')}</span>
                    <span>
                      {actualProtein.toFixed(0)}{' '}
                      <span className="text-muted-foreground">/ {pProt} g</span>
                    </span>
                  </div>
                  <Progress
                    value={Math.min((actualProtein / pProt) * 100, 100)}
                    className="h-2 rounded-none bg-neutral-900 border border-white/20"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between font-mono text-xs uppercase text-white font-bold">
                    <span>{t('dashboard.fats')}</span>
                    <span>
                      {actualFats.toFixed(0)}{' '}
                      <span className="text-muted-foreground">/ {pFat} g</span>
                    </span>
                  </div>
                  <Progress
                    value={Math.min((actualFats / pFat) * 100, 100)}
                    className="h-2 rounded-none bg-neutral-900 border border-white/20"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between font-mono text-xs uppercase text-white font-bold">
                    <span>{t('dashboard.carbs')}</span>
                    <span>
                      {actualCarbs.toFixed(0)}{' '}
                      <span className="text-muted-foreground">/ {pCarb} g</span>
                    </span>
                  </div>
                  <Progress
                    value={Math.min((actualCarbs / pCarb) * 100, 100)}
                    className="h-2 rounded-none bg-neutral-900 border border-white/20"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-center">
                <span className="text-[10px] font-mono uppercase text-primary animate-pulse tracking-widest font-black">
                  {t('dashboard.expandDiary')}
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link
          to="/settings"
          hash="iot-section"
          className="block transition-transform hover:scale-[1.01]"
        >
          <Card className="brutal-border brutal-shadow rounded-none bg-black h-full overflow-hidden">
            <CardHeader className="border-b-2 border-white py-4 relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-white/20" />
              <CardTitle className="text-sm font-black font-mono tracking-widest uppercase text-white">
                {t('dashboard.networkIoT')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex flex-col gap-4">
              <div className="flex justify-between items-center bg-neutral-900/50 border-2 border-white/10 p-4">
                <span className="font-mono text-xs text-muted-foreground uppercase">
                  {t('dashboard.connectivityStatus')}
                </span>
                {(scaleStatus as any)?.is_linked ? (
                  <span className="font-mono text-xs font-bold text-primary uppercase flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    {t('dashboard.linked')}
                  </span>
                ) : (
                  <span className="font-mono text-xs font-bold text-red-500 uppercase flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-500"></span>
                    {t('dashboard.disconnected')}
                  </span>
                )}
              </div>
              <p className="text-[10px] font-mono uppercase text-muted-foreground text-center mt-2 tracking-tighter">
                {t('dashboard.iotDesc')}
              </p>
            </CardContent>
          </Card>
        </Link>

        <a
          href={ANDROID_APK_URL}
          target="_blank"
          rel="noreferrer"
          className="block transition-transform hover:scale-[1.01]"
        >
          <Card className="brutal-border brutal-shadow rounded-none bg-black overflow-hidden">
            <CardHeader className="border-b-2 border-white py-4 relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
              <CardTitle className="text-sm font-black font-mono tracking-widest uppercase text-white">
                Android Build
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex items-center justify-between">
              <span className="font-mono text-xs uppercase text-muted-foreground">
                Download latest APK
              </span>
              <span className="font-mono text-xs uppercase font-black text-primary">
                Tap to install_
              </span>
            </CardContent>
          </Card>
        </a>
      </div>
    </div>
  )
}
