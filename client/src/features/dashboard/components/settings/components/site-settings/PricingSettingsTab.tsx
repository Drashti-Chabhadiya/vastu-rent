import { Info, Pencil, Sparkles, Plus, Trash2 } from 'lucide-react'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import { TabsContent } from '#/components/ui/tabs'
import { useSiteSettingsStore } from '../../../../../../store/useSiteSettingsStore'

export function PricingSettingsTab() {
  const {
    starterPrice,
    setStarterPrice,
    proPrice,
    setProPrice,
    businessPrice,
    setBusinessPrice,
    starterFeatures,
    proFeatures,
    businessFeatures,
    addFeature,
    removeFeature,
    updateFeatureText,
  } = useSiteSettingsStore()

  return (
    <TabsContent
      value="pricing"
      className="space-y-8 animate-in fade-in duration-300 outline-none overflow-y-auto flex-1 pr-2 max-h-[calc(100vh-27rem)] scrollbar-thin"
    >
      <div className="space-y-1">
        <h4 className="text-[14px] font-extrabold text-dash-brand flex items-center gap-2">
          <Info size={16} className="text-dash-brand" />
          Upgrade Plans & Billing Tiers
        </h4>
        <p className="text-[11px] font-semibold text-muted-dark leading-relaxed">
          Define the price for each monthly tier (in INR) and configure features.
        </p>
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Starter tier */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider block">
            Starter Price (INR)
          </label>
          <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-4 flex items-center justify-between focus-within:ring-2 focus-within:ring-dash-brand/10 focus-within:border-dash-brand transition-all">
            <div className="flex items-center gap-3.5 flex-1 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-dash-brand-light text-dash-brand flex items-center justify-center shrink-0 font-extrabold text-sm">
                ₹
              </div>
              <Input
                type="number"
                value={starterPrice}
                onChange={(e) => setStarterPrice(e.target.value)}
                className="border-none bg-transparent shadow-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm font-semibold text-slate-800 placeholder:text-muted-foreground/60 w-full h-auto"
              />
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-100/80 text-dash-brand flex items-center justify-center shrink-0">
              <Pencil size={12} />
            </div>
          </div>
        </div>

        {/* Pro tier */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider block">
            Pro Price (INR)
          </label>
          <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-4 flex items-center justify-between focus-within:ring-2 focus-within:ring-dash-brand/10 focus-within:border-dash-brand transition-all">
            <div className="flex items-center gap-3.5 flex-1 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-dash-brand-light text-dash-brand flex items-center justify-center shrink-0 font-extrabold text-sm">
                ₹
              </div>
              <Input
                type="number"
                value={proPrice}
                onChange={(e) => setProPrice(e.target.value)}
                className="border-none bg-transparent shadow-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm font-semibold text-slate-800 placeholder:text-muted-foreground/60 w-full h-auto"
              />
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-100/80 text-dash-brand flex items-center justify-center shrink-0">
              <Pencil size={12} />
            </div>
          </div>
        </div>

        {/* Business tier */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider block">
            Business Price (INR)
          </label>
          <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-4 flex items-center justify-between focus-within:ring-2 focus-within:ring-dash-brand/10 focus-within:border-dash-brand transition-all">
            <div className="flex items-center gap-3.5 flex-1 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-dash-brand-light text-dash-brand flex items-center justify-center shrink-0 font-extrabold text-sm">
                ₹
              </div>
              <Input
                type="number"
                value={businessPrice}
                onChange={(e) => setBusinessPrice(e.target.value)}
                className="border-none bg-transparent shadow-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm font-semibold text-slate-800 placeholder:text-muted-foreground/60 w-full h-auto"
              />
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-100/80 text-dash-brand flex items-center justify-center shrink-0">
              <Pencil size={12} />
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Features List */}
      <div className="space-y-6 pt-2">
        <h4 className="text-[12px] font-extrabold text-dash-brand uppercase tracking-wider border-b border-border/20 pb-2 flex items-center gap-2">
          <Sparkles size={14} className="text-dash-brand" />
          Plan Feature Matrices
        </h4>

        {/* Starter Features */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-extrabold text-muted-dark uppercase tracking-wider">
              Starter Plan Features ({starterFeatures.length})
            </label>
            <Button
              type="button"
              onClick={() => addFeature('starter')}
              className="h-8 px-3.5 rounded-full bg-dash-brand-light text-dash-brand hover:bg-dash-brand-light/85 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-colors duration-150 active:scale-95"
            >
              <Plus size={12} /> Add Feature
            </Button>
          </div>

          <div className="space-y-2.5">
            {starterFeatures.map((feat, index) => (
              <div
                key={index}
                className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-2.5 pl-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-dash-brand shrink-0" />
                  <Input
                    type="text"
                    value={feat}
                    onChange={(e) =>
                      updateFeatureText('starter', index, e.target.value)
                    }
                    placeholder="e.g. List up to 5 items"
                    className="border-none bg-transparent shadow-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm font-semibold text-slate-800 placeholder:text-muted-foreground/50 w-full h-auto"
                  />
                </div>
                <Button
                  type="button"
                  onClick={() => removeFeature('starter', index)}
                  variant="ghost"
                  className="h-9 w-9 p-0 rounded-xl text-destructive hover:bg-danger shrink-0 active:scale-95 transition-colors"
                >
                  <Trash2 size={15} />
                </Button>
              </div>
            ))}
            {starterFeatures.length === 0 && (
              <p className="text-[10px] font-bold text-muted-dark italic text-center py-3.5 bg-muted-light/20 rounded-xl">
                No features configured. Click 'Add Feature' to start.
              </p>
            )}
          </div>
        </div>

        {/* Pro Features */}
        <div className="space-y-3.5 pt-4 border-t border-border/10">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-extrabold text-muted-dark uppercase tracking-wider">
              Pro Plan Features ({proFeatures.length})
            </label>
            <Button
              type="button"
              onClick={() => addFeature('pro')}
              className="h-8 px-3.5 rounded-full bg-dash-brand-light text-dash-brand hover:bg-dash-brand-light/85 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-colors duration-150 active:scale-95"
            >
              <Plus size={12} /> Add Feature
            </Button>
          </div>

          <div className="space-y-2.5">
            {proFeatures.map((feat, index) => (
              <div
                key={index}
                className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-2.5 pl-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-dash-brand shrink-0" />
                  <Input
                    type="text"
                    value={feat}
                    onChange={(e) =>
                      updateFeatureText('pro', index, e.target.value)
                    }
                    placeholder="e.g. Priority support"
                    className="border-none bg-transparent shadow-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm font-semibold text-slate-800 placeholder:text-muted-foreground/50 w-full h-auto"
                  />
                </div>
                <Button
                  type="button"
                  onClick={() => removeFeature('pro', index)}
                  variant="ghost"
                  className="h-9 w-9 p-0 rounded-xl text-destructive hover:bg-danger shrink-0 active:scale-95 transition-colors"
                >
                  <Trash2 size={15} />
                </Button>
              </div>
            ))}
            {proFeatures.length === 0 && (
              <p className="text-[10px] font-bold text-muted-dark italic text-center py-3.5 bg-muted-light/20 rounded-xl">
                No features configured. Click 'Add Feature' to start.
              </p>
            )}
          </div>
        </div>

        {/* Business Features */}
        <div className="space-y-3.5 pt-4 border-t border-border/10">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-extrabold text-muted-dark uppercase tracking-wider">
              Business Plan Features ({businessFeatures.length})
            </label>
            <Button
              type="button"
              onClick={() => addFeature('business')}
              className="h-8 px-3.5 rounded-full bg-dash-brand-light text-dash-brand hover:bg-dash-brand-light/85 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-colors duration-150 active:scale-95"
            >
              <Plus size={12} /> Add Feature
            </Button>
          </div>

          <div className="space-y-2.5">
            {businessFeatures.map((feat, index) => (
              <div
                key={index}
                className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-2.5 pl-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-dash-brand shrink-0" />
                  <Input
                    type="text"
                    value={feat}
                    onChange={(e) =>
                      updateFeatureText('business', index, e.target.value)
                    }
                    placeholder="e.g. Unlimited listings"
                    className="border-none bg-transparent shadow-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm font-semibold text-slate-800 placeholder:text-muted-foreground/50 w-full h-auto"
                  />
                </div>
                <Button
                  type="button"
                  onClick={() => removeFeature('business', index)}
                  variant="ghost"
                  className="h-9 w-9 p-0 rounded-xl text-destructive hover:bg-danger shrink-0 active:scale-95 transition-colors"
                >
                  <Trash2 size={15} />
                </Button>
              </div>
            ))}
            {businessFeatures.length === 0 && (
              <p className="text-[10px] font-bold text-muted-dark italic text-center py-3.5 bg-muted-light/20 rounded-xl">
                No features configured. Click 'Add Feature' to start.
              </p>
            )}
          </div>
        </div>
      </div>
    </TabsContent>
  )
}
