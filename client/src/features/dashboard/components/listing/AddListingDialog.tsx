import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import type { SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PackagePlus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '#/components/ui/dialog'
import { Form } from '#/components/ui/form'
import { Button } from '#/components/ui/button'
import { Badge } from '#/components/ui/badge'
import { listingSchema } from '#/schema'
import type { ListingSchema } from '#/schema'
import { ProductForm } from './ProductForm'

interface Category {
  id: string
  name: string
}

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface AddListingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: ListingSchema) => void
  isLoading: boolean
  categories: Category[]
  users: User[]
  currentUser?: any
}

export const AddListingDialog = ({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  categories,
  users,
  currentUser,
}: AddListingDialogProps) => {
  const form = useForm<ListingSchema>({
    resolver: zodResolver(listingSchema) as any,
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      location: '',
      categoryId: '',
      ownerId: '',
      images: [],
      securityDeposit: 0,
    },
  })

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        title: '',
        description: '',
        price: 0,
        securityDeposit: 0,
        location: '',
        categoryId: '',
        ownerId: currentUser?.role === 'owner' ? currentUser.id : '',
        images: [],
      })
    }
  }, [open, currentUser, form])

  const handleFormSubmit: SubmitHandler<ListingSchema> = (values) => {
    onSubmit(values)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border-none shadow-2xl bg-white p-0 custom-scrollbar text-dash-text">
        <div className="bg-gradient-to-br from-[#166534] to-[#2f6a4a] p-8 text-white">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                <PackagePlus className="text-white" size={24} />
              </div>
              <Badge className="bg-white/20 text-white border-none font-bold text-[10px] uppercase tracking-widest">
                Marketplace Admin
              </Badge>
            </div>
            <DialogTitle className="text-2xl font-extrabold tracking-tight text-white">
              Create New Listing
            </DialogTitle>
          </DialogHeader>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => handleFormSubmit(values))}
            className="p-8 space-y-8"
          >
            {/* The actual form fields are abstracted here for reusability */}
            <ProductForm
              form={form}
              categories={categories}
              users={users}
              currentUser={currentUser}
            />

            <DialogFooter className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center gap-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto h-14 rounded-2xl font-bold"
              >
                Discard
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full sm:flex-1 h-14 bg-gradient-to-r from-[#166534] to-[#2f6a4a] text-white rounded-2xl font-extrabold text-base shadow-lg shadow-dash-brand/20 transition-all active:scale-[0.98]"
              >
                {isLoading ? 'Publishing...' : 'Publish to Marketplace'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
