import { format } from 'date-fns'

/**
 * Formats a date string, Date, or number into a long representation (e.g. "May 12, 2024")
 */
export function formatLongDate(dateStr: string | Date | number): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Formats a date string, Date, or number into a 2-digit numeric representation (e.g. "12/05/2024")
 */
export function formatNumericDate(dateStr: string | Date | number): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/**
 * Formats a date string into a full detailed representation (e.g. "dd MMM yyyy, h:mm a")
 */
export function formatFullDate(
  dateStr: string | null | undefined,
): string | null {
  if (!dateStr) return null
  try {
    return format(new Date(dateStr), 'dd MMM yyyy, h:mm a')
  } catch {
    return null
  }
}

/**
 * Computes a relative relative time string (e.g. "Just now", "2 hours ago")
 */
export function getLastActive(dateStr: string | Date | number): string {
  const d = new Date(dateStr)
  const diffMs = Date.now() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minutes ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} hours ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} days ago`
}

/**
 * Formats an audio or video time in seconds to "m:ss" (e.g., "3:04")
 */
export function formatMediaTime(time: number): string {
  if (isNaN(time)) return '0:00'
  const mins = Math.floor(time / 60)
  const secs = Math.floor(time % 60)
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`
}

/**
 * Formats a date into "Month Day" short representation (e.g. "Jun 15")
 */
export function formatMonthDay(date: Date | string | number): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Returns human-readable label for a date range type
 */
export function getRangeLabel(rangeType: string): string {
  switch (rangeType) {
    case '7days':
      return 'Last 7 Days'
    case '30days':
      return 'Last 30 Days'
    case 'thisMonth':
      return 'This Month'
    default:
      return rangeType
  }
}
