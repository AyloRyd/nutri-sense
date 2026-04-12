import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { PlusIcon, AlertTriangle, Trash2 } from 'lucide-react'
import {
  getPlansControllerFindAllQueryOptions,
  usePlansControllerCreate,
  usePlansControllerRemove,
} from '../../api/endpoints/plans/plans'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { FormDialog } from '../../components/shared/FormDialog'
import { ConfirmDialog } from '../../components/shared/ConfirmDialog'
import type { CreatePlanDtoGoal } from '../../api/model/createPlanDtoGoal'

export const Route = createFileRoute('/_authenticated/plans')({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(getPlansControllerFindAllQueryOptions()),
  component: Plans,
})

function Plans() {
  const { data: plans, refetch } = useQuery(
    getPlansControllerFindAllQueryOptions(),
  )
  const createPlanMutation = usePlansControllerCreate()
  const deletePlanMutation = usePlansControllerRemove()

  const handleDeletePlan = async (id: number) => {
    await deletePlanMutation.mutateAsync({ id })
    refetch()
  }

  const [dialogOpen, setDialogOpen] = useState(false)
  const [isAutoCalc, setIsAutoCalc] = useState(true)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      start_date: new Date().toISOString().split('T')[0],
      goal: 'maintain' as (typeof CreatePlanDtoGoal)[keyof typeof CreatePlanDtoGoal],
      day_calories: undefined as number | undefined,
      day_protein: undefined as number | undefined,
      day_fats: undefined as number | undefined,
      day_carbs: undefined as number | undefined,
    },
    onSubmit: async ({ value }) => {
      try {
        const payload = {
          start_date: value.start_date,
          goal: value.goal,
          ...(isAutoCalc
            ? {}
            : {
                day_calories: value.day_calories,
                day_protein: value.day_protein,
                day_fats: value.day_fats,
                day_carbs: value.day_carbs,
              }),
        }
        await createPlanMutation.mutateAsync({ data: payload })
        refetch()
        setSubmitError(null)
        setDialogOpen(false)
        form.reset()
      } catch (err: any) {
        setSubmitError(
          err?.response?.data?.message ||
            err?.message ||
            'Failed to create plan',
        )
        console.error('Failed to create plan', err)
      }
    },
  })

  return (
    <div className="flex flex-col gap-6 flex-1">
      <div className="flex justify-between items-end border-b-2 border-white pb-4">
        <div>
          <h1 className="text-3xl font-black font-mono uppercase tracking-tighter text-white">
            Target_Plans
          </h1>
          <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest mt-1">
            Manage dietary constraints
          </p>
        </div>
        <FormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title="INITIALIZE NEW PLAN"
          description="Create a new dietary target constraint schema"
          trigger={
            <Button className="brutal-border hover:bg-primary font-mono uppercase font-bold rounded-none">
              <PlusIcon className="w-4 h-4 mr-2" />
              New Plan_
            </Button>
          }
        >
          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
            className="flex flex-col gap-4 font-mono uppercase text-xs"
          >
            {submitError && (
              <div className="brutal-border bg-red-950 text-red-500 p-3 flex flex-col gap-1">
                <span className="font-bold flex items-center gap-2">
                  <AlertTriangle size={16} /> ERROR: {submitError}
                </span>
                {submitError.includes('missing') && (
                  <span className="text-white mt-2 normal-case">
                    Action required:{' '}
                    <Link
                      to="/settings"
                      className="font-bold underline hover:text-primary transition-colors text-primary"
                      onClick={() => setDialogOpen(false)}
                    >
                      Update your profile (Sex, Date of Birth) here
                    </Link>
                    .
                  </span>
                )}
              </div>
            )}
            <form.Field
              name="start_date"
              validators={{ onChange: z.string().min(1) }}
              children={(field) => (
                <div className="flex flex-col gap-1">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    className="brutal-border rounded-none bg-black text-white h-10"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            />
            <form.Field
              name="goal"
              validators={{ onChange: z.enum(['maintain', 'gain', 'lose']) }}
              children={(field) => (
                <div className="flex flex-col gap-1">
                  <Label>Goal</Label>
                  <select
                    className="brutal-border bg-black text-white p-2 h-10 ring-0 outline-none focus:ring-2 focus:ring-primary"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value as any)}
                  >
                    <option value="maintain">MAINTAIN</option>
                    <option value="lose">LOSE WEIGHT</option>
                    <option value="gain">GAIN WEIGHT</option>
                  </select>
                </div>
              )}
            />

            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="autoCalc"
                checked={isAutoCalc}
                onChange={(e) => setIsAutoCalc(e.target.checked)}
                className="w-4 h-4 bg-black border-white brutal-border accent-primary"
              />
              <Label htmlFor="autoCalc" className="cursor-pointer">
                Enable auto-calculation based on Goal
              </Label>
            </div>

            {!isAutoCalc && (
              <div className="grid grid-cols-2 gap-4">
                <form.Field
                  name="day_calories"
                  validators={{ onChange: z.number().min(0) }}
                  children={(field) => (
                    <div className="flex flex-col gap-1">
                      <Label>Calories</Label>
                      <Input
                        type="number"
                        className="brutal-border rounded-none bg-black text-white h-10"
                        value={field.state.value || ''}
                        onChange={(e) =>
                          field.handleChange(parseInt(e.target.value))
                        }
                      />
                    </div>
                  )}
                />
                <form.Field
                  name="day_protein"
                  validators={{ onChange: z.number().min(0) }}
                  children={(field) => (
                    <div className="flex flex-col gap-1">
                      <Label>Protein (g)</Label>
                      <Input
                        type="number"
                        className="brutal-border rounded-none bg-black text-white h-10"
                        value={field.state.value || ''}
                        onChange={(e) =>
                          field.handleChange(parseInt(e.target.value))
                        }
                      />
                    </div>
                  )}
                />
                <form.Field
                  name="day_fats"
                  validators={{ onChange: z.number().min(0) }}
                  children={(field) => (
                    <div className="flex flex-col gap-1">
                      <Label>Fats (g)</Label>
                      <Input
                        type="number"
                        className="brutal-border rounded-none bg-black text-white h-10"
                        value={field.state.value || ''}
                        onChange={(e) =>
                          field.handleChange(parseInt(e.target.value))
                        }
                      />
                    </div>
                  )}
                />
                <form.Field
                  name="day_carbs"
                  validators={{ onChange: z.number().min(0) }}
                  children={(field) => (
                    <div className="flex flex-col gap-1">
                      <Label>Carbs (g)</Label>
                      <Input
                        type="number"
                        className="brutal-border rounded-none bg-black text-white h-10"
                        value={field.state.value || ''}
                        onChange={(e) =>
                          field.handleChange(parseInt(e.target.value))
                        }
                      />
                    </div>
                  )}
                />
              </div>
            )}
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                  className="w-full mt-4 brutal-border bg-primary text-black uppercase font-bold tracking-widest rounded-none h-12"
                >
                  {isSubmitting ? 'PROCESSING...' : 'EXECUTE_PLAN'}
                </Button>
              )}
            />
          </form>
        </FormDialog>
      </div>

      {plans?.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground font-mono uppercase text-sm border-2 border-dashed border-muted min-h-[30vh]">
          <p>NO PLANS CREATED YET.</p>
          <p className="text-[10px] opacity-70 mt-1">
            Create constraints to dictate your macro targets.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans?.map((plan) => (
            <Card
              key={plan.id}
              className="brutal-border brutal-shadow rounded-none bg-black hover:bg-neutral-900 transition-colors"
            >
              <CardHeader className="border-b border-(--border) pb-4 relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
                <div className="flex justify-between items-start pt-2">
                  <div>
                    <CardTitle className="text-xl font-bold font-mono tracking-tighter uppercase text-white">
                      Constraint set #{plan.id}
                    </CardTitle>
                    <CardDescription className="font-mono text-xs uppercase text-primary">
                      Starts: {new Date(plan.start_date).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <ConfirmDialog
                    title="DELETE PLAN?"
                    description="Are you sure you want to delete this target plan?"
                    onConfirm={() => handleDeletePlan(plan.id)}
                    trigger={
                      <button
                        disabled={deletePlanMutation.isPending}
                        className="text-muted-foreground hover:text-red-500 transition-colors mt-0.5"
                        title="Delete Plan"
                      >
                        <Trash2 size={20} />
                      </button>
                    }
                  />
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4 font-mono text-sm uppercase">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-xs">
                      Calories
                    </span>
                    <span className="font-bold">{plan.day_calories}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-xs">
                      Plan Phase
                    </span>
                    <span className="font-bold">{plan.plan}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-xs">
                      Protein
                    </span>
                    <span className="font-bold">{plan.day_protein}g</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-xs">Fats</span>
                    <span className="font-bold">{plan.day_fats}g</span>
                  </div>
                  <div className="flex flex-col col-span-2">
                    <span className="text-muted-foreground text-xs">Carbs</span>
                    <span className="font-bold">{plan.day_carbs}g</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
