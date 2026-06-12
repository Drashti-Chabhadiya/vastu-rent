import React from 'react'
import EmojiPicker, { EmojiStyle } from 'emoji-picker-react'
import { CornerUpLeft, X, ImagePlus, Smile, Paperclip, Mic, Send, Loader2 } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import { useChatStore } from '../../../../../store/useChatStore'

interface ChatInputDockProps {
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  handleSend: () => void
  fileInputRef: React.RefObject<HTMLInputElement | null>
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  isRecording: boolean
  recordingSeconds: number
  isSimulatedRecording: boolean
  handleStartRecording: () => void
  handleCancelRecording: () => void
  handleStopAndSendRecording: () => void
  inputRef: React.RefObject<HTMLInputElement | null>
}

export function ChatInputDock({
  handleInputChange,
  handleKeyDown,
  handleSend,
  fileInputRef,
  handleFileSelect,
  isRecording,
  recordingSeconds,
  isSimulatedRecording,
  handleStartRecording,
  handleCancelRecording,
  handleStopAndSendRecording,
  inputRef,
}: ChatInputDockProps) {
  const {
    isConnected,
    isUploading,
    inputText,
    setInputText,
    showEmojiPicker,
    setShowEmojiPicker,
    pendingFiles,
    pendingPreviews,
    removeFile,
    replyTarget,
    setReplyTarget,
  } = useChatStore()

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
          {pendingPreviews.map((src, i) => (
            <div
              key={i}
              className="relative w-14 h-14 rounded-xl overflow-hidden border border-border/40 shadow-sm group"
            >
              <img
                src={src}
                alt={`preview-${i}`}
                className="w-full h-full object-cover"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFile(i)}
                className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-0 rounded-none hover:bg-black/50 w-full h-full"
              >
                <X size={14} className="text-white" strokeWidth={2.5} />
              </Button>
            </div>
          ))}
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
                Recording {Math.floor(recordingSeconds / 60)}:{(recordingSeconds % 60).toString().padStart(2, '0')}
                {isSimulatedRecording && " (Simulated)"}
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
        ) : (
          <>
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />

            {/* Text Input Container */}
            <div className="flex-1 relative flex items-center bg-white border border-[#e2e8f0] rounded-2xl px-3 h-11 gap-1.5 shadow-sm">
              {/* Emoji trigger inside left */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer shrink-0 border-none outline-none"
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
                  'w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer shrink-0 border-none outline-none',
                  pendingFiles.length > 0 && 'text-emerald-600 bg-emerald-50',
                )}
                title={`Attach images (${pendingFiles.length}/5)`}
              >
                <Paperclip size={18} className="rotate-45" />
              </Button>

              {/* Voice Record trigger inside far right */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleStartRecording}
                disabled={!isConnected || isUploading}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer shrink-0 border-none outline-none"
                title="Record Voice Message"
              >
                <Mic size={18} />
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

            {/* Action Button: Always Send outside the text field */}
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!isConnected || isUploading}
              className={cn(
                'w-11 h-11 rounded-2xl flex items-center justify-center text-white cursor-pointer transition-all shadow-sm active:scale-95 shrink-0 bg-[#0a6634] hover:bg-[#075028] border-none outline-none',
                (!isConnected || isUploading) && 'bg-muted text-muted-dark cursor-not-allowed shadow-none',
              )}
            >
              {isUploading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Send size={15} className="ml-0.5" />
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
