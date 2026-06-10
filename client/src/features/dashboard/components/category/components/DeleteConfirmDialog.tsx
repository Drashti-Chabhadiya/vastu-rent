import React from 'react'
import { ReusableAlertDialog } from '#/components/common/ReusableAlertDialog'

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
  title = 'Delete Category?',
  description,
  isPending = false,
  itemName,
}: DeleteConfirmDialogProps) => {
  const defaultDescription = (
    <div className="text-center w-full">
      <span className="inline-block">
        Are you sure you want to delete{' '}
        <span className="text-foreground/90 font-black">
          "{itemName || 'this item'}"
        </span>
        ?
      </span>
      <span className="text-muted-dark text-xs font-bold mt-4 block bg-muted-light py-2.5 px-4 rounded-xl border border-border/30">
        This action is permanent and cannot be reversed.
      </span>
    </div>
  )

  return (
    <ReusableAlertDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      title={title}
      description={description || defaultDescription}
      isPending={isPending}
      confirmText="Yes, Delete"
      pendingText="Deleting..."
      variant="danger"
    />
  )
}
