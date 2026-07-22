import { useState, useEffect } from 'react'
import { Plus, Search, FolderPlus } from 'lucide-react'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import { useTranslation } from '#/context/TranslationContext'
import {
  useAdminCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useCategoryRequests,
  useCreateCategoryRequest,
  useUpdateCategoryRequestStatus,
  useCategoryDeleteRequests,
  useCreateCategoryDeleteRequest,
  useProcessCategoryDeleteRequest,
} from '#/hook'
import { isAdminRole, isUserRole } from '#/lib/auth/roles'
import { CategoryFormDialog } from './components/CategoryFormDialog'
import { DeleteConfirmDialog } from './components/DeleteConfirmDialog'
import { authClient } from '#/lib/auth/auth-client'
import { toast } from 'sonner'
import { Textarea } from '#/components/ui/textarea'
import { useSearch } from '@tanstack/react-router'

// Import extracted sub-components
import { CategoryCard } from './components/CategoryCard'
import { CategoryRequestList } from './components/CategoryRequestList'
import { CategoryRequestActionModals } from './components/CategoryRequestActionModals'
import { CategoryDeleteRequestList } from './components/CategoryDeleteRequestList'
import { CategoryDeleteActionModals } from './components/CategoryDeleteActionModals'
import { ReusableAlertDialog } from '#/components/common/ReusableAlertDialog'
import { motion } from 'motion/react'
import { fadeUp, stagger } from '#/lib/animations'

interface CategoryManagementProps {
  onManageCategory?: (categoryId: string) => void
}

