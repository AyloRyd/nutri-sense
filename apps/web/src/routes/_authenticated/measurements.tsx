import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState, useMemo } from 'react'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { PlusIcon, Trash2 } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  getMeasurementsControllerFindAllQueryOptions,
  useMeasurementsControllerCreate,
  useMeasurementsControllerRemove,
} from '../../api/endpoints/measurements/measurements'

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

export const Route = createFileRoute('/_authenticated/measurements')({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(getMeasurementsControllerFindAllQueryOptions()),
  component: Measurements,
})

function Measurements() {
  const { data: measurements, refetch } = useQuery(
    getMeasurementsControllerFindAllQueryOptions(),
  )
  const createMeasurementMutation = useMeasurementsControllerCreate()
  const deleteMeasurementMutation = useMeasurementsControllerRemove()
  
  const handleDeleteMeasurement = async (id: number) => {
    if (confirm('Are you sure you want to delete this log entry?')) {
      await deleteMeasurementMutation.mutateAsync({ id })
      refetch()
    }
  }

  const [dialogOpen, setDialogOpen] = useState(false)

  const form = useForm({
    defaultValues: {
      weight: 0,
      height: 0,
      activity: 1.2,
      date: new Date().toISOString().split('T')[0],
    },
    onSubmit: async ({ value }) => {
      try {
        await createMeasurementMutation.mutateAsync({ data: value })
        refetch()
        setDialogOpen(false)
        form.reset()
      } catch (err) {
        console.error('Failed to create measurement', err)
      }
    },
  })

  const sortedData = useMemo(() => {
    if (!measurements) return []
    return [...measurements]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((m) => ({
        ...m,
        displayDate: new Date(m.date).toLocaleDateString(),
      }))
  }, [measurements])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-end border-b-2 border-white pb-4">
        <div>
          <h1 className="text-3xl font-black font-mono uppercase tracking-tighter text-white">
            Biometrics_Log
          </h1>
          <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest mt-1">
            Track physical metrics over time
          </p>
        </div>
        <FormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title="LOG BIOMETRICS"
          description="Enter your latest physical measurements"
          trigger={
            <Button className="brutal-border hover:bg-primary font-mono uppercase font-bold rounded-none">
              <PlusIcon className="w-4 h-4 mr-2" />
              New Entry_
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
            <form.Field
              name="date"
              validators={{ onChange: z.string().min(1) }}
              children={(field) => (
                <div className="flex flex-col gap-1">
                  <Label>Date</Label>
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
              name="weight"
              validators={{ onChange: z.number().min(1) }}
              children={(field) => (
                <div className="flex flex-col gap-1">
                  <Label>Weight (kg)</Label>
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
            />
            <form.Field
              name="height"
              validators={{ onChange: z.number().min(1) }}
              children={(field) => (
                <div className="flex flex-col gap-1">
                  <Label>Height (cm)</Label>
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
            />
            <form.Field
              name="activity"
              validators={{ onChange: z.number().min(1).max(2.5) }}
              children={(field) => (
                <div className="flex flex-col gap-1">
                  <Label>Activity Level (1.2 - 2.5)</Label>
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
            />

            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                  className="w-full mt-4 brutal-border bg-primary text-black uppercase font-bold tracking-widest rounded-none h-12"
                >
                  {isSubmitting ? 'PROCESSING...' : 'RECORD_ENTRY'}
                </Button>
              )}
            />
          </form>
        </FormDialog>
      </div>

      <Card className="brutal-border brutal-shadow rounded-none bg-black pt-6">
        <CardHeader className="pb-0">
          <CardTitle className="text-xl font-bold font-mono tracking-tighter uppercase text-white">
            Weight_Trend
          </CardTitle>
        </CardHeader>
        <CardContent className="h-80 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sortedData}>
              <XAxis
                dataKey="displayDate"
                stroke="#888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={['auto', 'auto']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'black',
                  border: '2px solid #39FF14',
                  borderRadius: '0',
                }}
                itemStyle={{ color: '#39FF14' }}
                labelStyle={{ color: 'white', fontFamily: 'monospace' }}
              />
              <Line
                type="step"
                dataKey="weight"
                stroke="#39FF14"
                strokeWidth={3}
                dot={{ r: 4, fill: 'black', stroke: '#39FF14', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#39FF14' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {sortedData
          .slice()
          .reverse()
          .map((entry) => (
            <Card
              key={entry.id}
              className="brutal-border brutal-shadow rounded-none bg-black hover:bg-neutral-900 transition-colors"
            >
              <CardHeader className="border-b border-(--border) pb-4 relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
                <div className="flex justify-between items-start pt-2">
                  <div>
                    <CardTitle className="text-xl font-bold font-mono tracking-tighter uppercase text-white">
                      {entry.weight} kg
                    </CardTitle>
                    <CardDescription className="font-mono text-xs uppercase text-primary">
                      {entry.displayDate}
                    </CardDescription>
                  </div>
                  <button
                    onClick={() => handleDeleteMeasurement(entry.id)}
                    disabled={deleteMeasurementMutation.isPending}
                    className="text-muted-foreground hover:text-red-500 transition-colors mt-0.5"
                    title="Delete Entry"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4 font-mono text-sm uppercase">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-xs">
                      Height
                    </span>
                    <span className="font-bold">{entry.height} cm</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-xs">
                      Activity
                    </span>
                    <span className="font-bold">{entry.activity}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  )
}
