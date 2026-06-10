import { ChevronRight, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Textarea } from '#/components/ui/textarea'
import { useDisputes, useResolveDispute } from '#/hook'
import { useState } from 'react'
import { authClient } from '#/lib/auth/auth-client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'

export const DisputesManagement = () => {
  const { data: disputes, isLoading } = useDisputes()
  const resolveMutation = useResolveDispute()
  const { data: session } = authClient.useSession()

  const isAdmin = session?.user?.role === 'admin'

  const [activeDispute, setActiveDispute] = useState<any>(null)
  const [resolutionText, setResolutionText] = useState('')
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false)
  const [resolveType, setResolveType] = useState<'resolved' | 'dismissed'>(
    'resolved',
  )

  const selectedDispute = activeDispute || disputes?.[0]

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDispute || !resolutionText.trim()) return

    resolveMutation.mutate(
      {
        id: selectedDispute.id,
        status: resolveType,
        resolution: resolutionText,
      },
      {
        onSuccess: () => {
          setIsResolveModalOpen(false)
          setResolutionText('')
          setActiveDispute(null)
        },
      },
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Breadcrumbs */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-dark">
          <span>Dashboard</span>
          <ChevronRight size={10} className="text-muted-dark" />
          <span className="text-dash-brand font-extrabold uppercase tracking-widest">
            Disputes
          </span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black text-foreground">
            Disputes & Disputes Reports
          </h1>
        </div>
      </div>

      {/* Main Grid: Disputes List & Details Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: All Disputes Table */}
        <div className="lg:col-span-2 bg-card p-8 rounded-[2.5rem] border border-border/30 shadow-sm overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <h3 className="text-[15px] font-black text-foreground">
                Incoming Disputes
              </h3>
              <p className="text-[11px] font-bold text-muted-dark">
                Review reported issues for orders and items.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto -mx-2">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/30 hover:bg-transparent">
                  <TableHead className="text-left px-4 py-3 text-[9px] font-black text-muted-dark uppercase tracking-widest h-auto">
                    Dispute Detail
                  </TableHead>
                  <TableHead className="text-left px-4 py-3 text-[9px] font-black text-muted-dark uppercase tracking-widest h-auto">
                    Rental ID
                  </TableHead>
                  <TableHead className="text-left px-4 py-3 text-[9px] font-black text-muted-dark uppercase tracking-widest h-auto">
                    Reported By
                  </TableHead>
                  <TableHead className="text-left px-4 py-3 text-[9px] font-black text-muted-dark uppercase tracking-widest h-auto">
                    Date
                  </TableHead>
                  <TableHead className="text-left px-4 py-3 text-[9px] font-black text-muted-dark uppercase tracking-widest h-auto">
                    Status
                  </TableHead>
                  <TableHead className="px-4 py-3 h-auto"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/30">
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-10 text-xs text-muted-dark"
                    >
                      Loading disputes...
                    </TableCell>
                  </TableRow>
                ) : disputes?.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-10 text-xs text-muted-dark"
                    >
                      No disputes reported.
                    </TableCell>
                  </TableRow>
                ) : (
                  disputes?.map((dispute) => (
                    <TableRow
                      key={dispute.id}
                      onClick={() => setActiveDispute(dispute)}
                      className={`group cursor-pointer hover:bg-muted-light/50 transition-all ${
                        selectedDispute?.id === dispute.id
                          ? 'bg-muted-light/80'
                          : ''
                      }`}
                    >
                      <TableCell className="px-4 py-5">
                        <p className="text-[11px] font-black text-foreground leading-tight">
                          {dispute.reason}
                        </p>
                        <p className="text-[9px] font-bold text-muted-dark mt-0.5 truncate max-w-[150px]">
                          {dispute.description}
                        </p>
                      </TableCell>
                      <TableCell className="px-4 py-5 font-mono text-[10px] text-foreground">
                        {dispute.rentalId.substring(0, 10)}...
                      </TableCell>
                      <TableCell className="px-4 py-5">
                        <p className="text-[10px] font-black text-foreground">
                          {dispute.reportedBy?.name || 'Anonymous'}
                        </p>
                        <p className="text-[8px] font-bold text-muted-dark">
                          {dispute.reportedBy?.email}
                        </p>
                      </TableCell>
                      <TableCell className="px-4 py-5 text-[10px] font-bold text-muted-foreground/85">
                        {new Date(dispute.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="px-4 py-5">
                        <Badge
                          className={`px-2.5 py-0.5 rounded-lg border-none text-[8px] font-black uppercase tracking-wider ${
                            dispute.status === 'open'
                              ? 'bg-danger text-danger-foreground'
                              : dispute.status === 'resolved'
                                ? 'bg-emerald-50 text-emerald-600'
                                : 'bg-muted/50 text-muted-foreground/85'
                          }`}
                        >
                          {dispute.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-5 text-right">
                        <ChevronRight
                          size={14}
                          className="text-muted-dark group-hover:text-dash-brand transition-colors"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Right Column: Dispute Details Sidebar */}
        <div className="space-y-6">
          {selectedDispute ? (
            <>
              <div className="bg-card p-8 rounded-[2.5rem] border border-border/30 shadow-sm">
                <h3 className="text-[15px] font-black text-foreground mb-6 uppercase tracking-widest">
                  Dispute Case
                </h3>

                <div className="space-y-4">
                  <div>
                    <span className="text-[9px] font-black text-muted-dark uppercase tracking-widest block mb-1">
                      Issue reason
                    </span>
                    <p className="text-[12px] font-black text-foreground">
                      {selectedDispute.reason}
                    </p>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-muted-dark uppercase tracking-widest block mb-1">
                      Detailed Description
                    </span>
                    <p className="text-[11px] font-bold text-muted-foreground leading-relaxed">
                      {selectedDispute.description}
                    </p>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-muted-dark uppercase tracking-widest block mb-1">
                      Product Details
                    </span>
                    <p className="text-[11px] font-black text-foreground/80">
                      {selectedDispute.rental?.product?.title || 'Unknown Item'}{' '}
                      (₹{selectedDispute.rental?.product?.price}/day)
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[9px] font-black text-muted-dark uppercase tracking-widest block mb-1">
                        Reported By
                      </span>
                      <p className="text-[10px] font-black text-foreground">
                        {selectedDispute.reportedBy?.name || 'Anonymous'}
                      </p>
                      <p className="text-[8px] font-bold text-muted-dark">
                        {selectedDispute.reportedBy?.email}
                      </p>
                    </div>
                    <div>
                      <span className="text-[9px] font-black text-muted-dark uppercase tracking-widest block mb-1">
                        Status
                      </span>
                      <Badge className="bg-danger text-danger-foreground border-none px-2.5 py-0.5 text-[8px] font-black uppercase tracking-wider">
                        {selectedDispute.status}
                      </Badge>
                    </div>
                  </div>

                  {selectedDispute.resolution && (
                    <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                      <span className="text-[9px] font-black text-emerald-800 uppercase tracking-widest block mb-1">
                        Official Resolution
                      </span>
                      <p className="text-[11px] font-bold text-emerald-700">
                        {selectedDispute.resolution}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {isAdmin && selectedDispute.status === 'open' && (
                <div className="bg-card p-8 rounded-[2.5rem] border border-border/30 shadow-sm space-y-3">
                  <h3 className="text-[13px] font-black text-foreground mb-1 uppercase tracking-widest">
                    Dispute Actions
                  </h3>
                  <Button
                    onClick={() => {
                      setResolveType('resolved')
                      setIsResolveModalOpen(true)
                    }}
                    className="w-full h-12 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-black text-[11px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <CheckCircle2 size={16} /> Resolve Dispute Case
                  </Button>
                  <Button
                    onClick={() => {
                      setResolveType('dismissed')
                      setIsResolveModalOpen(true)
                    }}
                    variant="ghost"
                    className="w-full h-12 rounded-xl text-danger-foreground hover:bg-danger font-black text-[11px] flex items-center justify-center gap-2 border border-danger/30 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <XCircle size={16} /> Dismiss Dispute Case
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="bg-card p-8 rounded-[2.5rem] border border-border/30 shadow-sm text-center text-muted-dark py-12">
              Select a dispute from the list to display its metrics and action
              controls.
            </div>
          )}
        </div>
      </div>

      {/* Support Footer */}
      <div className="bg-emerald-50 p-8 px-12 rounded-[2.5rem] border border-emerald-100 flex items-center justify-between group">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 rounded-2xl bg-card flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-50">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h4 className="text-[15px] font-black text-foreground">
              Dispute Management Center
            </h4>
            <p className="text-[11px] font-bold text-muted-foreground/85">
              Admins verify facts from both renters and hosts to guarantee
              payouts and transaction safety.
            </p>
          </div>
        </div>
      </div>

      {/* Resolution Dialog Modal using Shadcn Dialog */}
      <Dialog open={isResolveModalOpen} onOpenChange={setIsResolveModalOpen}>
        <DialogContent className="bg-card rounded-3xl max-w-md w-full p-8 border border-border/30 shadow-2xl animate-scale-in">
          <DialogHeader className="text-left">
            <DialogTitle className="text-xl font-black text-foreground tracking-tight mb-2">
              {resolveType === 'resolved'
                ? 'Resolve Dispute'
                : 'Dismiss Dispute'}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground/85">
              Write the official resolution verdict. Both renter and landlord
              will receive notifications.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleResolveSubmit} className="space-y-4 mt-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground/70 uppercase tracking-wider block mb-1">
                Veritable Verdict Remarks
              </label>
              <Textarea
                required
                placeholder="Provide detailed feedback on this resolution..."
                value={resolutionText}
                onChange={(e) => setResolutionText(e.target.value)}
                className="w-full border border-border rounded-xl p-3 h-28 focus:ring-1 focus:ring-dash-brand text-sm resize-none"
              />
            </div>

            <Button
              type="submit"
              disabled={resolveMutation.isPending}
              className={`w-full text-primary-foreground rounded-xl h-12 font-bold mt-2 active:scale-[0.98] transition-all cursor-pointer border-none ${
                resolveType === 'resolved'
                  ? 'bg-primary hover:bg-primary-hover'
                  : 'bg-destructive/90 hover:bg-destructive/90'
              }`}
            >
              {resolveMutation.isPending
                ? 'Submitting resolution...'
                : 'Submit Verdict'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
