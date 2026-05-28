import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { toast } from 'sonner'
import {
  Shield,
  UserCheck,
  MessageSquare,
  Headphones,
  ChevronRight,
  CheckCircle2,
  ArrowRight,
  Flag,
  AlertTriangle,
  MapPin,
  FileText,
} from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
import { Label } from '#/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { useSettings } from '#/hook'

const getIcon = (name: string, className = 'h-6 w-6 text-primary') => {
  switch (name) {
    case 'Shield':
      return <Shield className={className} />
    case 'UserCheck':
      return <UserCheck className={className} />
    case 'MessageSquare':
      return <MessageSquare className={className} />
    case 'Headphones':
      return <Headphones className={className} />
    case 'MapPin':
      return <MapPin className={className} />
    case 'FileText':
      return <FileText className={className} />
    case 'Flag':
      return <Flag className={className} />
    default:
      return <Shield className={className} />
  }
}

export function TrustPage() {
  const { data: settings } = useSettings()

  // Report form state
  const [reportType, setReportType] = useState('listing')
  const [targetId, setTargetId] = useState('')
  const [description, setDescription] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleSendReport = (e: React.FormEvent) => {
    e.preventDefault()

    if (!description.trim()) {
      toast.error('Please describe the concern details.')
      return
    }

    toast.success(
      'Thank you. Your report has been submitted to Vastu Trust & Safety.',
    )
    setTargetId('')
    setDescription('')
    setIsDialogOpen(false)
  }

  interface TrustItem {
    icon: React.ReactNode
    title: string
    description: string
  }

  const commitments: TrustItem[] = settings?.trust?.commitments?.map(
    (c: any) => ({
      icon: getIcon(c.iconName, 'h-6 w-6 text-primary'),
      title: c.title,
      description: c.description,
    }),
  ) || [
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: 'Secure platform',
      description:
        'We use industry-leading security measures to protect your data and payments.',
    },
    {
      icon: <UserCheck className="h-6 w-6 text-primary" />,
      title: 'Verified members',
      description:
        'Hosts and renters go through verification checks to build trust in our community.',
    },
    {
      icon: <MessageSquare className="h-6 w-6 text-primary" />,
      title: 'Fair & transparent',
      description:
        'Clear policies, honest communication and support when you need it.',
    },
    {
      icon: <Headphones className="h-6 w-6 text-primary" />,
      title: '24/7 support',
      description:
        'Our dedicated support team is always here to help you, any time.',
    },
  ]

  const safetyTips: TrustItem[] = settings?.trust?.safetyTips?.map(
    (s: any) => ({
      icon: getIcon(s.iconName, 'h-5 w-5 text-primary'),
      title: s.title,
      description: s.description,
    }),
  ) || [
    {
      icon: <MessageSquare className="h-5 w-5 text-primary" />,
      title: 'Communicate on Vastu',
      description: 'Keep all conversations and payments within Vastu.',
    },
    {
      icon: <UserCheck className="h-5 w-5 text-primary" />,
      title: 'Verify before you book',
      description: 'Check profiles, reviews and verification badges.',
    },
    {
      icon: <MapPin className="h-5 w-5 text-primary" />,
      title: 'Meet safely',
      description: 'Visit the place and meet in public when possible.',
    },
    {
      icon: <FileText className="h-5 w-5 text-primary" />,
      title: 'Read the listing carefully',
      description: 'Review house rules, policies and cancellation terms.',
    },
    {
      icon: <Flag className="h-5 w-5 text-primary" />,
      title: 'Report suspicious activity',
      description: 'Help us keep the community safe by reporting concerns.',
    },
  ]

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section Container */}
      <section className="mx-auto max-w-[1400px] px-6 pt-12 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-12 overflow-hidden bg-[#faf9f5] rounded-[2.5rem] border border-border/20 shadow-sm">
          {/* Left Hero Details */}
          <div className="md:col-span-7 flex flex-col justify-center px-8 py-16 sm:p-12 lg:p-16">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Trust & safety
              </div>
            </div>
            <h1 className="mt-8 font-display text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.05] tracking-tight text-[#0F291B]">
              Your trust is <br />
              <span className="italic text-primary">our priority.</span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
              At Vastu, we’re building a community where everyone can rent and
              host with confidence.
            </p>
          </div>

          {/* Right Hero Image */}
          <div className="md:col-span-5 relative min-h-[300px] md:min-h-full overflow-hidden">
            <img
              src="/assets/contact-hero.png"
              alt="Beautiful Vastu Arched Room"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            {/* Soft decorative shading */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>
      </section>

      {/* Commitment Cards Section */}
      <section className="mx-auto max-w-[1400px] px-6 mt-20 md:px-10">
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold text-[#0F291B] tracking-tight sm:text-3xl">
            Our commitment to you
          </h2>
          <p className="text-muted-foreground mt-2 text-sm max-w-xl leading-relaxed">
            We work around the clock to keep Vastu safe, secure and reliable for
            our community.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
          {commitments.map((c, i) => (
            <Card
              key={i}
              className="group border border-border/30 rounded-[2rem] bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/20"
            >
              <CardContent className="p-0 flex flex-col items-start gap-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5 transition-colors group-hover:bg-primary/10 shrink-0">
                  {c.icon}
                </div>
                <div>
                  <h3 className="font-bold text-[#0F291B] text-base">
                    {c.title}
                  </h3>
                  <p className="text-muted-foreground text-[13px] leading-relaxed mt-2">
                    {c.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Safety Tips and Privacy Section */}
      <section className="mx-auto max-w-[1400px] px-6 mt-20 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Safety Tips List */}
          <div className="lg:col-span-7">
            <h2 className="text-2xl font-bold text-[#0F291B] tracking-tight">
              Safety tips for a secure experience
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Follow these simple tips to protect yourself and others.
            </p>

            <div className="mt-8 rounded-[2rem] border border-border/30 overflow-hidden bg-card divide-y divide-border/30">
              {safetyTips.map((tip, idx) => (
                <div
                  key={idx}
                  onClick={() => toast.info(`${tip.title}: ${tip.description}`)}
                  className="flex items-center justify-between gap-4 p-5 sm:px-6 transition-colors hover:bg-[#faf9f5]/50 cursor-pointer group"
                >
                  <div className="flex gap-4 items-center">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/5 transition-colors group-hover:bg-primary/10">
                      {tip.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-[#0F291B] text-[14px]">
                        {tip.title}
                      </h4>
                      <p className="text-[12px] text-muted-foreground mt-0.5 leading-relaxed">
                        {tip.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5" />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Privacy matters Callout */}
          <div className="lg:col-span-5 bg-primary/5 border border-brand/10 rounded-[2.5rem] p-8 sm:p-10 shadow-sm relative overflow-hidden">
            {/* Elegant background circles */}
            <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-primary/5 blur-xl pointer-events-none" />

            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-background border border-primary/10 shadow-sm shrink-0">
              <Shield className="h-6 w-6 text-primary animate-pulse" />
            </div>

            <h3 className="font-bold text-[#0F291B] text-xl mt-6">
              Your privacy matters
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed mt-2">
              We collect only what we need to provide a better experience and
              never share your personal information without consent.
            </p>

            <div className="mt-6 space-y-4">
              {[
                'Encrypted and secure data',
                'Private and protected payments',
                'No spam, ever',
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <CheckCircle2 className="h-4.5 w-4.5 text-primary shrink-0" />
                  <span className="text-[13.5px] font-medium text-foreground">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-border/30">
              <Link
                to="/help"
                className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline group"
              >
                Learn more about our Privacy Policy
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Report Suspicious Activity Callout */}
      <section className="mx-auto max-w-[1400px] px-6 mt-16 md:px-10">
        <div className="bg-[#faf9f5] border border-border/20 rounded-[2rem] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/5 border border-primary/10 shrink-0">
              <Flag className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-[#0F291B] text-lg">
                See something that doesn’t look right?
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Report it to us. Your report helps us take action and keep the
                community safe for everyone.
              </p>
            </div>
          </div>
          <div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="group rounded-full bg-[#faf9f5] border border-primary/20 hover:border-primary px-6 py-4.5 h-auto text-sm font-bold text-[#0F291B] shadow-sm transition-all hover:bg-background active:scale-[0.98] inline-flex items-center gap-2 [&_svg]:size-4">
                  Report a concern
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md bg-background rounded-3xl p-6 border border-border/50 shadow-lg">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-[#0F291B] flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-primary" />
                    Report a concern
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground">
                    Please provide details about the issue. Our Vastu trust team
                    will investigate and take immediate actions.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSendReport} className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[13px] font-bold text-[#0F291B]">
                      What kind of concern is this?
                    </Label>
                    <Select value={reportType} onValueChange={setReportType}>
                      <SelectTrigger className="w-full rounded-xl border border-border h-11 text-sm bg-transparent">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover rounded-xl shadow-md border border-border/50">
                        <SelectItem
                          value="listing"
                          className="cursor-pointer rounded-lg"
                        >
                          Suspicious/Incorrect Listing
                        </SelectItem>
                        <SelectItem
                          value="user"
                          className="cursor-pointer rounded-lg"
                        >
                          Inappropriate/Fraudulent User
                        </SelectItem>
                        <SelectItem
                          value="payment"
                          className="cursor-pointer rounded-lg"
                        >
                          Payment issues / Off-platform requests
                        </SelectItem>
                        <SelectItem
                          value="other"
                          className="cursor-pointer rounded-lg"
                        >
                          Other safety issues
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[13px] font-bold text-[#0F291B]">
                      Reference URL / Listing / User ID (Optional)
                    </Label>
                    <Input
                      placeholder="e.g. VASTU-12345"
                      value={targetId}
                      onChange={(e) => setTargetId(e.target.value)}
                      className="w-full rounded-xl border border-border h-11 text-sm bg-transparent"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[13px] font-bold text-[#0F291B]">
                      Detailed Description
                    </Label>
                    <Textarea
                      placeholder="Describe the issue in detail..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="w-full rounded-xl border border-border text-sm p-4 bg-transparent resize-none"
                    />
                  </div>

                  <DialogFooter className="pt-2">
                    <Button
                      type="submit"
                      className="w-full rounded-full bg-primary hover:bg-primary/95 text-white font-bold h-11 text-sm"
                    >
                      Submit report
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>
    </div>
  )
}
