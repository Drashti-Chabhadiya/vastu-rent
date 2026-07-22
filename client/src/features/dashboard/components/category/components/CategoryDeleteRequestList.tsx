import * as LucideIcons from 'lucide-react'
import {
  FileText,
  Check,
  X,
  Trash2,
  AlertTriangle,
  AlertCircle,
} from 'lucide-react'
import { Button } from '#/components/ui/button'
import { useTranslation } from '#/context/TranslationContext'

interface CategoryDeleteRequestListProps {
  requests: any[]
  isAdmin: boolean
  isUser: boolean
  onApproveRequest: (request: any) => void
  onRejectRequest: (request: any) => void
  requestsLoading: boolean
  onDeleteConfirm?: (request: any) => void
}

export const CategoryDeleteRequestList = ({
  requests = [],
  isAdmin,
  isUser,
  onApproveRequest,
  onRejectRequest,
  requestsLoading,
  onDeleteConfirm,
}: CategoryDeleteRequestListProps) => {
  const { t } = useTranslation()
  return (
    <div className="bg-card rounded-xl border border-border/30 shadow-sm overflow-hidden animate-in fade-in duration-300">
      <div className="p-6 border-b border-border/30 flex items-center justify-between">
        <h3 className="font-bold text-foreground flex items-center gap-2">
          <Trash2 className="text-destructive" size={18} />
          {t('Category Deletion Pipeline')}
        </h3>
      </div>

      <div className="divide-y divide-border/30">
        {requestsLoading ? (
          <div className="p-8 text-center text-muted-foreground/70 animate-pulse">
            {t('Loading requests...')}
          </div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground/70">
            <FileText className="mx-auto w-12 h-12 text-muted-foreground/30 mb-3" />
            <p className="font-bold text-muted-foreground/85">
              {t('No deletion requests found')}
            </p>
            <p className="text-xs mt-1">
              {t('Active categories requested for deletion will display here.')}
            </p>
          </div>
        ) : (
          requests.map((req: any) => {
            const categoryName =
              req.categoryName || req.category?.name || t('Unknown Category')
            const categoryIcon =
              req.categoryIcon || req.category?.icon || 'Folder'
            const categoryColor =
              req.categoryColor || req.category?.color || 'var(--color-primary)'
            const categoryImage = req.category?.image

            const Icon =
              (LucideIcons as any)[categoryIcon] || LucideIcons.Folder
            const isApproved = req.status === 'approved'
            const approvedAtTime = req.approvedAt
              ? new Date(req.approvedAt).getTime()
              : 0
            const isExpired =
              isApproved &&
              (!req.approvedAt ||
                Date.now() - approvedAtTime > 24 * 60 * 60 * 1000)

            const msRemaining =
              approvedAtTime + 24 * 60 * 60 * 1000 - Date.now()
            const hoursRemaining = Math.max(
              0,
              Math.floor(msRemaining / (1000 * 60 * 60)),
            )
            const minutesRemaining = Math.max(
              0,
              Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60)),
            )
            const timeRemainingStr = `${hoursRemaining}h ${minutesRemaining}m`

            return (
              <div
                key={req.id}
                className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted-light/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Left side elements are unchanged... */}
                  <div className="flex-shrink-0">
                    {categoryImage ? (
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-border/30 shadow-sm">
                        <img
                          src={categoryImage}
                          alt={categoryName}
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
                          backgroundColor: `color-mix(in srgb, ${categoryColor} 15%, transparent)`,
                          color: categoryColor,
                        }}
                      >
                        {categoryIcon ? (
                          <Icon size={24} />
                        ) : (
                          <span className="font-bold text-xl">
                            {categoryName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">
                      {t('Delete "{categoryName}"').replace('{categoryName}', categoryName)}
                    </h4>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      {t('Requested by')}{' '}
                      {req.user?.name || req.user?.email || t('Unknown User')} •{' '}
                      {new Date(req.createdAt).toLocaleDateString()}
                    </p>
                    {req.reason && (
                      <p className="text-xs text-muted-foreground mt-2 bg-danger/10 px-3 py-1.5 rounded-xl border border-danger/30 w-full max-w-lg italic">
                        <span className="font-bold text-[10px] text-destructive uppercase block tracking-wide mb-0.5 not-italic">
                          {t('Reason for Deletion')}
                        </span>
                        "{req.reason}"
                      </p>
                    )}

                    {isApproved && !isExpired && (
                      <div className="text-xs text-warning-foreground bg-warning/10 border border-warning/20 px-3.5 py-2.5 rounded-xl w-full max-w-lg mt-3 flex items-start gap-2.5 animate-in fade-in duration-300">
                        <AlertTriangle
                          className="flex-shrink-0 mt-0.5 text-warning-foreground animate-pulse"
                          size={15}
                        />
                        <div className="space-y-0.5">
                          <p className="font-extrabold text-[10px] uppercase tracking-wider text-warning-foreground font-black">
                            {isAdmin
                              ? t('Approved: 24-Hour Deletion Window')
                              : t('Action Required: 24-Hour Delete Permission')}
                          </p>
                          <p className="font-semibold text-warning-foreground/95 leading-relaxed">
                            {isAdmin ? (
                              <>
                                {t('This deletion request has been approved. The proposing user has until')}{' '}
                                <span className="font-black text-warning-foreground underline">
                                  {new Date(
                                    approvedAtTime + 24 * 60 * 60 * 1000,
                                  ).toLocaleString()}
                                </span>{' '}
                                {t('to complete the deletion (Expires in')} <span className="font-black text-warning-foreground underline">
                                  {timeRemainingStr}
                                </span>
                                ).
                              </>
                            ) : (
                              <>
                                {t('Admin approved this deletion. You must complete the deletion before the permission expires on')}{' '}
                                <span className="font-black text-warning-foreground underline">
                                  {new Date(
                                    approvedAtTime + 24 * 60 * 60 * 1000,
                                  ).toLocaleString()}
                                </span>{' '}
                                ({t('Expires in')}{' '}
                                <span className="font-black text-warning-foreground underline">
                                  {timeRemainingStr}
                                </span>
                                ).
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                    )}

                    {isApproved && isExpired && (
                      <div className="text-xs text-muted-foreground bg-muted-light border border-border/30 px-3.5 py-2.5 rounded-xl w-full max-w-lg mt-3 flex items-start gap-2.5 animate-in fade-in duration-300">
                        <AlertCircle
                          className="flex-shrink-0 mt-0.5 text-muted-dark"
                          size={15}
                        />
                        <div className="space-y-0.5">
                          <p className="font-extrabold text-[10px] uppercase tracking-wider text-muted-dark font-black">
                            {t('Delete Permission Expired')}
                          </p>
                          <p className="font-semibold text-muted-foreground/80 leading-relaxed">
                            {isAdmin ? (
                              <>
                                {t('The 24-hour deletion window expired on')}{' '}
                                <span className="font-bold text-foreground">
                                  {new Date(
                                    approvedAtTime + 24 * 60 * 60 * 1000,
                                  ).toLocaleString()}
                                </span>{' '}
                                {t('without action. The proposing user must submit a new request.')}
                              </>
                            ) : (
                              <>
                                {t('The 24-hour deletion window expired on')}{' '}
                                <span className="font-bold text-foreground">
                                  {new Date(
                                    approvedAtTime + 24 * 60 * 60 * 1000,
                                  ).toLocaleString()}
                                </span>
                                {t('. You must submit a new deletion request.')}
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Status badge */}
                  <span
                    className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-wider ${
                      req.status === 'deleted'
                        ? 'bg-muted/60 text-muted-foreground'
                        : req.status === 'approved'
                          ? isExpired
                            ? 'bg-muted/40 text-muted-foreground/80'
                            : 'bg-primary-soft text-primary-hover'
                          : req.status === 'rejected'
                            ? 'bg-danger text-destructive'
                            : 'bg-yellow-50 text-yellow-700'
                    }`}
                  >
                    {req.status === 'approved' && isExpired
                      ? t('expired')
                      : req.status}
                  </span>

                  {/* User Delete action */}
                  {isUser && req.status === 'approved' && !isExpired && (
                    <Button
                      variant="destructive"
                      onClick={() => onDeleteConfirm?.(req)}
                      className="rounded-xl h-9 px-3 flex items-center justify-center gap-1.5 font-bold text-xs cursor-pointer shadow-sm active:scale-[0.98] transition-all"
                      title={t('Delete Category Now')}
                    >
                      <Trash2 size={14} />
                      <span>{t('Delete')}</span>
                    </Button>
                  )}

                  {/* Admin Actions */}
                  {isAdmin && req.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => onApproveRequest(req)}
                        className="bg-primary hover:bg-primary-hover text-primary-foreground rounded-xl h-9 w-9 p-0 flex items-center justify-center shadow-sm cursor-pointer"
                        title={t('Approve & Grant Permission to Delete')}
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
