import { AlignLeft, Calendar, Pencil, Plus, Trash2 } from 'lucide-react'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
import { Button } from '#/components/ui/button'
import { TabsContent } from '#/components/ui/tabs'
import { useSiteSettingsStore } from '../../../../../../store/useSiteSettingsStore'

export function TermsSettingsTab() {
  const {
    termsLastUpdated,
    setTermsLastUpdated,
    termsSections,
    addTermsSection,
    removeTermsSection,
    updateTermsSection,
  } = useSiteSettingsStore()

  return (
    <TabsContent
      value="terms"
      className="space-y-8 animate-in fade-in duration-300 outline-none overflow-y-auto flex-1 pr-2 max-h-[calc(100vh-27rem)] scrollbar-thin"
    >
      <div className="space-y-1">
        <h4 className="text-[14px] font-extrabold text-dash-brand flex items-center gap-2">
          <AlignLeft size={16} className="text-dash-brand" />
          Terms of Service Sections
        </h4>
        <p className="text-[11px] font-semibold text-muted-dark leading-relaxed">
          Configure formal legal agreements and documentation sections
          dynamically. Use standard Enter key to create paragraph breaks.
        </p>
      </div>

      {/* Last updated field */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider block">
          Document Last Updated Date
        </label>
        <div className="bg-muted-light border border-border rounded-2xl p-4 flex items-center justify-between focus-within:ring-2 focus-within:ring-dash-brand/10 focus-within:border-dash-brand transition-all">
          <div className="flex items-center gap-3.5 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-dash-brand-light text-dash-brand flex items-center justify-center shrink-0">
              <Calendar size={16} />
            </div>
            <Input
              type="text"
              value={termsLastUpdated}
              onChange={(e) => setTermsLastUpdated(e.target.value)}
              placeholder="e.g. 28 May 2026"
              className="border-none bg-transparent shadow-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm font-semibold text-slate-800 placeholder:text-muted-foreground/60 w-full h-auto"
            />
          </div>
          <div className="w-8 h-8 rounded-lg bg-slate-100/80 text-dash-brand flex items-center justify-center shrink-0">
            <Pencil size={12} />
          </div>
        </div>
      </div>

      {/* Dynamic Legal Sections */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-extrabold text-foreground/80 uppercase tracking-widest">
            Legal Content Sections ({termsSections.length})
          </label>
          <Button
            type="button"
            onClick={addTermsSection}
            className="group h-8 px-3.5 rounded-full bg-brand-green-bubble text-brand-primary-deep hover:bg-brand-green-bubble/80 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all duration-150 active:scale-[0.98] border-none"
          >
            Add Section
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-primary-deep/10 transition-transform group-hover:translate-x-1 ml-1">
              <Plus size={10} strokeWidth={3} />
            </span>
          </Button>
        </div>

        <div className="space-y-4">
          {termsSections.map((sec, index) => (
            <div
              key={index}
              className="p-5 rounded-2xl bg-muted-light/30 border border-border space-y-4 relative group"
            >
              <Button
                type="button"
                onClick={() => removeTermsSection(index)}
                variant="ghost"
                className="absolute top-2 right-2 h-8 w-8 p-0 rounded-lg text-destructive hover:bg-danger active:scale-95 transition-colors"
              >
                <Trash2 size={13} />
              </Button>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-extrabold text-muted-dark uppercase tracking-wider">
                    Unique Anchor ID
                  </label>
                  <div className="bg-muted-light border border-border rounded-xl px-3 py-1 flex items-center">
                    <Input
                      type="text"
                      value={sec.id}
                      onChange={(e) =>
                        updateTermsSection(index, 'id', e.target.value)
                      }
                      placeholder="e.g. refunds"
                      className="border-none bg-transparent shadow-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-xs font-semibold text-slate-800 w-full h-auto"
                    />
                  </div>
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[9px] font-extrabold text-muted-dark uppercase tracking-wider">
                    Section Title
                  </label>
                  <div className="bg-muted-light border border-border rounded-xl px-3 py-1 flex items-center">
                    <Input
                      type="text"
                      value={sec.title}
                      onChange={(e) =>
                        updateTermsSection(index, 'title', e.target.value)
                      }
                      placeholder="e.g. 5. Refund Policy"
                      className="border-none bg-transparent shadow-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-xs font-semibold text-slate-800 w-full h-auto"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-extrabold text-muted-dark uppercase tracking-wider">
                  Content Body
                </label>
                <div className="bg-muted-light border border-border rounded-xl p-3 flex items-start">
                  <Textarea
                    value={sec.content}
                    onChange={(e) =>
                      updateTermsSection(index, 'content', e.target.value)
                    }
                    placeholder="Insert paragraph block content here. Hit enter for linebreaks."
                    rows={5}
                    className="border-none bg-transparent shadow-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-xs font-semibold text-slate-800 w-full resize-y leading-relaxed min-h-0"
                  />
                </div>
              </div>
            </div>
          ))}
          {termsSections.length === 0 && (
            <p className="text-[10px] font-bold text-muted-dark italic text-center py-4 bg-muted-light/20 rounded-xl">
              No terms sections loaded. Click 'Add Section' to write one.
            </p>
          )}
        </div>
      </div>
    </TabsContent>
  )
}
