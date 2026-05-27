import { useState } from 'react'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import { Laptop, Smartphone, History, MapPin } from 'lucide-react'
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

interface SessionsDialogProps {
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

    // Dynamically extract exact Android model name from the user agent details
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

function getLastActive(dateStr: string) {
  const d = new Date(dateStr)
  const diffMs = Date.now() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minutes ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} hours ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} days ago`
}

export function SessionsDialog({ open, onOpenChange }: SessionsDialogProps) {
  const queryClient = useQueryClient()
  const [revokingId, setRevokingId] = useState<string | null>(null)

  // Fetch current session details to mark current session
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const res = await authClient.getSession()
      return res.data
    },
  })

  // Fetch active sessions dynamically
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['user-sessions'],
    queryFn: async () => {
      const res = await apiClient.get('/users/settings/sessions')
      return res.data.sessions as any[]
    },
    enabled: open,
  })

  // Revoke session mutation
  const revokeMutation = useMutation({
    mutationFn: async (id: string) => {
      setRevokingId(id)
      await apiClient.delete(`/users/settings/sessions/${id}`)
    },
    onSuccess: () => {
      toast.success('Session revoked successfully!')
      queryClient.invalidateQueries({ queryKey: ['user-sessions'] })
    },
    onError: () => {
      toast.error('Failed to revoke session.')
    },
    onSettled: () => {
      setRevokingId(null)
    },
  })

  const currentSessionId = session?.session?.id

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-[32px] border-none bg-white/90 backdrop-blur-md p-6 shadow-2xl animate-scale-in">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl font-black text-gray-900 font-display flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Active Login Sessions
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500 font-medium">
            Review and manage your current login sessions across other browsers
            and mobile devices.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-3 space-y-4 max-h-[340px] overflow-y-auto pr-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-2">
              <Loader size={24} variant="default" />
              <span className="text-xs font-bold text-gray-400">
                Loading active sessions...
              </span>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-10 text-xs font-bold text-gray-400">
              No active sessions found.
            </div>
          ) : (
            sessions.map((sessionItem: any) => {
              const { device, browser, os } = parseUserAgent(
                sessionItem.userAgent,
              )
              const isActiveNow = sessionItem.id === currentSessionId

              return (
                <div
                  key={sessionItem.id}
                  className={cn(
                    'flex items-start justify-between p-4 rounded-2xl border transition-all duration-300',
                    isActiveNow
                      ? 'bg-[#F4F8F1]/40 border-[#e6efe1]'
                      : 'bg-white border-gray-100 shadow-sm',
                  )}
                >
                  <div className="flex gap-3 items-start text-left">
                    <div
                      className={cn(
                        'h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border',
                        isActiveNow
                          ? 'bg-[#e6efe1] border-[#d8e8cd] text-primary'
                          : 'bg-gray-50 border-gray-150 text-gray-500',
                      )}
                    >
                      {device.includes('iPhone') ||
                      device.includes('iPad') ||
                      device.includes('Phone') ||
                      os === 'iOS' ||
                      os === 'Android' ? (
                        <Smartphone size={18} />
                      ) : (
                        <Laptop size={18} />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h4 className="text-xs font-extrabold text-gray-900">
                          {device}
                        </h4>
                        {isActiveNow && (
                          <span className="bg-[#ecfdf5] text-[#059669] px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400 font-bold mt-1">
                        {browser} on {os}
                      </p>
                      <p className="text-[10px] text-gray-500 font-semibold mt-0.5 flex items-center gap-1">
                        <MapPin size={10} className="text-gray-400" />
                        IP: {sessionItem.ipAddress || 'Unknown IP'}{' '}
                        <span className="divider-dot" />{' '}
                        {isActiveNow
                          ? 'Active now'
                          : getLastActive(sessionItem.updatedAt)}
                      </p>
                    </div>
                  </div>

                  {!isActiveNow && (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={revokingId === sessionItem.id}
                      onClick={() => revokeMutation.mutate(sessionItem.id)}
                      className="h-8 rounded-lg px-3 text-[10px] font-black uppercase tracking-wider text-red-500 hover:bg-red-50 hover:text-red-650 shadow-none cursor-pointer shrink-0"
                    >
                      {revokingId === sessionItem.id ? (
                        <Loader variant="default" size={12} />
                      ) : (
                        'Revoke'
                      )}
                    </Button>
                  )}
                </div>
              )
            })
          )}
        </div>

        <div className="pt-3 border-t border-gray-100 flex justify-end">
          <Button
            onClick={() => onOpenChange(false)}
            className="rounded-xl h-10 px-6 font-bold bg-[#2d5222] hover:bg-[#203a18] text-white border-none cursor-pointer"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
