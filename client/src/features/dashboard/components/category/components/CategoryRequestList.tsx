import * as LucideIcons from 'lucide-react'
import { Folder, FileText, Check, X, AlertCircle, FolderPlus } from 'lucide-react'
import { Button } from '#/components/ui/button'

interface CategoryRequestListProps {
  requests: any[]
  isAdmin: boolean
  isOwner: boolean
  onApproveRequest: (request: any) => void
  onRejectRequest: (request: any) => void
  onRequestCreate?: () => void
  requestsLoading: boolean
}

export const CategoryRequestList = ({
  requests = [],
  isAdmin,
  isOwner,
  onApproveRequest,
  onRejectRequest,
  onRequestCreate,
  requestsLoading,
}: CategoryRequestListProps) => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in duration-300">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-bold text-gray-900">
          Category Request Pipeline
        </h3>
        {isOwner && onRequestCreate && (
          <Button
            onClick={onRequestCreate}
            className="bg-dash-brand hover:bg-dash-brand/90 text-white rounded-xl h-10 px-6 font-bold flex items-center gap-2 cursor-pointer"
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
        ) : requests.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <FileText className="mx-auto w-12 h-12 text-gray-200 mb-3" />
            <p className="font-bold text-gray-500">No requests found</p>
            <p className="text-xs mt-1">
              Requested category proposals will display here.
            </p>
          </div>
        ) : (
          requests.map((req: any) => {
            const Icon =
              (LucideIcons as any)[req.icon || 'Folder'] || Folder
            return (
              <div
                key={req.id}
                className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {req.image ? (
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                        <img
                          src={req.image}
                          alt={req.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            ;(e.target as any).src =
                              'https://via.placeholder.com/100?text=Category'
                          }}
                        />
                      </div>
                    ) : (
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-sm"
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
                    className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-wider ${
                      req.status === 'approved'
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
                        onClick={() => onApproveRequest(req)}
                        className="bg-green-600 hover:bg-green-700 text-white rounded-xl h-9 w-9 p-0 flex items-center justify-center shadow-sm cursor-pointer"
                        title="Approve & Create Category"
                      >
                        <Check size={18} />
                      </Button>
                      <Button
                        onClick={() => onRejectRequest(req)}
                        className="bg-red-50 hover:bg-red-100 text-red-600 rounded-xl h-9 w-9 p-0 flex items-center justify-center cursor-pointer"
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
  )
}
