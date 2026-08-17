import * as LucideIcons from 'lucide-react'
import {
  Folder,
  FileText,
  Check,
  X,
  AlertCircle,
  FolderPlus,
} from 'lucide-react'
import { Button } from '#/components/ui/button'
import { useTranslation } from '#/context/TranslationContext'

interface CategoryRequestListProps {
  requests: any[]
  isAdmin: boolean
  isUser: boolean
  onApproveRequest: (request: any) => void
  onRejectRequest: (request: any) => void
  onRequestCreate?: () => void
  requestsLoading: boolean
}

export const CategoryRequestList = ({
  requests = [],
  isAdmin,
  isUser,
  onApproveRequest,
  onRejectRequest,
  onRequestCreate,
  requestsLoading,
}: CategoryRequestListProps) => {
  const { t } = useTranslation()
  return (
    <div className="bg-card rounded-xl border border-border/30 shadow-sm overflow-hidden animate-in fade-in duration-300">
      <div className="p-6 border-b border-border/30 flex items-center justify-between">
        <h3 className="font-bold text-foreground">
          {t('Category Request Pipeline')}
        </h3>
        {isUser && onRequestCreate && (
          <Button
            onClick={onRequestCreate}
            className="group bg-primary hover:bg-primary/90 text-primary-foreground rounded-full h-10 px-6 font-bold flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98] border-none"
          >
            {t('Request Category')}
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-foreground/20 transition-transform group-hover:translate-x-1">
              <FolderPlus size={14} strokeWidth={3} />
            </span>
          </Button>
        )}
      </div>

      <div className="divide-y divide-border/30">
        {requestsLoading ? (
          <div className="p-8 text-center text-muted-foreground/70">
            {t('Loading requests...')}
          </div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground/70">
            <FileText className="mx-auto w-12 h-12 text-muted-foreground/30 mb-3" />
            <p className="font-bold text-muted-foreground/85">
              {t('No requests found')}
            </p>
            <p className="text-xs mt-1">
              {t('Requested category proposals will display here.')}
            </p>
          </div>
        ) : (
          requests.map((req: any) => {
            const Icon = (LucideIcons as any)[req.icon || 'Folder'] || Folder
            return (
              <div
                key={req.id}
                className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted-light/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {req.image ? (
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-border/30 shadow-sm">
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
                          backgroundColor: `color-mix(in srgb, ${req.color || 'var(--color-primary)'} 15%, transparent)`,
                          color: req.color || 'var(--color-primary)',
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
                    <h4 className="font-bold text-foreground">{req.name}</h4>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      {t('Requested by')}{' '}
                      {req.user?.name || req.user?.email || t('Unknown User')} •{' '}
                      {new Date(req.createdAt).toLocaleDateString()}
                    </p>
                    {req.description && (
                      <p className="text-xs text-muted-foreground mt-2 bg-muted-light/80 px-3 py-1.5 rounded-xl border border-border/30/50 w-full max-w-lg">
                        <span className="font-bold text-[10px] text-muted-foreground/70 uppercase block tracking-wide mb-0.5">
                          {t('Description')}
                        </span>
                        {req.description}
                      </p>
                    )}
                    {req.requestReason && (
                      <p className="text-xs text-muted-foreground mt-2 bg-emerald-50/20 px-3 py-1.5 rounded-xl border border-emerald-50/50 w-full max-w-lg">
                        <span className="font-bold text-[10px] text-emerald-600/70 uppercase block tracking-wide mb-0.5">
                          {t('Proposed Reason')}
                        </span>
                        {req.requestReason}
                      </p>
                    )}
                    {req.status === 'rejected' && req.reason && (
                      <div className="flex items-center gap-1.5 text-xs text-destructive font-medium mt-2 bg-danger px-2 py-1 rounded-md w-fit border border-danger/30">
                        <AlertCircle size={12} />
                        {t('Reason: {reason}').replace('{reason}', req.reason)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Status badge */}
                  <span
                    className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-wider ${
                      req.status === 'approved'
                        ? 'bg-primary-soft text-primary-hover'
                        : req.status === 'rejected'
                          ? 'bg-danger text-destructive'
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
                        className="bg-primary hover:bg-primary/95 text-primary-foreground rounded-xl h-9 w-9 p-0 flex items-center justify-center shadow-sm cursor-pointer"
                        title={t('Approve & Create Category')}
                      >
                        <Check size={18} />
                      </Button>
                      <Button
                        onClick={() => onRejectRequest(req)}
                        className="bg-danger hover:bg-danger text-destructive rounded-xl h-9 w-9 p-0 flex items-center justify-center cursor-pointer"
                        title={t('Reject Request')}
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
