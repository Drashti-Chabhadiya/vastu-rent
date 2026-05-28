import { useState, useEffect } from 'react'
import { Plus, Trash2, Mail, AlignLeft, Info, HelpCircle } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
import { useSettings, useUpdateSettings } from '#/hook'
import { toast } from 'sonner'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '#/components/ui/tabs'

export const SiteSettingsForm = () => {
  const { data: settings, isLoading } = useSettings()
  const updateSettings = useUpdateSettings()

  const [activeTab, setActiveTab] = useState<'contact' | 'pricing' | 'trust' | 'terms'>('contact')

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
  const [commitments, setCommitments] = useState<Array<{ iconName: string; title: string; description: string }>>([])
  const [safetyTips, setSafetyTips] = useState<Array<{ iconName: string; title: string; description: string }>>([])

  // Terms States
  const [termsLastUpdated, setTermsLastUpdated] = useState('')
  const [termsSections, setTermsSections] = useState<Array<{ id: string; title: string; content: string }>>([])

  // Initialize fields once settings data loads
  useEffect(() => {
    if (settings) {
      // Contact
      setContactEmail(settings.contact?.email || 'support@vastu.com')
      setContactPhone(settings.contact?.phone || '+91 98765 43210')
      setContactAddress(settings.contact?.address || '')
      setContactDescription(settings.contact?.description || '')

      // Pricing
      setStarterPrice(settings.pricing?.starterPrice !== undefined ? settings.pricing.starterPrice : 0)
      setProPrice(settings.pricing?.proPrice !== undefined ? settings.pricing.proPrice : 499)
      setBusinessPrice(settings.pricing?.businessPrice !== undefined ? settings.pricing.businessPrice : 999)

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
            'Failed to save settings. Please try again.'
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

  const removeFeature = (plan: 'starter' | 'pro' | 'business', index: number) => {
    if (plan === 'starter') setStarterFeatures(starterFeatures.filter((_, i) => i !== index))
    if (plan === 'pro') setProFeatures(proFeatures.filter((_, i) => i !== index))
    if (plan === 'business') setBusinessFeatures(businessFeatures.filter((_, i) => i !== index))
  }

  const updateFeatureText = (plan: 'starter' | 'pro' | 'business', index: number, value: string) => {
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
    setCommitments([...commitments, { iconName: 'Shield', title: '', description: '' }])
  }

  const removeCommitment = (index: number) => {
    setCommitments(commitments.filter((_, i) => i !== index))
  }

  const updateCommitment = (index: number, field: 'iconName' | 'title' | 'description', value: string) => {
    const updated = [...commitments]
    updated[index] = { ...updated[index], [field]: value }
    setCommitments(updated)
  }

  // Safety Tips Helpers
  const addSafetyTip = () => {
    setSafetyTips([...safetyTips, { iconName: 'MessageSquare', title: '', description: '' }])
  }

  const removeSafetyTip = (index: number) => {
    setSafetyTips(safetyTips.filter((_, i) => i !== index))
  }

  const updateSafetyTip = (index: number, field: 'iconName' | 'title' | 'description', value: string) => {
    const updated = [...safetyTips]
    updated[index] = { ...updated[index], [field]: value }
    setSafetyTips(updated)
  }

  // Terms Section Helpers
  const addTermsSection = () => {
    const randomId = `section_${Math.random().toString(36).substr(2, 9)}`
    setTermsSections([...termsSections, { id: randomId, title: '', content: '' }])
  }

  const removeTermsSection = (index: number) => {
    setTermsSections(termsSections.filter((_, i) => i !== index))
  }

  const updateTermsSection = (index: number, field: 'id' | 'title' | 'content', value: string) => {
    const updated = [...termsSections]
    updated[index] = { ...updated[index], [field]: value }
    setTermsSections(updated)
  }

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
    <form onSubmit={handleSave} className="space-y-8 animate-in fade-in duration-300">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[16px] font-black text-foreground/90">
            Site Content Settings
          </h3>
          <p className="text-[11px] font-bold text-muted-dark">
            Manage public-facing marketing copy dynamically.
          </p>
        </div>
        <Button
          type="submit"
          disabled={updateSettings.isPending}
          className="bg-dash-brand hover:bg-dash-brand/90 text-primary-foreground font-black text-[11px] px-6 h-11 rounded-full transition-all shadow-md shadow-dash-brand/10 active:scale-95 cursor-pointer"
        >
          {updateSettings.isPending ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      {/* Pill Sub-Tabs */}
      <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)} className="w-full space-y-8">
        <TabsList className="w-full flex p-1.5 rounded-2xl bg-muted-light/80 border border-border/30 h-auto">
          <TabsTrigger
            value="contact"
            className="flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all data-[state=active]:bg-card data-[state=active]:text-dash-brand data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-border/10 text-muted-dark hover:text-foreground/80 cursor-pointer"
          >
            Contact
          </TabsTrigger>
          <TabsTrigger
            value="pricing"
            className="flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all data-[state=active]:bg-card data-[state=active]:text-dash-brand data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-border/10 text-muted-dark hover:text-foreground/80 cursor-pointer"
          >
            Pricing
          </TabsTrigger>
          <TabsTrigger
            value="trust"
            className="flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all data-[state=active]:bg-card data-[state=active]:text-dash-brand data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-border/10 text-muted-dark hover:text-foreground/80 cursor-pointer"
          >
            Trust
          </TabsTrigger>
          <TabsTrigger
            value="terms"
            className="flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all data-[state=active]:bg-card data-[state=active]:text-dash-brand data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-border/10 text-muted-dark hover:text-foreground/80 cursor-pointer"
          >
            Terms
          </TabsTrigger>
        </TabsList>

        {/* Content for CONTACT Tab */}
        <TabsContent value="contact" className="space-y-6 animate-in fade-in duration-300 outline-none">
          <div className="space-y-4">
            <h4 className="text-[13px] font-black text-foreground/80 flex items-center gap-1.5">
              <Mail size={15} className="text-dash-brand" />
              Contact Information Details
            </h4>
            <p className="text-[10px] font-semibold text-muted-dark leading-relaxed">
              These details are loaded dynamically on the public Contact Us page. Ensure support communication channels are valid.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-dark uppercase tracking-widest block">
                Support Email Address
              </label>
              <Input
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="support@vastu.com"
                className="h-12 bg-muted-light border-none rounded-2xl text-[12px] font-bold text-foreground px-5 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-dark uppercase tracking-widest block">
                Support Phone Number
              </label>
              <Input
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="h-12 bg-muted-light border-none rounded-2xl text-[12px] font-bold text-foreground px-5 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-dark uppercase tracking-widest block">
              Contact Page Hero Description
            </label>
            <Textarea
              value={contactDescription}
              onChange={(e) => setContactDescription(e.target.value)}
              placeholder="Have a question, suggestion, or need help? Our team is here to support you."
              rows={3}
              className="bg-muted-light border-none rounded-2xl text-[12px] font-bold text-foreground p-5 focus:ring-2 focus:ring-emerald-500/20 resize-none leading-relaxed"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-dark uppercase tracking-widest block">
              Office Address
            </label>
            <Textarea
              value={contactAddress}
              onChange={(e) => setContactAddress(e.target.value)}
              placeholder="Vastu HQ, 123 Harmony Lane, Bengaluru, Karnataka 560001, India"
              rows={3}
              className="bg-muted-light border-none rounded-2xl text-[12px] font-bold text-foreground p-5 focus:ring-2 focus:ring-emerald-500/20 resize-none leading-relaxed"
            />
          </div>
        </TabsContent>

        {/* Content for PRICING Tab */}
        <TabsContent value="pricing" className="space-y-8 animate-in fade-in duration-300 outline-none">
          <div className="space-y-4">
            <h4 className="text-[13px] font-black text-foreground/80 flex items-center gap-1.5">
              <Info size={15} className="text-dash-brand" />
              Upgrade Plans & Billing Tiers
            </h4>
            <p className="text-[10px] font-semibold text-muted-dark leading-relaxed">
              Define the price for each monthly tier (in INR). Add or edit plan features dynamically.
            </p>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Starter tier */}
            <div className="p-5 rounded-2xl bg-muted-light/40 border border-border/30 space-y-4">
              <span className="text-[9px] font-black bg-muted-light text-muted-dark px-2.5 py-1 rounded-full uppercase tracking-wider">
                Starter Tier
              </span>
              <div className="space-y-2 pt-2">
                <label className="text-[10px] font-black text-muted-dark uppercase tracking-widest block">
                  Starter Price (INR)
                </label>
                <Input
                  type="number"
                  value={starterPrice}
                  onChange={(e) => setStarterPrice(e.target.value)}
                  className="h-12 bg-muted-light border-none rounded-2xl text-[12px] font-bold text-foreground px-5 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            {/* Pro tier */}
            <div className="p-5 rounded-2xl bg-muted-light/40 border border-border/30 space-y-4">
              <span className="text-[9px] font-black bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Pro Tier
              </span>
              <div className="space-y-2 pt-2">
                <label className="text-[10px] font-black text-muted-dark uppercase tracking-widest block">
                  Pro Price (INR)
                </label>
                <Input
                  type="number"
                  value={proPrice}
                  onChange={(e) => setProPrice(e.target.value)}
                  className="h-12 bg-muted-light border-none rounded-2xl text-[12px] font-bold text-foreground px-5 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            {/* Business tier */}
            <div className="p-5 rounded-2xl bg-muted-light/40 border border-border/30 space-y-4">
              <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Business Tier
              </span>
              <div className="space-y-2 pt-2">
                <label className="text-[10px] font-black text-muted-dark uppercase tracking-widest block">
                  Business Price (INR)
                </label>
                <Input
                  type="number"
                  value={businessPrice}
                  onChange={(e) => setBusinessPrice(e.target.value)}
                  className="h-12 bg-muted-light border-none rounded-2xl text-[12px] font-bold text-foreground px-5 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>
          </div>

          {/* Dynamic Features List */}
          <div className="space-y-6">
            <h4 className="text-[12px] font-black text-foreground/80 uppercase tracking-wider border-b border-border/30 pb-2">
              Plan Feature Matrices
            </h4>

            {/* 1. Starter features */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-muted-dark uppercase tracking-widest">
                  Starter Plan Features ({starterFeatures.length})
                </label>
                <Button
                  type="button"
                  onClick={() => addFeature('starter')}
                  className="h-8 px-3 rounded-full bg-dash-brand-light text-dash-brand hover:bg-dash-brand-light/80 text-[9px] font-black uppercase tracking-wider flex items-center gap-1 active:scale-95"
                >
                  <Plus size={10} /> Add Feature
                </Button>
              </div>

              <div className="space-y-2.5">
                {starterFeatures.map((feat, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      value={feat}
                      onChange={(e) => updateFeatureText('starter', index, e.target.value)}
                      placeholder="e.g. List up to 5 items"
                      className="h-10 bg-muted-light border-none rounded-xl text-[11px] font-bold text-foreground px-4 focus:ring-2 focus:ring-emerald-500/20 flex-1"
                    />
                    <Button
                      type="button"
                      onClick={() => removeFeature('starter', index)}
                      variant="ghost"
                      className="h-10 w-10 p-0 rounded-xl text-destructive hover:bg-danger shrink-0 active:scale-95"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))}
                {starterFeatures.length === 0 && (
                  <p className="text-[10px] font-bold text-muted-dark italic text-center py-2 bg-muted-light/20 rounded-xl">
                    No features configured. Click 'Add Feature' to start.
                  </p>
                )}
              </div>
            </div>

            {/* 2. Pro features */}
            <div className="space-y-4 pt-4 border-t border-border/20">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-muted-dark uppercase tracking-widest">
                  Pro Plan Features ({proFeatures.length})
                </label>
                <Button
                  type="button"
                  onClick={() => addFeature('pro')}
                  className="h-8 px-3 rounded-full bg-dash-brand-light text-dash-brand hover:bg-dash-brand-light/80 text-[9px] font-black uppercase tracking-wider flex items-center gap-1 active:scale-95"
                >
                  <Plus size={10} /> Add Feature
                </Button>
              </div>

              <div className="space-y-2.5">
                {proFeatures.map((feat, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      value={feat}
                      onChange={(e) => updateFeatureText('pro', index, e.target.value)}
                      placeholder="e.g. Priority support"
                      className="h-10 bg-muted-light border-none rounded-xl text-[11px] font-bold text-foreground px-4 focus:ring-2 focus:ring-emerald-500/20 flex-1"
                    />
                    <Button
                      type="button"
                      onClick={() => removeFeature('pro', index)}
                      variant="ghost"
                      className="h-10 w-10 p-0 rounded-xl text-destructive hover:bg-danger shrink-0 active:scale-95"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))}
                {proFeatures.length === 0 && (
                  <p className="text-[10px] font-bold text-muted-dark italic text-center py-2 bg-muted-light/20 rounded-xl">
                    No features configured. Click 'Add Feature' to start.
                  </p>
                )}
              </div>
            </div>

            {/* 3. Business features */}
            <div className="space-y-4 pt-4 border-t border-border/20">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-muted-dark uppercase tracking-widest">
                  Business Plan Features ({businessFeatures.length})
                </label>
                <Button
                  type="button"
                  onClick={() => addFeature('business')}
                  className="h-8 px-3 rounded-full bg-dash-brand-light text-dash-brand hover:bg-dash-brand-light/80 text-[9px] font-black uppercase tracking-wider flex items-center gap-1 active:scale-95"
                >
                  <Plus size={10} /> Add Feature
                </Button>
              </div>

              <div className="space-y-2.5">
                {businessFeatures.map((feat, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      value={feat}
                      onChange={(e) => updateFeatureText('business', index, e.target.value)}
                      placeholder="e.g. Unlimited listings"
                      className="h-10 bg-muted-light border-none rounded-xl text-[11px] font-bold text-foreground px-4 focus:ring-2 focus:ring-emerald-500/20 flex-1"
                    />
                    <Button
                      type="button"
                      onClick={() => removeFeature('business', index)}
                      variant="ghost"
                      className="h-10 w-10 p-0 rounded-xl text-destructive hover:bg-danger shrink-0 active:scale-95"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))}
                {businessFeatures.length === 0 && (
                  <p className="text-[10px] font-bold text-muted-dark italic text-center py-2 bg-muted-light/20 rounded-xl">
                    No features configured. Click 'Add Feature' to start.
                  </p>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Content for TRUST Tab */}
        <TabsContent value="trust" className="space-y-8 animate-in fade-in duration-300 outline-none">
          <div className="space-y-4">
            <h4 className="text-[13px] font-black text-foreground/80 flex items-center gap-1.5">
              <HelpCircle size={15} className="text-dash-brand" />
              Trust & Community Commitments
            </h4>
            <p className="text-[10px] font-semibold text-muted-dark leading-relaxed">
              Configure trust badges, platform commitments, and community safety guidelines. Lucide icon keywords: Shield, UserCheck, MessageSquare, Headphones, MapPin, FileText, Flag.
            </p>
          </div>

          {/* Commitments List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black text-foreground/80 uppercase tracking-widest">
                Platform Commitments ({commitments.length})
              </label>
              <Button
                type="button"
                onClick={addCommitment}
                className="h-8 px-3 rounded-full bg-dash-brand-light text-dash-brand hover:bg-dash-brand-light/80 text-[9px] font-black uppercase tracking-wider flex items-center gap-1 active:scale-95"
              >
                <Plus size={10} /> Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {commitments.map((comm, index) => (
                <div key={index} className="p-4 rounded-2xl bg-muted-light/30 border border-border/30 space-y-3 relative group">
                  <Button
                    type="button"
                    onClick={() => removeCommitment(index)}
                    variant="ghost"
                    className="absolute top-2 right-2 h-8 w-8 p-0 rounded-lg text-destructive hover:bg-danger active:scale-95"
                  >
                    <Trash2 size={13} />
                  </Button>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-muted-dark uppercase tracking-wider">Icon Keyword</label>
                      <Input
                        value={comm.iconName}
                        onChange={(e) => updateCommitment(index, 'iconName', e.target.value)}
                        placeholder="Shield / UserCheck / MessageSquare"
                        className="h-9 bg-muted-light border-none rounded-xl text-[10px] font-bold text-foreground px-3"
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[9px] font-black text-muted-dark uppercase tracking-wider">Title</label>
                      <Input
                        value={comm.title}
                        onChange={(e) => updateCommitment(index, 'title', e.target.value)}
                        placeholder="e.g. Secure payments"
                        className="h-9 bg-muted-light border-none rounded-xl text-[10px] font-bold text-foreground px-3"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-muted-dark uppercase tracking-wider">Description</label>
                    <Textarea
                      value={comm.description}
                      onChange={(e) => updateCommitment(index, 'description', e.target.value)}
                      placeholder="Enter description explaining this commitment."
                      rows={2}
                      className="bg-muted-light border-none rounded-xl text-[10px] font-semibold text-foreground p-3 leading-normal"
                    />
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
          <div className="space-y-4 pt-6 border-t border-border/20">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black text-foreground/80 uppercase tracking-widest">
                Community Safety Guidelines ({safetyTips.length})
              </label>
              <Button
                type="button"
                onClick={addSafetyTip}
                className="h-8 px-3 rounded-full bg-dash-brand-light text-dash-brand hover:bg-dash-brand-light/80 text-[9px] font-black uppercase tracking-wider flex items-center gap-1 active:scale-95"
              >
                <Plus size={10} /> Add Tip
              </Button>
            </div>

            <div className="space-y-4">
              {safetyTips.map((tip, index) => (
                <div key={index} className="p-4 rounded-2xl bg-muted-light/30 border border-border/30 space-y-3 relative group">
                  <Button
                    type="button"
                    onClick={() => removeSafetyTip(index)}
                    variant="ghost"
                    className="absolute top-2 right-2 h-8 w-8 p-0 rounded-lg text-destructive hover:bg-danger active:scale-95"
                  >
                    <Trash2 size={13} />
                  </Button>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-muted-dark uppercase tracking-wider">Icon Keyword</label>
                      <Input
                        value={tip.iconName}
                        onChange={(e) => updateSafetyTip(index, 'iconName', e.target.value)}
                        placeholder="MapPin / MessageSquare / Flag"
                        className="h-9 bg-muted-light border-none rounded-xl text-[10px] font-bold text-foreground px-3"
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[9px] font-black text-muted-dark uppercase tracking-wider">Title</label>
                      <Input
                        value={tip.title}
                        onChange={(e) => updateSafetyTip(index, 'title', e.target.value)}
                        placeholder="e.g. Meet safely"
                        className="h-9 bg-muted-light border-none rounded-xl text-[10px] font-bold text-foreground px-3"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-muted-dark uppercase tracking-wider">Description</label>
                    <Textarea
                      value={tip.description}
                      onChange={(e) => updateSafetyTip(index, 'description', e.target.value)}
                      placeholder="Enter safety tip instructions."
                      rows={2}
                      className="bg-muted-light border-none rounded-xl text-[10px] font-semibold text-foreground p-3 leading-normal"
                    />
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
        <TabsContent value="terms" className="space-y-8 animate-in fade-in duration-300 outline-none">
          <div className="space-y-4">
            <h4 className="text-[13px] font-black text-foreground/80 flex items-center gap-1.5">
              <AlignLeft size={15} className="text-dash-brand" />
              Terms of Service Sections
            </h4>
            <p className="text-[10px] font-semibold text-muted-dark leading-relaxed">
              Configure formal legal agreements and documentation sections dynamically. Use standard linebreaks (`\n` or Enter key) to create paragraphs in document content.
            </p>
          </div>

          {/* Last updated field */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-dark uppercase tracking-widest block">
              Document Last Updated Date
            </label>
            <Input
              value={termsLastUpdated}
              onChange={(e) => setTermsLastUpdated(e.target.value)}
              placeholder="e.g. 28 May 2026"
              className="h-12 bg-muted-light border-none rounded-2xl text-[12px] font-bold text-foreground px-5 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Dynamic Legal Sections */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black text-foreground/80 uppercase tracking-widest">
                Legal Content Sections ({termsSections.length})
              </label>
              <Button
                type="button"
                onClick={addTermsSection}
                className="h-8 px-3 rounded-full bg-dash-brand-light text-dash-brand hover:bg-dash-brand-light/80 text-[9px] font-black uppercase tracking-wider flex items-center gap-1 active:scale-95"
              >
                <Plus size={10} /> Add Section
              </Button>
            </div>

            <div className="space-y-4">
              {termsSections.map((sec, index) => (
                <div key={index} className="p-4 rounded-2xl bg-muted-light/30 border border-border/30 space-y-3 relative group">
                  <Button
                    type="button"
                    onClick={() => removeTermsSection(index)}
                    variant="ghost"
                    className="absolute top-2 right-2 h-8 w-8 p-0 rounded-lg text-destructive hover:bg-danger active:scale-95"
                  >
                    <Trash2 size={13} />
                  </Button>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-muted-dark uppercase tracking-wider">Unique Anchor ID</label>
                      <Input
                        value={sec.id}
                        onChange={(e) => updateTermsSection(index, 'id', e.target.value)}
                        placeholder="e.g. refunds"
                        className="h-9 bg-muted-light border-none rounded-xl text-[10px] font-bold text-foreground px-3"
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[9px] font-black text-muted-dark uppercase tracking-wider">Section Title</label>
                      <Input
                        value={sec.title}
                        onChange={(e) => updateTermsSection(index, 'title', e.target.value)}
                        placeholder="e.g. 5. Refund Policy"
                        className="h-9 bg-muted-light border-none rounded-xl text-[10px] font-bold text-foreground px-3"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-muted-dark uppercase tracking-wider">Content Body</label>
                    <Textarea
                      value={sec.content}
                      onChange={(e) => updateTermsSection(index, 'content', e.target.value)}
                      placeholder="Insert paragraph block content here. Hit enter for linebreaks."
                      rows={5}
                      className="bg-muted-light border-none rounded-xl text-[10px] font-semibold text-foreground p-3 leading-normal"
                    />
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
