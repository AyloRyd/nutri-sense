import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { PlusIcon, ArrowLeft } from 'lucide-react'

import {
  getMealsControllerFindAllQueryOptions,
  useMealsControllerCreate,
} from '../../../api/endpoints/meals/meals'
import { useTemplateMealsControllerFindAll } from '../../../api/endpoints/template-meals/template-meals'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { FormDialog } from '../../../components/shared/FormDialog'

export const Route = createFileRoute('/_authenticated/diary/$date')({
  loader: ({ context: { queryClient }, params }) =>
    queryClient.ensureQueryData(
      getMealsControllerFindAllQueryOptions({
        start: params.date,
        end: params.date,
      }),
    ),
  component: DiaryDate,
})

function DiaryDate() {
  const { date } = Route.useParams()
  const navigate = useNavigate()

  const { data: meals, refetch } = useQuery(
    getMealsControllerFindAllQueryOptions({ start: date, end: date }),
  )
  const { data: templates } = useTemplateMealsControllerFindAll()
  const createMealMutation = useMealsControllerCreate()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [mode, setMode] = useState<'blank' | 'template'>('blank')

  const form = useForm({
    defaultValues: {
      name: 'Breakfast',
      date: date,
      mealFoods: [] as any[],
    },
    onSubmit: async ({ value }) => {
      try {
        const newMeal = await createMealMutation.mutateAsync({ data: value })
        refetch()
        setDialogOpen(false)
        setMode('blank')
        navigate({
          to: '/diary/meal/$mealId',
          params: { mealId: newMeal.id.toString() },
        })
      } catch (err) {
        console.error('Failed to create meal', err)
      }
    },
  })

  const totals = meals?.reduce(
    (acc, curr) => ({
      calories: acc.calories + curr.calories,
      protein: acc.protein + curr.protein,
      fats: acc.fats + curr.fats,
      carbs: acc.carbs + curr.carbs,
    }),
    { calories: 0, protein: 0, fats: 0, carbs: 0 },
  ) || { calories: 0, protein: 0, fats: 0, carbs: 0 }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end border-b-2 border-white pb-4 gap-4">
        <div>
          <Link
            to="/diary"
            className="text-muted-foreground hover:text-white uppercase font-mono text-xs flex items-center mb-2"
          >
            <ArrowLeft className="w-3 h-3 mr-1" />
            RETURN TO CALENDAR
          </Link>
          <h1 className="text-3xl font-black font-mono uppercase tracking-tighter text-white">
            Log_{date}
          </h1>
          <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest mt-1">
            Daily Meal Summary
          </p>
        </div>

        <FormDialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) {
              setMode('blank')
              form.reset()
            }
          }}
          title="INITIALIZE NEW MEAL"
          description={`Log a new meal for ${date}`}
          trigger={
            <Button className="brutal-border hover:bg-primary w-full md:w-auto font-mono uppercase font-bold rounded-none">
              <PlusIcon className="w-4 h-4 mr-2" />
              New Meal_
            </Button>
          }
        >
          {/* Mode toggle */}
          <div className="grid grid-cols-2 mt-4 border border-white rounded-none overflow-hidden">
            <button
              type="button"
              onClick={() => setMode('blank')}
              className={`py-2 font-mono text-xs uppercase tracking-widest transition-colors ${mode === 'blank' ? 'bg-white text-black font-bold' : 'bg-black text-muted-foreground hover:text-white'}`}
            >
              Blank
            </button>
            <button
              type="button"
              onClick={() => setMode('template')}
              className={`py-2 font-mono text-xs uppercase tracking-widest transition-colors ${mode === 'template' ? 'bg-white text-black font-bold' : 'bg-black text-muted-foreground hover:text-white'}`}
            >
              From Template
            </button>
          </div>

          {/* Template selector — only shown in template mode */}
          {mode === 'template' && (
            <div className="mt-4 flex flex-col gap-2">
              <Label className="font-mono uppercase text-xs">
                Select Template
              </Label>
              <select
                className="brutal-border rounded-none bg-black text-white h-10 w-full font-mono px-3"
                defaultValue=""
                onChange={(e) => {
                  const selectedTemp = templates?.find(
                    (t) => t.id.toString() === e.target.value,
                  )
                  if (selectedTemp) {
                    form.setFieldValue('name', selectedTemp.name)
                    form.setFieldValue(
                      'mealFoods',
                      selectedTemp.template_meal_foods.map((f) => ({
                        name: f.name,
                        weight: f.weight,
                        calories: f.calories,
                        protein: f.protein,
                        fats: f.fats,
                        carbs: f.carbs,
                      })),
                    )
                  }
                }}
              >
                <option value="" disabled>
                  -- Choose a template --
                </option>
                {templates?.map((temp) => (
                  <option key={temp.id} value={temp.id}>
                    {temp.name} ({Math.round(temp.calories)} kcal)
                  </option>
                ))}
              </select>
              <p className="font-mono text-[10px] uppercase text-muted-foreground">
                Selecting a template pre-fills the meal name and foods.
              </p>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
            className="flex flex-col gap-4 font-mono uppercase text-xs mt-4"
          >
            <form.Field
              name="name"
              validators={{ onChange: z.string().min(1) }}
              children={(field) => (
                <div className="flex flex-col gap-1">
                  <Label>Meal Name</Label>
                  <Input
                    className="brutal-border rounded-none bg-black text-white h-10"
                    placeholder="e.g. Breakfast, Lunch, Post-Workout"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            />

            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                  className="w-full mt-2 brutal-border bg-primary text-black uppercase font-bold tracking-widest rounded-none h-12"
                >
                  {isSubmitting
                    ? 'PROCESSING...'
                    : mode === 'template'
                      ? 'CREATE FROM TEMPLATE'
                      : 'CREATE MEAL & ADD FOODS'}
                </Button>
              )}
            />
          </form>
        </FormDialog>
      </div>

      <div className="grid grid-cols-4 gap-4 bg-muted/5 p-4 brutal-border">
        <div className="flex flex-col">
          <span className="text-muted-foreground text-xs font-mono uppercase">
            Total KCal
          </span>
          <span className="font-bold text-xl text-primary font-mono">
            {Math.round(totals.calories)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-muted-foreground text-xs font-mono uppercase">
            Protein
          </span>
          <span className="font-bold text-lg font-mono">
            {Math.round(totals.protein)}g
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-muted-foreground text-xs font-mono uppercase">
            Fats
          </span>
          <span className="font-bold text-lg font-mono">
            {Math.round(totals.fats)}g
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-muted-foreground text-xs font-mono uppercase">
            Carbs
          </span>
          <span className="font-bold text-lg font-mono">
            {Math.round(totals.carbs)}g
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
        {meals?.length === 0 && (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 py-12 text-center text-muted-foreground font-mono uppercase text-sm border-2 border-dashed border-muted">
            NO MEALS LOGGED FOR THIS DATE.
          </div>
        )}
        {meals?.map((meal) => (
          <Card
            key={meal.id}
            className="brutal-border brutal-shadow rounded-none bg-black hover:bg-neutral-900 transition-colors h-full flex flex-col cursor-pointer"
            onClick={() =>
              navigate({
                to: '/diary/meal/$mealId',
                params: { mealId: meal.id.toString() },
              })
            }
          >
            <CardHeader className="border-b border-(--border) pb-4 relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
              <div className="flex justify-between items-start pt-2">
                <CardTitle className="text-xl font-bold font-mono tracking-tighter uppercase text-white truncate pr-2">
                  {meal.name}
                </CardTitle>
                <div className="text-primary font-mono text-xl font-black">
                  {Math.round(meal.calories)}
                </div>
              </div>
              <CardDescription className="font-mono text-[10px] uppercase text-muted-foreground">
                {meal.meal_foods.length} items logged
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 flex flex-col flex-1 gap-4">
              <div className="grid grid-cols-3 gap-2 font-mono text-xs uppercase opacity-80">
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-[10px]">P</span>
                  <span className="font-bold">{Math.round(meal.protein)}g</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-[10px]">F</span>
                  <span className="font-bold">{Math.round(meal.fats)}g</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-[10px]">C</span>
                  <span className="font-bold">{Math.round(meal.carbs)}g</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
