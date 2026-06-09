import { format } from 'date-fns'

export const REPLY_SEP = '\u200B\u{1F4AC}\u200B' // zero-width + speech bubble + zero-width (invisible separator)

export function buildReplyContent(replyText: string, mainText: string) {
  const truncated =
    replyText.length > 120 ? replyText.slice(0, 120) + '…' : replyText
  return `>>REPLY_TO::${truncated}${REPLY_SEP}${mainText}`
}

export function parseMessage(content: string): {
  replyQuote: string | null
  text: string
} {
  if (content.startsWith('>>REPLY_TO::')) {
    const withoutPrefix = content.slice('>>REPLY_TO::'.length)
    const sepIdx = withoutPrefix.indexOf(REPLY_SEP)
    if (sepIdx !== -1) {
      return {
        replyQuote: withoutPrefix.slice(0, sepIdx),
        text: withoutPrefix.slice(sepIdx + REPLY_SEP.length),
      }
    }
  }
  return { replyQuote: null, text: content }
}

export function formatMsgTime(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHrs = diffMs / (1000 * 60 * 60)
  if (diffHrs < 24) return format(date, 'h:mm a')
  if (diffHrs < 48) return 'Yesterday'
  return format(date, 'dd MMM')
}
