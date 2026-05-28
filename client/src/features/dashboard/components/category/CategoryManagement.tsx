import { useState } from 'react'
import { Plus, Search, FolderPlus } from 'lucide-react'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import {
  useAdminCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useCategoryRequests,
  useCreateCategoryRequest,
  useUpdateCategoryRequestStatus,
} from '#/hook'
import { isAdminRole, isUserRole } from '#/lib/auth/roles'
import { CategoryFormDialog } from './components/CategoryFormDialog'
import { DeleteConfirmDialog } from './components/DeleteConfirmDialog'
import { authClient } from '#/lib/auth/auth-client'

// Import extracted sub-components
import { CategoryCard } from './components/CategoryCard'
import { CategoryRequestList } from './components/CategoryRequestList'
import { CategoryRequestActionModals } from './components/CategoryRequestActionModals'

interface CategoryManagementProps {
  onManageCategory?: (categoryId: string) => void
}

export const CategoryManagement = ({
  onManageCategory,
}: CategoryManagementProps) => {
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'categories' | 'requests'>(
    'categories',
  )

  // Category CRUD states
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Category Request states
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false)

  // Rejection state
  const [rejectingRequest, setRejectingRequest] = useState<any>(null)

  // Approval state
  const [approvingRequest, setApprovingRequest] = useState<any>(null)

  const { data: categories, isLoading } = useAdminCategories()
  const { data: requests, isLoading: requestsLoading } = useCategoryRequests()
  const { data: session } = authClient.useSession()

  const user = session?.user
  const isAdmin = isAdminRole(user?.role)
  const isOwner = isUserRole(user?.role)

  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const deleteMutation = useDeleteCategory()

  const createRequestMutation = useCreateCategoryRequest()
  const updateRequestStatusMutation = useUpdateCategoryRequestStatus()

  const handleOpenAdd = () => {
    if (!isAdmin) return
    setEditingCategory(null)
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (category: any) => {
    if (!isAdmin) return
    setEditingCategory(category)
    setIsDialogOpen(true)
  }

  const handleFormSubmit = (data: any) => {
    if (editingCategory) {
      updateMutation.mutate(
        { id: editingCategory.id, ...data },
        {
          onSuccess: () => {
            setIsDialogOpen(false)
            setEditingCategory(null)
          },
        },
      )
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          setIsDialogOpen(false)
        },
      })
    }
  }

  const handleDeleteConfirm = () => {
    if (categoryToDelete) {
      deleteMutation.mutate(categoryToDelete.id, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false)
          setCategoryToDelete(null)
        },
      })
    }
  }

  const handleCreateRequest = (data: any) => {
    createRequestMutation.mutate(data, {
      onSuccess: () => {
        setIsRequestDialogOpen(false)
      },
    })
  }

  const handleRejectConfirm = (reason: string) => {
    if (!rejectingRequest) return
    updateRequestStatusMutation.mutate(
      {
        id: rejectingRequest.id,
        status: 'rejected',
        reason,
      },
      {
        onSuccess: () => {
          setRejectingRequest(null)
        },
      },
    )
  }

  const handleApproveConfirm = () => {
    if (!approvingRequest) return
    updateRequestStatusMutation.mutate(
      { id: approvingRequest.id, status: 'approved' },
      {
        onSuccess: () => {
          setApprovingRequest(null)
        },
      },
    )
  }

  const filteredCategories = categories?.filter((cat: any) =>
    cat.name.toLowerCase().includes(search.toLowerCase()),
  )

  const ownerRequests = requests?.filter((req: any) =>
    isAdmin ? true : req.ownerId === user?.id,
  )

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex border-b border-border/30 gap-6">
        <Button
          variant="ghost"
          onClick={() => setActiveTab('categories')}
          className={`h-auto pb-4 pt-0 px-0 rounded-none text-sm font-bold tracking-tight transition-all relative cursor-pointer hover:bg-transparent active:scale-[0.98] ${
            activeTab === 'categories'
              ? 'text-primary font-black hover:text-primary'
              : 'text-muted-foreground/70 hover:text-muted-foreground'
          }`}
        >
          Active Categories
          {activeTab === 'categories' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />
          )}
        </Button>
        <Button
          variant="ghost"
          onClick={() => setActiveTab('requests')}
          className={`h-auto pb-4 pt-0 px-0 rounded-none text-sm font-bold tracking-tight transition-all relative flex items-center gap-2 cursor-pointer hover:bg-transparent active:scale-[0.98] ${
            activeTab === 'requests'
              ? 'text-primary font-black hover:text-primary'
              : 'text-muted-foreground/70 hover:text-muted-foreground'
          }`}
        >
          Category Requests
          {ownerRequests &&
            ownerRequests.filter((r: any) => r.status === 'pending').length >
              0 && (
              <span className="bg-destructive text-destructive-foreground text-[10px] px-2 py-0.5 rounded-full font-extrabold animate-pulse">
                {
                  ownerRequests.filter((r: any) => r.status === 'pending')
                    .length
                }
              </span>
            )}
          {activeTab === 'requests' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />
          )}
        </Button>
      </div>

      {activeTab === 'categories' ? (
        <>
          {/* Categories List Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-xl border border-border/30 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/70 z-10"
                size={18}
              />
              <Input
                type="text"
                placeholder="Search categories..."
                className="pl-11 h-12 bg-muted-light/50 border-transparent rounded-xl text-[15px] text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-1 focus-visible:ring-dash-brand/30 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {isAdmin && (
              <Button
                onClick={handleOpenAdd}
                className="bg-primary hover:bg-primary-hover text-primary-foreground rounded-full h-12 px-8 font-bold shadow-md shadow-primary/20 flex items-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
              >
                <Plus size={20} strokeWidth={2.5} />
                Add Category
              </Button>
            )}

            {isOwner && (
              <Button
                onClick={() => setIsRequestDialogOpen(true)}
                className="bg-primary hover:bg-primary-hover text-primary-foreground rounded-full h-12 px-8 font-bold shadow-md shadow-primary/20 flex items-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
              >
                <FolderPlus size={20} />
                Request Category
              </Button>
            )}
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-32 bg-card rounded-xl border border-border/30 animate-pulse"
                />
              ))
            ) : filteredCategories?.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-card rounded-xl border border-dashed border-border">
                <div className="w-16 h-16 bg-muted-light rounded-full flex items-center justify-center mx-auto mb-4">
                  <FolderPlus className="text-muted-dark" size={32} />
                </div>
                <p className="text-muted-foreground/85 font-bold">
                  No categories found.
                </p>
              </div>
            ) : (
              filteredCategories?.map((category: any) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  isAdmin={isAdmin}
                  onManageCategory={onManageCategory}
                  onOpenEdit={handleOpenEdit}
                  onOpenDelete={(cat) => {
                    setCategoryToDelete(cat)
                    setIsDeleteDialogOpen(true)
                  }}
                />
              ))
            )}
          </div>
        </>
      ) : (
        /* Requests Tab View */
        <CategoryRequestList
          requests={ownerRequests || []}
          isAdmin={isAdmin}
          isOwner={isOwner}
          onApproveRequest={(req) => setApprovingRequest(req)}
          onRejectRequest={(req) => setRejectingRequest(req)}
          onRequestCreate={() => setIsRequestDialogOpen(true)}
          requestsLoading={requestsLoading}
        />
      )}

      {/* Forms & Dialogs */}
      <CategoryFormDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingCategory={editingCategory}
        onSubmit={handleFormSubmit}
        isPending={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        itemName={categoryToDelete?.name}
        isPending={deleteMutation.isPending}
      />

      {/* Category Request Dialog for Owners */}
      <CategoryFormDialog
        isOpen={isRequestDialogOpen}
        onOpenChange={setIsRequestDialogOpen}
        editingCategory={null}
        onSubmit={handleCreateRequest}
        isPending={createRequestMutation.isPending}
        isRequest={true}
      />

      {/* Admin Action Action Modals */}
      <CategoryRequestActionModals
        rejectingRequest={rejectingRequest}
        onRejectClose={() => setRejectingRequest(null)}
        onRejectConfirm={handleRejectConfirm}
        approvingRequest={approvingRequest}
        onApproveClose={() => setApprovingRequest(null)}
        onApproveConfirm={handleApproveConfirm}
        isPending={updateRequestStatusMutation.isPending}
      />
    </div>
  )
}
