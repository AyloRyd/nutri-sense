import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { PlusIcon, ArrowLeft, Trash2, Search } from 'lucide-react'

import {
  getMealsControllerFindOneQueryOptions,
  useMealsControllerRemove,
} from '../api/endpoints/meals/meals'
import {
  useMealFoodsControllerCreate,
  useMealFoodsControllerRemove,
} from '../api/endpoints/meal-foods/meal-foods'
import { openfoodfactsControllerGetProduct } from '../api/endpoints/openfoodfacts/openfoodfacts'


import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { FormDialog } from '../components/shared/FormDialog'

export const Route = createFileRoute('/_authenticated/diary/meal/$mealId')({
  loader: ({ context: { queryClient }, params }) =>
    queryClient.ensureQueryData(getMealsControllerFindOneQueryOptions(Number(params.mealId))),
  component: MealDetails,
})

function MealDetails() {
  const { mealId } = Route.useParams()
  const navigate = useNavigate()

  const { data: meal, refetch } = useQuery(getMealsControllerFindOneQueryOptions(Number(mealId)))
  const createMealFoodMutation = useMealFoodsControllerCreate()
  const removeMealFoodMutation = useMealFoodsControllerRemove()
  const removeMealMutation = useMealsControllerRemove()

  const [dialogOpen, setDialogOpen] = useState(false)
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
        await createMealFoodMutation.mutateAsync({ mealId: Number(mealId), data: value })
        refetch()
        setDialogOpen(false)
        form.reset()
      } catch (err) {
        console.error('Failed to add food', err)
      }
    },
  })

  if (!meal) return null

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
    } catch (err) {
      setBarcodeError('Product not found or invalid barcode')
    } finally {
      setIsSearchingBarcode(false)
    }
  }

  const handleDeleteMeal = async () => {
    if (confirm('Delete this entire meal?')) {
      await removeMealMutation.mutateAsync({ id: Number(mealId) })
      navigate({ to: '/diary/$date', params: { date: meal.date } })
    }
  }

  const handleRemoveFood = async (foodId: number) => {
    await removeMealFoodMutation.mutateAsync({ mealId: Number(mealId), id: foodId })
    refetch()
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end border-b-2 border-white pb-4 gap-4">
        <div>
          <Link to={`/diary/$date`} params={{ date: meal.date }} className="text-muted-foreground hover:text-white uppercase font-mono text-xs flex items-center mb-2">
            <ArrowLeft className="w-3 h-3 mr-1" />
            RETURN TO DAY
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-black font-mono uppercase tracking-tighter text-white">{meal.name}</h1>
            <Button variant="outline" size="sm" onClick={handleDeleteMeal} className="brutal-border hover:bg-destructive hover:text-white rounded-none">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest mt-1">Date: {meal.date}</p>
        </div>
        
        <FormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title="ADD FOOD ITEM"
          description="Log a new ingredient or product"
          trigger={<Button className="brutal-border hover:bg-primary w-full md:w-auto font-mono uppercase font-bold rounded-none"><PlusIcon className="w-4 h-4 mr-2"/>Add Food_</Button>}
        >
          <Tabs defaultValue="manual" className="mt-4">
            <TabsList className="grid w-full grid-cols-2 rounded-none bg-black border border-white p-0 h-10">
              <TabsTrigger value="manual" className="rounded-none font-mono uppercase data-[state=active]:bg-white data-[state=active]:text-black">Manual</TabsTrigger>
              <TabsTrigger value="barcode" className="rounded-none font-mono uppercase data-[state=active]:bg-white data-[state=active]:text-black">Barcode</TabsTrigger>
            </TabsList>
            <TabsContent value="barcode" className="pt-4 flex flex-col gap-4 border-b border-(--border) pb-6">
              <div className="flex flex-col gap-2">
                 <Label className="font-mono uppercase text-xs">Scan or Enter Barcode</Label>
                 <div className="flex gap-2">
                   <Input 
                     className="brutal-border rounded-none bg-black text-white h-10 flex-1 font-mono" 
                     placeholder="e.g. 5449000000996" 
                     value={barcode}
                     onChange={(e) => setBarcode(e.target.value)}
                   />
                   <Button onClick={handleBarcodeSearch} disabled={isSearchingBarcode} className="brutal-border rounded-none bg-primary text-black">
                      {isSearchingBarcode ? '...' : <Search className="w-4 h-4" />}
                   </Button>
                 </div>
                 {barcodeError && <div className="text-red-500 font-mono text-xs uppercase mt-1">{barcodeError}</div>}
              </div>
              <div className="text-muted-foreground font-mono text-[10px] uppercase text-center">
                 Data fetched from OpenFoodFacts will populate the manual form fields.
              </div>
            </TabsContent>
            <TabsContent value="manual" className="pt-4">
              {/* Form renders here regardless of tab so we can submit the same data */}
            </TabsContent>
          </Tabs>

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
                  <Label>Food Name</Label>
                  <Input
                    className="brutal-border rounded-none bg-black text-white h-10"
                    placeholder="e.g. Chicken Breast"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
               <form.Field
                 name="weight"
                 validators={{ onChange: z.number().min(1) }}
                 children={(field) => (
                   <div className="flex flex-col gap-1">
                     <Label>Weight (g)</Label>
                     <Input
                       type="number"
                       className="brutal-border rounded-none bg-black text-white h-10"
                       value={field.state.value || ''}
                       onChange={(e) => field.handleChange(parseFloat(e.target.value))}
                     />
                   </div>
                 )}
               />
               <form.Field
                 name="calories"
                 validators={{ onChange: z.number().min(0) }}
                 children={(field) => (
                   <div className="flex flex-col gap-1 text-primary">
                     <Label>KCAL (per 100g)</Label>
                     <Input
                       type="number"
                       className="brutal-border rounded-none bg-black text-white h-10 border-primary focus:border-primary"
                       value={field.state.value || ''}
                       onChange={(e) => field.handleChange(parseFloat(e.target.value))}
                     />
                   </div>
                 )}
               />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <form.Field
                name="protein"
                validators={{ onChange: z.number().min(0) }}
                children={(field) => (
                  <div className="flex flex-col gap-1">
                    <Label>Prot /100g</Label>
                    <Input
                      type="number"
                      step="0.1"
                      className="brutal-border rounded-none bg-black text-white h-10"
                      value={field.state.value || ''}
                      onChange={(e) => field.handleChange(parseFloat(e.target.value))}
                    />
                  </div>
                )}
              />
              <form.Field
                name="fats"
                validators={{ onChange: z.number().min(0) }}
                children={(field) => (
                  <div className="flex flex-col gap-1">
                    <Label>Fats /100g</Label>
                    <Input
                      type="number"
                      step="0.1"
                      className="brutal-border rounded-none bg-black text-white h-10"
                      value={field.state.value || ''}
                      onChange={(e) => field.handleChange(parseFloat(e.target.value))}
                    />
                  </div>
                )}
              />
              <form.Field
                name="carbs"
                validators={{ onChange: z.number().min(0) }}
                children={(field) => (
                  <div className="flex flex-col gap-1">
                    <Label>Carbs /100g</Label>
                    <Input
                      type="number"
                      step="0.1"
                      className="brutal-border rounded-none bg-black text-white h-10"
                      value={field.state.value || ''}
                      onChange={(e) => field.handleChange(parseFloat(e.target.value))}
                    />
                  </div>
                )}
              />
            </div>
            
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                  className="w-full mt-4 brutal-border bg-primary text-black uppercase font-bold tracking-widest rounded-none h-12"
                >
                  {isSubmitting ? 'PROCESSING...' : 'ADD FOOD ITEM'}
                </Button>
              )}
            />
          </form>
        </FormDialog>
      </div>

      <div className="grid grid-cols-4 gap-4 bg-muted/5 p-4 brutal-border mb-6">
        <div className="flex flex-col">
          <span className="text-muted-foreground text-xs font-mono uppercase">Total KCal</span>
          <span className="font-bold text-xl text-primary font-mono">{Math.round(meal.calories)}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-muted-foreground text-xs font-mono uppercase">Protein</span>
          <span className="font-bold text-lg font-mono">{Math.round(meal.protein)}g</span>
        </div>
        <div className="flex flex-col">
          <span className="text-muted-foreground text-xs font-mono uppercase">Fats</span>
          <span className="font-bold text-lg font-mono">{Math.round(meal.fats)}g</span>
        </div>
        <div className="flex flex-col">
          <span className="text-muted-foreground text-xs font-mono uppercase">Carbs</span>
          <span className="font-bold text-lg font-mono">{Math.round(meal.carbs)}g</span>
        </div>
      </div>

      <div className="flex flex-col gap-2 relative border-l border-white/20 pl-4">
        {meal.meal_foods.length === 0 && (
          <div className="py-8 text-muted-foreground font-mono uppercase text-xs">
            No foods added yet.
          </div>
        )}
        {meal.meal_foods.map((food) => {
          return (
            <div key={food.id} className="group relative flex justify-between items-center p-4 bg-black brutal-border hover:bg-neutral-900 transition-colors">
               <div className="flex-1">
                 <div className="flex justify-between items-center">
                    <span className="font-mono font-bold uppercase text-white">{food.name}</span>
                    <span className="font-mono font-black text-primary">{Math.round(food.calories)} KCAL</span>
                 </div>
                 <div className="font-mono text-xs text-muted-foreground mt-1 flex gap-4 uppercase">
                    <span>w:{food.weight}g</span>
                    <span>p:{Math.round(food.protein)}g</span>
                    <span>f:{Math.round(food.fats)}g</span>
                    <span>c:{Math.round(food.carbs)}g</span>
                 </div>
               </div>
               <button 
                 onClick={() => handleRemoveFood(food.id)}
                 className="ml-4 p-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10 rounded-full"
               >
                 <Trash2 className="w-4 h-4" />
               </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
