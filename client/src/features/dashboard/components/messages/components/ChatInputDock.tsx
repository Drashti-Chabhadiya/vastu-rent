import React, { useRef } from 'react'
import EmojiPicker, { EmojiStyle } from 'emoji-picker-react'
import {
  CornerUpLeft,
  X,
  ImagePlus,
  Smile,
  Paperclip,
  Mic,
  Send,
  Loader2,
} from 'lucide-react'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import { toast } from 'sonner'
import { useChatStore } from '../../../../../store/useChatStore'
import { useUploadChatFile } from '#/hook'
import { useAudioRecorder } from '../hooks/useAudioRecorder'
import { buildReplyContent } from '#/lib/chat-utils'

export function ChatInputDock() {
  const uploadChatFile = useUploadChatFile()

  const {
    isConnected,
    isUploading,
    setIsUploading,
    inputText,
    setInputText,
    showEmojiPicker,
    setShowEmojiPicker,
    pendingFiles,
    pendingPreviews,
    addPendingFiles,
    addPendingPreviews,
    removeFile,
    clearAttachments,
    replyTarget,
    setReplyTarget,
    conversations,
    activeConversationId,
    currentUserId,
    unblockConversation,
    sendMessage,
    emitTyping,
  } = useChatStore()

  const {
    isRecording,
    recordingSeconds,
    isSimulatedRecording,
    startRecording: handleStartRecording,
    cancelRecording: handleCancelRecording,
    stopAndSendRecording: handleStopAndSendRecording,
  } = useAudioRecorder()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId,
  )
  const isBlockedByMe = activeConversation?.blockedBy?.includes(
    currentUserId || '',
  )
  const isBlockedByOther = activeConversation?.blockedBy?.some(
    (uid) => uid !== currentUserId,
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value)
    emitTyping(true)
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => emitTyping(false), 2000)
  }

  const handleSend = async () => {
    const hasText = inputText.trim().length > 0
    const hasFiles = pendingFiles.length > 0
    if (!hasText && !hasFiles) return
    if (!activeConversationId) {
      toast.error('Please select a conversation first')
      return
    }

    setIsUploading(true)
    try {
      // 1. Upload any pending file attachments
      let uploadedUrls: string[] = []
      if (hasFiles) {
        const uploads = await Promise.all(
          pendingFiles.map(async (file) => {
            return await uploadChatFile.mutateAsync(file)
          }),
        )
        uploadedUrls = uploads
      }

      // 2. Build final message content
      const finalContent = replyTarget
        ? buildReplyContent(replyTarget.content, inputText.trim())
        : inputText.trim()

      // 3. Send via socket
      sendMessage(finalContent, uploadedUrls)

      // 4. Reset state
      setInputText('')
      setReplyTarget(null)
      clearAttachments()
      emitTyping(false)
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to upload attachment')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    // Limit to 5 images
    const allowed = files.slice(0, 5 - pendingFiles.length)
    const newPreviews = allowed.map((f) => URL.createObjectURL(f))
    addPendingFiles(allowed)
    addPendingPreviews(newPreviews)
    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className={cn('border-t border-border/30 bg-card shrink-0')}>
      {/* Reply Preview Bar */}
      {replyTarget && (
        <div
          className={cn(
            'flex items-center gap-2 px-4 py-2.5',
            'bg-primary/5 border-b border-primary/10',
            'animate-in slide-in-from-bottom-1 duration-150',
          )}
        >
          <CornerUpLeft size={13} className="text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-black text-primary uppercase tracking-wider mb-0.5">
              Replying to {replyTarget.senderName}
            </p>
            <p className="text-[10px] font-semibold text-muted-dark truncate">
              {replyTarget.content}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setReplyTarget(null)}
            className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-muted-dark hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
          >
            <X size={11} strokeWidth={2.5} />
          </Button>
        </div>
      )}
      {/* Attachment previews (before send) */}
      {pendingPreviews.length > 0 && (
        <div className="flex items-center gap-2 px-4 pt-3 pb-1 flex-wrap">
          {pendingPreviews.map((src, i) => {
            const file = pendingFiles[i]
            const isImage = file?.type?.startsWith('image/')
            return (
              <div
                key={i}
                className="relative w-14 h-14 rounded-xl overflow-hidden border border-border/40 shadow-sm group flex items-center justify-center bg-slate-50"
              >
                {isImage ? (
                  <img
                    src={src}
                    alt={`preview-${i}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-1 text-center text-slate-400 select-none">
                    <Paperclip size={14} className="text-slate-400" />
                    <span className="text-[7px] font-bold text-slate-500 truncate max-w-[50px] mt-0.5">
                      {file?.name}
                    </span>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(i)}
                  className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-0 rounded-none hover:bg-black/50 w-full h-full"
                >
                  <X size={14} className="text-white" strokeWidth={2.5} />
                </Button>
              </div>
            )
          })}
          {pendingFiles.length < 5 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="w-14 h-14 rounded-xl border-2 border-dashed border-border/50 hover:border-primary/40 hover:bg-primary/5 flex items-center justify-center text-muted-dark hover:text-primary transition-all cursor-pointer"
            >
              <ImagePlus size={18} />
            </Button>
          )}
        </div>
      )}
      <div className="flex items-center gap-3 p-4">
        {isRecording ? (
          <div className="flex-1 flex items-center justify-between px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-500/20 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-ping shrink-0" />
              <span className="text-[10px] font-black text-emerald-800 tracking-wide select-none">
                Recording {Math.floor(recordingSeconds / 60)}:
                {(recordingSeconds % 60).toString().padStart(2, '0')}
                {isSimulatedRecording && ' (Simulated)'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleCancelRecording}
                className="w-7 h-7 hover:bg-emerald-100 rounded-lg text-red-500 cursor-pointer shadow-none"
                title="Cancel Recording"
              >
                <X size={14} strokeWidth={2.5} />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleStopAndSendRecording}
                className="w-7 h-7 hover:bg-emerald-100 rounded-lg text-emerald-600 cursor-pointer shadow-none"
                title="Send Voice Message"
              >
                <Send size={14} strokeWidth={2.5} />
              </Button>
            </div>
          </div>
        ) : isBlockedByMe ? (
          <div
            onClick={async () => {
              try {
                if (activeConversation) {
                  await unblockConversation(activeConversation.id)
                  toast.success(
                    `Unblocked ${activeConversation.otherParticipant.name}`,
                  )
                }
              } catch {
                toast.error('Failed to unblock contact')
              }
            }}
            className="flex-1 flex items-center justify-center h-11 bg-red-50 hover:bg-red-100/70 border border-red-200 rounded-2xl cursor-pointer text-red-600 font-extrabold text-[12px] select-none transition-colors px-4 text-center"
          >
            You blocked this contact. Tap to unblock.
          </div>
        ) : isBlockedByOther ? (
          <div className="flex-1 flex items-center justify-center h-11 bg-slate-100 border border-slate-200 rounded-2xl text-slate-500 font-extrabold text-[12px] select-none px-4 text-center">
            You cannot send messages to this contact.
          </div>
        ) : (
          <>
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*,audio/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,application/zip,application/x-zip-compressed"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />

            {/* Text Input Container */}
            <div className="flex-1 relative flex items-center bg-white border border-[#e2e8f0] rounded-full px-4 h-11 gap-1.5 shadow-sm">
              {/* Emoji trigger inside left */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer shrink-0 border-none outline-none p-0"
                title="Emoji Picker"
              >
                <Smile size={18} />
              </Button>

              <input
                ref={inputRef}
                placeholder={
                  isConnected
                    ? replyTarget
                      ? `Reply to ${replyTarget.senderName}...`
                      : 'Type a message...'
                    : 'Connecting...'
                }
                value={inputText}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={!isConnected}
                className="w-full bg-transparent border-none outline-none text-[13px] placeholder:text-slate-400 h-full flex-1 text-slate-800"
              />

              {/* Attachment trigger inside right */}
              <Button
                variant="ghost"
                size="icon"
                disabled={!isConnected || pendingFiles.length >= 5}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer shrink-0 border-none outline-none p-0',
                  pendingFiles.length > 0 && 'text-emerald-600 bg-emerald-50',
                )}
                title={`Attach files (${pendingFiles.length}/5)`}
              >
                <Paperclip size={18} className="rotate-45" />
              </Button>

              {showEmojiPicker && (
                <div className="absolute bottom-14 left-0 z-50 shadow-2xl rounded-2xl overflow-hidden bg-card animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <EmojiPicker
                    onEmojiClick={(emojiData) => {
                      setInputText(inputText + emojiData.emoji)
                    }}
                    width={280}
                    height={320}
                    previewConfig={{ showPreview: false }}
                    searchDisabled={false}
                    skinTonesDisabled={true}
                    emojiStyle={EmojiStyle.APPLE}
                  />
                </div>
              )}
            </div>

            {/* Action Button: Dynamic Mic/Send outside the text field */}
            {inputText.trim().length > 0 || pendingFiles.length > 0 ? (
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!isConnected || isUploading}
                className={cn(
                  'w-11 h-11 rounded-full flex items-center justify-center text-white cursor-pointer transition-all shadow-sm active:scale-95 shrink-0 bg-[#0d4d38] hover:bg-[#093a2a] border-none outline-none',
                  (!isConnected || isUploading) &&
                    'bg-muted text-muted-dark cursor-not-allowed shadow-none',
                )}
                title="Send Message"
              >
                {isUploading ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Send size={15} className="ml-0.5" />
                )}
              </Button>
            ) : (
              <Button
                size="icon"
                onClick={handleStartRecording}
                disabled={!isConnected || isUploading}
                className={cn(
                  'w-11 h-11 rounded-full flex items-center justify-center text-white cursor-pointer transition-all shadow-sm active:scale-95 shrink-0 bg-[#0d4d38] hover:bg-[#093a2a] border-none outline-none',
                  (!isConnected || isUploading) &&
                    'bg-muted text-muted-dark cursor-not-allowed shadow-none',
                )}
                title="Record Voice Message"
              >
                <Mic size={18} />
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
