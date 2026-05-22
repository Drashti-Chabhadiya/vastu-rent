import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import type { SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PackagePlus, Plus, Pencil, Save } from 'lucide-react'
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

interface ListingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: ListingSchema) => void
  isLoading: boolean
  categories: Category[]
  users: User[]
  currentUser?: any
  product?: any
}

export const ListingDialog = ({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  categories,
  users,
  currentUser,
  product,
}: ListingDialogProps) => {
  const isEditMode = !!product

  const form = useForm<ListingSchema>({
    resolver: zodResolver(listingSchema) as any,
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      city: '',
      location: '',
      categoryId: '',
      ownerId: '',
      images: [],
      securityDeposit: 0,
    },
  })

  // Reset form when dialog opens or product/currentUser changes
  useEffect(() => {
    if (open) {
      if (product) {
        form.reset({
          title: product.title || '',
          description: product.description || '',
          price: product.price || 0,
          securityDeposit: product.securityDeposit || 0,
          city: product.city || '',
          location: product.location || '',
          categoryId: product.categoryId || '',
          ownerId: product.ownerId || '',
          images: product.images || [],
          condition: product.condition || 'Good',
          features: product.features || [],
          deliveryOptions: product.deliveryOptions || ['Pickup'],
          pickupReturnDetails: product.pickupReturnDetails || '',
          tags: product.tags || [],
          minDuration: product.minDuration || 1,
          maxDuration: product.maxDuration || undefined,
        })
      } else {
        form.reset({
          title: '',
          description: '',
          price: 0,
          securityDeposit: 0,
          city: '',
          location: '',
          categoryId: '',
          ownerId: currentUser?.role === 'owner' ? currentUser.id : '',
          images: [],
          condition: 'Good',
          features: [],
          deliveryOptions: ['Pickup'],
          pickupReturnDetails: '',
          tags: [],
          minDuration: 1,
          maxDuration: undefined,
        })
      }
    }
  }, [open, product, currentUser, form])

  const handleFormSubmit: SubmitHandler<ListingSchema> = (values) => {
    onSubmit(values)
  }

  const HeaderIcon = isEditMode ? Pencil : PackagePlus
  const SubmitIcon = isEditMode ? Save : Plus

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border-none shadow-2xl bg-white p-0 custom-scrollbar text-dash-text">
        <div className="bg-gradient-to-br from-[#166534] to-[#2f6a4a] p-8 text-white">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                <HeaderIcon className="text-white" size={isEditMode ? 20 : 24} />
              </div>
              <Badge className="bg-white/20 text-white border-none font-bold text-[10px] uppercase tracking-widest">
                {isEditMode ? 'Marketplace Management' : 'Marketplace Admin'}
              </Badge>
            </div>
            <DialogTitle className="text-2xl font-extrabold tracking-tight text-white">
              {isEditMode ? 'Edit Listing Details' : 'Create New Listing'}
            </DialogTitle>
          </DialogHeader>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => handleFormSubmit(values))}
            className="p-8 space-y-8"
          >
            <ProductForm
              form={form}
              categories={categories}
              users={users}
              currentUser={currentUser}
            />

            <DialogFooter className="gap-3 sm:gap-3 pt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="rounded-xl font-bold h-12 flex-1 bg-gray-200 text-gray-600 hover:bg-gray-300 transition-all border-none"
              >
                {isEditMode ? 'Cancel' : 'Discard'}
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-dash-brand hover:bg-dash-brand/90 text-white rounded-xl h-12 font-extrabold px-8 shadow-lg shadow-dash-brand/20 flex-1 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <SubmitIcon size={18} strokeWidth={isEditMode ? 2 : 3} />
                {isEditMode
                  ? isLoading
                    ? 'Saving...'
                    : 'Save Changes'
                  : isLoading
                    ? 'Publishing...'
                    : 'Publish to Marketplace'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
