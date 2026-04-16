import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isToday,
  isAfter,
  startOfToday,
  addMonths,
  subMonths,
} from 'date-fns'
import { formatDate } from '../../../lib/date-format'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { getStatsControllerGetStatsQueryOptions } from '../../../api/endpoints/stats/stats'
import { Button } from '../../../components/ui/button'

export const Route = createFileRoute('/_authenticated/diary/')({
  component: DiaryCalendar,
})

function DiaryCalendar() {
  const { t } = useTranslation()
  const [currentDate, setCurrentDate] = useState(new Date())
  const navigate = useNavigate()

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)

  const { data: stats } = useQuery({
    ...getStatsControllerGetStatsQueryOptions({
      start: format(monthStart, 'yyyy-MM-dd'),
      end: format(monthEnd, 'yyyy-MM-dd'),
    }),
  })

  // Ensure calendar grid aligns to a 7-day week logic by getting the start day of week
  const startDateOffset = monthStart.getDay() // 0 is Sunday
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))

  // Compute month summary
  const summary = useMemo(() => {
    if (!stats) return { cals: 0, prot: 0, fat: 0, carb: 0, daysWithData: 0 }
    return stats.reduce(
      (acc, curr) => {
        if (curr.actual_calories > 0) acc.daysWithData++
        acc.cals += curr.actual_calories
        acc.prot += curr.actual_protein
        acc.fat += curr.actual_fats
        acc.carb += curr.actual_carbs
        return acc
      },
      { cals: 0, prot: 0, fat: 0, carb: 0, daysWithData: 0 },
    )
  }, [stats])

  return (
    <div className="flex flex-col gap-6 mb-24">
      <div className="mt-8 p-6 bg-black brutal-border brutal-shadow flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-center">
        <div className="border-b-2 border-primary pb-2 xl:border-none xl:pb-0 w-full xl:w-auto">
          <h3 className="font-mono text-2xl font-black uppercase text-white tracking-widest">
            {t('diary.monthSummary')}
          </h3>
          <p className="font-mono text-xs uppercase text-primary mt-1 font-bold">
            {t('diary.basedOnLoggedDays', { count: summary.daysWithData })}
          </p>
        </div>
        <div className="grid grid-cols-1 min-[400px]:grid-cols-3 gap-4 md:gap-8 font-mono text-sm uppercase w-full xl:w-auto">
          <div className="flex flex-col bg-neutral-900 p-3 brutal-border border border-neutral-700">
            <span className="text-muted-foreground text-[10px] tracking-widest">
              {t('diary.totalKcal')}
            </span>
            <span className="font-black text-xl text-white">
              {Math.round(summary.cals).toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col bg-neutral-900 p-3 brutal-border border border-neutral-700">
            <span className="text-muted-foreground text-[10px] tracking-widest">
              {t('diary.avgKcalDay')}
            </span>
            <span className="font-black text-xl text-white">
              {summary.daysWithData > 0
                ? Math.round(
                    summary.cals / summary.daysWithData,
                  ).toLocaleString()
                : 0}
            </span>
          </div>
          <div className="flex flex-col bg-neutral-900 p-3 brutal-border border border-neutral-700">
            <span className="text-muted-foreground text-[10px] tracking-widest">
              {t('diary.totalMacros')}
            </span>
            <span className="font-black text-sm mt-1 text-primary">
              P:{Math.round(summary.prot)} F:{Math.round(summary.fat)} C:
              {Math.round(summary.carb)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-end border-b-2 border-white pb-4">
        <div>
          <h1 className="text-3xl font-black font-mono uppercase tracking-tighter text-white">
            {t('diary.dailyLog')}
          </h1>
          <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest mt-1">
            {t('diary.calendarOverview')}
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="text-right font-mono uppercase text-xs">
            <span className="block text-white font-bold capitalize">
              {formatDate(currentDate, 'LLLL yyyy')}
            </span>
            <span className="text-muted-foreground">
              {t('diary.globalView')}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={prevMonth}
              className="brutal-border rounded-none bg-black text-white hover:bg-white hover:text-black border-2 border-white h-10 w-10 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={nextMonth}
              className="brutal-border rounded-none bg-black text-white hover:bg-white hover:text-black border-2 border-white h-10 w-10 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 md:gap-4 flex-1 mt-4">
        {['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map((dayKey) => (
          <div
            key={dayKey}
            className="text-center font-mono uppercase text-[10px] sm:text-xs font-black tracking-widest text-primary pb-2 border-b-2 border-primary/30 mb-2"
          >
            {t(`days.${dayKey}`)}
          </div>
        ))}
        {Array.from({ length: startDateOffset }).map((_, i) => (
          <div key={`empty-${i}`} className="opacity-0" />
        ))}
        {daysInMonth.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const dayStat = stats?.find((s) => s.date === dateStr)

          let statusColor = 'border-neutral-800 bg-black' // No plan = Black
          const isTodayDay = isToday(day)
          const isFuture = isAfter(day, startOfToday())

          if (dayStat) {
            const hasPlan = !!dayStat.plan
            const isCalOk = hasPlan
              ? Math.abs(
                  dayStat.actual_calories - dayStat.plan!.day_calories,
                ) <= 100
              : false

            if (!hasPlan) {
              statusColor =
                'border-neutral-700 bg-neutral-900 border-dashed text-neutral-400' // Logged but no plan
            } else if (isFuture) {
              statusColor =
                'border-neutral-700 bg-neutral-800/40 text-neutral-400' // Future Plan = Gray
            } else if (dayStat.actual_calories === 0) {
              statusColor = 'border-rose-900 bg-rose-900/30 text-rose-500' // Uncompleted / Zero Calories = Red
            } else if (isCalOk) {
              statusColor =
                'border-emerald-800 bg-emerald-900/30 text-emerald-400' // Completed = Green
            } else {
              statusColor = 'border-rose-900 bg-rose-900/30 text-rose-500' // Uncompleted = Red
            }
          }

          const todayClass = isTodayDay ? 'ring-2 ring-white/50' : ''

          return (
            <div
              key={dateStr}
              onClick={() =>
                navigate({ to: '/diary/$date', params: { date: dateStr } })
              }
              className={`aspect-square sm:aspect-auto sm:h-24 md:h-32 p-2 brutal-border ${statusColor} ${todayClass} cursor-pointer hover:bg-neutral-900 transition-colors flex flex-col items-start justify-between relative group`}
            >
              <span
                className={`font-mono text-xs sm:text-sm font-bold ${isToday(day) ? 'bg-primary text-black px-1' : ''}`}
              >
                {formatDate(day, 'd')}
              </span>
              {dayStat && (
                <div className="flex flex-col gap-0.5 w-full mt-auto">
                  <div
                    className={`font-mono font-black text-xs sm:text-sm truncate ${
                      !dayStat.plan
                        ? 'text-neutral-500'
                        : Math.abs(
                              dayStat.actual_calories -
                                dayStat.plan.day_calories,
                            ) <= 100
                          ? 'text-emerald-500'
                          : isFuture
                            ? 'text-neutral-500'
                            : 'text-rose-600'
                    }`}
                  >
                    {Math.round(dayStat.actual_calories)}{' '}
                    {dayStat.plan && (
                      <span className="opacity-50 font-normal text-white">
                        / {Math.round(dayStat.plan.day_calories)}
                      </span>
                    )}
                  </div>
                  <div className="hidden sm:flex justify-between font-mono text-[10px] w-full uppercase">
                    <span
                      className={
                        !dayStat.plan
                          ? 'text-neutral-500/70'
                          : Math.abs(
                                dayStat.actual_protein -
                                  dayStat.plan.day_protein,
                              ) <= 30
                            ? 'text-emerald-500/70'
                            : isFuture
                              ? 'text-neutral-500/70'
                              : 'text-rose-600/70'
                      }
                    >
                      P:{Math.round(dayStat.actual_protein)}
                    </span>
                    <span
                      className={
                        !dayStat.plan
                          ? 'text-neutral-500/70'
                          : Math.abs(
                                dayStat.actual_fats - dayStat.plan.day_fats,
                              ) <= 15
                            ? 'text-emerald-500/70'
                            : isFuture
                              ? 'text-neutral-500/70'
                              : 'text-rose-600/70'
                      }
                    >
                      F:{Math.round(dayStat.actual_fats)}
                    </span>
                    <span
                      className={
                        !dayStat.plan
                          ? 'text-neutral-500/70'
                          : Math.abs(
                                dayStat.actual_carbs - dayStat.plan.day_carbs,
                              ) <= 30
                            ? 'text-emerald-500/70'
                            : isFuture
                              ? 'text-neutral-500/70'
                              : 'text-rose-600/70'
                      }
                    >
                      C:{Math.round(dayStat.actual_carbs)}
                    </span>
                  </div>
                </div>
              )}
              {!dayStat && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-primary font-mono text-[10px] uppercase w-full text-center mt-auto">
                  {t('diary.addLog')}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
