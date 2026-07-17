import { Logo } from '#/components/layout'
import { ShieldCheck, CreditCard, Headphones } from 'lucide-react'

export function AuthLeftSection() {
  return (
    <div
      className="relative hidden flex-1 overflow-hidden p-12 lg:flex lg:flex-col lg:justify-between rounded-[28px] border border-border/40 shadow-soft"
      style={{
        backgroundImage: "url('/assets/contact-hero.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Semi-transparent overlay to ensure contrast and premium feel */}
      <div className="absolute inset-0 bg-brand-surface-warm/80 dark:bg-black/85 backdrop-blur-[2px] z-0" />

      <div className="relative z-10 flex w-full flex-col">
        {/* Logo */}
        <Logo />

        {/* Hero */}
        <div className="mt-12">
          <h1 className="text-[52px] font-extrabold leading-[1.05] tracking-tight text-brand-ink dark:text-foreground">
            Rent Anything,
            <br />
            <span className="text-primary">Live Smarter</span>
          </h1>
          <p className="mt-5 text-[16px] text-muted-foreground/85 max-w-[440px] leading-relaxed">
            Join thousands of happy users who are renting anything they need,
            anytime, anywhere.
          </p>
        </div>

        {/* Visual stage (Single High-Fidelity Product Card) */}
        <div className="relative mt-8 h-[460px] w-full flex items-center justify-center">
          <div className="w-[340px] bg-white rounded-3xl overflow-hidden shadow-lift border border-border/20 transition-transform duration-500 hover:scale-[1.02] cursor-pointer">
            {/* Product Image Section */}
            <div className="h-[210px] bg-slate-50 flex items-center justify-center relative p-6">
              <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[9px] font-bold text-emerald-700 tracking-wider uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                AVAILABLE NEARBY
              </span>
              <img
                src="/assets/auth/armchair.png"
                alt="Stockholm Lounge Chair"
                loading="lazy"
                className="h-full w-auto object-contain transition-transform duration-500 hover:scale-105"
              />
            </div>

            {/* Product Details Section */}
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold tracking-wider text-primary uppercase">
                  LIVING ROOM · TOKYO
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-amber-600">
                  ★ 4.96
                </span>
              </div>

              <div>
                <h3 className="font-display text-[20px] font-semibold text-brand-ink leading-tight">
                  Stockholm Lounge Chair
                </h3>
                <p className="text-[11px] text-muted-foreground/80 mt-1">
                  Hosted by Anneli · Verified Lender
                </p>
              </div>

              <div className="h-[1px] bg-border/40 w-full" />

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-muted-foreground/80 font-medium">
                    Weekly Rent
                  </div>
                  <div className="font-display text-[18px] font-bold text-brand-ink mt-0.5">
                    ₹800
                    <span className="text-xs text-muted-foreground/80 font-normal">
                      /wk
                    </span>
                  </div>
                </div>

                <button className="bg-primary text-white text-xs px-5 py-2.5 rounded-full font-bold hover:bg-primary-hover shadow-soft hover:shadow-lift transition-all active:scale-95 duration-200">
                  Reserve Item
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust badges */}
      <div className="relative z-10 grid grid-cols-3 gap-4 rounded-2xl bg-white/90 dark:bg-card/90 backdrop-blur-sm border border-border/30 p-5 mt-6 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center shadow-sm">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="leading-tight min-w-0">
            <h4 className="text-[11px] font-bold text-foreground truncate">
              Trusted & Verified
            </h4>
            <p className="text-[9px] text-muted-foreground/85 line-clamp-2">
              Every item and user is verified
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center shadow-sm">
            <CreditCard className="h-5 w-5" />
          </div>
          <div className="leading-tight min-w-0">
            <h4 className="text-[11px] font-bold text-foreground truncate">
              Secure Payments
            </h4>
            <p className="text-[9px] text-muted-foreground/85 line-clamp-2">
              100% safe & hassle-free
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center shadow-sm">
            <Headphones className="h-5 w-5" />
          </div>
          <div className="leading-tight min-w-0">
            <h4 className="text-[11px] font-bold text-foreground truncate">
              24/7 Support
            </h4>
            <p className="text-[9px] text-muted-foreground/85 line-clamp-2">
              We're here to help anytime
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
