import React from 'react'
import { AlertTriangle, CheckCircle2, AlertCircle, Info } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '#/components/ui/alert-dialog'
import { cn } from '#/lib/utils'

export type AlertDialogVariant = 'danger' | 'success' | 'warning' | 'info'

interface ReusableAlertDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  onCancel?: () => void
  title: string
  description?: React.ReactNode
  confirmText?: string
  cancelText?: string
  isPending?: boolean
  pendingText?: string
  variant?: AlertDialogVariant
  icon?: LucideIcon
  className?: string
}

const variantConfig = {
  danger: {
    defaultIcon: AlertTriangle,
    iconBg: 'bg-danger',
    iconPing: 'bg-destructive/10',
    iconColor: 'text-destructive',
    confirmBtn:
      'bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-lg shadow-destructive/20 border-none',
  },
  success: {
    defaultIcon: CheckCircle2,
    iconBg: 'bg-primary-soft',
    iconPing: 'bg-primary/10',
    iconColor: 'text-primary',
    confirmBtn:
      'bg-primary hover:bg-primary-hover text-primary-foreground shadow-lg shadow-primary/20 border-none',
  },
  warning: {
    defaultIcon: AlertCircle,
    iconBg: 'bg-warning',
    iconPing: 'bg-warning-foreground/10',
    iconColor: 'text-warning-foreground',
    confirmBtn:
      'bg-warning-foreground hover:bg-warning-foreground/90 text-primary-foreground shadow-lg shadow-warning-foreground/20 border-none',
  },
  info: {
    defaultIcon: Info,
    iconBg: 'bg-info',
    iconPing: 'bg-info-foreground/10',
    iconColor: 'text-info-foreground',
    confirmBtn:
      'bg-info-foreground hover:bg-info-foreground/90 text-primary-foreground shadow-lg shadow-info-foreground/20 border-none',
  },
}

export const ReusableAlertDialog = ({
  isOpen,
  onOpenChange,
  onConfirm,
  onCancel,
  title,
  description,
  confirmText,
  cancelText = 'Cancel',
  isPending = false,
  pendingText,
  variant = 'info',
  icon: CustomIcon,
  className,
}: ReusableAlertDialogProps) => {
  const config = variantConfig[variant]
  const IconToRender = CustomIcon || config.defaultIcon

  // Default confirm text if not provided
  const getConfirmText = () => {
    if (confirmText) return confirmText
    switch (variant) {
      case 'danger':
        return 'Delete'
      case 'success':
        return 'Confirm'
      case 'warning':
        return 'Proceed'
      case 'info':
      default:
        return 'OK'
    }
  }

  // Default pending text if not provided
  const getPendingText = () => {
    if (pendingText) return pendingText
    switch (variant) {
      case 'danger':
        return 'Deleting...'
      case 'success':
        return 'Confirming...'
      default:
        return 'Processing...'
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent
        className={cn(
          'rounded-[2.5rem] border-none shadow-2xl bg-card max-w-[400px] p-0 overflow-hidden animate-in fade-in zoom-in-95 duration-300 font-sans',
          className,
        )}
      >
        <div className="p-8 pb-10">
          <AlertDialogHeader>
            {/* Pulsating Icon container */}
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto relative group">
              <div
                className={cn(
                  'absolute inset-0 rounded-full animate-ping group-hover:animate-none',
                  config.iconPing,
                )}
              />
              <div
                className={cn(
                  'relative w-11 h-11 rounded-full bg-card shadow-sm border border-border/30 flex items-center justify-center',
                  config.iconBg,
                )}
              >
                <IconToRender
                  className={config.iconColor}
                  size={22}
                  strokeWidth={2.5}
                />
              </div>
            </div>

            <AlertDialogTitle className="text-xl font-black text-foreground/90 text-center tracking-tight leading-tight">
              {title}
            </AlertDialogTitle>

            {description && (
              <AlertDialogDescription className="text-muted-foreground/85 font-semibold text-center text-[13px] leading-relaxed mt-4 px-2">
                {description}
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>

          {/* Dialog Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mt-8">
            <AlertDialogCancel
              onClick={onCancel}
              disabled={isPending}
              className="rounded-xl font-bold h-12 border-none bg-muted/50 text-muted-foreground/85 hover:bg-muted hover:text-foreground/90 transition-all active:scale-[0.98] text-[12px] uppercase tracking-wider cursor-pointer"
            >
              {cancelText}
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                onConfirm()
              }}
              disabled={isPending}
              className={cn(
                'rounded-xl font-bold h-12 transition-all active:scale-[0.98] text-[12px] uppercase tracking-wider cursor-pointer',
                config.confirmBtn,
              )}
            >
              {isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-card/30 border-t-white rounded-full animate-spin" />
                  <span>{getPendingText()}</span>
                </div>
              ) : (
                getConfirmText()
              )}
            </AlertDialogAction>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
