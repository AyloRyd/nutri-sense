import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Wifi, WifiOff } from 'lucide-react'

import {
  getUsersControllerGetMeQueryOptions,
  useUsersControllerUpdate,
} from '../../api/endpoints/users/users'
import type { UpdateUserDtoSex } from '../../api/model/updateUserDtoSex'
import { useAuthControllerChangePassword } from '../../api/endpoints/auth/auth'
import {
  useIotControllerLinkDevice,
  useIotControllerUnlinkDevice,
  getIotControllerGetStatusQueryOptions,
} from '../../api/endpoints/iot-scales/iot-scales'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'

export const Route = createFileRoute('/_authenticated/settings')({
  loader: async ({ context: { queryClient } }) => {
    await Promise.all([
      queryClient.ensureQueryData(getUsersControllerGetMeQueryOptions({})),
      queryClient
        .ensureQueryData(getIotControllerGetStatusQueryOptions({}) as any)
        .catch(() => null),
    ])
  },
  component: Settings,
})

type FeedbackState = 'idle' | 'success' | 'error'

function useTransientFeedback() {
  const [state, setState] = useState<FeedbackState>('idle')
  const [message, setMessage] = useState('')

  const trigger = (type: 'success' | 'error', msg: string) => {
    setState(type)
    setMessage(msg)
    setTimeout(() => setState('idle'), 3000)
  }

  return { state, message, trigger }
}

