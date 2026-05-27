import {
  CheckCircle2,
  XCircle,
  Trash2,
  User,
  Package,
  AlertCircle,
} from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Badge } from '#/components/ui/badge'
import { useDeleteRequests, useProcessDeleteRequest } from '#/hook'
import { toast } from 'sonner'

export const DeleteRequestsManagement = () => {
  const { data: requests, isLoading } = useDeleteRequests()
  const processMutation = useProcessDeleteRequest()

  const handleProcess = (id: string, status: 'approved' | 'rejected') => {
    const action = status === 'approved' ? 'approve' : 'reject'
    if (
      window.confirm(
        `Are you sure you want to ${action} this deletion request?`,
      )
    ) {
      processMutation.mutate(
        { id, status },
        {
          onSuccess: () => toast.success(`Request ${status} successfully`),
          onError: () => toast.error(`Failed to process request`),
        },
      )
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-dash-text flex items-center gap-3">
          <Trash2 className="text-destructive" size={32} />
          Deletion Requests
        </h1>
        <p className="text-dash-text-soft font-medium text-sm ml-1">
          Review and process product deletion requests from admins.
        </p>
      </div>

      <div className="bg-card rounded-3xl border border-border/30 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-border/30 bg-muted-light/50">
                <th className="px-6 py-5 text-[11px] font-extrabold text-dash-text-soft uppercase tracking-[0.2em]">
                  Product
                </th>
                <th className="px-6 py-5 text-[11px] font-extrabold text-dash-text-soft uppercase tracking-[0.2em]">
                  Requested By
                </th>
                <th className="px-6 py-5 text-[11px] font-extrabold text-dash-text-soft uppercase tracking-[0.2em]">
                  Reason
                </th>
                <th className="px-6 py-5 text-[11px] font-extrabold text-dash-text-soft uppercase tracking-[0.2em]">
                  Status
                </th>
                <th className="px-6 py-5 text-[11px] font-extrabold text-dash-text-soft uppercase tracking-[0.2em] text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-20 text-center text-dash-text-soft animate-pulse font-bold"
                  >
                    Loading requests...
                  </td>
                </tr>
              ) : requests?.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-20 text-center text-dash-text-soft font-bold"
                  >
                    No pending requests
                  </td>
                </tr>
              ) : (
                requests?.map((req: any) => (
                  <tr
                    key={req.id}
                    className="group hover:bg-muted-light/80 transition-all"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center text-dash-text-soft">
                          <Package size={20} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-dash-text">
                            {req.product?.title || 'Unknown Product'}
                          </span>
                          <span className="text-[10px] text-dash-text-soft font-bold uppercase tracking-wider">
                            ID: {req.productId}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-dash-brand/10 flex items-center justify-center text-dash-brand">
                          <User size={14} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-extrabold text-dash-text">
                            {req.admin?.name}
                          </span>
                          <span className="text-[10px] text-dash-text-soft font-bold">
                            {req.admin?.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2 max-w-xs">
                        <AlertCircle
                          size={14}
                          className="text-dash-text-soft mt-0.5 flex-shrink-0"
                        />
                        <span className="text-xs text-dash-text font-medium leading-relaxed italic">
                          "{req.reason || 'No reason provided'}"
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className={`
                        rounded-full px-3 py-1 font-bold text-[10px] uppercase tracking-widest
                        ${
                          req.status === 'pending'
                            ? 'bg-orange-50 text-orange-500 border-orange-200'
                            : req.status === 'approved'
                              ? 'bg-primary-soft text-primary border-primary-border/80'
                              : 'bg-danger text-destructive border-danger/50'
                        }
                      `}
                      >
                        {req.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {req.status === 'pending' && (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleProcess(req.id, 'approved')}
                            className="h-8 rounded-lg border-primary-border/80 text-primary hover:bg-primary-soft hover:text-primary-hover font-bold text-[10px] uppercase tracking-widest gap-1.5"
                          >
                            <CheckCircle2 size={12} strokeWidth={3} />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleProcess(req.id, 'rejected')}
                            className="h-8 rounded-lg border-danger/50 text-destructive hover:bg-danger hover:text-destructive font-bold text-[10px] uppercase tracking-widest gap-1.5"
                          >
                            <XCircle size={12} strokeWidth={3} />
                            Reject
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
