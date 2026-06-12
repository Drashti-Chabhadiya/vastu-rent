import { Dialog, DialogContent } from '#/components/ui/dialog'
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
