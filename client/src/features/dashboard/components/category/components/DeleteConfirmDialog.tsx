import React from 'react'
import { ReusableAlertDialog } from '#/components/common/ReusableAlertDialog'
import { useTranslation } from '#/context/TranslationContext'

interface DeleteConfirmDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  title?: string
  description?: React.ReactNode
  isPending?: boolean
  itemName?: string
}

export const DeleteConfirmDialog = ({
  isOpen,
  onOpenChange,
  onConfirm,
  title,
  description,
  isPending = false,
  itemName,
}: DeleteConfirmDialogProps) => {
  const { t } = useTranslation()
  const displayTitle = title || t('Delete Category?')
  const defaultDescription = (
    <div className="text-center w-full">
      <span className="inline-block">
        {t('Are you sure you want to delete "{item}"?').replace('{item}', itemName || t('this item'))}
      </span>
      <span className="text-muted-dark text-xs font-bold mt-4 block bg-muted-light py-2.5 px-4 rounded-xl border border-border/30">
        {t('This action is permanent and cannot be reversed.')}
      </span>
    </div>
  )

  return (
    <ReusableAlertDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      title={displayTitle}
      description={description || defaultDescription}
      isPending={isPending}
      confirmText={t('Yes, Delete')}
      pendingText={t('Deleting...')}
      variant="danger"
    />
  )
}
