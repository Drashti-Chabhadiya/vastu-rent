import { Home, Users, ShieldCheck, Star } from 'lucide-react'

const stats = [
  {
    icon: (
      <Home
        className="h-5 w-5 sm:h-6 sm:w-6 text-primary-accent"
        strokeWidth={1.5}
      />
    ),
    value: '25,000+',
    label: 'Items Available',
  },
  {
    icon: (
      <Users
        className="h-5 w-5 sm:h-6 sm:w-6 text-primary-accent"
        strokeWidth={1.5}
      />
    ),
    value: '15,000+',
    label: 'Happy Customers',
  },
  {
    icon: (
      <ShieldCheck
        className="h-5 w-5 sm:h-6 sm:w-6 text-primary-accent"
        strokeWidth={1.5}
      />
    ),
    value: '98%',
    label: 'Verified & Trusted',
  },
  {
    icon: (
      <Star
        className="h-5 w-5 sm:h-6 sm:w-6 text-primary-accent"
        strokeWidth={1.5}
      />
    ),
    value: '4.8/5',
    label: 'Customer Rating',
  },
]

export function StatsSection() {
  return (
    <section className="bg-white py-8 sm:py-12">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="bg-bg-card rounded-2xl border border-gray-100 shadow-sm py-8 px-6 lg:px-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-4">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-full border border-gray-100 bg-white shadow-sm">
                {stat.icon}
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-gray-900">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm font-medium text-gray-600">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
