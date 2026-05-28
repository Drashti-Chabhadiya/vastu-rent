import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Button } from '#/components/ui/button'
import { Badge } from '#/components/ui/badge'
import { Coins, Camera, ShieldCheck, Zap, ArrowRight, Star, LayoutDashboard } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { authClient } from '#/lib/auth/auth-client'

const features = [
  {
    icon: <Coins className="w-8 h-8 text-primary" />,
    title: 'Earn Extra Income',
    description:
      'Turn your idle items into a steady stream of passive income without any extra effort.',
  },
  {
    icon: <Camera className="w-8 h-8 text-info-foreground" />,
    title: 'Easy Listing',
    description:
      'Upload photos, set your price, and list your item in less than 2 minutes.',
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-primary" />,
    title: 'Verified Renters',
    description:
      'All renters are verified through our platform to ensure your items are in safe hands.',
  },
  {
    icon: <Zap className="w-8 h-8 text-yellow-600" />,
    title: 'Instant Management',
    description:
      'Manage all your rentals, bookings, and earnings from your personalized dashboard.',
  },
]

export function BecomeListerPage() {
  const { data: session } = authClient.useSession()
  const isLoggedIn = !!session?.user

  // Logged-in users go straight to their listings dashboard.
  // Guests go to sign up first.
  const ctaHref = isLoggedIn ? '/account/listings' : '/signup'

  return (
    <div className="min-h-screen bg-card pb-20">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center overflow-hidden bg-foreground text-primary-foreground">
        <div className="absolute inset-0 opacity-40">
          <img
            src="https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=1600&q=80"
            alt="Hero Background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl">
            <Badge className="mb-6 bg-primary hover:bg-primary-hover text-primary-foreground px-4 py-1.5 rounded-full font-bold text-sm">
              JOIN 5,000+ OWNERS
            </Badge>
            <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-8 leading-tight">
              Turn Your Things Into{' '}
              <span className="text-primary">Earnings</span>
            </h1>
            <p className="text-xl text-muted-dark mb-10 leading-relaxed">
              Don't let your items gather dust. List them on Vastu-Rent and
              start earning money today. It's safe, easy, and free to get
              started.
            </p>
            <Link to={ctaHref as any}>
              <Button size="lg" className="flex items-center gap-3">
                {isLoggedIn ? (
                  <>
                    Go to My Listings
                    <LayoutDashboard size={20} />
                  </>
                ) : (
                  <>
                    Start Listing Now
                    <ArrowRight size={20} />
                  </>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why List Section */}
      <section className="py-24 bg-background">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Why list on Vastu-Rent?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We provide the tools and security you need to share your items
              with confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <Card
                key={i}
                className="bg-card border border-border/30 shadow-sm hover:shadow-xl transition-all duration-300 rounded-3xl p-6 group"
              >
                <CardHeader className="p-0 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center transition-transform group-hover:scale-110">
                    {feature.icon}
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <CardTitle className="text-xl font-bold text-foreground mb-3">
                    {feature.title}
                  </CardTitle>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-24">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="bg-primary/5 rounded-[40px] overflow-hidden flex flex-col lg:flex-row border border-brand/10">
            <div className="lg:w-1/2 bg-muted/50">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80"
                alt="Happy Owner"
                className="w-full h-full object-cover"
                onError={(e) => {
                  ; (e.target as any).src =
                    'https://placehold.co/800x800/166534/FFFFFF/png?text=Happy+Owner'
                }}
              />
            </div>
            <div className="lg:w-1/2 p-12 lg:p-20 flex flex-col justify-center">
              <div className="flex gap-1 mb-8">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-6 h-6 text-yellow-500 fill-yellow-500"
                  />
                ))}
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-8 italic leading-snug">
                "Listing my professional camera equipment on Vastu-Rent has been
                a game-changer. I've earned over ₹45,000 in just three months,
                and every renter has been respectful and professional."
              </h3>
              <div>
                <p className="text-xl font-bold text-primary">Rahul Sharma</p>
                <p className="text-muted-foreground/85">
                  Professional Photographer, Ahmedabad
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 text-center">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-foreground mb-8">
            Your items could be earning for you right now.
          </h2>
          <Link to={ctaHref as any}>
            <Button size="lg">
              {isLoggedIn ? 'Go to My Listings' : 'Get Started for Free'}
            </Button>
          </Link>
          <p className="mt-6 text-muted-foreground/85">
            {isLoggedIn
              ? 'Create your first listing in under 2 minutes.'
              : 'No hidden fees. No listing costs. Just earnings.'}
          </p>
        </div>
      </section>
    </div>
  )
}
