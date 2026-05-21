import React from 'react'
import { AlertTriangle } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '#/components/ui/alert-dialog'

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
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-3xl border-none shadow-2xl bg-white max-w-[400px] p-0 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="p-8 pb-10">
          <AlertDialogHeader>
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-6 mx-auto relative group">
              <div className="absolute inset-0 rounded-full bg-red-500/10 animate-ping group-hover:animate-none" />
              <div className="relative w-11 h-11 rounded-full bg-white shadow-sm flex items-center justify-center">
                <AlertTriangle
                  className="text-red-600"
                  size={24}
                  strokeWidth={2.5}
                />
              </div>
            </div>

            <AlertDialogTitle className="text-2xl font-black text-gray-900 text-center tracking-tight leading-tight">
              {title}
            </AlertDialogTitle>

            <AlertDialogDescription className="text-gray-500 font-semibold text-center text-sm leading-relaxed mt-4 px-2">
              {description || (
                <>
                  Are you sure you want to delete{' '}
                  <span className="text-gray-900 font-black">
                    "{itemName || 'this item'}"
                  </span>
                  ?
                  <br />
                  <p className="text-gray-400 text-xs font-bold mt-4 bg-gray-50 py-2.5 px-4 rounded-xl border border-gray-100">
                    This action is permanent and cannot be reversed.
                  </p>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="grid grid-cols-2 gap-3 mt-10">
            <AlertDialogCancel
              disabled={isPending}
              className="rounded-xl font-bold h-11 border-none bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-all active:scale-[0.98] text-sm"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                onConfirm()
              }}
              disabled={isPending}
              className="rounded-xl font-bold h-11 bg-red-600 hover:bg-red-700 text-white transition-all shadow-lg shadow-red-600/20 active:scale-[0.98] border-none text-sm"
            >
              {isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Deleting...</span>
                </div>
              ) : (
                'Yes, Delete'
              )}
            </AlertDialogAction>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
