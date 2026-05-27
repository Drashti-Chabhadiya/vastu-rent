import { Logo } from '#/components/layout'
import {
  ShieldCheck,
  CreditCard,
  Headphones,
  Home,
  Car,
  Percent,
} from 'lucide-react'

const floatingItems = [
  {
    title: 'Camera',
    price: '₹1,200',
    image: '/assets/auth/camera.png',
    className: 'top-[2%] left-[8%]',
  },
  {
    title: 'Sofa',
    price: '₹800',
    image: '/assets/auth/sofa.png',
    className: 'top-[-2%] left-[38%]',
  },
  {
    title: 'Laptop',
    price: '₹1,000',
    image: '/assets/auth/laptop.png',
    className: 'top-[6%] right-[10%]',
  },
  {
    title: 'Party Tent',
    price: '₹2,500',
    image: '/assets/auth/tent.png',
    className: 'top-[40%] left-[14%]',
  },
  {
    title: 'Wedding Dress',
    price: '₹2,000',
    image: '/assets/auth/dress.png',
    className: 'top-[44%] right-[18%]',
  },
]

export function AuthLeftSection() {
  return (
    <div className="relative hidden flex-1 overflow-hidden bg-auth-section-bg p-12 lg:flex lg:flex-col lg:justify-between rounded-[28px]">
      <div className="relative z-10 flex w-full flex-col">
        {/* Logo */}
        <Logo />

        {/* Hero */}
        <div className="mt-12">
          <h1 className="text-[52px] font-extrabold leading-[1.05] tracking-tight text-text-dark">
            Rent Anything,
            <br />
            <span className="text-primary">Live Smarter</span>
          </h1>
          <p className="mt-5 text-[16px] text-muted-foreground/85 max-w-[440px] leading-relaxed">
            Join thousands of happy users who are renting anything they need,
            anytime, anywhere.
          </p>
        </div>

        {/* Visual stage */}
        <div className="relative mt-8 h-[460px] w-full">
          {/* Dashed connections */}
          <svg
            className="absolute inset-0 h-full w-full opacity-50"
            viewBox="0 0 600 460"
            fill="none"
          >
            <path
              d="M120,90 Q250,40 320,80"
              stroke="var(--color-auth-line)"
              strokeWidth="1.5"
              strokeDasharray="5,5"
            />
            <path
              d="M380,80 Q450,60 500,110"
              stroke="var(--color-auth-line)"
              strokeWidth="1.5"
              strokeDasharray="5,5"
            />
            <path
              d="M140,260 Q220,300 280,280"
              stroke="var(--color-auth-line)"
              strokeWidth="1.5"
              strokeDasharray="5,5"
            />
            <path
              d="M340,280 Q420,300 480,260"
              stroke="var(--color-auth-line)"
              strokeWidth="1.5"
              strokeDasharray="5,5"
            />
          </svg>

          {/* Floating category icons */}
          <div className="absolute top-[6%] left-[32%] z-20 h-9 w-9 rounded-full bg-card border border-border/30 flex items-center justify-center shadow-md">
            <Home className="h-4 w-4 bg-primary-light" />
          </div>
          <div className="absolute top-[8%] right-[34%] z-20 h-9 w-9 rounded-full bg-card border border-border/30 flex items-center justify-center shadow-md">
            <Percent className="h-4 w-4 bg-primary-light" />
          </div>
          <div className="absolute top-[55%] left-[33%] z-20 h-9 w-9 rounded-full bg-card border border-border/30 flex items-center justify-center shadow-md">
            <Car className="h-4 w-4 bg-primary-light" />
          </div>
          <div className="absolute top-[55%] right-[36%] z-20 h-9 w-9 rounded-full bg-card border border-border/30 flex items-center justify-center shadow-md">
            <Car className="h-4 w-4 bg-primary-light" />
          </div>

          {/* 2. DIRECT IMAGES: Updated src to use string paths */}
          <img
            src="/assets/auth/plant-left.png"
            alt="Plant"
            loading="lazy"
            className="absolute bottom-0 left-0 z-0 h-[240px] w-auto object-contain"
          />
          <img
            src="/assets/auth/lamp.png"
            alt="Lamp"
            loading="lazy"
            className="absolute bottom-0 right-0 z-0 h-[260px] w-auto object-contain"
          />

          {/* Centerpiece chair */}
          <div className="absolute bottom-0 left-1/2 z-10 -translate-x-1/2">
            <div className="relative flex flex-col items-center">
              <div className="absolute -bottom-2 h-10 w-[280px] rounded-[100%] bg-auth-shadow"></div>
              <img
                src="/assets/auth/armchair.png"
                alt="Armchair"
                loading="lazy"
                className="relative h-[260px] w-auto object-contain"
              />
            </div>
          </div>

          {/* Floating product cards */}
          {floatingItems.map((item) => (
            <div
              key={item.title}
              className={`absolute ${item.className} w-[120px] rounded-xl bg-card p-2 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.15)] z-30`}
            >
              <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted-light flex items-center justify-center">
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="mt-2 px-1 pb-1">
                <h4 className="text-[11px] font-bold text-foreground">
                  {item.title}
                </h4>
                <p className="text-[12px] font-extrabold bg-primary-light mt-0.5">
                  {item.price}
                  <span className="text-[10px] font-medium text-muted-foreground/70">
                    /day
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust badges */}
      <div className="grid grid-cols-3 gap-4 rounded-2xl bg-auth-card-bg p-5 mt-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-card flex items-center justify-center shadow-sm">
            <ShieldCheck className="h-5 w-5 bg-primary-light" />
          </div>
          <div className="leading-tight">
            <h4 className="text-[12px] font-bold text-foreground">
              Trusted & Verified
            </h4>
            <p className="text-[10px] text-muted-foreground/85">
              Every item and user is verified
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-card flex items-center justify-center shadow-sm">
            <CreditCard className="h-5 w-5 bg-primary-light" />
          </div>
          <div className="leading-tight">
            <h4 className="text-[12px] font-bold text-foreground">
              Secure Payments
            </h4>
            <p className="text-[10px] text-muted-foreground/85">
              100% safe and hassle free transactions
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-card flex items-center justify-center shadow-sm">
            <Headphones className="h-5 w-5 bg-primary-light" />
          </div>
          <div className="leading-tight">
            <h4 className="text-[12px] font-bold text-foreground">
              24/7 Support
            </h4>
            <p className="text-[10px] text-muted-foreground/85">
              We're here to help you anytime
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
