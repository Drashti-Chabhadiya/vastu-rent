import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Button } from '#/components/ui/button'
import {
  CheckCircle2,
  Search,
  Calendar,
  UserCheck,
  ShieldCheck,
  CreditCard,
} from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { fadeUp, stagger } from '#/lib/animations'

const steps = [
  {
    icon: <Search className="w-10 h-10 text-primary" />,
    title: '1. Find What You Need',
    description:
      'Browse our extensive catalog of rental items, from electronics and furniture to vehicles and tools.',
  },
  {
    icon: <Calendar className="w-10 h-10 text-primary" />,
    title: '2. Choose Your Dates',
    description:
      'Select the pickup and return dates that work for you. Our system ensures items are available when you need them.',
  },
  {
    icon: <CreditCard className="w-10 h-10 text-primary" />,
    title: '3. Secure Booking',
    description:
      'Pay securely through our platform. Your money is held safely until the rental process is complete.',
  },
  {
    icon: <UserCheck className="w-10 h-10 text-primary" />,
    title: '4. Meet and Collect',
    description:
      "Coordinate with the lister to pick up the item. Verify its condition and you're good to go!",
  },
]

const benefits = [
  {
    title: 'Verified Users',
    description:
      'Every user on our platform undergoes a verification process to ensure safety and trust.',
    icon: <ShieldCheck className="w-6 h-6 text-primary" />,
  },
  {
    title: 'Quality Guarantee',
    description:
      'We encourage honest reviews and high standards to ensure you get what you pay for.',
    icon: <CheckCircle2 className="w-6 h-6 text-primary" />,
  },
]

export function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <section className="bg-card py-20 border-b border-border/30 overflow-hidden">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 text-center"
        >
          <motion.h1
            variants={fadeUp}
            className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight mb-6"
          >
            Renting Made Simple
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="text-xl text-muted-foreground max-w-3xl mx-auto"
          >
            Vastu-Rent connects people who have things with people who need
            them. It's the smarter, more sustainable way to live.
          </motion.p>
        </motion.div>
      </section>

      {/* Steps Grid */}
      <section className="py-20 overflow-hidden">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeUp}
              className="text-3xl font-bold text-foreground mb-4"
            >
              How it works for Renters
            </motion.h2>
            <motion.div
              variants={fadeUp}
              className="w-20 h-1.5 bg-primary mx-auto rounded-full"
            />
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {steps.map((step, index) => (
              <motion.div key={index} variants={fadeUp} className="flex">
                <Card className="w-full bg-card border border-border/30 shadow-sm hover:shadow-xl transition-all duration-300 rounded-[32px] overflow-hidden group">
                  <CardHeader className="pt-10 flex items-center justify-center">
                    <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      {step.icon}
                    </div>
                  </CardHeader>
                  <CardContent className="text-center px-8 pb-10">
                    <CardTitle className="text-xl font-bold text-foreground mb-3">
                      {step.title}
                    </CardTitle>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Trust & Safety Section */}
      <section className="py-12 bg-card overflow-hidden">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="bg-primary/5 rounded-[40px] p-8 sm:p-12 lg:p-16 flex flex-col lg:flex-row items-center gap-12"
          >
            <div className="lg:w-1/2">
              <motion.h2
                variants={fadeUp}
                className="text-3xl sm:text-4xl font-bold text-foreground mb-6"
              >
                Built on Trust and Safety
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="text-lg text-muted-foreground mb-8 leading-relaxed"
              >
                We've built Vastu-Rent with security at its core. From verified
                profiles to secure payments, we've got you covered every step of
                the way.
              </motion.p>
              <motion.div
                variants={stagger}
                className="grid grid-cols-1 sm:grid-cols-2 gap-6"
              >
                {benefits.map((benefit, i) => (
                  <motion.div key={i} variants={fadeUp} className="flex gap-4">
                    <div className="shrink-0 w-10 h-10 rounded-full bg-card flex items-center justify-center shadow-sm">
                      {benefit.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground mb-1">
                        {benefit.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {benefit.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
            <motion.div variants={fadeUp} className="lg:w-1/2">
              <img
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80"
                alt="Safety"
                className="rounded-[32px] shadow-2xl bg-card"
                onError={(e) => {
                  ; (e.target as any).src =
                    'https://placehold.co/800x600/166534/FFFFFF/png?text=Trust+and+Safety'
                }}
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center overflow-hidden">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8"
        >
          <motion.h2
            variants={fadeUp}
            className="text-3xl font-bold text-foreground mb-6"
          >
            Ready to start renting?
          </motion.h2>
          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to={'/products'}>
              <Button size="lg">Browse Items</Button>
            </Link>
            <Link to={'/become-lister'}>
              <Button variant="outline" size="lg">
                Learn to List
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </div>
  )
}
