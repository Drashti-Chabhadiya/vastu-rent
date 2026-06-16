import { Mail, Phone, MapPin, Pencil, Info } from 'lucide-react'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
import { TabsContent } from '#/components/ui/tabs'
import { useSiteSettingsStore } from '../../../../../../store/useSiteSettingsStore'

export function ContactSettingsTab() {
  const {
    contactEmail,
    setContactEmail,
    contactPhone,
    setContactPhone,
    contactAddress,
    setContactAddress,
    contactDescription,
    setContactDescription,
  } = useSiteSettingsStore()

  return (
    <TabsContent
      value="contact"
      className="space-y-6 animate-in fade-in duration-300 outline-none overflow-y-auto flex-1 pr-2 max-h-[calc(100vh-27rem)] scrollbar-thin"
    >
      <div className="space-y-1">
        <h4 className="text-[14px] font-extrabold text-dash-brand flex items-center gap-2">
          <Mail size={16} className="text-dash-brand" />
          Contact Information Details
        </h4>
        <p className="text-[11px] font-semibold text-muted-dark leading-relaxed">
          These details appear on the public Contact Us page.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Support Email Address */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider block">
            Support Email Address
          </label>
          <div className="bg-muted-light border border-border rounded-2xl p-4 flex items-center justify-between focus-within:ring-2 focus-within:ring-dash-brand/10 focus-within:border-dash-brand transition-all">
            <div className="flex items-center gap-3.5 flex-1 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-dash-brand-light text-dash-brand flex items-center justify-center shrink-0">
                <Mail size={16} />
              </div>
              <Input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="support@vastu.com"
                className="border-none bg-transparent shadow-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm font-semibold text-slate-800 placeholder:text-muted-foreground/60 w-full h-auto"
              />
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-100/80 text-dash-brand flex items-center justify-center shrink-0">
              <Pencil size={12} />
            </div>
          </div>
        </div>

        {/* Support Phone Number */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider block">
            Support Phone Number
          </label>
          <div className="bg-muted-light border border-border rounded-2xl p-4 flex items-center justify-between focus-within:ring-2 focus-within:ring-dash-brand/10 focus-within:border-dash-brand transition-all">
            <div className="flex items-center gap-3.5 flex-1 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-dash-brand-light text-dash-brand flex items-center justify-center shrink-0">
                <Phone size={16} />
              </div>
              <Input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="border-none bg-transparent shadow-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm font-semibold text-slate-800 placeholder:text-muted-foreground/60 w-full h-auto"
              />
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-100/80 text-dash-brand flex items-center justify-center shrink-0">
              <Pencil size={12} />
            </div>
          </div>
        </div>
      </div>

      {/* Contact Page Hero Description */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider block flex items-center gap-1">
          ✨ Contact Page Hero Description
        </label>
        <div className="bg-muted-light border border-border rounded-2xl p-4 flex items-start justify-between focus-within:ring-2 focus-within:ring-dash-brand/10 focus-within:border-dash-brand transition-all">
          <Textarea
            value={contactDescription}
            onChange={(e) => setContactDescription(e.target.value)}
            placeholder="Have a question, suggestion, or need help? Our team is here to support you."
            rows={3}
            className="border-none bg-transparent shadow-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm font-semibold text-slate-800 placeholder:text-muted-foreground/60 w-full resize-y leading-relaxed min-h-0"
          />
          <div className="w-8 h-8 rounded-lg bg-slate-100/80 text-dash-brand flex items-center justify-center shrink-0 ml-3">
            <Pencil size={12} />
          </div>
        </div>
      </div>

      {/* Office Address */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider block">
          Office Address
        </label>
        <div className="bg-muted-light border border-border rounded-2xl p-4 flex items-center justify-between focus-within:ring-2 focus-within:ring-dash-brand/10 focus-within:border-dash-brand transition-all">
          <div className="flex items-center gap-3.5 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-dash-brand-light text-dash-brand flex items-center justify-center shrink-0">
              <MapPin size={16} />
            </div>
            <Input
              type="text"
              value={contactAddress}
              onChange={(e) => setContactAddress(e.target.value)}
              placeholder="Vastu HQ, 123 Harmony Lane, Bengaluru, Karnataka 560001, India"
              className="border-none bg-transparent shadow-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm font-semibold text-slate-800 placeholder:text-muted-foreground/60 w-full h-auto"
            />
          </div>
          <div className="w-8 h-8 rounded-lg bg-slate-100/80 text-dash-brand flex items-center justify-center shrink-0">
            <Pencil size={12} />
          </div>
        </div>
      </div>

      {/* Bottom Info Banner */}
      <div className="bg-dash-brand-light/30 border border-dash-brand/10 rounded-2xl p-4.5 flex items-start gap-3.5 mt-8">
        <div className="w-9 h-9 rounded-full bg-dash-brand-light text-dash-brand flex items-center justify-center shrink-0 mt-0.5">
          <Info size={18} />
        </div>
        <div>
          <span className="text-sm font-bold text-dash-brand block">
            Changes Reflect Instantly
          </span>
          <span className="text-xs text-slate-600 block mt-1 font-semibold leading-relaxed">
            Any updates you make here will be visible on the live site
            immediately.
          </span>
        </div>
      </div>
    </TabsContent>
  )
}
