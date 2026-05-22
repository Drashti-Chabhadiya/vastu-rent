import { useState } from 'react'
import * as LucideIcons from 'lucide-react'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  FolderPlus,
  Folder,
  Layers,
  ArrowRight,
  Check,
  X,
  FileText,
  AlertCircle,
} from 'lucide-react'
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
import { CategoryFormDialog } from './CategoryFormDialog'
import { DeleteConfirmDialog } from './DeleteConfirmDialog'
import { authClient } from '#/lib/auth/auth-client'

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
  const [rejectReason, setRejectReason] = useState('')

  // Approval state
  const [approvingRequest, setApprovingRequest] = useState<any>(null)

  const { data: categories, isLoading } = useAdminCategories()
  const { data: requests, isLoading: requestsLoading } = useCategoryRequests()
  const { data: session } = authClient.useSession()

  const user = session?.user
  const isAdmin = user?.role === 'admin' || user?.role === 'superAdmin'
  const isOwner = user?.role === 'owner'

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

  const handleApproveRequest = (id: string) => {
    updateRequestStatusMutation.mutate({ id, status: 'approved' })
  }

  const handleRejectRequest = (e: React.FormEvent) => {
    e.preventDefault()
    if (!rejectingRequest || !rejectReason.trim()) return

    updateRequestStatusMutation.mutate(
      {
        id: rejectingRequest.id,
        status: 'rejected',
        reason: rejectReason,
      },
      {
        onSuccess: () => {
          setRejectingRequest(null)
          setRejectReason('')
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

  const renderCategoryIcon = (category: any) => {
    if (category.image) {
      return (
        <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as any).src =
                'https://via.placeholder.com/100?text=Category'
            }}
          />
        </div>
      )
    }

    const iconName = category.icon || 'Folder'
    const IconComponent = (LucideIcons as any)[iconName]
    const iconColor = category.color || '#166534'

    return (
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center transition-all group-hover:scale-110 shadow-sm"
        style={{
          backgroundColor: `${iconColor}15`,
          color: iconColor,
        }}
      >
        {IconComponent ? <IconComponent size={24} /> : <Folder size={24} />}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex border-b border-gray-100 gap-6">
        <button
          onClick={() => setActiveTab('categories')}
          className={`pb-4 text-sm font-bold tracking-tight transition-all relative ${activeTab === 'categories'
            ? 'text-dash-brand'
            : 'text-gray-400 hover:text-gray-600'
            }`}
        >
          Active Categories
          {activeTab === 'categories' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-dash-brand rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-4 text-sm font-bold tracking-tight transition-all relative flex items-center gap-2 ${activeTab === 'requests'
            ? 'text-dash-brand'
            : 'text-gray-400 hover:text-gray-600'
            }`}
        >
          Category Requests
          {ownerRequests &&
            ownerRequests.filter((r: any) => r.status === 'pending').length >
            0 && (
              <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-extrabold animate-pulse">
                {
                  ownerRequests.filter((r: any) => r.status === 'pending')
                    .length
                }
              </span>
            )}
          {activeTab === 'requests' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-dash-brand rounded-t-full" />
          )}
        </button>
      </div>

      {activeTab === 'categories' ? (
        <>
          {/* Categories List Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10"
                size={18}
              />
              <Input
                type="text"
                placeholder="Search categories..."
                className="pl-11 h-12 bg-gray-50/50 border-transparent rounded-xl text-[15px] text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-dash-brand/30 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {isAdmin && (
              <Button
                onClick={handleOpenAdd}
                className="bg-dash-brand hover:bg-dash-brand/90 text-white rounded-xl h-12 px-8 font-bold shadow-md shadow-dash-brand/10 flex items-center gap-2 transition-all active:scale-[0.98]"
              >
                <Plus size={20} strokeWidth={2.5} />
                Add Category
              </Button>
            )}

            {isOwner && (
              <Button
                onClick={() => setIsRequestDialogOpen(true)}
                className="bg-dash-brand hover:bg-dash-brand/90 text-white rounded-xl h-12 px-8 font-bold shadow-md shadow-dash-brand/10 flex items-center gap-2 transition-all active:scale-[0.98]"
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
                  className="h-32 bg-white rounded-xl border border-gray-100 animate-pulse"
                />
              ))
            ) : filteredCategories?.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white rounded-xl border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FolderPlus className="text-gray-300" size={32} />
                </div>
                <p className="text-gray-500 font-bold">No categories found.</p>
              </div>
            ) : (
              filteredCategories?.map((category: any) => (
                <div
                  key={category.id}
                  className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-dash-brand/20 transition-all group relative overflow-hidden"
                >
                  <div
                    className="absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 opacity-[0.03]"
                    style={{ backgroundColor: category.color || '#166534' }}
                  />

                  <div className="flex items-start justify-between relative z-10">
                    <div className="space-y-4">
                      {renderCategoryIcon(category)}
                      <div>
                        <h3 className="text-lg font-extrabold text-gray-900 group-hover:text-dash-brand transition-colors">
                          {category.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                          <div
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                            style={{
                              backgroundColor: `${category.color || '#166534'}15`,
                            }}
                          >
                            <Layers
                              size={12}
                              style={{ color: category.color || '#166534' }}
                            />
                            <span
                              className="text-[11px] font-extrabold uppercase tracking-wider"
                              style={{ color: category.color || '#166534' }}
                            >
                              {category._count?.products || 0} Items
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {isAdmin && (
                      <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(category)}
                          className="h-9 w-9 text-gray-400 hover:text-dash-brand hover:bg-dash-brand/10 rounded-xl"
                        >
                          <Edit2 size={18} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setCategoryToDelete(category)
                            setIsDeleteDialogOpen(true)
                          }}
                          className="h-9 w-9 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl"
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div
                    onClick={() => onManageCategory?.(category.id)}
                    className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between cursor-pointer group/manage"
                  >
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover/manage:text-dash-brand transition-colors">
                      Manage Collection
                    </span>
                    <ArrowRight
                      size={16}
                      className="text-gray-300 group-hover/manage:text-dash-brand group-hover/manage:translate-x-1 transition-all"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        /* Requests Tab View */
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">
              Category Request Pipeline
            </h3>
            {isOwner && (
              <Button
                onClick={() => setIsRequestDialogOpen(true)}
                className="bg-dash-brand hover:bg-dash-brand/90 text-white rounded-xl h-10 px-6 font-bold flex items-center gap-2"
              >
                <FolderPlus size={16} />
                Request Category
              </Button>
            )}
          </div>

          <div className="divide-y divide-gray-50">
            {requestsLoading ? (
              <div className="p-8 text-center text-gray-400">
                Loading requests...
              </div>
            ) : ownerRequests?.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <FileText className="mx-auto w-12 h-12 text-gray-200 mb-3" />
                <p className="font-bold text-gray-500">No requests found</p>
                <p className="text-xs mt-1">
                  Requested category proposals will display here.
                </p>
              </div>
            ) : (
              ownerRequests?.map((req: any) => {
                const Icon =
                  (LucideIcons as any)[req.icon || 'Folder'] || Folder
                return (
                  <div
                    key={req.id}
                    className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{
                          backgroundColor: `${req.color || '#166534'}15`,
                          color: req.color || '#166534',
                        }}
                      >
                        {req.image ? (
                          <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                            <img
                              src={req.image}
                              alt={req.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                ; (e.target as any).src =
                                  'https://via.placeholder.com/100?text=Category'
                              }}
                            />
                          </div>
                        ) : (
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center transition-all group-hover:scale-110 shadow-sm"
                            style={{
                              backgroundColor: `${req.color || '#166534'}15`,
                              color: req.color || '#166534',
                            }}
                          >
                            {req.icon ? (
                              <Icon size={24} />
                            ) : (
                              <span className="font-bold text-xl">
                                {req.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{req.name}</h4>
                        <p className="text-xs text-gray-400 mt-1">
                          Requested by{' '}
                          {req.owner?.name ||
                            req.owner?.email ||
                            'Unknown Owner'}{' '}
                          • {new Date(req.createdAt).toLocaleDateString()}
                        </p>
                        {req.description && (
                          <p className="text-xs text-gray-600 mt-2 bg-gray-50/80 px-3 py-1.5 rounded-xl border border-gray-100/50 w-full max-w-lg">
                            <span className="font-bold text-[10px] text-gray-400 uppercase block tracking-wide mb-0.5">
                              Description
                            </span>
                            {req.description}
                          </p>
                        )}
                        {req.requestReason && (
                          <p className="text-xs text-gray-600 mt-2 bg-emerald-50/20 px-3 py-1.5 rounded-xl border border-emerald-50/50 w-full max-w-lg">
                            <span className="font-bold text-[10px] text-emerald-600/70 uppercase block tracking-wide mb-0.5">
                              Proposed Reason
                            </span>
                            {req.requestReason}
                          </p>
                        )}
                        {req.status === 'rejected' && req.reason && (
                          <div className="flex items-center gap-1.5 text-xs text-red-500 font-medium mt-2 bg-red-50 px-2 py-1 rounded-md w-fit border border-red-100">
                            <AlertCircle size={12} />
                            Reason: {req.reason}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Status badge */}
                      <span
                        className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-wider ${req.status === 'approved'
                          ? 'bg-green-50 text-green-700'
                          : req.status === 'rejected'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-yellow-50 text-yellow-700'
                          }`}
                      >
                        {req.status}
                      </span>

                      {/* Admin Actions */}
                      {isAdmin && req.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => setApprovingRequest(req)}
                            className="bg-green-600 hover:bg-green-700 text-white rounded-xl h-9 w-9 p-0 flex items-center justify-center shadow-sm"
                            title="Approve & Create Category"
                          >
                            <Check size={18} />
                          </Button>
                          <Button
                            onClick={() => setRejectingRequest(req)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 rounded-xl h-9 w-9 p-0 flex items-center justify-center"
                            title="Reject Request"
                          >
                            <X size={18} />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
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

      {/* Admin Rejection Dialog */}
      {rejectingRequest && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 border border-gray-100 shadow-2xl relative">
            <button
              onClick={() => setRejectingRequest(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-black text-gray-900 tracking-tight mb-2">
              Reject Proposed Category
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              State the reason for rejecting "{rejectingRequest.name}".
            </p>

            <form onSubmit={handleRejectRequest} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                  Rejection Feedback (Optional)
                </label>
                <textarea
                  placeholder="State why this category is rejected (e.g. Duplicated category name, not relevant, etc.)"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 h-28 focus:ring-1 focus:ring-dash-brand text-sm"
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRejectingRequest(null)}
                  className="rounded-xl h-12 px-6 font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateRequestStatusMutation.isPending}
                  className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-12 px-6 font-bold"
                >
                  {updateRequestStatusMutation.isPending
                    ? 'Rejecting...'
                    : 'Reject Request'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Approval Confirmation Dialog */}
      {approvingRequest && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 border border-gray-100 shadow-2xl relative">
            <button
              onClick={() => setApprovingRequest(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mb-4 text-green-600 border border-green-100">
              <Check size={28} />
            </div>

            <h3 className="text-xl font-black text-gray-900 tracking-tight mb-2">
              Approve Category Proposal
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to approve and create the category{' '}
              <strong className="text-gray-900">
                "{approvingRequest.name}"
              </strong>
              ? This will automatically add it to the active category database
              catalog for all platform users.
            </p>

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setApprovingRequest(null)}
                className="rounded-xl h-12 px-6 font-bold"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  updateRequestStatusMutation.mutate(
                    { id: approvingRequest.id, status: 'approved' },
                    {
                      onSuccess: () => {
                        setApprovingRequest(null)
                      },
                    },
                  )
                }}
                disabled={updateRequestStatusMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white rounded-xl h-12 px-6 font-bold"
              >
                {updateRequestStatusMutation.isPending
                  ? 'Approving...'
                  : 'Confirm Approval'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
