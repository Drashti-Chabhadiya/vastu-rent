import { ShoppingCart, CreditCard, AlertCircle, Info, Bell } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/**
 * Returns the appropriate LucideIcon component for a given notification type.
 */
export function getNotificationIcon(type: string): LucideIcon {
  switch (type.toLowerCase()) {
    case 'booking':
      return ShoppingCart
    case 'payment':
      return CreditCard
    case 'alert':
      return AlertCircle
    case 'info':
      return Info
    default:
      return Bell
  }
}

/**
 * Returns Tailwind class names for notification badges on the main page.
 */
export function getNotificationColorClasses(type: string): string {
  switch (type.toLowerCase()) {
    case 'booking':
      return 'bg-primary-soft text-primary'
    case 'payment':
      return 'bg-warning text-warning-foreground'
    case 'alert':
      return 'bg-danger text-danger-foreground'
    case 'info':
      return 'bg-info text-info-foreground'
    default:
      return 'bg-muted-light text-muted-dark'
  }
}

/**
 * Returns Tailwind class names for notification badges in the header popover.
 */
export function getHeaderNotificationColorClasses(type: string): string {
  switch (type.toLowerCase()) {
    case 'booking':
      return 'bg-emerald-50 text-emerald-600'
    case 'payment':
      return 'bg-warning text-warning-foreground'
    case 'alert':
      return 'bg-danger text-danger-foreground'
    default:
      return 'bg-muted-light text-muted-foreground/85'
  }
}
