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
    <>
      Are you sure you want to delete{' '}
      <span className="text-slate-800 font-black">
        "{itemName || 'this item'}"
      </span>
      ?
      <br />
      <span className="text-slate-400 text-xs font-bold mt-4 block bg-slate-50 py-2.5 px-4 rounded-xl border border-slate-100">
        This action is permanent and cannot be reversed.
      </span>
    </>
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
