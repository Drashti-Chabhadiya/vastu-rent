import { useState, useEffect } from 'react'
import {
  Plus,
  Trash2,
  Mail,
  AlignLeft,
  Info,
  HelpCircle,
  Phone,
  MapPin,
  Pencil,
  Save,
  Calendar,
  Sparkles,
} from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
import { useSettings, useUpdateSettings } from '#/hook'
import { toast } from 'sonner'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '#/components/ui/tabs'

export const SiteSettingsForm = () => {
  const { data: settings, isLoading } = useSettings()
  const updateSettings = useUpdateSettings()

  const [activeTab, setActiveTab] = useState<
    'contact' | 'pricing' | 'trust' | 'terms'
  >('contact')

  // Contact States
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactAddress, setContactAddress] = useState('')
  const [contactDescription, setContactDescription] = useState('')

  // Pricing States
  const [starterPrice, setStarterPrice] = useState<number | string>(0)
  const [proPrice, setProPrice] = useState<number | string>(499)
  const [businessPrice, setBusinessPrice] = useState<number | string>(999)

  const [starterFeatures, setStarterFeatures] = useState<string[]>([])
  const [proFeatures, setProFeatures] = useState<string[]>([])
  const [businessFeatures, setBusinessFeatures] = useState<string[]>([])

  // Trust States
  const [commitments, setCommitments] = useState<
    Array<{ iconName: string; title: string; description: string }>
  >([])
  const [safetyTips, setSafetyTips] = useState<
    Array<{ iconName: string; title: string; description: string }>
  >([])

  // Terms States
  const [termsLastUpdated, setTermsLastUpdated] = useState('')
  const [termsSections, setTermsSections] = useState<
    Array<{ id: string; title: string; content: string }>
  >([])

  // Initialize fields once settings data loads
  useEffect(() => {
    if (settings) {
      // Contact
      setContactEmail(settings.contact?.email || 'support@vastu.com')
      setContactPhone(settings.contact?.phone || '+91 98765 43210')
      setContactAddress(settings.contact?.address || '')
      setContactDescription(settings.contact?.description || '')

      // Pricing
      setStarterPrice(
        settings.pricing?.starterPrice !== undefined
          ? settings.pricing.starterPrice
          : 0,
      )
      setProPrice(
        settings.pricing?.proPrice !== undefined
          ? settings.pricing.proPrice
          : 499,
      )
      setBusinessPrice(
        settings.pricing?.businessPrice !== undefined
          ? settings.pricing.businessPrice
          : 999,
      )

      setStarterFeatures(settings.pricing?.starterFeatures || [])
      setProFeatures(settings.pricing?.proFeatures || [])
      setBusinessFeatures(settings.pricing?.businessFeatures || [])

      // Trust
      setCommitments(settings.trust?.commitments || [])
      setSafetyTips(settings.trust?.safetyTips || [])

      // Terms
      setTermsLastUpdated(settings.terms?.lastUpdated || '')
      setTermsSections(settings.terms?.sections || [])
    }
  }, [settings])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      contact: {
        email: contactEmail,
        phone: contactPhone,
        address: contactAddress,
        description: contactDescription,
      },
      pricing: {
        starterPrice: Number(starterPrice),
        proPrice: Number(proPrice),
        businessPrice: Number(businessPrice),
        starterFeatures: starterFeatures.filter((f) => f.trim() !== ''),
        proFeatures: proFeatures.filter((f) => f.trim() !== ''),
        businessFeatures: businessFeatures.filter((f) => f.trim() !== ''),
      },
      trust: {
        commitments,
        safetyTips,
      },
      terms: {
        lastUpdated: termsLastUpdated,
        sections: termsSections,
      },
    }

    updateSettings.mutate(payload, {
      onSuccess: () => {
        toast.success('Site Content Settings saved successfully! 🌐')
      },
      onError: (err: any) => {
        toast.error(
          err.response?.data?.message ||
            err.message ||
            'Failed to save settings. Please try again.',
        )
      },
    })
  }

  // Feature Helpers
  const addFeature = (plan: 'starter' | 'pro' | 'business') => {
    if (plan === 'starter') setStarterFeatures([...starterFeatures, ''])
    if (plan === 'pro') setProFeatures([...proFeatures, ''])
    if (plan === 'business') setBusinessFeatures([...businessFeatures, ''])
  }

  const removeFeature = (
    plan: 'starter' | 'pro' | 'business',
    index: number,
  ) => {
    if (plan === 'starter')
      setStarterFeatures(starterFeatures.filter((_, i) => i !== index))
    if (plan === 'pro')
      setProFeatures(proFeatures.filter((_, i) => i !== index))
    if (plan === 'business')
      setBusinessFeatures(businessFeatures.filter((_, i) => i !== index))
  }

  const updateFeatureText = (
    plan: 'starter' | 'pro' | 'business',
    index: number,
    value: string,
  ) => {
    if (plan === 'starter') {
      const updated = [...starterFeatures]
      updated[index] = value
      setStarterFeatures(updated)
    }
    if (plan === 'pro') {
      const updated = [...proFeatures]
      updated[index] = value
      setProFeatures(updated)
    }
    if (plan === 'business') {
      const updated = [...businessFeatures]
      updated[index] = value
      setBusinessFeatures(updated)
    }
  }

  // Trust/Commitments Helpers
  const addCommitment = () => {
    setCommitments([
      ...commitments,
      { iconName: 'Shield', title: '', description: '' },
    ])
  }

  const removeCommitment = (index: number) => {
    setCommitments(commitments.filter((_, i) => i !== index))
  }

  const updateCommitment = (
    index: number,
    field: 'iconName' | 'title' | 'description',
    value: string,
  ) => {
    const updated = [...commitments]
    updated[index] = { ...updated[index], [field]: value }
    setCommitments(updated)
  }

  // Safety Tips Helpers
  const addSafetyTip = () => {
    setSafetyTips([
      ...safetyTips,
      { iconName: 'MessageSquare', title: '', description: '' },
    ])
  }

  const removeSafetyTip = (index: number) => {
    setSafetyTips(safetyTips.filter((_, i) => i !== index))
  }

  const updateSafetyTip = (
    index: number,
    field: 'iconName' | 'title' | 'description',
    value: string,
  ) => {
    const updated = [...safetyTips]
    updated[index] = { ...updated[index], [field]: value }
    setSafetyTips(updated)
  }

  // Terms Section Helpers
  const addTermsSection = () => {
    const randomId = `section_${Math.random().toString(36).substr(2, 9)}`
    setTermsSections([
      ...termsSections,
      { id: randomId, title: '', content: '' },
    ])
  }

  const removeTermsSection = (index: number) => {
    setTermsSections(termsSections.filter((_, i) => i !== index))
  }

  const updateTermsSection = (
    index: number,
    field: 'id' | 'title' | 'content',
    value: string,
  ) => {
    const updated = [...termsSections]
    updated[index] = { ...updated[index], [field]: value }
    setTermsSections(updated)
  }

  const hasChanges = (() => {
    if (!settings) return false
    
    // Contact details check
    if (contactEmail !== (settings.contact?.email || 'support@vastu.com')) return true
    if (contactPhone !== (settings.contact?.phone || '+91 98765 43210')) return true
    if (contactAddress !== (settings.contact?.address || '')) return true
    if (contactDescription !== (settings.contact?.description || '')) return true

    // Pricing details check
    if (Number(starterPrice) !== Number(settings.pricing?.starterPrice ?? 0)) return true
    if (Number(proPrice) !== Number(settings.pricing?.proPrice ?? 499)) return true
    if (Number(businessPrice) !== Number(settings.pricing?.businessPrice ?? 999)) return true

    // Features check (shallow array comparison)
    const initStarter = settings.pricing?.starterFeatures || []
    if (starterFeatures.length !== initStarter.length || starterFeatures.some((f, i) => f !== initStarter[i])) return true

    const initPro = settings.pricing?.proFeatures || []
    if (proFeatures.length !== initPro.length || proFeatures.some((f, i) => f !== initPro[i])) return true

    const initBusiness = settings.pricing?.businessFeatures || []
    if (businessFeatures.length !== initBusiness.length || businessFeatures.some((f, i) => f !== initBusiness[i])) return true

    // Trust check
    const initCommitments = settings.trust?.commitments || []
    if (JSON.stringify(commitments) !== JSON.stringify(initCommitments)) return true

    const initSafety = settings.trust?.safetyTips || []
    if (JSON.stringify(safetyTips) !== JSON.stringify(initSafety)) return true

    // Terms check
    if (termsLastUpdated !== (settings.terms?.lastUpdated || '')) return true
    const initTerms = settings.terms?.sections || []
    if (JSON.stringify(termsSections) !== JSON.stringify(initTerms)) return true

    return false
  })()

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-4 bg-muted/40 rounded-md w-36" />
            <div className="h-3 bg-muted/30 rounded-md w-64" />
          </div>
          <div className="h-10 bg-muted/40 rounded-full w-28" />
        </div>
        <div className="h-10 bg-muted-light/60 rounded-xl w-full" />
        <div className="space-y-4">
          <div className="h-12 bg-muted/20 rounded-2xl w-full" />
          <div className="h-12 bg-muted/20 rounded-2xl w-full" />
          <div className="h-32 bg-muted/20 rounded-2xl w-full" />
        </div>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSave}
      className="flex flex-col h-full space-y-6 animate-in fade-in duration-300"
    >
      {/* Title Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/10">
        <div>
          <h3 className="text-xl font-extrabold text-dash-brand font-display tracking-tight leading-none">
            Site Content Settings
          </h3>
          <p className="text-[12px] font-semibold text-muted-dark mt-2">
            Manage public-facing marketing copy dynamically.
          </p>
        </div>
        <Button
          type="submit"
          disabled={!hasChanges || updateSettings.isPending}
          className="bg-dash-brand hover:bg-dash-brand/90 text-primary-foreground rounded-[12px] px-6 h-11 text-xs font-black flex items-center gap-2 shadow-md shadow-dash-brand/10 cursor-pointer transition-all active:scale-95 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-dash-brand"
        >
          <Save size={13} />
          {updateSettings.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Pill Sub-Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(val: any) => setActiveTab(val)}
        className="w-full flex flex-col flex-1 min-h-0 space-y-6"
      >
        <TabsList className="w-full flex p-1 rounded-full bg-[#f8fafc] border border-[#e2e8f0] h-auto justify-between mb-8">
          <TabsTrigger
            value="contact"
            className="flex-1 py-2.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-all data-[state=active]:bg-dash-brand data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm border border-transparent text-[#334155] hover:text-dash-brand cursor-pointer"
          >
            Contact
          </TabsTrigger>
          <TabsTrigger
            value="pricing"
            className="flex-1 py-2.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-all data-[state=active]:bg-dash-brand data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm border border-transparent text-[#334155] hover:text-dash-brand cursor-pointer"
          >
            Pricing
          </TabsTrigger>
          <TabsTrigger
            value="trust"
            className="flex-1 py-2.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-all data-[state=active]:bg-dash-brand data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm border border-transparent text-[#334155] hover:text-dash-brand cursor-pointer"
          >
            Trust
          </TabsTrigger>
          <TabsTrigger
            value="terms"
            className="flex-1 py-2.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-all data-[state=active]:bg-dash-brand data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm border border-transparent text-[#334155] hover:text-dash-brand cursor-pointer"
          >
            Terms
          </TabsTrigger>
        </TabsList>

        {/* Content for CONTACT Tab */}
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
              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-4 flex items-center justify-between focus-within:ring-2 focus-within:ring-dash-brand/10 focus-within:border-dash-brand transition-all">
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
              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-4 flex items-center justify-between focus-within:ring-2 focus-within:ring-dash-brand/10 focus-within:border-dash-brand transition-all">
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
            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-4 flex items-start justify-between focus-within:ring-2 focus-within:ring-dash-brand/10 focus-within:border-dash-brand transition-all">
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
            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-4 flex items-center justify-between focus-within:ring-2 focus-within:ring-dash-brand/10 focus-within:border-dash-brand transition-all">
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
                Any updates you make here will be visible on the live site immediately.
              </span>
            </div>
          </div>
        </TabsContent>

        {/* Content for PRICING Tab */}
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
                  <div key={index} className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-2.5 pl-4 flex items-center justify-between">
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-dash-brand shrink-0" />
                      <Input
                        type="text"
                        value={feat}
                        onChange={(e) => updateFeatureText('starter', index, e.target.value)}
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
                  <div key={index} className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-2.5 pl-4 flex items-center justify-between">
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-dash-brand shrink-0" />
                      <Input
                        type="text"
                        value={feat}
                        onChange={(e) => updateFeatureText('pro', index, e.target.value)}
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
                  <div key={index} className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-2.5 pl-4 flex items-center justify-between">
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-dash-brand shrink-0" />
                      <Input
                        type="text"
                        value={feat}
                        onChange={(e) => updateFeatureText('business', index, e.target.value)}
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

        {/* Content for TRUST Tab */}
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
                          onChange={(e) => updateCommitment(index, 'iconName', e.target.value)}
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
                          onChange={(e) => updateCommitment(index, 'title', e.target.value)}
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
                        onChange={(e) => updateCommitment(index, 'description', e.target.value)}
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
                          onChange={(e) => updateSafetyTip(index, 'iconName', e.target.value)}
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
                          onChange={(e) => updateSafetyTip(index, 'title', e.target.value)}
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
                        onChange={(e) => updateSafetyTip(index, 'description', e.target.value)}
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

        {/* Content for TERMS Tab */}
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
              Configure formal legal agreements and documentation sections dynamically. Use standard Enter key to create paragraph breaks.
            </p>
          </div>

          {/* Last updated field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider block">
              Document Last Updated Date
            </label>
            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-4 flex items-center justify-between focus-within:ring-2 focus-within:ring-dash-brand/10 focus-within:border-dash-brand transition-all">
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
                className="h-8 px-3.5 rounded-full bg-[#e6f4ea] text-[#0a5c36] hover:bg-[#d0eed8] text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-colors duration-150 active:scale-95"
              >
                <Plus size={12} /> Add Section
              </Button>
            </div>

            <div className="space-y-4">
              {termsSections.map((sec, index) => (
                <div
                  key={index}
                  className="p-5 rounded-2xl bg-[#f8fafc]/30 border border-[#e2e8f0] space-y-4 relative group"
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
                      <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3 py-1 flex items-center">
                        <Input
                          type="text"
                          value={sec.id}
                          onChange={(e) => updateTermsSection(index, 'id', e.target.value)}
                          placeholder="e.g. refunds"
                          className="border-none bg-transparent shadow-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-xs font-semibold text-slate-800 w-full h-auto"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[9px] font-extrabold text-muted-dark uppercase tracking-wider">
                        Section Title
                      </label>
                      <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3 py-1 flex items-center">
                        <Input
                          type="text"
                          value={sec.title}
                          onChange={(e) => updateTermsSection(index, 'title', e.target.value)}
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
                    <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-3 flex items-start">
                      <Textarea
                        value={sec.content}
                        onChange={(e) => updateTermsSection(index, 'content', e.target.value)}
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
      </Tabs>
    </form>
  )
}
