import { HelpCircle, Plus, Trash2 } from 'lucide-react'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
import { Button } from '#/components/ui/button'
import { TabsContent } from '#/components/ui/tabs'

interface TrustSettingsTabProps {
  commitments: Array<{ iconName: string; title: string; description: string }>
  addCommitment: () => void
  removeCommitment: (index: number) => void
  updateCommitment: (
    index: number,
    field: 'iconName' | 'title' | 'description',
    value: string,
  ) => void
  safetyTips: Array<{ iconName: string; title: string; description: string }>
  addSafetyTip: () => void
  removeSafetyTip: (index: number) => void
  updateSafetyTip: (
    index: number,
    field: 'iconName' | 'title' | 'description',
    value: string,
  ) => void
}

export function TrustSettingsTab({
  commitments,
  addCommitment,
  removeCommitment,
  updateCommitment,
  safetyTips,
  addSafetyTip,
  removeSafetyTip,
  updateSafetyTip,
}: TrustSettingsTabProps) {
  return (
    <TabsContent
      value="trust"
      className="space-y-8 animate-in fade-in duration-300 outline-none overflow-y-auto flex-1 pr-2 max-h-[calc(100vh-27rem)] scrollbar-thin"
    >
      <div className="space-y-1">
        <h4 className="text-[14px] font-extrabold text-dash-brand flex items-center gap-2">
          <HelpCircle size={16} className="text-dash-brand" />
          Trust & Community Commitments
        </h4>
        <p className="text-[11px] font-semibold text-muted-dark leading-relaxed">
          Configure trust badges, platform commitments, and community safety guidelines. Icon Keywords: Shield, UserCheck, MessageSquare, Headphones, MapPin, FileText, Flag.
        </p>
      </div>

      {/* Commitments List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-extrabold text-foreground/80 uppercase tracking-widest">
            Platform Commitments ({commitments.length})
          </label>
          <Button
            type="button"
            onClick={addCommitment}
            className="h-8 px-3.5 rounded-full bg-dash-brand-light text-dash-brand hover:bg-dash-brand-light/85 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-colors duration-150 active:scale-95"
          >
            <Plus size={12} /> Add Item
          </Button>
        </div>

        <div className="space-y-4">
          {commitments.map((comm, index) => (
            <div
              key={index}
              className="p-5 rounded-2xl bg-[#f8fafc]/30 border border-[#e2e8f0] space-y-4 relative group"
            >
              <Button
                type="button"
                onClick={() => removeCommitment(index)}
                variant="ghost"
                className="absolute top-2 right-2 h-8 w-8 p-0 rounded-lg text-destructive hover:bg-danger active:scale-95 transition-colors"
              >
                <Trash2 size={13} />
              </Button>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-extrabold text-muted-dark uppercase tracking-wider">
                    Icon Keyword
                  </label>
                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3 py-1 flex items-center">
                    <Input
                      type="text"
                      value={comm.iconName}
                      onChange={(e) =>
                        updateCommitment(index, 'iconName', e.target.value)
                      }
                      placeholder="Shield / UserCheck"
                      className="border-none bg-transparent shadow-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-xs font-semibold text-slate-800 w-full h-auto"
                    />
                  </div>
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[9px] font-extrabold text-muted-dark uppercase tracking-wider">
                    Title
                  </label>
                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3 py-1 flex items-center">
                    <Input
                      type="text"
                      value={comm.title}
                      onChange={(e) =>
                        updateCommitment(index, 'title', e.target.value)
                      }
                      placeholder="e.g. Secure payments"
                      className="border-none bg-transparent shadow-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-xs font-semibold text-slate-800 w-full h-auto"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-extrabold text-muted-dark uppercase tracking-wider">
                  Description
                </label>
                <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-3 flex items-start">
                  <Textarea
                    value={comm.description}
                    onChange={(e) =>
                      updateCommitment(index, 'description', e.target.value)
                    }
                    placeholder="Enter description explaining this commitment."
                    rows={2}
                    className="border-none bg-transparent shadow-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-xs font-semibold text-slate-800 w-full resize-y leading-normal min-h-0"
                  />
                </div>
              </div>
            </div>
          ))}
          {commitments.length === 0 && (
            <p className="text-[10px] font-bold text-muted-dark italic text-center py-4 bg-muted-light/20 rounded-xl">
              No commitments loaded. Click 'Add Item' to create one.
            </p>
          )}
        </div>
      </div>

      {/* Safety Tips List */}
      <div className="space-y-4 pt-6 border-t border-border/10">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-extrabold text-foreground/80 uppercase tracking-widest">
            Community Safety Guidelines ({safetyTips.length})
          </label>
          <Button
            type="button"
            onClick={addSafetyTip}
            className="h-8 px-3.5 rounded-full bg-dash-brand-light text-dash-brand hover:bg-dash-brand-light/85 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-colors duration-150 active:scale-95"
          >
            <Plus size={12} /> Add Tip
          </Button>
        </div>

        <div className="space-y-4">
          {safetyTips.map((tip, index) => (
            <div
              key={index}
              className="p-5 rounded-2xl bg-[#f8fafc]/30 border border-[#e2e8f0] space-y-4 relative group"
            >
              <Button
                type="button"
                onClick={() => removeSafetyTip(index)}
                variant="ghost"
                className="absolute top-2 right-2 h-8 w-8 p-0 rounded-lg text-destructive hover:bg-danger active:scale-95 transition-colors"
              >
                <Trash2 size={13} />
              </Button>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-extrabold text-muted-dark uppercase tracking-wider">
                    Icon Keyword
                  </label>
                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3 py-1 flex items-center">
                    <Input
                      type="text"
                      value={tip.iconName}
                      onChange={(e) =>
                        updateSafetyTip(index, 'iconName', e.target.value)
                      }
                      placeholder="MapPin / Flag"
                      className="border-none bg-transparent shadow-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-xs font-semibold text-slate-800 w-full h-auto"
                    />
                  </div>
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[9px] font-extrabold text-muted-dark uppercase tracking-wider">
                    Title
                  </label>
                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3 py-1 flex items-center">
                    <Input
                      type="text"
                      value={tip.title}
                      onChange={(e) =>
                        updateSafetyTip(index, 'title', e.target.value)
                      }
                      placeholder="e.g. Meet safely"
                      className="border-none bg-transparent shadow-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-xs font-semibold text-slate-800 w-full h-auto"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-extrabold text-muted-dark uppercase tracking-wider">
                  Description
                </label>
                <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-3 flex items-start">
                  <Textarea
                    value={tip.description}
                    onChange={(e) =>
                      updateSafetyTip(index, 'description', e.target.value)
                    }
                    placeholder="Enter safety tip instructions."
                    rows={2}
                    className="border-none bg-transparent shadow-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-xs font-semibold text-slate-800 w-full resize-y leading-normal min-h-0"
                  />
                </div>
              </div>
            </div>
          ))}
          {safetyTips.length === 0 && (
            <p className="text-[10px] font-bold text-muted-dark italic text-center py-4 bg-muted-light/20 rounded-xl">
              No safety tips loaded. Click 'Add Tip' to create one.
            </p>
          )}
        </div>
      </div>
    </TabsContent>
  )
}
