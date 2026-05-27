import {
  LayoutGrid,
  ShieldCheck,
  UserCheck,
  Headset,
  TicketX,
} from 'lucide-react'

const features = [
  {
    icon: (
      <LayoutGrid
        className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700"
        strokeWidth={1.5}
      />
    ),
    title: 'Wide Range\nof Categories',
  },
  {
    icon: (
      <ShieldCheck
        className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700"
        strokeWidth={1.5}
      />
    ),
    title: 'Secure\nPayments',
  },
  {
    icon: (
      <UserCheck
        className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700"
        strokeWidth={1.5}
      />
    ),
    title: 'Verified\nUsers',
  },
  {
    icon: (
      <Headset
        className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700"
        strokeWidth={1.5}
      />
    ),
    title: '24/7\nSupport',
  },
  {
    icon: (
      <TicketX
        className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700"
        strokeWidth={1.5}
      />
    ),
    title: 'Easy\nCancellations',
  },
]

export function FeaturesBar() {
  return (
    <section className="bg-background border-t border-b border-slate-100 py-6">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center sm:justify-between gap-6 sm:gap-4 md:gap-6">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 sm:gap-3">
              {feature.icon}
              <span className="text-[10px] sm:text-xs font-semibold text-gray-800 whitespace-pre-line leading-tight">
                {feature.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
