import { Dialog, DialogContent } from '#/components/ui/dialog'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'

interface StorageDetailsDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  usageData: any
  cloudinaryCloudName: string
  usedPercent: number
  formattedUsed: { value: string; unit: string }
  formattedLimit: { value: string; unit: string }
}

export const StorageDetailsDialog = ({
  isOpen,
  onOpenChange,
  usageData,
  cloudinaryCloudName,
  usedPercent,
  formattedUsed,
  formattedLimit,
}: StorageDetailsDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-8 border-none bg-white rounded-[2.5rem] shadow-2xl font-sans animate-in fade-in zoom-in-95 duration-200">
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#059669] bg-emerald-50 px-2 py-0.5 rounded">
              Storage Audit
            </span>
            <h3 className="text-xl font-extrabold text-slate-800">
              Cloudinary Resource Metrics
            </h3>
            <p className="text-[11px] font-bold text-slate-400">
              Real-time resource and bandwidth allocations from your connected
              Cloudinary bucket.
            </p>
          </div>

          <div className="space-y-4">
            {/* Cloud name & plan */}
            <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  Active Storage Bucket
                </span>
                <p className="text-xs font-black text-slate-800">
                  {usageData?.cloudName ||
                    cloudinaryCloudName ||
                    'Global Fallback'}
                </p>
              </div>
              <Badge className="bg-emerald-50 text-emerald-600 border-none px-2.5 py-0.5 rounded-md font-black text-[10px] uppercase">
                Connected
              </Badge>
            </div>

            {/* Storage Details */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-wider">
                <span>Byte Storage Allocated</span>
                <span className="text-slate-800">
                  {usedPercent.toFixed(1)}% Used
                </span>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-slate-100 space-y-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-black text-slate-800">
                    {formattedUsed.value} {formattedUsed.unit}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">
                    of {formattedLimit.value} {formattedLimit.unit} limit
                  </span>
                </div>
                <p className="text-[9px] font-bold text-slate-400">
                  Total size of active image resources, folders, and assets.
                </p>
              </div>
            </div>

            {/* Billing Universal Credits */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-wider">
                <span>Universal Billing Credits</span>
                <span className="text-slate-800">
                  {(usageData?.credits?.used_percent || 0).toFixed(1)}% Used
                </span>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-slate-100 space-y-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-black text-slate-800">
                    {usageData?.credits?.usage || 0}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">
                    of {usageData?.credits?.limit || 25} Credits limit
                  </span>
                </div>
                <p className="text-[9px] font-bold text-slate-400">
                  Cloudinary's universal usage metrics (Transformations,
                  Bandwidth & Storage combined).
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex">
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-[11px] uppercase tracking-wider shadow-lg flex items-center justify-center animate-all"
            >
              Close Metrics
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
