import { useTranslation } from '#/context/TranslationContext'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import type { Conversation } from '#/hook'

interface ConversationSubTabsProps {
  activeSubTab: 'all' | 'unread' | 'bookings' | 'support' | 'archived'
  setActiveSubTab: (
    tab: 'all' | 'unread' | 'bookings' | 'support' | 'archived',
  ) => void
  conversations: Conversation[]
  totalUnread: number
}

export function ConversationSubTabs({
  activeSubTab,
  setActiveSubTab,
  conversations,
  totalUnread,
}: ConversationSubTabsProps) {
  const { t } = useTranslation()

  return (
    <div className="flex gap-1 pt-1 justify-between w-full">
      {(['all', 'unread', 'bookings', 'support', 'archived'] as const).map(
        (tab) => {
          const tabUnread =
            tab === 'unread'
              ? totalUnread
              : tab === 'all'
                ? totalUnread
                : tab === 'archived'
                  ? conversations.filter((c) => c.isArchived).length
                  : conversations
                      .filter((c) => {
                        if (tab === 'bookings')
                          return c.otherParticipant.role === 'user'
                        if (tab === 'support')
                          return c.otherParticipant.role === 'admin'
                        return false
                      })
                      .reduce((s, c) => s + c.unreadCount, 0)

          const isActive = activeSubTab === tab
          const tabLabel =
            tab === 'archived'
              ? 'Archive'
              : tab.charAt(0).toUpperCase() + tab.slice(1)

          return (
            <Button
              key={tab}
              variant="ghost"
              onClick={() => setActiveSubTab(tab)}
              className={cn(
                'h-8 rounded-full px-2 text-[11px] font-bold cursor-pointer transition-all flex items-center justify-center gap-1 flex-1 shrink min-w-0 shadow-none border border-transparent',
                isActive
                  ? 'bg-brand-primary-deep text-white hover:bg-brand-primary-darker hover:text-white'
                  : 'bg-muted-light hover:bg-muted/60 text-muted-foreground',
              )}
            >
              <span className="truncate">{t(tabLabel)}</span>
              {tabUnread > 0 && (
                <span
                  className={cn(
                    'px-1 h-4 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 transition-colors min-w-[14px]',
                    isActive
                      ? 'bg-white text-brand-primary-deep'
                      : 'bg-emerald-100 text-brand-primary-deep',
                  )}
                >
                  {tabUnread}
                </span>
              )}
            </Button>
          )
        },
      )}
    </div>
  )
}
