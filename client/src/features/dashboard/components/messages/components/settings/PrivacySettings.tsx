import { Shield, Slash, AlertCircle } from 'lucide-react'
import { Switch } from '#/components/ui/switch'
import { Button } from '#/components/ui/button'
import { UserAvatar } from '../UserAvatar'
import { useChatStore } from '../../../../../../store/useChatStore'
import { useUpdateUserSettings } from '#/hook'
import { useQueryClient, useQuery } from '@tanstack/react-query'
import { authClient } from '#/lib/auth/auth-client'
import { toast } from 'sonner'

export function PrivacySettings() {
  const queryClient = useQueryClient()
  const { mutateAsync: updateSettings } = useUpdateUserSettings()

  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const res = await authClient.getSession()
      return res.data
    },
  })

  const { conversations, currentUserId, unblockConversation } = useChatStore()

  if (!session?.user) return null

  const user = session.user
  const myShowOnline = (user as any).showOnline !== false
  const myShowProfile = (user as any).showProfile !== false

  // Filter blocked users
  const blockedConversations = conversations.filter((conv: any) =>
    conv.blockedBy?.includes(currentUserId || ''),
  )

  return (
    <div className="flex flex-col gap-4 animate-in slide-in-from-right-5 duration-200">
      <div className="flex flex-col gap-4 bg-white/70 border border-slate-200/30 rounded-2xl p-5 shadow-xs">
        <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
          <Shield size={12} className="text-primary" /> Privacy controls
        </h4>

        {/* Profile pic switch */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5 max-w-[80%]">
            <span className="text-[12px] font-bold text-slate-800 flex items-center gap-1.5">
              Profile Visibility
            </span>
            <p className="text-[9px] font-semibold text-slate-400">
              Allow everyone to view your avatar image.
            </p>
          </div>
          <Switch
            checked={myShowProfile}
            onCheckedChange={async (val) => {
              try {
                await updateSettings({ showProfile: val })
                await queryClient.invalidateQueries({
                  queryKey: ['session'],
                })
                toast.success(
                  `Profile visibility set to ${val ? 'everyone' : 'nobody'}`,
                )
              } catch {
                toast.error('Failed to update settings')
              }
            }}
          />
        </div>

        {/* Online status switch */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5 max-w-[80%]">
            <span className="text-[12px] font-bold text-slate-800 flex items-center gap-1.5">
              Online & Active Status
            </span>
            <p className="text-[9px] font-semibold text-slate-400">
              Show your online ping indicator to contacts.
            </p>
          </div>
          <Switch
            checked={myShowOnline}
            onCheckedChange={async (val) => {
              try {
                await updateSettings({ showOnline: val })
                await queryClient.invalidateQueries({
                  queryKey: ['session'],
                })
                toast.success(
                  `Online status set to ${val ? 'everyone' : 'nobody'}`,
                )
              } catch {
                toast.error('Failed to update settings')
              }
            }}
          />
        </div>
      </div>

      {/* Blocked accounts list */}
      <div className="flex flex-col gap-3 bg-white/70 border border-slate-200/30 rounded-2xl p-5 shadow-xs">
        <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
          <Slash size={12} className="text-red-500" /> Blocked Contacts
        </h4>

        {blockedConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-4 text-center gap-1 bg-slate-50/40 border border-dashed border-slate-200/50 rounded-xl">
            <AlertCircle size={14} className="text-slate-300" />
            <span className="text-[10px] font-semibold text-slate-400">
              No blocked contacts
            </span>
          </div>
        ) : (
          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
            {blockedConversations.map((conv: any) => (
              <div
                key={conv.id}
                className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-100 shadow-2xs hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <UserAvatar
                    image={conv.otherParticipant.image}
                    name={conv.otherParticipant.name}
                    size="sm"
                  />
                  <span className="text-[11px] font-bold text-slate-800 truncate max-w-[100px]">
                    {conv.otherParticipant.name}
                  </span>
                </div>
                <Button
                  onClick={async () => {
                    try {
                      await unblockConversation(conv.id)
                      toast.success(`Unblocked ${conv.otherParticipant.name}`)
                    } catch {
                      toast.error('Failed to unblock user')
                    }
                  }}
                  variant="outline"
                  className="h-6 px-2.5 rounded-lg border-emerald-500/20 bg-emerald-50/50 hover:bg-emerald-50 text-[10px] font-black text-emerald-600 hover:text-emerald-700 shadow-none cursor-pointer"
                >
                  Unblock
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