export const CategoryManagement = ({
  onManageCategory,
}: CategoryManagementProps) => {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const searchParams = useSearch({ strict: false }) as any
  const [activeTab, setActiveTab] = useState<'categories' | 'requests'>(
    searchParams.tab === 'requests' ? 'requests' : 'categories',
  )

  // Category CRUD states
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleteRequestDialogOpen, setIsDeleteRequestDialogOpen] =
    useState(false)
  const [deleteRequestReason, setDeleteRequestReason] = useState('')

  // Category Request states
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false)
  const [requestsSubTab, setRequestsSubTab] = useState<
    'proposals' | 'deletions'
  >(searchParams.sub === 'deletions' ? 'deletions' : 'proposals')

  useEffect(() => {
    if (searchParams.tab) {
      setActiveTab(searchParams.tab)
    }
    if (searchParams.sub) {
      setRequestsSubTab(searchParams.sub)
    }
  }, [searchParams.tab, searchParams.sub])

  // Rejection state
  const [rejectingRequest, setRejectingRequest] = useState<any>(null)
  const [rejectingDeleteRequest, setRejectingDeleteRequest] =
    useState<any>(null)

  // Approval state
  const [approvingRequest, setApprovingRequest] = useState<any>(null)
  const [approvingDeleteRequest, setApprovingDeleteRequest] =
    useState<any>(null)

  const { data: categories, isLoading } = useAdminCategories()
  const { data: requests, isLoading: requestsLoading } = useCategoryRequests()
  const { data: deleteRequests, isLoading: deleteRequestsLoading } =
    useCategoryDeleteRequests()
  const { data: session } = authClient.useSession()

  const user = session?.user
  const isAdmin = isAdminRole(user?.role)
  const isUser = isUserRole(user?.role)

  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const deleteMutation = useDeleteCategory()

  const createRequestMutation = useCreateCategoryRequest()
  const updateRequestStatusMutation = useUpdateCategoryRequestStatus()

  const createDeleteRequestMutation = useCreateCategoryDeleteRequest()
  const processDeleteRequestMutation = useProcessCategoryDeleteRequest()

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

  const handleCreateDeleteRequest = () => {
    if (!categoryToDelete) return
    if (!deleteRequestReason.trim()) {
      toast.error(t('Please specify a reason for deletion'))
      return
    }

    createDeleteRequestMutation.mutate(
      {
        categoryId: categoryToDelete.id,
        reason: deleteRequestReason,
      },
      {
        onSuccess: () => {
          setIsDeleteRequestDialogOpen(false)
          setCategoryToDelete(null)
          toast.success(t('Category deletion request submitted successfully'))
        },
        onError: (err: any) => {
          toast.error(
            err.response?.data?.message || t('Failed to submit deletion request'),
          )
        },
      },
    )
  }

  const handleApproveDeleteConfirm = () => {
    if (!approvingDeleteRequest) return
    processDeleteRequestMutation.mutate(
      { id: approvingDeleteRequest.id, status: 'approved' },
      {
        onSuccess: () => {
          setApprovingDeleteRequest(null)
          toast.success(t('Category deletion request approved'))
        },
        onError: (err: any) => {
          toast.error(
            err.response?.data?.message || t('Failed to approve deletion'),
          )
        },
      },
    )
  }

  const handleRejectDeleteConfirm = () => {
    if (!rejectingDeleteRequest) return
    processDeleteRequestMutation.mutate(
      { id: rejectingDeleteRequest.id, status: 'rejected' },
      {
        onSuccess: () => {
          setRejectingDeleteRequest(null)
          toast.success(t('Category deletion request rejected'))
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || t('Failed to reject request'))
        },
      },
    )
  }

  const filteredCategories = categories?.filter((cat: any) =>
    cat.name.toLowerCase().includes(search.toLowerCase()),
  )

  const userRequests = requests?.filter((req: any) =>
    isAdmin ? true : req.userId === user?.id,
  )

  const userDeleteRequests = deleteRequests?.filter((req: any) =>
    isAdmin ? true : req.userId === user?.id,
  )

  const deleteRequestDialogDescription = (
    <div className="space-y-4 text-left">
      <p className="text-xs text-muted-foreground/80 font-semibold mt-1">
        {t('You cannot delete "{category}" directly because it is approved. Please submit a request to the platform admins.').replace('{category}', categoryToDelete?.name)}
      </p>
      <div className="space-y-2">
        <label className="text-[10px] font-black text-dash-text-soft uppercase tracking-wider block">
          {t('Reason for Deletion')}
        </label>
        <Textarea
          placeholder={t('Explain why this category is no longer needed or should be removed...')}
          value={deleteRequestReason}
          onChange={(e) => setDeleteRequestReason(e.target.value)}
          className="min-h-[90px] rounded-xl border-border/30 bg-muted-light/50 focus-visible:ring-dash-brand text-foreground w-full p-3 text-sm"
        />
      </div>
    </div>
  )

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Tab Switcher */}
      <motion.div
        variants={fadeUp}
        className="flex border-b border-border/30 gap-6"
      >
        <Button
          variant="ghost"
          onClick={() => setActiveTab('categories')}
          className={`h-auto pb-4 pt-0 px-0 rounded-none text-sm font-bold tracking-tight transition-all relative cursor-pointer hover:bg-transparent active:scale-[0.98] ${
            activeTab === 'categories'
              ? 'text-primary font-black hover:text-primary'
              : 'text-muted-foreground/70 hover:text-muted-foreground'
          }`}
        >
          {t('Active Categories')}
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
          {t('Category Requests')}
          {userRequests &&
            userRequests.filter((r: any) => r.status === 'pending').length >
              0 && (
              <span className="bg-destructive text-destructive-foreground text-[10px] px-2 py-0.5 rounded-full font-extrabold animate-pulse">
                {userRequests.filter((r: any) => r.status === 'pending').length}
              </span>
            )}
          {activeTab === 'requests' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />
          )}
        </Button>
      </motion.div>

      {activeTab === 'categories' ? (
        <motion.div
          key="categories-tab"
          variants={fadeUp}
          className="space-y-6"
        >
          {/* Categories List Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-xl border border-border/30 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/70 z-10"
                size={18}
              />
              <Input
                type="text"
                placeholder={t('Search categories...')}
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
                {t('Add Category')}
              </Button>
            )}

            {isUser && (
              <Button
                onClick={() => setIsRequestDialogOpen(true)}
                className="bg-primary hover:bg-primary-hover text-primary-foreground rounded-full h-12 px-8 font-bold shadow-md shadow-primary/20 flex items-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
              >
                <FolderPlus size={20} />
                {t('Propose Categories')}
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
                  {t('No categories found.')}
                </p>
              </div>
            ) : (
              filteredCategories?.map((category: any) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  currentUser={user}
                  onManageCategory={onManageCategory}
                  onOpenEdit={handleOpenEdit}
                  onOpenDelete={(cat) => {
                    setCategoryToDelete(cat)
                    if (isAdmin) {
                      setIsDeleteDialogOpen(true)
                    } else if (cat.userId === user?.id) {
                      setDeleteRequestReason('')
                      setIsDeleteRequestDialogOpen(true)
                    }
                  }}
                />
              ))
            )}
          </div>
        </motion.div>
      ) : (
        /* Requests Tab View */
        <motion.div key="requests-tab" variants={fadeUp} className="space-y-6">
          <div className="flex border-b border-border/20 gap-4">
            <Button
              variant="ghost"
              onClick={() => setRequestsSubTab('proposals')}
              className={`pb-2 pt-0 px-2 rounded-none text-xs font-bold transition-all relative cursor-pointer hover:bg-transparent ${
                requestsSubTab === 'proposals'
                  ? 'text-primary border-b-2 border-primary font-black'
                  : 'text-muted-foreground/70'
              }`}
            >
              {t('Proposals')}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setRequestsSubTab('deletions')}
              className={`pb-2 pt-0 px-2 rounded-none text-xs font-bold transition-all relative cursor-pointer hover:bg-transparent ${
                requestsSubTab === 'deletions'
                  ? 'text-primary border-b-2 border-primary font-black'
                  : 'text-muted-foreground/70'
              }`}
            >
              {t('Deletion Requests')}
              {userDeleteRequests &&
                userDeleteRequests.filter((r: any) => r.status === 'pending')
                  .length > 0 && (
                  <span className="ml-1.5 bg-destructive text-destructive-foreground text-[9px] px-1.5 py-0.5 rounded-full font-black animate-pulse">
                    {
                      userDeleteRequests.filter(
                        (r: any) => r.status === 'pending',
                      ).length
                    }
                  </span>
                )}
            </Button>
          </div>

          {requestsSubTab === 'proposals' ? (
            <CategoryRequestList
              requests={userRequests || []}
              isAdmin={isAdmin}
              isUser={isUser}
              onApproveRequest={(req) => setApprovingRequest(req)}
              onRejectRequest={(req) => setRejectingRequest(req)}
              onRequestCreate={() => setIsRequestDialogOpen(true)}
              requestsLoading={requestsLoading}
            />
          ) : (
            <CategoryDeleteRequestList
              requests={userDeleteRequests || []}
              isAdmin={isAdmin}
              isUser={isUser}
              onApproveRequest={(req) => setApprovingDeleteRequest(req)}
              onRejectRequest={(req) => setRejectingDeleteRequest(req)}
              requestsLoading={deleteRequestsLoading}
              onDeleteConfirm={(req) => {
                setCategoryToDelete(
                  req.category || {
                    id: req.categoryId,
                    name: req.categoryName,
                  },
                )
                setIsDeleteDialogOpen(true)
              }}
            />
          )}
        </motion.div>
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

      {/* Category Deletion Request Dialog for Users */}
      <ReusableAlertDialog
        isOpen={isDeleteRequestDialogOpen}
        onOpenChange={setIsDeleteRequestDialogOpen}
        onConfirm={handleCreateDeleteRequest}
        onCancel={() => setCategoryToDelete(null)}
        title={t('Request Category Deletion')}
        description={deleteRequestDialogDescription}
        confirmText={t('Submit Request')}
        cancelText={t('Cancel')}
        variant="danger"
        isPending={createDeleteRequestMutation.isPending}
        pendingText={t('Submitting...')}
      />

      {/* Category Request Dialog for Users */}
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

      {/* Category Deletion Request Action Modals for Admin */}
      <CategoryDeleteActionModals
        rejectingRequest={rejectingDeleteRequest}
        onRejectClose={() => setRejectingDeleteRequest(null)}
        onRejectConfirm={handleRejectDeleteConfirm}
        approvingRequest={approvingDeleteRequest}
        onApproveClose={() => setApprovingDeleteRequest(null)}
        onApproveConfirm={handleApproveDeleteConfirm}
        isPending={processDeleteRequestMutation.isPending}
      />
    </motion.div>
  )
}
