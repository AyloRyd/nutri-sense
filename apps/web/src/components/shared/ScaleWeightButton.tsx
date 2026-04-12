import { useState } from 'react'
import { Scale, Loader2, WifiOff } from 'lucide-react'
import { iotControllerGetCurrentWeight } from '../../api/endpoints/iot-scales/iot-scales'
import { Button } from '../ui/button'

type Props = {
  /** Called with the weight in grams when scale responds */
  onWeight: (grams: number) => void
  className?: string
}

/**
 * A button that fetches the current reading from the linked IoT scale and
 * calls `onWeight` with the value in grams.
 *
 * - Hidden when no device serial is stored in localStorage
 * - Shows a loading state while waiting (up to 60s backend timeout)
 * - Shows an error state briefly on failure
 */
export function ScaleWeightButton({ onWeight, className }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')

  const isDeviceLinked = !!localStorage.getItem('iot_serial_number')

  if (!isDeviceLinked) {
    return (
      <button
        type="button"
        title="No IoT scale linked — go to Settings"
        className={`h-10 w-10 flex items-center justify-center text-muted-foreground/40 brutal-border bg-neutral-900 shrink-0 cursor-not-allowed ${className ?? ''}`}
        disabled
      >
        <WifiOff size={14} />
      </button>
    )
  }

  const handleFetch = async () => {
    if (status === 'loading') return
    setStatus('loading')
    try {
      const data = (await iotControllerGetCurrentWeight()) as any
      const grams = Math.round(Number(data?.weight ?? 0))
      if (grams > 0) {
        onWeight(grams)
        setStatus('idle')
      } else {
        setStatus('error')
        setTimeout(() => setStatus('idle'), 2500)
      }
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 2500)
    }
  }

  return (
    <Button
      type="button"
      onClick={handleFetch}
      disabled={status === 'loading'}
      title={
        status === 'loading'
          ? 'Waiting for scale...'
          : 'Read weight from IoT scale'
      }
      className={`h-10 w-10 p-0 shrink-0 brutal-border rounded-none transition-colors ${
        status === 'error'
          ? 'bg-red-500/20 border-red-500 text-red-400'
          : status === 'loading'
            ? 'bg-primary/10 border-primary text-primary'
            : 'bg-transparent border-white/30 text-white hover:border-primary hover:text-primary'
      } ${className ?? ''}`}
    >
      {status === 'loading' ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <Scale size={14} />
      )}
    </Button>
  )
}
