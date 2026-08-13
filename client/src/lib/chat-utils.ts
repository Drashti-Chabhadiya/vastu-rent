import { format, isToday, isYesterday } from 'date-fns'
import React from 'react'

export const REPLY_SEP = '\u200B\u{1F4AC}\u200B' // zero-width + speech bubble + zero-width (invisible separator)

// ──────────────────────────────────────────────────────────────────────────────
// URL helpers (defined first so buildReplyContent can reference them)
// ──────────────────────────────────────────────────────────────────────────────

export const isImageUrl = (url: string): boolean => {
  const cleanUrl = url.split('?')[0].toLowerCase()
  return (
    cleanUrl.endsWith('.jpg') ||
    cleanUrl.endsWith('.jpeg') ||
    cleanUrl.endsWith('.png') ||
    cleanUrl.endsWith('.gif') ||
    cleanUrl.endsWith('.webp')
  )
}

export const isAudioUrl = (url: string): boolean => {
  const cleanUrl = url.split('?')[0].toLowerCase()
  return (
    cleanUrl.endsWith('.mp3') ||
    cleanUrl.endsWith('.wav') ||
    cleanUrl.endsWith('.ogg') ||
    cleanUrl.endsWith('.m4a') ||
    cleanUrl.endsWith('.aac') ||
    cleanUrl.endsWith('.webm')
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// Reply encoding / decoding
// Format: >>REPLY_TO::<originalMsgId>::<quotedText><REPLY_SEP><mainText>
// ──────────────────────────────────────────────────────────────────────────────

const REPLY_PREFIX = '>>REPLY_TO::'
const ID_SEP = '::'

export function buildReplyContent(
  replyText: string,
  mainText: string,
  attachments?: string[],
  replyToId?: string,
) {
  const imageAttachments = (attachments ?? []).filter(isImageUrl)
  const audioAttachments = (attachments ?? []).filter(isAudioUrl)

  let label = replyText
  if (!label && imageAttachments.length > 0) {
    label = `📷 Photo${imageAttachments.length > 1 ? ` (${imageAttachments.length})` : ''}`
  } else if (!label && audioAttachments.length > 0) {
    label = '🎤 Voice message'
  } else if (!label && (attachments ?? []).length > 0) {
    label = '📎 File'
  }

  const truncated = label.length > 120 ? label.slice(0, 120) + '…' : label
  const idPart = replyToId ? `${replyToId}${ID_SEP}` : ''
  return `${REPLY_PREFIX}${idPart}${truncated}${REPLY_SEP}${mainText}`
}

export function parseMessage(content: string): {
  replyQuote: string | null
  replyToId: string | null
  text: string
} {
  if (content.startsWith(REPLY_PREFIX)) {
    const withoutPrefix = content.slice(REPLY_PREFIX.length)
    const sepIdx = withoutPrefix.indexOf(REPLY_SEP)
    if (sepIdx !== -1) {
      const quotePart = withoutPrefix.slice(0, sepIdx)
      const mainText = withoutPrefix.slice(sepIdx + REPLY_SEP.length)

      // Try to extract optional leading <id>:: prefix
      const idSepIdx = quotePart.indexOf(ID_SEP)
      // A valid ID looks like a cuid/uuid — no spaces, reasonable length
      const potentialId = idSepIdx !== -1 ? quotePart.slice(0, idSepIdx) : null
      const isValidId =
        potentialId !== null &&
        potentialId.length > 4 &&
        potentialId.length < 64 &&
        !/\s/.test(potentialId)

      return {
        replyToId: isValidId ? potentialId : null,
        replyQuote: isValidId
          ? quotePart.slice(idSepIdx + ID_SEP.length)
          : quotePart,
        text: mainText,
      }
    }
  }
  return { replyQuote: null, replyToId: null, text: content }
}

// ──────────────────────────────────────────────────────────────────────────────
// Time / date helpers
// ──────────────────────────────────────────────────────────────────────────────

export function formatMsgTime(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHrs = diffMs / (1000 * 60 * 60)
  if (diffHrs < 24) return format(date, 'h:mm a')
  if (diffHrs < 48) return 'Yesterday'
  return format(date, 'dd MMM')
}

export function formatLastActive(
  lastActiveStr: string | null | undefined,
): string {
  if (!lastActiveStr) return 'Offline'
  try {
    const date = new Date(lastActiveStr)
    const timeStr = format(date, 'h:mm a')
    if (isToday(date)) return `today at ${timeStr}`
    if (isYesterday(date)) return `yesterday at ${timeStr}`
    return `${format(date, 'dd MMM yyyy')} at ${timeStr}`
  } catch {
    return 'Offline'
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Misc helpers
// ──────────────────────────────────────────────────────────────────────────────

export const getEmojiUnified = (emojiStr: string): string => {
  return Array.from(emojiStr)
    .map((char) => char.codePointAt(0)!.toString(16))
    .join('-')
}

export const getDisappearingDurationText = (value: number) => {
  if (value === 0) return 'Off'
  if (value <= 720) {
    if (value === 24) return '24 hours'
    if (value === 168) return '7 days'
    if (value === 720) return '30 days'
    return `${value} hours`
  }
  if (value === 86400) return '24 hours'
  if (value === 604800) return '7 days'
  if (value === 7776000) return '90 days'
  if (value % 86400 === 0) return `${value / 86400} days`
  return `${Math.round((value / 86400) * 100) / 100} days`
}

export const highlightText = (
  text: string,
  search: string,
): React.ReactNode => {
  if (!search || !search.trim()) return text
  const parts = text.split(
    new RegExp(`(${search.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'),
  )
  return React.createElement(
    React.Fragment,
    null,
    parts.map((part, i) =>
      part.toLowerCase() === search.toLowerCase()
        ? React.createElement(
            'mark',
            {
              key: i,
              className:
                'bg-yellow-200 text-foreground font-black px-0.5 rounded-sm',
            },
            part,
          )
        : part,
    ),
  )
}