function SectionHeader({
  index,
  title,
  description,
}: {
  index: string
  title: string
  description?: string
}) {
  return (
    <div className="flex items-baseline gap-4 border-t-2 border-white pt-6 mb-8">
      <span className="font-mono text-muted-foreground text-xs tracking-[0.3em] shrink-0">
        [{index}]
      </span>
      <div>
        <h2 className="font-mono font-black uppercase tracking-widest text-lg text-white">
          {title}
        </h2>
        {description && (
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mt-0.5">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}

function InlineFeedback({
  state,
  message,
}: {
  state: FeedbackState
  message: string
}) {
  if (state === 'idle') return null
  return (
    <div
      className={`flex items-center gap-2 font-mono text-xs uppercase tracking-widest py-2 px-3 border-l-2 transition-all ${
        state === 'success'
          ? 'border-primary text-primary bg-primary/5'
          : 'border-red-500 text-red-500 bg-red-500/5'
      }`}
    >
      {state === 'success' ? <CheckCircle size={12} /> : <XCircle size={12} />}
      {message}
    </div>
  )
}

function Settings() {
  const { data: user, refetch: refetchUser } = useQuery(
    getUsersControllerGetMeQueryOptions({}),
  )
  const { data: scaleStatus, refetch: refetchScale } = useQuery(
    getIotControllerGetStatusQueryOptions({}) as any,
  )

  const updateProfileMutation = useUsersControllerUpdate()
  const changePasswordMutation = useAuthControllerChangePassword()
  const linkScaleMutation = useIotControllerLinkDevice()
  const unlinkScaleMutation = useIotControllerUnlinkDevice()

  const [username, setUsername] = useState(user?.username || '')
  const [dateOfBirth, setDateOfBirth] = useState(
    user?.date_of_birth
      ? new Date(user.date_of_birth).toISOString().split('T')[0]
      : '',
  )
  const [sex, setSex] = useState<UpdateUserDtoSex | ''>(user?.sex || '')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [serialNumber, setSerialNumber] = useState('')

  const profileFeedback = useTransientFeedback()
  const passwordFeedback = useTransientFeedback()
  const iotFeedback = useTransientFeedback()

  // Scroll to hash anchor on mount (e.g. /settings#iot-section from dashboard)
  useEffect(() => {
    if (window.location.hash) {
      const el = document.querySelector(window.location.hash)
      if (el) {
        setTimeout(
          () => el.scrollIntoView({ behavior: 'smooth', block: 'start' }),
          200,
        )
      }
    }
  }, [])

  // Sync user data when loaded
  useEffect(() => {
    if (user) {
      setUsername(user.username || '')
      setDateOfBirth(
        user.date_of_birth
          ? new Date(user.date_of_birth).toISOString().split('T')[0]
          : '',
      )
      setSex(user.sex || '')
    }
  }, [user])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    try {
      await updateProfileMutation.mutateAsync({
        id: user.id.toString(),
        data: {
          username,
          date_of_birth: dateOfBirth
            ? new Date(dateOfBirth).toISOString()
            : undefined,
          sex: (sex || undefined) as any,
        },
      })
      refetchUser()
      profileFeedback.trigger('success', 'Profile updated successfully')
    } catch {
      profileFeedback.trigger('error', 'Failed to update profile')
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await changePasswordMutation.mutateAsync({
        data: { password: oldPassword, new_password: newPassword },
      })
      setOldPassword('')
      setNewPassword('')
      passwordFeedback.trigger('success', 'Password changed successfully')
    } catch {
      passwordFeedback.trigger('error', 'Incorrect current password')
    }
  }

  const handleLinkScale = async () => {
    try {
      await linkScaleMutation.mutateAsync({
        data: { serial_number: serialNumber },
      })
      setSerialNumber('')
      refetchScale()
      iotFeedback.trigger('success', 'Device linked successfully')
    } catch {
      iotFeedback.trigger(
        'error',
        'Failed to link device — check serial number',
      )
    }
  }

  const handleUnlinkScale = async () => {
    try {
      await unlinkScaleMutation.mutateAsync()
      refetchScale()
      iotFeedback.trigger('success', 'Device unlinked')
    } catch {
      iotFeedback.trigger('error', 'Failed to unlink device')
    }
  }

  const isLinked = (scaleStatus as any)?.isLinked

  return (
    <div className="flex flex-col max-w-2xl w-full mx-auto mb-24">
      {/* Page title */}
      <div className="mb-10">
        <h1 className="text-4xl font-black font-mono uppercase tracking-tighter text-white">
          System.<span className="text-primary">Config</span>
        </h1>
        <p className="text-muted-foreground font-mono uppercase text-xs tracking-[0.3em] mt-2">
          User preferences &amp; hardware integrations
        </p>
      </div>

      {/* ── 01 PROFILE ─────────────────────────────── */}
      <section
        className="mb-10"
        style={{
          animation: 'fadeSlideUp 0.4s ease both',
          animationDelay: '0ms',
        }}
      >
        <SectionHeader
          index="01"
          title="Identity"
          description="Personal profile &amp; biometric metadata"
        />
        <form onSubmit={handleUpdateProfile} className="flex flex-col gap-5">
          <div className="border-l-2 border-white/10 pl-5 flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Username
              </Label>
              <Input
                className="brutal-border rounded-none bg-black text-white h-10 font-mono text-sm"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Date of Birth
                </Label>
                <Input
                  type="date"
                  className="brutal-border rounded-none bg-black text-white h-10 font-mono text-sm"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Biological Sex
                </Label>
                <select
                  className="brutal-border bg-black text-white h-10 px-3 font-mono text-sm uppercase outline-none focus:ring-2 focus:ring-primary w-full"
                  value={sex}
                  onChange={(e) => setSex(e.target.value as UpdateUserDtoSex)}
                >
                  <option value="">— Select —</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="brutal-border hover:bg-primary rounded-none font-bold uppercase font-mono tracking-widest text-black bg-white text-xs h-10 px-6"
            >
              {updateProfileMutation.isPending
                ? 'Updating...'
                : 'Apply Changes_'}
            </Button>
            <InlineFeedback
              state={profileFeedback.state}
              message={profileFeedback.message}
            />
          </div>
        </form>
      </section>

      {/* ── 02 SECURITY ─────────────────────────────── */}
      <section
        className="mb-10"
        style={{
          animation: 'fadeSlideUp 0.4s ease both',
          animationDelay: '80ms',
        }}
      >
        <SectionHeader
          index="02"
          title="Security_Key"
          description="Change authentication credentials"
        />
        <form onSubmit={handleChangePassword} className="flex flex-col gap-5">
          <div className="border-l-2 border-white/10 pl-5 flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Current Password
                </Label>
                <Input
                  type="password"
                  className="brutal-border rounded-none bg-black text-white h-10 font-mono text-sm"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  New Password
                </Label>
                <Input
                  type="password"
                  className="brutal-border rounded-none bg-black text-white h-10 font-mono text-sm"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              type="submit"
              disabled={
                changePasswordMutation.isPending || !oldPassword || !newPassword
              }
              className="brutal-border rounded-none font-bold uppercase font-mono tracking-widest text-xs h-10 px-6 bg-transparent border-red-500 text-red-500 hover:bg-red-500 hover:text-black"
            >
              {changePasswordMutation.isPending
                ? 'Changing...'
                : 'Rotate_Password_'}
            </Button>
            <InlineFeedback
              state={passwordFeedback.state}
              message={passwordFeedback.message}
            />
          </div>
        </form>
      </section>

      {/* ── 03 IOT ─────────────────────────────── */}
      <section
        id="iot-section"
        style={{
          animation: 'fadeSlideUp 0.4s ease both',
          animationDelay: '160ms',
        }}
      >
        <SectionHeader
          index="03"
          title="IoT_Link"
          description="Smart scale hardware integration"
        />
        <div className="border-l-2 border-white/10 pl-5 flex flex-col gap-5">
          {/* Status row */}
          <div className="flex items-center justify-between py-4 px-5 bg-neutral-950 brutal-border">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-8 h-8">
                {isLinked ? (
                  <Wifi size={16} className="text-primary" />
                ) : (
                  <WifiOff size={16} className="text-muted-foreground" />
                )}
                {isLinked && (
                  <span
                    className="absolute top-0 right-0 w-2 h-2 rounded-full bg-primary"
                    style={{ animation: 'pulse 2s ease-in-out infinite' }}
                  />
                )}
              </div>
              <div>
                <p className="font-mono font-bold uppercase text-sm text-white tracking-widest">
                  Smart Scale
                </p>
                <p
                  className={`font-mono text-[10px] uppercase tracking-widest ${
                    isLinked ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {isLinked ? '● LINKED' : '○ NO DEVICE CONNECTED'}
                </p>
              </div>
            </div>
            {isLinked && (
              <Button
                onClick={handleUnlinkScale}
                disabled={unlinkScaleMutation.isPending}
                className="brutal-border bg-transparent border-red-500 text-red-500 hover:bg-red-500 hover:text-black rounded-none uppercase font-mono font-bold tracking-widest text-xs h-9 px-4"
              >
                {unlinkScaleMutation.isPending ? 'Working...' : 'Unlink_'}
              </Button>
            )}
          </div>

          {/* Link form */}
          {!isLinked && (
            <div className="flex flex-col gap-3">
              <Label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Device Serial Number
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. SC-4A2B-9F1D"
                  value={serialNumber}
                  onChange={(e) =>
                    setSerialNumber(e.target.value.toUpperCase())
                  }
                  className="brutal-border rounded-none bg-black text-primary font-mono h-10 tracking-widest text-sm flex-1 placeholder:text-muted-foreground/50 placeholder:normal-case placeholder:tracking-normal"
                />
                <Button
                  onClick={handleLinkScale}
                  disabled={linkScaleMutation.isPending || !serialNumber}
                  className="brutal-border bg-primary text-black hover:bg-white rounded-none uppercase font-mono font-bold tracking-widest text-xs h-10 px-5 shrink-0"
                >
                  {linkScaleMutation.isPending ? '...' : 'Link_Device_'}
                </Button>
              </div>
            </div>
          )}

          <InlineFeedback
            state={iotFeedback.state}
            message={iotFeedback.message}
          />
        </div>
      </section>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
      `}</style>
    </div>
  )
}
