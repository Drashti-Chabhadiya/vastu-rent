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
import { useQuery } from '@tanstack/react-query'
import { authClient } from '#/lib/auth/auth-client'
import { useUserSessions, useRevokeSession } from '#/hook'
import { parseUserAgent } from '#/lib/device-utils'
import { getLastActive } from '#/lib/date-utils'

interface SessionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SessionsDialog({ open, onOpenChange }: SessionsDialogProps) {
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
  const { data: sessions = [], isLoading } = useUserSessions({ enabled: open })

  // Revoke session mutation
  const revokeMutation = useRevokeSession()

  const currentSessionId = session?.session.id

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-[32px] border-none bg-card/90 backdrop-blur-md p-6 shadow-2xl animate-scale-in">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl font-black text-foreground font-display flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Active Login Sessions
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground/85 font-medium">
            Review and manage your current login sessions across other browsers
            and mobile devices.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-3 space-y-4 max-h-[340px] overflow-y-auto pr-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-2">
              <Loader size={24} variant="default" />
              <span className="text-xs font-bold text-muted-foreground/70">
                Loading active sessions...
              </span>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-10 text-xs font-bold text-muted-foreground/70">
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
                      ? 'bg-primary-soft/40 border-primary-border'
                      : 'bg-card border-border/30 shadow-sm',
                  )}
                >
                  <div className="flex gap-3 items-start text-left">
                    <div
                      className={cn(
                        'h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border',
                        isActiveNow
                          ? 'bg-primary-border border-primary-border text-primary'
                          : 'bg-muted-light border-border/40 text-muted-foreground/85',
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
                        <h4 className="text-xs font-extrabold text-foreground">
                          {device}
                        </h4>
                        {isActiveNow && (
                          <span className="bg-primary-soft/50 text-primary px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground/70 font-bold mt-1">
                        {browser} on {os}
                      </p>
                      <p className="text-[10px] text-muted-foreground/85 font-semibold mt-0.5 flex items-center gap-1">
                        <MapPin
                          size={10}
                          className="text-muted-foreground/70"
                        />
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
                      onClick={() => {
                        setRevokingId(sessionItem.id)
                        revokeMutation.mutate(sessionItem.id, {
                          onSuccess: () => {
                            toast.success('Session revoked successfully!')
                          },
                          onError: () => {
                            toast.error('Failed to revoke session.')
                          },
                          onSettled: () => {
                            setRevokingId(null)
                          },
                        })
                      }}
                      className="h-8 rounded-lg px-3 text-[10px] font-black uppercase tracking-wider text-destructive hover:bg-danger hover:text-destructive shadow-none cursor-pointer shrink-0"
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
