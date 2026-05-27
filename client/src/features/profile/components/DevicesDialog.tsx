import { useState } from 'react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Laptop, Smartphone, Pencil, Trash2 } from 'lucide-react'
import { Loader } from '#/components/ui/loader'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '#/components/ui/dialog'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authClient } from '#/lib/auth/auth-client'
import { apiClient } from '#/lib/api'

interface DevicesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function parseUserAgent(userAgent: string | null) {
  if (!userAgent) {
    return { device: 'Unknown Device', browser: 'Browser', os: 'OS' }
  }

  let os = 'OS'
  let device = 'Desktop'
  let browser = 'Browser'

  // OS & Device detection
  if (/windows/i.test(userAgent)) {
    os = 'Windows'
    device = 'Windows PC'
  } else if (/macintosh|mac os x/i.test(userAgent)) {
    os = 'macOS'
    device = 'Mac'
  } else if (/iphone/i.test(userAgent)) {
    os = 'iOS'
    device = 'iPhone'
  } else if (/ipad/i.test(userAgent)) {
    os = 'iOS'
    device = 'iPad'
  } else if (/android/i.test(userAgent)) {
    os = 'Android'
    device = 'Android Phone'

    const androidMatch = userAgent.match(/android \d+(?:\.\d+)*;\s*([^;)]+)/i)
    if (androidMatch && androidMatch[1]) {
      const model = androidMatch[1].split('Build/')[0].trim()
      if (model && model.length < 32 && !/wv|mobile|version/i.test(model)) {
        device = model
      }
    }
  } else if (/linux/i.test(userAgent)) {
    os = 'Linux'
    device = 'Linux PC'
  }

  // Browser detection
  if (/chrome|crios/i.test(userAgent) && !/edge|opr|opera/i.test(userAgent)) {
    browser = 'Chrome'
  } else if (
    /safari/i.test(userAgent) &&
    !/chrome|crios|android/i.test(userAgent)
  ) {
    browser = 'Safari'
  } else if (/firefox|fxios/i.test(userAgent)) {
    browser = 'Firefox'
  } else if (/edge|edg/i.test(userAgent)) {
    browser = 'Edge'
  } else if (/opera|opr/i.test(userAgent)) {
    browser = 'Opera'
  }

  return { device, browser, os }
}

