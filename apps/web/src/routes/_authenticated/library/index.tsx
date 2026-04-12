import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { PlusIcon, Trash2 } from 'lucide-react'

import {
  getTemplateMealsControllerFindAllQueryOptions,
  useTemplateMealsControllerCreate,
  useTemplateMealsControllerUpdate,
  useTemplateMealsControllerRemove,
} from '../../../api/endpoints/template-meals/template-meals'
import {
  getTemplateFoodsControllerFindAllQueryOptions,
  useTemplateFoodsControllerCreate,
  useTemplateFoodsControllerUpdate,
  useTemplateFoodsControllerRemove,
} from '../../../api/endpoints/template-foods/template-foods'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../components/ui/tabs'
import { FormDialog } from '../../../components/shared/FormDialog'

export const Route = createFileRoute('/_authenticated/library/')({
  component: Library,
})

type EditingMeal = { id: number; name: string } | null
type EditingFood = {
  id: number
  name: string
  calories: number
  protein: number
  fats: number
  carbs: number
} | null

function Library() {
  const navigate = useNavigate()

  const { data: templateMeals, refetch: refetchMeals } = useQuery(
    getTemplateMealsControllerFindAllQueryOptions(),
  )
  const { data: templateFoods, refetch: refetchFoods } = useQuery(
    getTemplateFoodsControllerFindAllQueryOptions(),
  )

  const createMealMutation = useTemplateMealsControllerCreate()
  const updateMealMutation = useTemplateMealsControllerUpdate()
  const removeMealMutation = useTemplateMealsControllerRemove()

  const createFoodMutation = useTemplateFoodsControllerCreate()
  const updateFoodMutation = useTemplateFoodsControllerUpdate()
  const removeFoodMutation = useTemplateFoodsControllerRemove()

  const [mealDialogOpen, setMealDialogOpen] = useState(false)
  const [foodDialogOpen, setFoodDialogOpen] = useState(false)
  const [editingMeal, setEditingMeal] = useState<EditingMeal>(null)
  const [editingFood, setEditingFood] = useState<EditingFood>(null)

  const mealForm = useForm({
    defaultValues: { name: '' },
    onSubmit: async ({ value }) => {
      try {
        if (editingMeal) {
          await updateMealMutation.mutateAsync({
            id: editingMeal.id,
            data: value,
          })
          refetchMeals()
          setMealDialogOpen(false)
          setEditingMeal(null)
          mealForm.reset()
        } else {
          const res = await createMealMutation.mutateAsync({
            data: { ...value, templateMealFoods: [] },
          })
          refetchMeals()
          setMealDialogOpen(false)
          navigate({
            to: '/library/template-meal/$id',
            params: { id: res.id.toString() },
          })
        }
      } catch (_err) {}
    },
  })

  const foodForm = useForm({
    defaultValues: { name: '', calories: 0, protein: 0, fats: 0, carbs: 0 },
    onSubmit: async ({ value }) => {
      try {
        if (editingFood) {
          await updateFoodMutation.mutateAsync({
            id: editingFood.id,
            data: value,
          })
          refetchFoods()
        } else {
          await createFoodMutation.mutateAsync({ data: value })
          refetchFoods()
        }
        setFoodDialogOpen(false)
        setEditingFood(null)
        foodForm.reset()
      } catch (_err) {}
    },
  })

  const openMealDialog = (meal?: EditingMeal) => {
    if (meal) {
      setEditingMeal(meal)
      mealForm.setFieldValue('name', meal.name)
    } else {
      setEditingMeal(null)
      mealForm.reset()
    }
    setMealDialogOpen(true)
  }

  const openFoodDialog = (food?: EditingFood) => {
    if (food) {
      setEditingFood(food)
      foodForm.setFieldValue('name', food.name)
      foodForm.setFieldValue('calories', food.calories)
      foodForm.setFieldValue('protein', food.protein)
      foodForm.setFieldValue('fats', food.fats)
      foodForm.setFieldValue('carbs', food.carbs)
    } else {
      setEditingFood(null)
      foodForm.reset()
    }
    setFoodDialogOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end border-b-2 border-white pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-black font-mono uppercase tracking-tighter text-white">
            Library.
          </h1>
          <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest mt-1">
            Manage Templates
          </p>
        </div>
      </div>

      <Tabs defaultValue="meals" className="mt-4 w-full flex-col">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2 rounded-none bg-black border border-white p-0 h-11 md:h-12 overflow-hidden">
          <TabsTrigger
            value="meals"
            className="rounded-none font-mono uppercase data-[state=active]:bg-white data-[state=active]:text-black tracking-widest font-bold text-[10px] md:text-xs"
          >
            Template Meals
          </TabsTrigger>
          <TabsTrigger
            value="foods"
            className="rounded-none font-mono uppercase data-[state=active]:bg-white data-[state=active]:text-black tracking-widest font-bold text-[10px] md:text-xs"
          >
            Template Foods
          </TabsTrigger>
        </TabsList>

        {/* ── MEALS TAB ─────────────────────────────── */}
        <TabsContent value="meals" className="pt-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <h2 className="font-mono text-xl font-bold uppercase text-white">
              My Meals
            </h2>
            <Button
              className="brutal-border hover:bg-primary font-mono uppercase font-bold rounded-none w-full sm:w-auto"
              onClick={() => openMealDialog()}
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              New Meal
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templateMeals?.map((meal: any) => (
              <Card
                key={meal.id}
                className="brutal-border brutal-shadow rounded-none bg-black hover:bg-neutral-900 transition-colors h-full flex flex-col cursor-pointer"
                onClick={() =>
                  navigate({
                    to: '/library/template-meal/$id',
                    params: { id: meal.id.toString() },
                  })
                }
              >
                <CardHeader className="border-b border-(--border) pb-4 relative">
                  <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
                  <div className="flex justify-between items-start pt-2">
                    <CardTitle className="text-xl font-bold font-mono tracking-tighter uppercase text-white truncate pr-2">
                      {meal.name}
                    </CardTitle>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation()
                        if (
                          window.confirm(
                            'Are you sure you want to delete this template meal?',
                          )
                        ) {
                          await removeMealMutation.mutateAsync({ id: meal.id })
                          refetchMeals()
                        }
                      }}
                      className="text-muted-foreground hover:text-red-500 transition-colors shrink-0 mt-0.5"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-2 font-mono text-xs text-muted-foreground uppercase">
                    <div className="text-primary font-bold text-lg">
                      {Math.round(meal.calories)} KCAL
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <div>P: {Math.round(meal.protein)}g</div>
                      <div>F: {Math.round(meal.fats)}g</div>
                      <div>C: {Math.round(meal.carbs)}g</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── FOODS TAB ─────────────────────────────── */}
        <TabsContent value="foods" className="pt-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <h2 className="font-mono text-xl font-bold uppercase text-white">
              My Foods
            </h2>
            <Button
              className="brutal-border hover:bg-primary font-mono uppercase font-bold rounded-none w-full sm:w-auto"
              onClick={() => openFoodDialog()}
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              New Food
            </Button>
          </div>

          <div className="flex flex-col gap-2 relative border-l border-white/20 pl-4">
            {templateFoods?.map((food: any) => (
              <div
                key={food.id}
                className="flex justify-between items-start p-4 bg-black brutal-border hover:bg-neutral-900 transition-colors cursor-pointer"
                onClick={() =>
                  openFoodDialog({
                    id: food.id,
                    name: food.name,
                    calories: food.calories,
                    protein: food.protein,
                    fats: food.fats,
                    carbs: food.carbs,
                  })
                }
              >
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold uppercase text-white">
                      {food.name}
                    </span>
                    <span className="font-mono font-black text-primary">
                      {Math.round(food.calories)} KCAL
                    </span>
                  </div>
                  <div className="font-mono text-[10px] text-muted-foreground mt-1 flex gap-4 uppercase">
                    <span>per 100g</span>
                    <span>p:{Math.round(food.protein)}g</span>
                    <span>f:{Math.round(food.fats)}g</span>
                    <span>c:{Math.round(food.carbs)}g</span>
                  </div>
                </div>
                <button
                  onClick={async (e) => {
                    e.stopPropagation()
                    if (
                      window.confirm(
                        'Are you sure you want to delete this template food?',
                      )
                    ) {
                      await removeFoodMutation.mutateAsync({ id: food.id })
                      refetchFoods()
                    }
                  }}
                  className="ml-4 p-2 text-muted-foreground hover:text-red-500 transition-colors mt-0.5"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* ── MEAL DIALOG (create / rename) ──────────── */}
      <FormDialog
        open={mealDialogOpen}
        onOpenChange={(open) => {
          setMealDialogOpen(open)
          if (!open) {
            setEditingMeal(null)
            mealForm.reset()
          }
        }}
        title={editingMeal ? 'EDIT TEMPLATE MEAL' : 'CREATE TEMPLATE MEAL'}
        description={
          editingMeal
            ? 'Rename this template'
            : 'Initialize a new empty meal template'
        }
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            mealForm.handleSubmit()
          }}
          className="flex flex-col gap-4 font-mono uppercase text-xs mt-4"
        >
          <mealForm.Field
            name="name"
            validators={{ onChange: z.string().min(1) }}
          >
            {(field) => (
              <div className="flex flex-col gap-1">
                <Label>Template Name</Label>
                <Input
                  className="brutal-border rounded-none bg-black text-white h-10"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </mealForm.Field>
          <mealForm.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="w-full mt-4 brutal-border bg-primary text-black uppercase font-bold rounded-none h-12"
              >
                {isSubmitting
                  ? 'SAVING...'
                  : editingMeal
                    ? 'SAVE CHANGES'
                    : 'CREATE TEMPLATE MEAL'}
              </Button>
            )}
          </mealForm.Subscribe>
        </form>
      </FormDialog>

      {/* ── FOOD DIALOG (create / edit) ──────────── */}
      <FormDialog
        open={foodDialogOpen}
        onOpenChange={(open) => {
          setFoodDialogOpen(open)
          if (!open) {
            setEditingFood(null)
            foodForm.reset()
          }
        }}
        title={editingFood ? 'EDIT TEMPLATE FOOD' : 'CREATE TEMPLATE FOOD'}
        description="Values per 100g"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            foodForm.handleSubmit()
          }}
          className="flex flex-col gap-4 font-mono uppercase text-xs mt-4"
        >
          <foodForm.Field
            name="name"
            validators={{ onChange: z.string().min(1) }}
          >
            {(field) => (
              <div className="flex flex-col gap-1">
                <Label>Food Name</Label>
                <Input
                  className="brutal-border rounded-none bg-black text-white h-10"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </foodForm.Field>
          <foodForm.Field
            name="calories"
            validators={{ onChange: z.number().min(0) }}
          >
            {(field) => (
              <div className="flex flex-col gap-1 text-primary">
                <Label>KCal per 100g</Label>
                <Input
                  type="number"
                  className="brutal-border rounded-none bg-black text-white h-10 border-primary"
                  value={field.state.value || ''}
                  onChange={(e) =>
                    field.handleChange(parseFloat(e.target.value))
                  }
                />
              </div>
            )}
          </foodForm.Field>
          <div className="grid grid-cols-3 gap-4">
            <foodForm.Field
              name="protein"
              validators={{ onChange: z.number().min(0) }}
            >
              {(field) => (
                <div className="flex flex-col gap-1">
                  <Label>Prot /100g</Label>
                  <Input
                    type="number"
                    step="0.1"
                    className="brutal-border rounded-none bg-black text-white h-10"
                    value={field.state.value || ''}
                    onChange={(e) =>
                      field.handleChange(parseFloat(e.target.value))
                    }
                  />
                </div>
              )}
            </foodForm.Field>
            <foodForm.Field
              name="fats"
              validators={{ onChange: z.number().min(0) }}
            >
              {(field) => (
                <div className="flex flex-col gap-1">
                  <Label>Fats /100g</Label>
                  <Input
                    type="number"
                    step="0.1"
                    className="brutal-border rounded-none bg-black text-white h-10"
                    value={field.state.value || ''}
                    onChange={(e) =>
                      field.handleChange(parseFloat(e.target.value))
                    }
                  />
                </div>
              )}
            </foodForm.Field>
            <foodForm.Field
              name="carbs"
              validators={{ onChange: z.number().min(0) }}
            >
              {(field) => (
                <div className="flex flex-col gap-1">
                  <Label>Carbs /100g</Label>
                  <Input
                    type="number"
                    step="0.1"
                    className="brutal-border rounded-none bg-black text-white h-10"
                    value={field.state.value || ''}
                    onChange={(e) =>
                      field.handleChange(parseFloat(e.target.value))
                    }
                  />
                </div>
              )}
            </foodForm.Field>
          </div>
          <foodForm.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="w-full mt-4 brutal-border bg-primary text-black uppercase font-bold rounded-none h-12"
              >
                {isSubmitting
                  ? 'SAVING...'
                  : editingFood
                    ? 'SAVE CHANGES'
                    : 'CREATE TEMPLATE FOOD'}
              </Button>
            )}
          </foodForm.Subscribe>
        </form>
      </FormDialog>
    </div>
  )
}
