import { useTranslation } from 'react-i18next'

interface RingProps {
  label: string
  value: number
  goal?: number
  unit: string
  color: string
  radius: number
  stroke: number
  large?: boolean
}

function Ring({
  label,
  value,
  goal,
  unit,
  color,
  radius,
  stroke,
  large = false,
}: RingProps) {
  const circumference = 2 * Math.PI * radius
  // Always show at least a sliver when there's any value at all
  const rawRatio = goal && goal > 0 ? value / goal : 0
  const clampedRatio = Math.min(rawRatio, 1)
  // minimum visual arc of 2% so something is always visible after first entry
  const visibleRatio = value > 0 && clampedRatio < 0.02 ? 0.02 : clampedRatio
  const dashOffset = circumference * (1 - visibleRatio)
  const isFull = rawRatio >= 1
  const isOver = rawRatio > 1

  const displayColor = isOver ? '#ef4444' : color
  const pct = goal && goal > 0 ? Math.round(rawRatio * 100) : null

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        style={{
          position: 'relative',
          width: radius * 2 + stroke * 2,
          height: radius * 2 + stroke * 2,
        }}
      >
        <svg
          width={radius * 2 + stroke * 2}
          height={radius * 2 + stroke * 2}
          style={{ overflow: 'visible', display: 'block' }}
        >
          <circle
            cx={radius + stroke}
            cy={radius + stroke}
            r={radius}
            fill="none"
            stroke="#1e1e1e"
            strokeWidth={stroke}
          />
          <circle
            cx={radius + stroke}
            cy={radius + stroke}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            opacity={0.08}
          />
          {visibleRatio > 0 && (
            <circle
              cx={radius + stroke}
              cy={radius + stroke}
              r={radius}
              fill="none"
              stroke={displayColor}
              strokeWidth={stroke}
              strokeLinecap="butt"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              transform={`rotate(-90 ${radius + stroke} ${radius + stroke})`}
              style={{
                transition:
                  'stroke-dashoffset 0.7s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.3s',
                filter: isFull
                  ? `drop-shadow(0 0 ${large ? 12 : 8}px ${displayColor}cc) drop-shadow(0 0 ${large ? 20 : 14}px ${displayColor}66)`
                  : `drop-shadow(0 0 ${large ? 6 : 4}px ${displayColor}55)`,
              }}
            />
          )}
        </svg>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
          }}
        >
          <span
            className="font-mono font-black leading-none"
            style={{
              fontSize: large ? (goal ? 17 : 24) : goal ? 12 : 16,
              color: visibleRatio > 0 ? displayColor : '#3a3a3a',
              textShadow:
                visibleRatio > 0.05 ? `0 0 14px ${displayColor}55` : 'none',
              transition: 'color 0.3s',
            }}
          >
            {Math.round(value)}
            {goal ? (
              <span style={{ opacity: 0.4, margin: '0 2px' }}>/</span>
            ) : null}
            {goal ? (
              <span style={{ opacity: 0.8 }}>{Math.round(goal)}</span>
            ) : null}
          </span>
          <span
            className="font-mono uppercase"
            style={{
              fontSize: large ? 10 : 8,
              color: '#555',
              letterSpacing: '0.1em',
            }}
          >
            {unit}
          </span>
          {pct !== null && (
            <span
              className="font-mono"
              style={{
                fontSize: large ? 9 : 7,
                color: isOver ? '#ef4444' : '#444',
                marginTop: 1,
                letterSpacing: '0.05em',
              }}
            >
              {pct}%
            </span>
          )}
        </div>
      </div>
      <span
        className="font-mono uppercase tracking-widest text-center"
        style={{ fontSize: 9, color: '#666', letterSpacing: '0.18em' }}
      >
        {label}
      </span>
    </div>
  )
}

interface NutritionRingsProps {
  calories: number
  protein: number
  fats: number
  carbs: number
  goals?: {
    calories?: number
    protein?: number
    fats?: number
    carbs?: number
  }
}

export function NutritionRings({
  calories,
  protein,
  fats,
  carbs,
  goals,
}: NutritionRingsProps) {
  const { t } = useTranslation()

  const macros = [
    {
      key: 'protein',
      label: t('diaryDate.protein'),
      value: protein,
      goal: goals?.protein,
      color: '#3b82f6',
    },
    {
      key: 'fats',
      label: t('diaryDate.fats'),
      value: fats,
      goal: goals?.fats,
      color: '#f59e0b',
    },
    {
      key: 'carbs',
      label: t('diaryDate.carbs'),
      value: carbs,
      goal: goals?.carbs,
      color: '#ec4899',
    },
  ]

  return (
    <div
      className="brutal-border"
      style={{
        background: '#050505',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.01) 3px, rgba(255,255,255,0.01) 4px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />{' '}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div className="flex flex-col items-center gap-6 py-6 md:hidden">
          <Ring
            label={t('diaryDate.totalKcal')}
            value={calories}
            goal={goals?.calories}
            unit="kcal"
            color="#6ee7b7"
            radius={70}
            stroke={8}
            large
          />
          <div style={{ width: '60%', height: 1, background: '#1c1c1c' }} />
          <div className="flex flex-row justify-center gap-8">
            {macros.map((m) => (
              <Ring
                key={m.key}
                label={m.label}
                value={m.value}
                goal={m.goal}
                unit="g"
                color={m.color}
                radius={40}
                stroke={5}
              />
            ))}
          </div>
        </div>
        <div className="hidden md:flex flex-row items-center">
          <div
            style={{
              padding: '24px 32px',
              borderRight: '1px solid #1c1c1c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ring
              label={t('diaryDate.totalKcal')}
              value={calories}
              goal={goals?.calories}
              unit="kcal"
              color="#6ee7b7"
              radius={64}
              stroke={7}
              large
            />
          </div>
          <div className="flex flex-row flex-1 items-center justify-around px-4 py-6">
            {macros.map((m, i) => (
              <div
                key={m.key}
                style={{
                  padding: '0 24px',
                  borderRight:
                    i < macros.length - 1 ? '1px solid #1c1c1c' : 'none',
                  display: 'flex',
                  justifyContent: 'center',
                  flex: 1,
                }}
              >
                <Ring
                  label={m.label}
                  value={m.value}
                  goal={m.goal}
                  unit="g"
                  color={m.color}
                  radius={48}
                  stroke={5}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