export function DevicesDialog({ open, onOpenChange }: DevicesDialogProps) {
  const queryClient = useQueryClient()
  const [editingDeviceId, setEditingDeviceId] = useState<string | null>(null)
  const [editingDeviceName, setEditingDeviceName] = useState('')
  const [removingId, setRemovingId] = useState<string | null>(null)

  // Fetch current session details to mark current device
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const res = await authClient.getSession()
      return res.data
    },
  })

  // Fetch dynamic sessions as devices
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['user-sessions'],
    queryFn: async () => {
      const res = await apiClient.get('/users/settings/sessions')
      return res.data.sessions as any[]
    },
    enabled: open,
  })

  // Rename device mutation
  const renameMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      await apiClient.patch(`/users/settings/sessions/${id}`, {
        deviceName: name,
      })
    },
    onSuccess: () => {
      toast.success('Device renamed successfully!')
      queryClient.invalidateQueries({ queryKey: ['user-sessions'] })
      setEditingDeviceId(null)
      setEditingDeviceName('')
    },
    onError: () => {
      toast.error('Failed to rename device.')
    },
  })

  // Untrust / Revoke device session mutation
  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      setRemovingId(id)
      await apiClient.delete(`/users/settings/sessions/${id}`)
    },
    onSuccess: () => {
      toast.success('Device untrusted successfully.')
      queryClient.invalidateQueries({ queryKey: ['user-sessions'] })
    },
    onError: () => {
      toast.error('Failed to remove device.')
    },
    onSettled: () => {
      setRemovingId(null)
    },
  })

  const handleRemoveDevice = (deviceId: string) => {
    if (
      confirm('Remove this device from trusted list? This will sign it out.')
    ) {
      removeMutation.mutate(deviceId)
    }
  }

  const handleStartRenameDevice = (deviceId: string, name: string) => {
    setEditingDeviceId(deviceId)
    setEditingDeviceName(name)
  }

  const handleSaveRenameDevice = () => {
    if (!editingDeviceName.trim() || !editingDeviceId) return
    renameMutation.mutate({
      id: editingDeviceId,
      name: editingDeviceName.trim(),
    })
  }

  const currentSessionId = session?.session?.id

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-[32px] border-none bg-card/90 backdrop-blur-md p-6 shadow-2xl animate-scale-in">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl font-black text-foreground font-display flex items-center gap-2">
            <Laptop className="h-5 w-5 text-primary" />
            Trusted Devices
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground/85 font-medium">
            These devices bypass secondary prompts and are fully authorized to
            access your Vastu rental data.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-3 space-y-4 max-h-[340px] overflow-y-auto pr-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-2">
              <Loader size={24} variant="default" />
              <span className="text-xs font-bold text-muted-foreground/70">
                Loading trusted devices...
              </span>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-10 text-xs font-bold text-muted-foreground/70">
              No trusted devices found.
            </div>
          ) : (
            sessions.map((sessionItem: any) => {
              const { device, os } = parseUserAgent(sessionItem.userAgent)
              const displayName = sessionItem.deviceName || device
              const isCurrent = sessionItem.id === currentSessionId
              const isPhone =
                device.includes('iPhone') ||
                device.includes('iPad') ||
                device.includes('Phone') ||
                os === 'iOS' ||
                os === 'Android'

              const formattedDate = new Date(
                sessionItem.createdAt,
              ).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })

              return (
                <div
                  key={sessionItem.id}
                  className="flex items-center justify-between p-4 rounded-2xl border bg-card border-border/30 shadow-sm"
                >
                  <div className="flex gap-3 items-center flex-1 min-w-0 pr-2 text-left">
                    <div className="h-10 w-10 rounded-xl bg-muted-light border border-border/40 text-muted-foreground/85 flex items-center justify-center shrink-0">
                      {isPhone ? (
                        <Smartphone size={18} />
                      ) : (
                        <Laptop size={18} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      {editingDeviceId === sessionItem.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="text"
                            value={editingDeviceName}
                            onChange={(e) =>
                              setEditingDeviceName(e.target.value)
                            }
                            disabled={renameMutation.isPending}
                            className="h-8 rounded-lg text-xs font-bold border-primary focus:ring-1 focus:ring-primary/20"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveRenameDevice()
                              if (e.key === 'Escape') setEditingDeviceId(null)
                            }}
                          />
                          <Button
                            size="sm"
                            onClick={handleSaveRenameDevice}
                            disabled={renameMutation.isPending}
                            className="h-8 bg-primary text-primary-foreground text-[10px] font-black rounded-lg px-2 shadow-none cursor-pointer border-none flex items-center gap-1"
                          >
                            {renameMutation.isPending ? (
                              <Loader variant="white" size={10} />
                            ) : (
                              'Save'
                            )}
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-extrabold text-foreground truncate">
                            {displayName}
                          </h4>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleStartRenameDevice(
                                sessionItem.id,
                                displayName,
                              )
                            }
                            className="h-5 w-5 text-muted-foreground/70 hover:text-muted-foreground transition-colors p-0 border-none bg-transparent cursor-pointer"
                          >
                            <Pencil size={10} />
                          </Button>
                        </div>
                      )}
                      <p className="text-[10px] text-muted-foreground/70 font-semibold mt-0.5">
                        Trusted since {formattedDate}{' '}
                        {isCurrent && ' • Current Device'}
                      </p>
                    </div>
                  </div>

                  {!isCurrent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={removingId === sessionItem.id}
                      onClick={() => handleRemoveDevice(sessionItem.id)}
                      className="h-8 w-8 p-0 rounded-lg text-destructive/80 hover:text-destructive hover:bg-danger cursor-pointer shadow-none shrink-0 flex items-center justify-center"
                    >
                      {removingId === sessionItem.id ? (
                        <Loader variant="default" size={12} />
                      ) : (
                        <Trash2 size={13} />
                      )}
                    </Button>
                  )}
                </div>
              )
            })
          )}
        </div>

        <div className="pt-3 border-t border-border/30 flex justify-end">
          <Button
            onClick={() => onOpenChange(false)}
            className="rounded-xl h-10 px-6 font-bold bg-primary hover:bg-primary-hover text-primary-foreground border-none cursor-pointer"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
