import React from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Info,
} from 'lucide-react'
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
    iconBg: 'bg-red-50',
    iconPing: 'bg-red-500/10',
    iconColor: 'text-red-600',
    confirmBtn: 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 border-none',
  },
  success: {
    defaultIcon: CheckCircle2,
    iconBg: 'bg-emerald-50',
    iconPing: 'bg-emerald-500/10',
    iconColor: 'text-emerald-600',
    confirmBtn: 'bg-[#059669] hover:bg-[#059669]/90 text-white shadow-lg shadow-emerald-600/20 border-none',
  },
  warning: {
    defaultIcon: AlertCircle,
    iconBg: 'bg-amber-50',
    iconPing: 'bg-amber-500/10',
    iconColor: 'text-amber-600',
    confirmBtn: 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 border-none',
  },
  info: {
    defaultIcon: Info,
    iconBg: 'bg-blue-50',
    iconPing: 'bg-blue-500/10',
    iconColor: 'text-blue-600',
    confirmBtn: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 border-none',
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
          'rounded-[2.5rem] border-none shadow-2xl bg-white max-w-[400px] p-0 overflow-hidden animate-in fade-in zoom-in-95 duration-300 font-sans',
          className
        )}
      >
        <div className="p-8 pb-10">
          <AlertDialogHeader>
            {/* Pulsating Icon container */}
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto relative group">
              <div
                className={cn(
                  'absolute inset-0 rounded-full animate-ping group-hover:animate-none',
                  config.iconPing
                )}
              />
              <div
                className={cn(
                  'relative w-11 h-11 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center',
                  config.iconBg
                )}
              >
                <IconToRender
                  className={config.iconColor}
                  size={22}
                  strokeWidth={2.5}
                />
              </div>
            </div>

            <AlertDialogTitle className="text-xl font-black text-slate-800 text-center tracking-tight leading-tight">
              {title}
            </AlertDialogTitle>

            {description && (
              <AlertDialogDescription className="text-slate-500 font-semibold text-center text-[13px] leading-relaxed mt-4 px-2">
                {description}
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>

          {/* Dialog Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mt-8">
            <AlertDialogCancel
              onClick={onCancel}
              disabled={isPending}
              className="rounded-xl font-bold h-12 border-none bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-all active:scale-[0.98] text-[12px] uppercase tracking-wider cursor-pointer"
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
                config.confirmBtn
              )}
            >
              {isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
