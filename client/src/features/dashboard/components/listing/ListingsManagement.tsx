import { useState, useEffect } from 'react'
import { Plus, PackagePlus, Trash2 } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { isAdminRole } from '#/lib/auth/roles'

// Sub-components
import { ListingsTable } from './ListingsTable'
import { ListingDialog } from './ListingDialog'
import { ListingsFilters } from './ListingsFilters'
import { ReusableAlertDialog } from '#/components/common/ReusableAlertDialog'
import { Textarea } from '#/components/ui/textarea'
import {
  useAdminCategories,
  useAdminUsers,
  useAdminProducts,
  useCreateProduct,
  useUpdateProduct,
  useToggleProductStatus,
  useDeleteProduct,
  useMyListings,
  useCreateDeleteRequest,
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
  const [currentView, setCurrentView] = useState<'my' | 'all'>('my')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [productToEdit, setProductToEdit] = useState<any>(null)
  const [productToDelete, setProductToDelete] = useState<any>(null)
  const [isDeleteRequestOpen, setIsDeleteRequestOpen] = useState(false)
  const [deleteReason, setDeleteReason] = useState('')

  // Sync initial filter if it changes
  useEffect(() => {
    if (initialCategoryFilter) {
      setCategoryFilter(initialCategoryFilter)
    }
  }, [initialCategoryFilter])

  // Auth
  const { data: session } = authClient.useSession()
  const currentUser = session?.user
  const isAdmin = isAdminRole(currentUser?.role)

  // Fetch categories
  const { data: categories } = useAdminCategories()

  // Fetch users (providers) only for admin views
  const { data: users } = useAdminUsers(undefined, { enabled: isAdmin })

  // Fetch products based on role
  const { data: adminProducts, isLoading: isAdminLoading } = useAdminProducts(
    isAdmin
      ? {
          search,
          categoryId: categoryFilter === 'all' ? undefined : categoryFilter,
          status: statusFilter === 'all' ? undefined : statusFilter,
        }
      : undefined,
  )

  const { data: myProducts, isLoading: isMyLoading } = useMyListings()

  const filteredMyProducts = myProducts?.filter((p: any) => {
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

  const products =
    isAdmin && currentView === 'all' ? adminProducts : filteredMyProducts
  const isLoading =
    isAdmin && currentView === 'all' ? isAdminLoading : isMyLoading

  // Mutations
  const createMutation = useCreateProduct()
  const updateMutation = useUpdateProduct()
  const toggleStatusMutation = useToggleProductStatus()
  const deleteMutation = useDeleteProduct()
  const createDeleteRequestMutation = useCreateDeleteRequest()

  const handleDelete = (product: any) => {
    if (!currentUser) return
    const isProductLister = product.userId === currentUser.id
    const isAdmin = currentUser.role === 'admin'

    if (isProductLister) {
      setProductToDelete(product)
    } else if (isAdmin) {
      setProductToDelete(product)
      setDeleteReason('')
      setIsDeleteRequestOpen(true)
    } else {
      toast.error("You don't have permission to delete this listing")
    }
  }

  const handleConfirmDelete = () => {
    if (!currentUser || !productToDelete) return

    deleteMutation.mutate(productToDelete.id, {
      onSuccess: () => {
        toast.success('Listing deleted successfully')
        setProductToDelete(null)
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || 'Failed to delete listing')
      },
    })
  }

  const handleConfirmDeleteRequest = () => {
    if (!currentUser || !productToDelete) return

    if (!deleteReason.trim()) {
      toast.error('Please provide a reason for deletion')
      return
    }

    createDeleteRequestMutation.mutate(
      {
        productId: productToDelete.id,
        reason: deleteReason,
      },
      {
        onSuccess: () => {
          toast.success('Deletion request submitted successfully')
          setIsDeleteRequestOpen(false)
          setProductToDelete(null)
        },
        onError: (err: any) => {
          toast.error(
            err.response?.data?.message || 'Failed to submit deletion request',
          )
        },
      },
    )
  }

  const deleteTitle = 'Delete Listing permanently?'

  const deleteDescription = productToDelete
    ? `Are you sure you want to permanently delete "${productToDelete.title}"? This listing will be removed from the marketplace, and all associated rental history will be archived. This action cannot be undone.`
    : ''

  const deleteRequestDialogDescription = (
    <div className="space-y-4 text-left">
      <p className="text-xs text-muted-foreground/80 font-semibold mt-1">
        Since you do not own "{productToDelete?.title}", you must submit a deletion request with a valid reason.
      </p>
      <div className="space-y-2">
        <label className="text-[10px] font-black text-dash-text-soft uppercase tracking-wider block">
          Reason for Deletion
        </label>
        <Textarea
          placeholder="Please explain why this listing should be deleted (e.g., violation of policies, outdated, duplicate)..."
          value={deleteReason}
          onChange={(e) => setDeleteReason(e.target.value)}
          className="min-h-[100px] rounded-xl border-border/30 bg-muted-light/50 focus-visible:ring-dash-brand text-foreground w-full p-3 text-sm"
        />
      </div>
    </div>
  )

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
        {isAdmin ? (
          <div className="flex items-center gap-2 rounded-full bg-dash-bg-soft p-1">
            <Button
              variant="ghost"
              onClick={() => setCurrentView('my')}
              className={`rounded-full px-5 py-2 text-sm font-bold transition-all h-auto ${
                currentView === 'my'
                  ? 'bg-dash-brand text-primary-foreground hover:bg-dash-brand hover:text-primary-foreground'
                  : 'text-dash-text-soft hover:text-dash-text hover:bg-transparent'
              }`}
            >
              My Listings
            </Button>
            <Button
              variant="ghost"
              onClick={() => setCurrentView('all')}
              className={`rounded-full px-5 py-2 text-sm font-bold transition-all h-auto ${
                currentView === 'all'
                  ? 'bg-dash-brand text-primary-foreground hover:bg-dash-brand hover:text-primary-foreground'
                  : 'text-dash-text-soft hover:text-dash-text hover:bg-transparent'
              }`}
            >
              All Listings
            </Button>
          </div>
        ) : null}
        <Button
          onClick={() => setIsAddOpen(true)}
          className="bg-dash-brand hover:bg-dash-brand/90 text-primary-foreground rounded-2xl px-6 h-14 font-extrabold shadow-lg shadow-dash-brand/20 transition-all active:scale-95 flex items-center gap-2"
        >
          <Plus size={20} strokeWidth={3} />
          Create Listing
        </Button>
      </div>

      {/* Filters Bar */}
      <ListingsFilters
        search={search}
        setSearch={setSearch}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        categories={categories}
      />

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
      <ListingDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onSubmit={(data) => {
          createMutation.mutate(data, {
            onSuccess: () => {
              setIsAddOpen(false)
              toast.success('Listing created successfully')
            },
            onError: (err: any) => {
              toast.error(
                err.response?.data?.message || 'Failed to create listing',
              )
            },
          })
        }}
        isLoading={createMutation.isPending}
        categories={categories || []}
        users={users || []}
        currentUser={currentUser}
      />

      {/* Edit Listing Dialog Component */}
      <ListingDialog
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
      <ReusableAlertDialog
        isOpen={!!productToDelete && !isDeleteRequestOpen}
        onOpenChange={(open) => !open && setProductToDelete(null)}
        onConfirm={handleConfirmDelete}
        onCancel={() => setProductToDelete(null)}
        title={deleteTitle}
        description={deleteDescription}
        confirmText="Delete"
        variant="danger"
        isPending={deleteMutation.isPending}
      />

      {/* Request Deletion Dialog */}
      <ReusableAlertDialog
        isOpen={isDeleteRequestOpen}
        onOpenChange={setIsDeleteRequestOpen}
        onConfirm={handleConfirmDeleteRequest}
        onCancel={() => {
          setIsDeleteRequestOpen(false)
          setProductToDelete(null)
        }}
        title="Request Listing Deletion"
        description={deleteRequestDialogDescription}
        confirmText="Submit Request"
        cancelText="Cancel"
        variant="danger"
        isPending={createDeleteRequestMutation.isPending}
        pendingText="Submitting..."
      />
    </div>
  )
}
