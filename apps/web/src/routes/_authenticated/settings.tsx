import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircle, XCircle, Wifi, WifiOff } from 'lucide-react'

import {
  getUsersControllerGetMeQueryOptions,
  useUsersControllerUpdate,
  useUsersControllerRemove,
} from '../../api/endpoints/users/users'
import type { UpdateUserDtoSex } from '../../api/model/updateUserDtoSex'
import { useAuthControllerChangePassword } from '../../api/endpoints/auth/auth'
import {
  useIotControllerLinkDevice,
  useIotControllerUnlinkDevice,
  getIotControllerGetStatusQueryOptions,
} from '../../api/endpoints/iot-scales/iot-scales'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../components/ui/alert-dialog'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'

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
  const { t } = useTranslation()
  const { data: user, refetch: refetchUser } = useQuery(
    getUsersControllerGetMeQueryOptions({}),
  )
  const { data: scaleStatus, refetch: refetchScale } = useQuery({
    ...(getIotControllerGetStatusQueryOptions({}) as any),
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  })

  const updateProfileMutation = useUsersControllerUpdate()
  const changePasswordMutation = useAuthControllerChangePassword()
  const linkScaleMutation = useIotControllerLinkDevice()
  const unlinkScaleMutation = useIotControllerUnlinkDevice()
  const deleteAccountMutation = useUsersControllerRemove()

  const [username, setUsername] = useState(user?.username || '')
  const [dateOfBirth, setDateOfBirth] = useState(
    user?.date_of_birth
      ? new Date(user.date_of_birth).toISOString().split('T')[0]
      : '',
  )
  const [sex, setSex] = useState<UpdateUserDtoSex | ''>(user?.sex || '')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [serialNumber, setSerialNumber] = useState(
    () => localStorage.getItem('iot_serial_number') ?? '',
  )

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
      profileFeedback.trigger('success', t('settingsPage.msg.profSuccess'))
    } catch {
      profileFeedback.trigger('error', t('settingsPage.msg.profFail'))
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
      passwordFeedback.trigger('success', t('settingsPage.msg.passSuccess'))
    } catch {
      passwordFeedback.trigger('error', t('settingsPage.msg.passFail'))
    }
  }

  const handleLinkScale = async () => {
    try {
      await linkScaleMutation.mutateAsync({
        data: { serial_number: serialNumber },
      })
      localStorage.setItem('iot_serial_number', serialNumber)
      setSerialNumber('')
      refetchScale()
      iotFeedback.trigger('success', t('settingsPage.msg.linkSuccess'))
    } catch {
      iotFeedback.trigger('error', t('settingsPage.msg.linkFail'))
    }
  }

  const handleUnlinkScale = async () => {
    try {
      await unlinkScaleMutation.mutateAsync()
      localStorage.removeItem('iot_serial_number')
      refetchScale()
      iotFeedback.trigger('success', t('settingsPage.msg.unlinkSuccess'))
    } catch {
      iotFeedback.trigger('error', t('settingsPage.msg.unlinkFail'))
    }
  }

  const handleDeleteAccount = async () => {
    if (!user) return
    try {
      await deleteAccountMutation.mutateAsync({ id: user.id.toString() })
      localStorage.removeItem('token')
      window.location.href = '/'
    } catch {
      console.error('Failed to delete account')
    }
  }

  const scaleData = scaleStatus as any
  const isLinked = scaleData?.is_linked
  const linkedSerial = scaleData?.serial_number as string | null

  return (
    <div className="flex flex-col max-w-2xl w-full mx-auto mb-24">
      <div className="mb-10">
        <h1 className="text-4xl font-black font-mono uppercase tracking-tighter text-white">
          {t('settingsPage.title')}
          <span className="text-primary">{t('settingsPage.titleSpan')}</span>
        </h1>
        <p className="text-muted-foreground font-mono uppercase text-xs tracking-[0.3em] mt-2">
          {t('settingsPage.subtitle')}
        </p>
      </div>
      <section
        className="mb-10"
        style={{
          animation: 'fadeSlideUp 0.4s ease both',
          animationDelay: '0ms',
        }}
      >
        <SectionHeader
          index="01"
          title={t('settingsPage.identity')}
          description={t('settingsPage.identityDesc')}
        />
        <form onSubmit={handleUpdateProfile} className="flex flex-col gap-5">
          <div className="border-l-2 border-white/10 pl-5 flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {t('settingsPage.username')}
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
                  {t('settingsPage.dob')}
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
                  {t('settingsPage.bioSex')}
                </Label>
                <Select
                  value={sex}
                  onValueChange={(val) => setSex(val as UpdateUserDtoSex)}
                >
                  <SelectTrigger className="brutal-border rounded-none bg-black text-white h-10 font-mono text-sm uppercase w-full">
                    <SelectValue placeholder={t('settingsPage.select')} />
                  </SelectTrigger>
                  <SelectContent className="bg-black brutal-border rounded-none font-mono uppercase">
                    <SelectGroup>
                      <SelectItem value="male">
                        {t('settingsPage.male')}
                      </SelectItem>
                      <SelectItem value="female">
                        {t('settingsPage.female')}
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
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
                ? t('settingsPage.updating')
                : t('settingsPage.applyChanges')}
            </Button>
            <InlineFeedback
              state={profileFeedback.state}
              message={profileFeedback.message}
            />
          </div>
        </form>
      </section>
      <section
        className="mb-10"
        style={{
          animation: 'fadeSlideUp 0.4s ease both',
          animationDelay: '80ms',
        }}
      >
        <SectionHeader
          index="02"
          title={t('settingsPage.securityKey')}
          description={t('settingsPage.securityDesc')}
        />
        <form onSubmit={handleChangePassword} className="flex flex-col gap-5">
          <div className="border-l-2 border-white/10 pl-5 flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  {t('settingsPage.curPass')}
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
                  {t('settingsPage.newPass')}
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
                ? t('settingsPage.changing')
                : t('settingsPage.rotatePass')}
            </Button>
            <InlineFeedback
              state={passwordFeedback.state}
              message={passwordFeedback.message}
            />
          </div>
        </form>
      </section>
      <section
        className="mb-10"
        id="iot-section"
        style={{
          animation: 'fadeSlideUp 0.4s ease both',
          animationDelay: '160ms',
        }}
      >
        <SectionHeader
          index="03"
          title={t('settingsPage.iotLink')}
          description={t('settingsPage.iotDesc')}
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
                  {t('settingsPage.smartScale')}
                </p>
                <p
                  className={`font-mono text-[10px] uppercase tracking-widest ${
                    isLinked ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {isLinked
                    ? t('settingsPage.linkedStatus', { serial: linkedSerial })
                    : t('settingsPage.noDevice')}
                </p>
              </div>
            </div>
            {isLinked && (
              <Button
                onClick={handleUnlinkScale}
                disabled={unlinkScaleMutation.isPending}
                className="brutal-border bg-transparent border-red-500 text-red-500 hover:bg-red-500 hover:text-black rounded-none uppercase font-mono font-bold tracking-widest text-xs h-9 px-4"
              >
                {unlinkScaleMutation.isPending
                  ? t('settingsPage.working')
                  : t('settingsPage.unlink')}
              </Button>
            )}
          </div>
          {!isLinked && (
            <div className="flex flex-col gap-3">
              <Label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {t('settingsPage.devSerial')}
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. SC-4A2B-9F1D"
                  value={serialNumber}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase()
                    setSerialNumber(val)
                    localStorage.setItem('iot_serial_number', val)
                  }}
                  className="brutal-border rounded-none bg-black text-primary font-mono h-10 tracking-widest text-sm flex-1 placeholder:text-muted-foreground/50 placeholder:normal-case placeholder:tracking-normal"
                />
                <Button
                  onClick={handleLinkScale}
                  disabled={linkScaleMutation.isPending || !serialNumber}
                  className="brutal-border bg-primary text-black hover:bg-white rounded-none uppercase font-mono font-bold tracking-widest text-xs h-10 px-5 shrink-0"
                >
                  {linkScaleMutation.isPending
                    ? '...'
                    : t('settingsPage.linkDevice')}
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
      <section
        className="mb-10"
        style={{
          animation: 'fadeSlideUp 0.4s ease both',
          animationDelay: '240ms',
        }}
      >
        <SectionHeader
          index="04"
          title={t('settingsPage.dangerZone', 'Danger Zone')}
          description={t('settingsPage.dangerZoneDesc', 'Irreversible actions')}
        />
        <div className="border-l-2 border-red-500/50 pl-5 flex flex-col gap-5">
          <p className="font-mono text-sm text-red-500 max-w-lg mb-4">
            {t(
              'settingsPage.deleteWarning',
              'Once you delete your account, there is no going back. Please be certain.',
            )}
          </p>

          <AlertDialog>
            <AlertDialogTrigger
              render={<Button variant="destructive" />}
              className="brutal-border w-fit font-bold uppercase font-mono tracking-widest text-xs h-10 px-6 rounded-none transition-none"
            >
              {t('settingsPage.deleteAccount', 'Delete Account')}
            </AlertDialogTrigger>
            <AlertDialogContent className="brutal-border bg-black border-red-500 rounded-none sm:max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-mono font-black uppercase text-xl text-red-500 tracking-tighter">
                  {t(
                    'settingsPage.deleteConfirmTitle',
                    'Are you absolutely sure?',
                  )}
                </AlertDialogTitle>
                <AlertDialogDescription className="font-mono text-muted-foreground text-sm">
                  {t(
                    'settingsPage.deleteConfirmDesc',
                    'This action cannot be undone. This will permanently delete your account and remove all your data from our servers.',
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="mt-6 border-t-2 border-white/10 pt-4">
                <AlertDialogCancel className="brutal-border hover:bg-white/10 text-white rounded-none font-mono uppercase text-xs font-bold transition-none">
                  {t('settingsPage.cancel', 'Cancel')}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  className="bg-red-500 text-white hover:bg-black hover:text-red-500 hover:border-red-500 brutal-border border-red-500 rounded-none font-mono uppercase text-xs font-bold transition-none ml-2"
                >
                  {t('settingsPage.deleteConfirmAction', 'Yes, Delete Account')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
