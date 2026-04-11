import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import { getUsersControllerGetMeQueryOptions, useUsersControllerUpdate } from '../../api/endpoints/users/users'
import type { UpdateUserDtoSex } from '../../api/model/updateUserDtoSex'
import { useAuthControllerChangePassword } from '../../api/endpoints/auth/auth'
import { useIotControllerLinkDevice, useIotControllerUnlinkDevice, getIotControllerGetStatusQueryOptions } from '../../api/endpoints/iot-scales/iot-scales'

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

export const Route = createFileRoute('/_authenticated/settings')({
  loader: async ({ context: { queryClient } }) => {
    await Promise.all([
      queryClient.ensureQueryData(getUsersControllerGetMeQueryOptions({})),
      queryClient.ensureQueryData(getIotControllerGetStatusQueryOptions({}) as any).catch(() => null)
    ])
  },
  component: Settings,
})

function Settings() {
  const { data: user, refetch: refetchUser } = useQuery(getUsersControllerGetMeQueryOptions({}))
  const { data: scaleStatus, refetch: refetchScale } = useQuery(getIotControllerGetStatusQueryOptions({}) as any)

  const updateProfileMutation = useUsersControllerUpdate()
  const changePasswordMutation = useAuthControllerChangePassword()
  const linkScaleMutation = useIotControllerLinkDevice()
  const unlinkScaleMutation = useIotControllerUnlinkDevice()

  const [username, setUsername] = useState(user?.username || '')
  const [dateOfBirth, setDateOfBirth] = useState(user?.date_of_birth ? new Date(user.date_of_birth).toISOString().split('T')[0] : '')
  const [sex, setSex] = useState<UpdateUserDtoSex | ''>(user?.sex || '')
  
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [serialNumber, setSerialNumber] = useState('')

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    await updateProfileMutation.mutateAsync({ 
      id: user.id.toString(), 
      data: { 
        username,
        date_of_birth: dateOfBirth ? new Date(dateOfBirth).toISOString() : undefined,
        sex: (sex || undefined) as any
      } 
    })
    refetchUser()
    alert('Profile updated!')
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await changePasswordMutation.mutateAsync({ data: { password: oldPassword, new_password: newPassword } })
      setOldPassword('')
      setNewPassword('')
      alert('Password updated!')
    } catch {
      alert('Failed to update password')
    }
  }

  const handleLinkScale = async () => {
    try {
      await linkScaleMutation.mutateAsync({ data: { serial_number: serialNumber } })
      refetchScale()
    } catch {
      alert('Failed to link scale')
    }
  }

  const handleUnlinkScale = async () => {
    try {
      await unlinkScaleMutation.mutateAsync()
      refetchScale()
    } catch {
      alert('Failed to unlink scale')
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-black font-mono tracking-tighter uppercase text-white">
          System.<span className="text-primary">Settings</span>
        </h1>
        <p className="text-muted-foreground font-mono uppercase text-xs tracking-widest mt-1">
          Configuration & External Integrations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="brutal-border brutal-shadow rounded-none bg-black">
          <CardHeader className="border-b-2 border-white pb-4 relative">
            <CardTitle className="text-sm font-black font-mono tracking-widest uppercase text-white">
              Profile_Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label className="font-mono text-xs uppercase text-muted-foreground">Username</Label>
                <Input 
                  className="brutal-border rounded-none bg-black text-white h-10 font-mono" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="font-mono text-xs uppercase text-muted-foreground">Date of Birth</Label>
                <Input 
                  type="date"
                  className="brutal-border rounded-none bg-black text-white h-10 font-mono" 
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="font-mono text-xs uppercase text-muted-foreground">Sex</Label>
                <select
                  className="brutal-border rounded-none bg-black text-white h-10 p-2 font-mono outline-none focus:ring-2 focus:ring-primary"
                  value={sex}
                  onChange={(e) => setSex(e.target.value as UpdateUserDtoSex)}
                >
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <Button type="submit" disabled={updateProfileMutation.isPending} className="brutal-border hover:bg-primary rounded-none font-bold uppercase font-mono tracking-widest text-black">
                {updateProfileMutation.isPending ? 'Updating...' : 'Update_Profile'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="brutal-border brutal-shadow rounded-none bg-black">
          <CardHeader className="border-b-2 border-white pb-4 relative">
            <CardTitle className="text-sm font-black font-mono tracking-widest uppercase text-white">
              Security_Key
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label className="font-mono text-xs uppercase text-muted-foreground">Current Password</Label>
                <Input 
                  type="password"
                  className="brutal-border rounded-none bg-black text-white h-10 font-mono" 
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="font-mono text-xs uppercase text-muted-foreground">New Password</Label>
                <Input 
                  type="password"
                  className="brutal-border rounded-none bg-black text-white h-10 font-mono" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={changePasswordMutation.isPending} className="brutal-border bg-destructive hover:bg-destructive/90 text-white rounded-none font-bold uppercase font-mono tracking-widest">
                {changePasswordMutation.isPending ? 'Changing...' : 'Change_Password'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="brutal-border brutal-shadow rounded-none bg-black md:col-span-2">
          <CardHeader className="border-b-2 border-white pb-4 relative">
            <CardTitle className="text-sm font-black font-mono tracking-widest uppercase text-white">
              IoT_Integrations
            </CardTitle>
            <CardDescription className="font-mono uppercase text-xs mt-2">
              Manage smart scale connections
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex justify-between items-center bg-[#0a0a0a]">
             <div className="flex flex-col gap-1">
               <span className="font-mono uppercase text-sm font-bold text-white">Smart Scale</span>
               {(scaleStatus as any)?.isLinked ? (
                 <span className="font-mono text-xs text-primary uppercase">Status: Linked</span>
               ) : (
                 <span className="font-mono text-xs text-red-500 uppercase">Status: Unlinked</span>
               )}
             </div>
             
             {(scaleStatus as any)?.isLinked ? (
               <Button onClick={handleUnlinkScale} disabled={unlinkScaleMutation.isPending} className="brutal-border bg-transparent border-red-500 text-red-500 hover:bg-red-500 hover:text-black rounded-none uppercase font-mono font-bold tracking-widest">
                 {unlinkScaleMutation.isPending ? 'Working...' : 'Unlink_Device'}
               </Button>
             ) : (
               <div className="flex gap-2">
                 <Input 
                   placeholder="SERIAL_NUMBER" 
                   value={serialNumber} 
                   onChange={e => setSerialNumber(e.target.value)} 
                   className="brutal-border rounded-none bg-black text-white w-48 font-mono" 
                 />
                 <Button onClick={handleLinkScale} disabled={linkScaleMutation.isPending || !serialNumber} className="brutal-border bg-primary text-black hover:bg-white rounded-none uppercase font-mono font-bold tracking-widest">
                   {linkScaleMutation.isPending ? 'Working...' : 'Link_Device'}
                 </Button>
               </div>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
