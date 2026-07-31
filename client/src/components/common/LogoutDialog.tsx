import { LogOut } from 'lucide-react'
import { ReusableAlertDialog } from './ReusableAlertDialog'
import { useTranslation } from '#/context/TranslationContext'

interface LogoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isPending?: boolean
}

/**
 * Reusable Logout confirmation dialog.
 *
 * Usage:
 * ```tsx
 * <LogoutDialog
 *   open={logoutOpen}
 *   onOpenChange={setLogoutOpen}
 *   onConfirm={handleLogout}
 *   isPending={logoutLoading}
 * />
 * ```
 */
export function LogoutDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending = false,
}: LogoutDialogProps) {
  const { t } = useTranslation()

  return (
    <ReusableAlertDialog
      isOpen={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      onCancel={() => onOpenChange(false)}
      title={t('Log out')}
      description={t('Are you sure you want to log out of your Vastu account?')}
      confirmText={t('Yes, log out')}
      cancelText={t('Cancel')}
      pendingText={t('Logging out...')}
      isPending={isPending}
      variant="warning"
      icon={LogOut}
    />
  )
}
