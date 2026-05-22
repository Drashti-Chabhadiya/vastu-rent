import { useState, useEffect } from 'react'
import { Search, Plus, PackagePlus } from 'lucide-react'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '#/components/ui/alert-dialog'

// Sub-components
import { ListingsTable } from './ListingsTable'
import { AddListingDialog } from './AddListingDialog'
import { EditListingDialog } from './EditListingDialog'
import {
  useAdminCategories,
  useAdminUsers,
  useAdminProducts,
  useCreateProduct,
  useUpdateProduct,
  useToggleProductStatus,
  useDeleteProduct,
  useCreateDeleteRequest,
  useMyListings,
} from '#/hook'
import { authClient } from '#/lib/auth/auth-client'
import { toast } from 'sonner'

interface ListingsManagementProps {
  initialCategoryFilter?: string | null
}

export const ListingsManagement = ({
  initialCategoryFilter,
}: ListingsManagementProps) => {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState(
    initialCategoryFilter || 'all',
  )
  const [statusFilter, setStatusFilter] = useState('all')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [productToEdit, setProductToEdit] = useState<any>(null)
  const [productToDelete, setProductToDelete] = useState<any>(null)

  // Sync initial filter if it changes
  useEffect(() => {
    if (initialCategoryFilter) {
      setCategoryFilter(initialCategoryFilter)
    }
  }, [initialCategoryFilter])

  // Auth
  const { data: session } = authClient.useSession()
  const currentUser = session?.user
  const isOwner = currentUser?.role === 'owner'

  // Fetch categories
  const { data: categories } = useAdminCategories()

  // Fetch users (providers) - using same params as before if needed, or just all users
  const { data: users } = useAdminUsers(undefined, { enabled: !isOwner })

  // Fetch products based on role
  const { data: adminProducts, isLoading: isAdminLoading } = useAdminProducts(
    !isOwner
      ? {
          search,
          categoryId: categoryFilter === 'all' ? undefined : categoryFilter,
          status: statusFilter === 'all' ? undefined : statusFilter,
        }
      : undefined,
  )

  const { data: myProducts, isLoading: isMyLoading } = useMyListings()

  const isLoading = isOwner ? isMyLoading : isAdminLoading

  // Filter listings locally if owner
  const products = isOwner
    ? myProducts?.filter((p: any) => {
        const matchesSearch =
          !search.trim() ||
          p.title?.toLowerCase().includes(search.toLowerCase()) ||
          p.description?.toLowerCase().includes(search.toLowerCase())
        const matchesCategory =
          categoryFilter === 'all' || p.categoryId === categoryFilter
        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'available'
            ? p.isAvailable === true
            : p.isAvailable === false)
        return matchesSearch && matchesCategory && matchesStatus
      })
    : adminProducts

  // Mutations
  const createMutation = useCreateProduct()
  const updateMutation = useUpdateProduct()
  const toggleStatusMutation = useToggleProductStatus()
  const deleteMutation = useDeleteProduct()
  const createDeleteRequestMutation = useCreateDeleteRequest()

  const handleDelete = (product: any) => {
    if (!currentUser) return
    setProductToDelete(product)
  }

  const handleConfirmDelete = () => {
    if (!currentUser || !productToDelete) return

    const isProductOwner = productToDelete.ownerId === currentUser.id
    const isSuperAdmin = currentUser.role === 'superAdmin'
    const isAdmin = currentUser.role === 'admin'

    if (isSuperAdmin || isProductOwner) {
      deleteMutation.mutate(productToDelete.id, {
        onSuccess: () => {
          toast.success('Listing deleted successfully')
          setProductToDelete(null)
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || 'Failed to delete listing')
        },
      })
    } else if (isAdmin) {
      createDeleteRequestMutation.mutate(
        {
          productId: productToDelete.id,
          reason: `Admin ${currentUser.name} requested deletion`,
        },
        {
          onSuccess: () => {
            toast.success('Deletion request sent to SuperAdmin')
            setProductToDelete(null)
          },
          onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to send request')
          },
        },
      )
    } else {
      toast.error("You don't have permission to delete this listing")
      setProductToDelete(null)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-dash-text flex items-center gap-3">
            <PackagePlus className="text-dash-brand" size={32} />
            Marketplace Management
          </h1>
          <p className="text-dash-text-soft font-medium text-sm ml-1">
            Manage your rental inventory, pricing, and provider assignments.
          </p>
        </div>
        <Button
          onClick={() => setIsAddOpen(true)}
          className="bg-dash-brand hover:bg-dash-brand/90 text-white rounded-2xl px-6 h-14 font-extrabold shadow-lg shadow-dash-brand/20 transition-all active:scale-95 flex items-center gap-2"
        >
          <Plus size={20} strokeWidth={3} />
          Create Listing
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-2 bg-white rounded-[2rem] shadow-sm border border-gray-100">
        <div className="md:col-span-2 relative">
          <Search
            className="absolute left-5 top-1/2 -translate-y-1/2 text-dash-text-soft opacity-40"
            size={18}
          />
          <Input
            placeholder="Search by title or description..."
            className="h-14 pl-12 bg-transparent border-none focus-visible:ring-0 text-dash-text font-bold placeholder:text-dash-text-soft/40"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="h-14 border-none bg-gray-50/50 rounded-2xl font-extrabold text-dash-text hover:bg-gray-100 transition-all focus:ring-0 px-6">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="bg-white rounded-2xl shadow-2xl border-none p-2 animate-in fade-in zoom-in-95 duration-200">
            <SelectItem
              value="all"
              className="rounded-xl font-bold py-3 px-4 focus:bg-dash-brand/10 focus:text-dash-brand cursor-pointer text-dash-text-soft"
            >
              All Categories
            </SelectItem>
            {categories?.map((cat: any) => (
              <SelectItem
                key={cat.id}
                value={cat.id}
                className="rounded-xl font-bold py-3 px-4 focus:bg-dash-brand/10 focus:text-dash-brand cursor-pointer text-dash-text-soft"
              >
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-14 border-none bg-gray-50/50 rounded-2xl font-extrabold text-dash-text hover:bg-gray-100 transition-all focus:ring-0 px-6">
            <SelectValue placeholder="Availability" />
          </SelectTrigger>
          <SelectContent className="bg-white rounded-2xl shadow-2xl border-none p-2 animate-in fade-in zoom-in-95 duration-200">
            <SelectItem
              value="all"
              className="rounded-xl font-bold py-3 px-4 focus:bg-dash-brand/10 focus:text-dash-brand cursor-pointer text-dash-text-soft"
            >
              Any Status
            </SelectItem>
            <SelectItem
              value="available"
              className="rounded-xl font-bold py-3 px-4 focus:bg-dash-brand/10 focus:text-dash-brand cursor-pointer text-dash-text-soft"
            >
              Public
            </SelectItem>
            <SelectItem
              value="unavailable"
              className="rounded-xl font-bold py-3 px-4 focus:bg-dash-brand/10 focus:text-dash-brand cursor-pointer text-dash-text-soft"
            >
              Hidden
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Listings Table Component */}
      <ListingsTable
        products={products}
        isLoading={isLoading}
        onToggleStatus={(id, isAvailable) => {
          toggleStatusMutation.mutate(
            { id, isAvailable },
            {
              onSuccess: () => {
                toast.success(
                  `Listing is now ${isAvailable ? 'public' : 'hidden'}`,
                )
              },
              onError: (err: any) => {
                toast.error(
                  err.response?.data?.message || 'Failed to update visibility',
                )
              },
            },
          )
        }}
        onDelete={handleDelete}
        onEdit={(item) => {
          setProductToEdit(item)
          setIsEditOpen(true)
        }}
        currentUser={currentUser}
      />

      {/* Add Listing Dialog Component */}
      <AddListingDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onSubmit={(data) => {
          createMutation.mutate(data, {
            onSuccess: () => {
              setIsAddOpen(false)
              toast.success('Listing created successfully')
            },
            onError: (err: any) => {
              toast.error(err.response?.data?.message || 'Failed to create listing')
            },
          })
        }}
        isLoading={createMutation.isPending}
        categories={categories || []}
        users={users || []}
        currentUser={currentUser}
      />

      {/* Edit Listing Dialog Component */}
      <EditListingDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        product={productToEdit}
        onSubmit={(data) => {
          if (!productToEdit) return
          updateMutation.mutate(
            { id: productToEdit.id, data },
            {
              onSuccess: () => {
                setIsEditOpen(false)
                setProductToEdit(null)
                toast.success('Listing updated successfully')
              },
              onError: (err: any) => {
                toast.error(
                  err.response?.data?.message || 'Failed to update listing',
                )
              },
            },
          )
        }}
        isLoading={updateMutation.isPending}
        categories={categories || []}
        users={users || []}
        currentUser={currentUser}
      />

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={!!productToDelete}
        onOpenChange={(open) => !open && setProductToDelete(null)}
      >
        <AlertDialogContent className="bg-white rounded-[2rem] border border-gray-100 shadow-2xl p-8 max-w-md animate-in fade-in zoom-in-95 duration-200">
          <AlertDialogHeader className="space-y-3 text-left">
            <AlertDialogTitle className="text-xl font-black text-dash-text flex items-center gap-2.5">
              {productToDelete &&
                (currentUser?.role === 'superAdmin' ||
                productToDelete.ownerId === currentUser?.id
                  ? 'Delete Listing permanently?'
                  : 'Request Deletion?')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-dash-text-soft font-medium leading-relaxed">
              {productToDelete &&
                (currentUser?.role === 'superAdmin' ||
                productToDelete.ownerId === currentUser?.id
                  ? `Are you sure you want to permanently delete "${productToDelete.title}"? This listing will be removed from the marketplace, and all associated rental history will be archived. This action cannot be undone.`
                  : `You don't own "${productToDelete.title}". Sending this request will notify the SuperAdmin to review and approve the deletion. Do you want to proceed?`)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex gap-3">
            <AlertDialogCancel className="h-12 rounded-xl font-black text-dash-text-soft hover:bg-gray-100 transition-all border-none bg-gray-50/50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleConfirmDelete()
              }}
              disabled={
                deleteMutation.isPending ||
                createDeleteRequestMutation.isPending
              }
              className="h-12 bg-red-500 hover:bg-red-600 text-white rounded-xl font-black transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
            >
              {deleteMutation.isPending ||
              createDeleteRequestMutation.isPending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Confirm</span>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
