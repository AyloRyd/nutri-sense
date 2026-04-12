import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import {
  PlusIcon,
  ArrowLeft,
  Trash2,
  Search,
  Save,
  Bookmark,
} from 'lucide-react'

import {
  getMealsControllerFindOneQueryOptions,
  useMealsControllerRemove,
} from '../../../../api/endpoints/meals/meals'
import {
  useMealFoodsControllerCreate,
  useMealFoodsControllerUpdate,
  useMealFoodsControllerRemove,
} from '../../../../api/endpoints/meal-foods/meal-foods'
import { openfoodfactsControllerGetProduct } from '../../../../api/endpoints/openfoodfacts/openfoodfacts'
import { useTemplateMealsControllerCreate } from '../../../../api/endpoints/template-meals/template-meals'
import {
  useTemplateFoodsControllerCreate,
  useTemplateFoodsControllerFindAll,
} from '../../../../api/endpoints/template-foods/template-foods'

import { Button } from '../../../../components/ui/button'
import { Input } from '../../../../components/ui/input'
import { Label } from '../../../../components/ui/label'
import { FormDialog } from '../../../../components/shared/FormDialog'
import { ConfirmDialog } from '../../../../components/shared/ConfirmDialog'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select'

export const Route = createFileRoute('/_authenticated/diary/meal/$mealId')({
  loader: ({ context: { queryClient }, params }) =>
    queryClient.ensureQueryData(
      getMealsControllerFindOneQueryOptions(Number(params.mealId)),
    ),
  component: MealDetails,
})

type EditingFood = {
  id: number
  name: string
  weight: number
  calories: number
  protein: number
  fats: number
  carbs: number
} | null

