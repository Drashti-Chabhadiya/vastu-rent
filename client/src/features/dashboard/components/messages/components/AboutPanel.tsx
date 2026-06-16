import { useState, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { useChatStore } from '../../../../../store/useChatStore'
import { MySettingsPanel } from './MySettingsPanel'
import { EncryptionSecurityDialog } from './EncryptionSecurityDialog'

// Sub-components
import { AboutProfileCard } from './about/AboutProfileCard'
import { AboutBioSection } from './about/AboutBioSection'
import { AboutBookingCard } from './about/AboutBookingCard'
import { AboutActionsCard } from './about/AboutActionsCard'
import { AboutSettingsCard } from './about/AboutSettingsCard'

export function AboutPanel() {
  const {
    conversations,
    activeConversationId,
    currentUserId,
    setShowDetailsPanel,
    activePanel,
    setActivePanel,
  } = useChatStore()

  const [showEncryptionInfo, setShowEncryptionInfo] = useState(false)

  // Derive active conversation
  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) || null

  // Tab state
  const [activeTab, setActiveTab] = useState<'info' | 'settings'>(
    activePanel === 'settings' ? 'settings' : 'info',
  )

  useEffect(() => {
    if (activePanel === 'settings') {
      setActiveTab('settings')
    } else {
      setActiveTab('info')
    }
  }, [activePanel])

  if (!activeConversation) return null

  return (
    <div className="w-full lg:w-[360px] shrink-0 flex flex-col h-full overflow-hidden select-none animate-in slide-in-from-right duration-250 bg-brand-surface-warm">
      {activeTab === 'info' ? (
        <div className="flex-1 overflow-y-auto scrollbar-none pb-6 pt-1 flex flex-col gap-4 px-1">
          {/* Card 1: Profile card with avatar & Verification status */}
          <AboutProfileCard
            otherParticipant={activeConversation.otherParticipant}
          />

          {/* About Bio Section Card with Edit option */}
          <AboutBioSection
            otherParticipant={activeConversation.otherParticipant}
          />

          {/* Card 2: Booking Summary Card */}
          <AboutBookingCard
            otherParticipantId={activeConversation.otherParticipant.id}
            currentUserId={currentUserId || ''}
          />

          {/* Card 3: Media, Links & Docs, Starred, Wallpaper & Export list card */}
          <AboutActionsCard activeConversation={activeConversation} />

          {/* Chat settings card (disappearing, block, report and block) */}
          <AboutSettingsCard activeConversation={activeConversation} />
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Settings Sub-Header */}
          <div className="bg-brand-primary-deep px-4 py-5 flex items-center gap-4 text-white shrink-0 shadow-sm rounded-t-3xl">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setActivePanel('about')
                setShowDetailsPanel(false)
              }}
              className="h-8 w-8 rounded-full hover:bg-white/10 text-white cursor-pointer shadow-none shrink-0"
            >
              <ArrowLeft size={18} strokeWidth={2.5} />
            </Button>
            <h3 className="text-[15px] font-bold text-white leading-none font-display">
              My Settings
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto">
            <MySettingsPanel
              isEmbedded={true}
              onBackToInfo={() => {
                setActivePanel('about')
                setShowDetailsPanel(false)
              }}
            />
          </div>
        </div>
      )}

      {/* Extracted dialog components */}
      <EncryptionSecurityDialog
        open={showEncryptionInfo}
        onOpenChange={setShowEncryptionInfo}
      />
    </div>
  )
}
