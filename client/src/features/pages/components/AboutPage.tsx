import { useState } from 'react'
import { useIsMobile } from '#/hook'
import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '#/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
} from '#/components/ui/drawer'
import {
  Leaf,
  Users,
  ShoppingBag,
  ShieldCheck,
  CalendarCheck,
  UserCheck,
  Headphones,
  Sprout,
  Handshake,
  ArrowRight,
  Sparkles,
  Rocket,
  Heart,
  Globe,
  Quote,
} from 'lucide-react'

export const AboutPage = () => {
  const [isStoryOpen, setIsStoryOpen] = useState(false)
  const isMobile = useIsMobile()

  const TitleComponent = isMobile ? DrawerTitle : DialogTitle
  const DescriptionComponent = isMobile ? DrawerDescription : DialogDescription

  const storyContent = (
    <>
      {/* Modal Header Banner */}
      <div className="shrink-0 relative bg-gradient-to-br from-primary via-primary/95 to-emerald-950 text-primary-foreground p-6 sm:p-10 overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md border border-white/20 mb-3 sm:mb-4 text-white">
          <Sparkles size={14} className="text-amber-300" />
          Our Journey & Vision
        </div>
        <TitleComponent className="text-2xl sm:text-4xl font-display font-black text-white tracking-tight leading-tight pr-10">
          The Story Behind Vastu-Rent
        </TitleComponent>
        <DescriptionComponent className="text-emerald-100/90 text-sm sm:text-base font-medium mt-2 max-w-xl leading-relaxed">
          How a simple realization about idle items evolved into a thriving
          community-first rental movement.
        </DescriptionComponent>
      </div>

      {/* Modal Body Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8">
        {/* Origin Story Quote Card */}
        <div className="bg-primary/5 border border-primary/15 rounded-2xl p-6 sm:p-7 relative overflow-hidden">
          <Quote className="absolute top-3 right-4 text-primary/10 w-16 h-16 pointer-events-none" />
          <h4 className="text-base sm:text-lg font-bold text-foreground mb-2 flex items-center gap-2">
            <Heart
              size={20}
              className="text-primary fill-primary/20 shrink-0"
            />
            Born from a Real Need
          </h4>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed relative z-10">
            It all started when our founders realized how many expensive tools,
            cameras, camping gear, and event equipment sit unused in garages and
            closets 95% of the time. Meanwhile, neighbors down the street were
            buying brand-new ones for single-use occasions. Vastu-Rent was
            founded to bridge this gap—making access smarter, cheaper, and
            kinder to our planet.
          </p>
        </div>

        {/* Interactive Timeline */}
        <div>
          <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
            <Rocket size={16} />
            Key Milestones & Evolution
          </h4>

          <div className="relative border-l-2 border-primary/20 ml-3 pl-6 space-y-8">
            {/* Milestone 1 */}
            <div className="relative">
              <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-primary border-4 border-background shadow-md" />
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[11px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                  2023
                </span>
                <span className="text-xs font-bold text-foreground/70">
                  • The Spark
                </span>
              </div>
              <h5 className="text-sm sm:text-base font-bold text-foreground">
                The Peer-to-Peer Concept
              </h5>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                Launched our first pilot project connecting item owners with
                local neighbors needing temporary access.
              </p>
            </div>

            {/* Milestone 2 */}
            <div className="relative">
              <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-primary border-4 border-background shadow-md" />
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[11px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                  2024
                </span>
                <span className="text-xs font-bold text-foreground/70">
                  • Building Trust
                </span>
              </div>
              <h5 className="text-sm sm:text-base font-bold text-foreground">
                Trust & Escrow Payments
              </h5>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                Integrated identity verification badges, escrow payments, and
                host damage coverage policies to build 100% rental security.
              </p>
            </div>

            {/* Milestone 3 */}
            <div className="relative">
              <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-primary border-4 border-background shadow-md" />
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[11px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                  2025
                </span>
                <span className="text-xs font-bold text-foreground/70">
                  • Eco Impact
                </span>
              </div>
              <h5 className="text-sm sm:text-base font-bold text-foreground">
                10,000+ Items & 25k kg CO₂ Saved
              </h5>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                Expanded our catalog to cover electronics, home décor, event
                gear, and tools while preventing tons of manufacturing waste.
              </p>
            </div>

            {/* Milestone 4 */}
            <div className="relative">
              <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-primary border-4 border-background shadow-md" />
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[11px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                  2026 & Beyond
                </span>
                <span className="text-xs font-bold text-foreground/70">
                  • The Horizon
                </span>
              </div>
              <h5 className="text-sm sm:text-base font-bold text-foreground">
                The Circular Living Standard
              </h5>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                Empowering communities everywhere to choose renting over buying
                as their default, eco-friendly lifestyle choice.
              </p>
            </div>
          </div>
        </div>

        {/* Core Values Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-4 rounded-2xl bg-surface/50 border border-border/40 text-center">
            <Globe className="mx-auto text-primary mb-2" size={22} />
            <h6 className="text-xs font-bold text-foreground uppercase tracking-wider mb-1">
              Sustainability
            </h6>
            <p className="text-[11px] text-muted-foreground">
              Reducing clutter & carbon footprints through shared use.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-surface/50 border border-border/40 text-center">
            <ShieldCheck className="mx-auto text-primary mb-2" size={22} />
            <h6 className="text-xs font-bold text-foreground uppercase tracking-wider mb-1">
              Trust & Safety
            </h6>
            <p className="text-[11px] text-muted-foreground">
              Verified users, secure payments & host peace of mind.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-surface/50 border border-border/40 text-center">
            <Users className="mx-auto text-primary mb-2" size={22} />
            <h6 className="text-xs font-bold text-foreground uppercase tracking-wider mb-1">
              Community First
            </h6>
            <p className="text-[11px] text-muted-foreground">
              Empowering hosts to earn while helping renters save money.
            </p>
          </div>
        </div>

        {/* Footer Action */}
        <div className="pt-4 border-t border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Leaf size={14} className="text-primary" />
            <span>Vastu-Rent Circular Economy</span>
          </div>
          <Button
            onClick={() => setIsStoryOpen(false)}
            className="rounded-full px-6 font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all active:scale-95 cursor-pointer"
          >
            Close Story
          </Button>
        </div>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-background font-sans overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 xl:px-12 pb-16">
        {/* HERO SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12 mb-16 mt-8">
          {/* Left Content */}
          <div className="flex-1 space-y-6 lg:pr-12">
            <div className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 border border-primary/20">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                About Vastu-Rent
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-display font-black text-primary tracking-tight leading-tight lg:whitespace-nowrap">
              About Vastu-Rent
            </h1>
            <h2 className="text-2xl lg:text-3xl font-semibold text-foreground/80 tracking-tight">
              Rent Anything. Live in Harmony.
            </h2>
            <p className="text-base text-muted-foreground/90 font-medium leading-relaxed max-w-xl">
              Vastu-Rent is a community-driven rental marketplace that connects
              people who need things with people who own them.
              <br />
              <br />
              We believe in a world where access matters more than ownership.
              That's why we make renting simple, affordable, and trustworthy for
              everyone.
            </p>
            <div className="pt-2">
              <Button
                onClick={() => setIsStoryOpen(true)}
                className="group h-12 px-6 rounded-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center gap-2 cursor-pointer"
              >
                <Leaf size={18} />
                Our Story
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-foreground/20 transition-transform group-hover:translate-x-1 ml-1">
                  <ArrowRight size={14} strokeWidth={2.5} />
                </span>
              </Button>
            </div>
          </div>

          {/* Right Image (Arch Mask) */}
          <div className="relative w-full aspect-square lg:aspect-[4/3] rounded-3xl lg:rounded-tl-[120px] lg:rounded-bl-[40px] lg:rounded-tr-[40px] lg:rounded-br-[120px] overflow-hidden shadow-2xl">
            <img
              src="/images/about_hero_generated.png"
              alt="Cozy interior with plants"
              className="w-full h-full object-cover"
            />
          </div>
        </section>

        {/* STATS BAR */}
        <section className="bg-surface/50 backdrop-blur-md border border-border/50 rounded-3xl p-6 md:p-10 shadow-sm mb-20 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 divide-y sm:divide-y-0 sm:divide-x divide-border/40">
            {/* Stat 1 */}
            <div className="flex items-center gap-5 pt-4 sm:pt-0 sm:px-4">
              <div className="w-16 h-16 rounded-full bg-brand-beige flex items-center justify-center shrink-0">
                <Users className="text-primary" size={26} />
              </div>
              <div>
                <h4 className="text-xl font-black text-foreground">5,000+</h4>
                <p className="text-sm font-bold text-foreground/80 mb-0.5">
                  Active Members
                </p>
                <p className="text-xs text-muted-foreground font-medium leading-tight">
                  Growing community across cities
                </p>
              </div>
            </div>
            {/* Stat 2 */}
            <div className="flex items-center gap-5 pt-4 sm:pt-0 sm:px-4">
              <div className="w-16 h-16 rounded-full bg-brand-beige flex items-center justify-center shrink-0">
                <ShoppingBag className="text-primary" size={26} />
              </div>
              <div>
                <h4 className="text-xl font-black text-foreground">10,000+</h4>
                <p className="text-sm font-bold text-foreground/80 mb-0.5">
                  Items in Rotation
                </p>
                <p className="text-xs text-muted-foreground font-medium leading-tight">
                  From gadgets to décor, we've got it all
                </p>
              </div>
            </div>
            {/* Stat 3 */}
            <div className="flex items-center gap-5 pt-4 sm:pt-0 sm:px-4">
              <div className="w-16 h-16 rounded-full bg-brand-beige flex items-center justify-center shrink-0">
                <Leaf className="text-primary" size={26} />
              </div>
              <div>
                <h4 className="text-xl font-black text-foreground">25k kg</h4>
                <p className="text-sm font-bold text-foreground/80 mb-0.5">
                  CO₂ Saved
                </p>
                <p className="text-xs text-muted-foreground font-medium leading-tight">
                  By promoting reuse and reducing waste
                </p>
              </div>
            </div>
            {/* Stat 4 */}
            <div className="flex items-center gap-5 pt-4 sm:pt-0 sm:px-4">
              <div className="w-16 h-16 rounded-full bg-brand-beige flex items-center justify-center shrink-0">
                <ShieldCheck className="text-primary" size={26} />
              </div>
              <div>
                <h4 className="text-xl font-black text-foreground">100%</h4>
                <p className="text-sm font-bold text-foreground/80 mb-0.5">
                  Trusted Platform
                </p>
                <p className="text-xs text-muted-foreground font-medium leading-tight">
                  Verified hosts, secure payments, safe rentals
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* MISSION SECTION */}
        <section className="mb-20">
          <div className="mb-8">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">
              Our Mission
            </p>
            <h2 className="text-3xl md:text-5xl font-display font-black text-foreground tracking-tight mb-6">
              Building a{' '}
              <span className="text-primary">Better Way to Rent</span>
            </h2>
            <p className="text-sm md:text-base text-muted-foreground/90 font-medium leading-relaxed max-w-2xl">
              Our mission is to build a trusted rental community where people
              can rent what they need, earn from what they own, and reduce
              unnecessary purchases for a sustainable future.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Pillars */}
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-surface/30 sm:bg-transparent hover:bg-muted/40 transition-colors">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Users className="text-primary" size={20} />
                </div>
                <div>
                  <h5 className="text-sm font-black text-foreground mb-1">
                    Access Over Ownership
                  </h5>
                  <p className="text-xs text-muted-foreground font-medium">
                    Why buy when you can rent easily and affordably?
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-surface/30 sm:bg-transparent hover:bg-muted/40 transition-colors">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Sprout className="text-primary" size={20} />
                </div>
                <div>
                  <h5 className="text-sm font-black text-foreground mb-1">
                    Sustainable Living
                  </h5>
                  <p className="text-xs text-muted-foreground font-medium">
                    Reduce waste, reuse more, and care for our planet.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-surface/30 sm:bg-transparent hover:bg-muted/40 transition-colors">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Handshake className="text-primary" size={20} />
                </div>
                <div>
                  <h5 className="text-sm font-black text-foreground mb-1">
                    Stronger Community
                  </h5>
                  <p className="text-xs text-muted-foreground font-medium">
                    Empowering people to share, connect, and grow together.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Image & Quote Container */}
            <div className="flex flex-col">
              <div className="relative rounded-[28px] sm:rounded-[40px] overflow-hidden aspect-[4/3] shadow-xl">
                <img
                  src="/images/about_mission_generated.png"
                  alt="Sustainable renting"
                  className="w-full h-full object-cover"
                />

                {/* Quote box - Overlay on desktop */}
                <div className="hidden sm:block absolute bottom-6 right-6 md:bottom-12 md:right-12 w-72 md:w-80 bg-primary p-6 md:p-8 rounded-3xl shadow-2xl">
                  <div className="text-primary-foreground/20 font-display text-5xl md:text-6xl leading-none absolute -top-4 -left-2">
                    "
                  </div>
                  <p className="text-primary-foreground font-bold text-sm md:text-base leading-relaxed relative z-10">
                    We envision a world where renting is the new
                    normal—convenient, affordable, and sustainable.
                  </p>
                  <div className="w-12 h-1 bg-primary-foreground/20 mt-6 rounded-full" />
                </div>
              </div>

              {/* Mobile Quote Card - Placed neatly below image on mobile */}
              <div className="sm:hidden bg-primary p-5 rounded-2xl shadow-lg mt-3 relative overflow-hidden">
                <div className="text-primary-foreground/20 font-display text-4xl leading-none absolute -top-3 -left-1">
                  "
                </div>
                <p className="text-primary-foreground font-bold text-xs leading-relaxed relative z-10">
                  We envision a world where renting is the new
                  normal—convenient, affordable, and sustainable.
                </p>
                <div className="w-10 h-1 bg-primary-foreground/20 mt-3 rounded-full" />
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM FEATURES */}
        <section className="bg-surface/60 backdrop-blur-md rounded-3xl p-5 sm:p-8 border border-border/50 relative overflow-hidden">
          {/* Decorative leaf cut out */}
          <div className="absolute -bottom-20 -right-20 opacity-15 pointer-events-none hidden sm:block">
            <Leaf size={220} className="text-primary" strokeWidth={0.5} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 sm:gap-6 md:divide-x divide-border/40 relative z-10">
            <div className="flex items-center gap-4 px-2 md:px-6">
              <CalendarCheck
                className="text-primary shrink-0"
                size={26}
                strokeWidth={1.5}
              />
              <div>
                <h6 className="text-sm font-black text-foreground">
                  Easy Booking
                </h6>
                <p className="text-xs text-muted-foreground font-medium">
                  Book in minutes
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 px-2 md:px-6">
              <ShieldCheck
                className="text-primary shrink-0"
                size={26}
                strokeWidth={1.5}
              />
              <div>
                <h6 className="text-sm font-black text-foreground">
                  Secure Payments
                </h6>
                <p className="text-xs text-muted-foreground font-medium">
                  Safe & reliable
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 px-2 md:px-6">
              <UserCheck
                className="text-primary shrink-0"
                size={26}
                strokeWidth={1.5}
              />
              <div>
                <h6 className="text-sm font-black text-foreground">
                  Verified Hosts
                </h6>
                <p className="text-xs text-muted-foreground font-medium">
                  Trusted community
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 px-2 md:px-6">
              <Headphones
                className="text-primary shrink-0"
                size={26}
                strokeWidth={1.5}
              />
              <div>
                <h6 className="text-sm font-black text-foreground">
                  Customer Support
                </h6>
                <p className="text-xs text-muted-foreground font-medium">
                  We're here to help
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* OUR STORY MODAL / DRAWER */}
        {isMobile ? (
          <Drawer open={isStoryOpen} onOpenChange={setIsStoryOpen}>
            <DrawerContent className="max-h-[90vh] overflow-hidden rounded-t-[2rem] border-none shadow-2xl bg-background p-0 outline-none flex flex-col">
              {storyContent}
            </DrawerContent>
          </Drawer>
        ) : (
          <Dialog open={isStoryOpen} onOpenChange={setIsStoryOpen}>
            <DialogContent className="top-1/2 -translate-y-1/2 max-w-3xl max-h-[85vh] flex flex-col p-0 border-none bg-background rounded-[2.5rem] shadow-2xl overflow-hidden [&>button]:top-6 [&>button]:right-6 [&>button]:text-white [&>button]:bg-white/20 [&>button]:hover:bg-white/35 [&>button]:h-9 [&>button]:w-9 [&>button]:flex [&>button]:items-center [&>button]:justify-center [&>button]:rounded-full [&>button]:opacity-100 [&>button]:transition-all [&>button]:focus:ring-0 [&>button]:focus:ring-offset-0 [&>button]:z-20">
              {storyContent}
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}
