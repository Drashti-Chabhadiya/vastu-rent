import React from 'react'
import { Dialog, DialogContent } from '#/components/ui/dialog'
import { Drawer, DrawerContent } from '#/components/ui/drawer'
import EmojiPicker, { EmojiStyle } from 'emoji-picker-react'
import { useChatStore } from '../../../../../store/useChatStore'

export function EmojiReactDialog() {
  const {
    fullReactMsgId,
    setFullReactMsgId,
    messages,
    currentUserId,
    reactToMessage,
    removeReaction,
  } = useChatStore()

  const [isDesktop, setIsDesktop] = React.useState(true)

  React.useEffect(() => {
    const mql = window.matchMedia('(min-width: 768px)')
    setIsDesktop(mql.matches)
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  const handleEmojiSelect = async (emojiData: any) => {
    if (!fullReactMsgId) return
    const targetMsg = messages.find((m) => m.id === fullReactMsgId)
    const userReacted = targetMsg?.reactions?.some(
      (r) => r.userId === currentUserId && r.emoji === emojiData.emoji,
    )
    try {
      if (userReacted) {
        await removeReaction(fullReactMsgId)
      } else {
        await reactToMessage({
          messageId: fullReactMsgId,
          emoji: emojiData.emoji,
        })
      }
    } catch (err) {
      console.error('Failed to react:', err)
    } finally {
      setFullReactMsgId(null)
    }
  }

  if (isDesktop) {
    return (
      <Dialog
        open={!!fullReactMsgId}
        onOpenChange={(open) => !open && setFullReactMsgId(null)}
      >
        <DialogContent className="max-w-[350px] rounded-3xl p-0 border border-border/30 shadow-2xl overflow-hidden bg-card flex justify-center items-center">
          <EmojiPicker
            onEmojiClick={handleEmojiSelect}
            width={320}
            height={360}
            previewConfig={{ showPreview: false }}
            searchDisabled={false}
            skinTonesDisabled={true}
            emojiStyle={EmojiStyle.APPLE}
          />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer
      open={!!fullReactMsgId}
      onOpenChange={(open) => !open && setFullReactMsgId(null)}
    >
      <DrawerContent className="p-0 border-none bg-card flex flex-col items-center pt-2 pb-6 max-h-[70vh]">
        <EmojiPicker
          onEmojiClick={handleEmojiSelect}
          width="100%"
          height={400}
          previewConfig={{ showPreview: false }}
          searchDisabled={false}
          skinTonesDisabled={true}
          emojiStyle={EmojiStyle.APPLE}
          style={{ border: 'none', backgroundColor: 'transparent' }}
        />
      </DrawerContent>
    </Drawer>
  )
}