function MealDetails() {
  const { mealId } = Route.useParams()
  const navigate = useNavigate()

  const { data: meal, refetch } = useQuery(
    getMealsControllerFindOneQueryOptions(Number(mealId)),
  )
  const createMealFoodMutation = useMealFoodsControllerCreate()
  const updateMealFoodMutation = useMealFoodsControllerUpdate()
  const removeMealFoodMutation = useMealFoodsControllerRemove()
  const removeMealMutation = useMealsControllerRemove()
  const createTemplateMealMutation = useTemplateMealsControllerCreate()
  const createTemplateFoodMutation = useTemplateFoodsControllerCreate()
  const { data: templateFoods } = useTemplateFoodsControllerFindAll()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingFood, setEditingFood] = useState<EditingFood>(null)
  const [inputMode, setInputMode] = useState<'manual' | 'barcode' | 'template'>(
    'manual',
  )
  const [barcode, setBarcode] = useState('')
  const [isSearchingBarcode, setIsSearchingBarcode] = useState(false)
  const [barcodeError, setBarcodeError] = useState('')

  const form = useForm({
    defaultValues: {
      name: '',
      weight: 100,
      calories: 0,
      protein: 0,
      fats: 0,
      carbs: 0,
    },
    onSubmit: async ({ value }) => {
      try {
        if (editingFood) {
          await updateMealFoodMutation.mutateAsync({
            mealId: Number(mealId),
            id: editingFood.id,
            data: value,
          })
        } else {
          await createMealFoodMutation.mutateAsync({
            mealId: Number(mealId),
            data: value,
          })
        }
        refetch()
        setDialogOpen(false)
        setEditingFood(null)
        form.reset()
      } catch (err) {
        console.error('Failed to save food', err)
      }
    },
  })

  if (!meal) return null

  const openDialog = (food?: EditingFood) => {
    if (food) {
      setEditingFood(food)
      form.setFieldValue('name', food.name)
      form.setFieldValue('weight', food.weight)
      form.setFieldValue('calories', food.calories)
      form.setFieldValue('protein', food.protein)
      form.setFieldValue('fats', food.fats)
      form.setFieldValue('carbs', food.carbs)
    } else {
      setEditingFood(null)
      form.reset()
    }
    setInputMode('manual')
    setBarcodeError('')
    setBarcode('')
    setDialogOpen(true)
  }

  const handleBarcodeSearch = async () => {
    if (!barcode) return
    setIsSearchingBarcode(true)
    setBarcodeError('')
    try {
      const product = await openfoodfactsControllerGetProduct(barcode)
      form.setFieldValue('name', product.name)
      form.setFieldValue('calories', product.calories || 0)
      form.setFieldValue('protein', product.protein || 0)
      form.setFieldValue('fats', product.fats || 0)
      form.setFieldValue('carbs', product.carbs || 0)
    } catch (_err) {
      setBarcodeError('Product not found or invalid barcode')
    } finally {
      setIsSearchingBarcode(false)
    }
  }

  const handleDeleteMeal = async () => {
    await removeMealMutation.mutateAsync({ id: Number(mealId) })
    navigate({ to: '/diary/$date', params: { date: meal.date } })
  }

  const handleRemoveFood = async (foodId: number) => {
    await removeMealFoodMutation.mutateAsync({
      mealId: Number(mealId),
      id: foodId,
    })
    refetch()
  }

  const handleSaveMealAsTemplate = async () => {
    await createTemplateMealMutation.mutateAsync({
      data: {
        name: meal.name,
        templateMealFoods: meal.meal_foods.map((f) => ({
          name: f.name,
          weight: f.weight,
          calories: f.calories,
          protein: f.protein,
          fats: f.fats,
          carbs: f.carbs,
        })),
      },
    })
  }

  const handleSaveFoodAsTemplate = async (food: any) => {
    const factor = 100 / food.weight
    await createTemplateFoodMutation.mutateAsync({
      data: {
        name: food.name,
        calories: food.calories * factor,
        protein: food.protein * factor,
        fats: food.fats * factor,
        carbs: food.carbs * factor,
      },
    })
    alert('Template food saved!')
  }

  const modeButtonClass = (active: boolean) =>
    `py-2 font-mono text-xs uppercase tracking-widest transition-colors ${
      active
        ? 'bg-white text-black font-bold'
        : 'bg-black text-muted-foreground hover:text-white'
    }`

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end border-b-2 border-white pb-4 gap-4">
        <div>
          <Link
            to={`/diary/$date`}
            params={{ date: meal.date }}
            className="text-muted-foreground hover:text-white uppercase font-mono text-xs flex items-center mb-2"
          >
            <ArrowLeft className="w-3 h-3 mr-1" />
            RETURN TO DAY
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-black font-mono uppercase tracking-tighter text-white">
              {meal.name}
            </h1>
            <div className="flex gap-2">
              <ConfirmDialog
                title="SAVE TEMPLATE?"
                description="Save this entire meal setup as a reusable template?"
                onConfirm={handleSaveMealAsTemplate}
                trigger={
                  <Button
                    variant="outline"
                    size="sm"
                    className="brutal-border hover:bg-primary hover:text-white rounded-none"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    SAVE AS TEMPLATE
                  </Button>
                }
              />
              <ConfirmDialog
                title="DELETE MEAL?"
                description="Are you sure you want to delete this entire meal?"
                onConfirm={handleDeleteMeal}
                trigger={
                  <Button
                    variant="outline"
                    size="sm"
                    className="brutal-border hover:bg-destructive hover:text-white rounded-none"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                }
              />
            </div>
          </div>
          <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest mt-1">
            Date: {meal.date}
          </p>
        </div>

        <Button
          className="brutal-border hover:bg-primary w-full md:w-auto font-mono uppercase font-bold rounded-none"
          onClick={() => openDialog()}
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Food_
        </Button>
      </div>

      {/* Macro summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-muted/5 p-4 brutal-border mb-2">
        <div className="flex flex-col">
          <span className="text-muted-foreground text-xs font-mono uppercase">
            Total KCal
          </span>
          <span className="font-bold text-xl text-primary font-mono">
            {Math.round(meal.calories)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-muted-foreground text-xs font-mono uppercase">
            Protein
          </span>
          <span className="font-bold text-lg font-mono">
            {Math.round(meal.protein)}g
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-muted-foreground text-xs font-mono uppercase">
            Fats
          </span>
          <span className="font-bold text-lg font-mono">
            {Math.round(meal.fats)}g
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-muted-foreground text-xs font-mono uppercase">
            Carbs
          </span>
          <span className="font-bold text-lg font-mono">
            {Math.round(meal.carbs)}g
          </span>
        </div>
      </div>

      {/* Food list */}
      <div className="flex flex-col gap-2 relative border-l border-white/20 pl-4">
        {meal.meal_foods.length === 0 && (
          <div className="py-8 text-muted-foreground font-mono uppercase text-xs">
            No foods added yet.
          </div>
        )}
        {meal.meal_foods.map((food) => (
          <div
            key={food.id}
            className="flex justify-between items-start p-4 bg-black brutal-border hover:bg-neutral-900 transition-colors cursor-pointer"
            onClick={() =>
              openDialog({
                id: food.id,
                name: food.name,
                weight: food.weight,
                calories: food.calories,
                protein: food.protein,
                fats: food.fats,
                carbs: food.carbs,
              })
            }
          >
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center gap-2">
                <span className="font-mono font-bold uppercase text-white truncate">
                  {food.name}
                </span>
                <span className="font-mono font-black text-primary shrink-0">
                  {Math.round(food.calories)} KCAL
                </span>
              </div>
              <div className="font-mono text-xs text-muted-foreground mt-1 flex gap-3 uppercase flex-wrap">
                <span>w:{food.weight}g</span>
                <span>p:{Math.round(food.protein)}g</span>
                <span>f:{Math.round(food.fats)}g</span>
                <span>c:{Math.round(food.carbs)}g</span>
              </div>
            </div>
            <div className="ml-3 flex items-start gap-1 shrink-0 mt-0.5">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleSaveFoodAsTemplate(food)
                }}
                className="p-2 text-muted-foreground hover:text-primary transition-colors"
                title="Save as Template Food"
              >
                <Bookmark className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemoveFood(food.id)
                }}
                className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit food dialog */}
      <FormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) {
            setEditingFood(null)
            form.reset()
            setBarcodeError('')
            setBarcode('')
          }
        }}
        title={editingFood ? 'EDIT FOOD ITEM' : 'ADD FOOD ITEM'}
        description={
          editingFood
            ? 'Update ingredient details'
            : 'Log a new ingredient or product'
        }
      >
        {/* Mode tabs — only for new entries */}
        {!editingFood && (
          <div className="grid grid-cols-3 mt-4 border border-white overflow-hidden">
            {(['manual', 'barcode', 'template'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setInputMode(m)}
                className={modeButtonClass(inputMode === m)}
              >
                {m}
              </button>
            ))}
          </div>
        )}

        {/* Barcode panel */}
        {!editingFood && inputMode === 'barcode' && (
          <div className="mt-4 flex flex-col gap-3">
            <Label className="font-mono uppercase text-xs">
              Scan or Enter Barcode
            </Label>
            <div className="flex gap-2">
              <Input
                className="brutal-border rounded-none bg-black text-white h-10 flex-1 font-mono"
                placeholder="e.g. 5449000000996"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleBarcodeSearch()}
              />
              <Button
                type="button"
                onClick={handleBarcodeSearch}
                disabled={isSearchingBarcode}
                className="brutal-border rounded-none bg-primary text-black"
              >
                {isSearchingBarcode ? '...' : <Search className="w-4 h-4" />}
              </Button>
            </div>
            {barcodeError && (
              <p className="text-red-500 font-mono text-xs uppercase">
                {barcodeError}
              </p>
            )}
            <p className="text-muted-foreground font-mono text-[10px] uppercase">
              Fills the form fields below automatically.
            </p>
          </div>
        )}

        {/* Template food panel */}
        {!editingFood && inputMode === 'template' && (
          <div className="mt-4 flex flex-col gap-3">
            <Label className="font-mono uppercase text-xs">
              Select Template Food
            </Label>
            <Select
              onValueChange={(val) => {
                const tf = templateFoods?.find((t) => t.id.toString() === val)
                if (tf) {
                  form.setFieldValue('name', tf.name)
                  form.setFieldValue('calories', tf.calories || 0)
                  form.setFieldValue('protein', tf.protein || 0)
                  form.setFieldValue('fats', tf.fats || 0)
                  form.setFieldValue('carbs', tf.carbs || 0)
                  form.setFieldValue('weight', 100)
                }
              }}
            >
              <SelectTrigger className="brutal-border rounded-none bg-black text-white h-10 font-mono w-full">
                <SelectValue placeholder="-- Choose a template --" />
              </SelectTrigger>
              <SelectContent className="bg-black brutal-border rounded-none font-mono">
                <SelectGroup>
                  {templateFoods?.map((tf) => (
                    <SelectItem key={tf.id} value={tf.id.toString()}>
                      {tf.name} ({Math.round(tf.calories)} kcal/100g)
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <p className="text-muted-foreground font-mono text-[10px] uppercase">
              Values normalized to 100g. Adjust weight below.
            </p>
          </div>
        )}

        {/* Shared form */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="flex flex-col gap-4 font-mono uppercase text-xs mt-4"
        >
          <form.Field name="name" validators={{ onChange: z.string().min(1) }}>
            {(field) => (
              <div className="flex flex-col gap-1">
                <Label>Food Name</Label>
                <Input
                  className="brutal-border rounded-none bg-black text-white h-10"
                  placeholder="e.g. Chicken Breast"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>

          <div className="grid grid-cols-2 gap-4">
            <form.Field
              name="weight"
              validators={{ onChange: z.number().min(1) }}
            >
              {(field) => (
                <div className="flex flex-col gap-1">
                  <Label>Weight (g)</Label>
                  <Input
                    type="number"
                    className="brutal-border rounded-none bg-black text-white h-10"
                    value={field.state.value || ''}
                    onChange={(e) =>
                      field.handleChange(parseFloat(e.target.value))
                    }
                  />
                </div>
              )}
            </form.Field>
            <form.Field
              name="calories"
              validators={{ onChange: z.number().min(0) }}
            >
              {(field) => (
                <div className="flex flex-col gap-1 text-primary">
                  <Label>KCAL (per 100g)</Label>
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
            </form.Field>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {(['protein', 'fats', 'carbs'] as const).map((macro) => (
              <form.Field
                key={macro}
                name={macro}
                validators={{ onChange: z.number().min(0) }}
              >
                {(field) => (
                  <div className="flex flex-col gap-1">
                    <Label>{macro} /100g</Label>
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
              </form.Field>
            ))}
          </div>

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="w-full mt-2 brutal-border bg-primary text-black uppercase font-bold tracking-widest rounded-none h-12"
              >
                {isSubmitting
                  ? 'SAVING...'
                  : editingFood
                    ? 'SAVE CHANGES'
                    : 'ADD FOOD ITEM'}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </FormDialog>
    </div>
  )
}
