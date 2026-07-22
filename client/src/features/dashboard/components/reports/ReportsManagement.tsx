import {
  BarChart3,
  ChevronRight,
  Calendar,
  Download,
  Users,
  Package,
  Star,
  ShoppingCart,
  FileText,
  Layout,
  IndianRupee,
  ChevronDown,
} from 'lucide-react'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { motion } from 'motion/react'
import { fadeUp, stagger } from '#/lib/animations'

import { useTranslation } from '#/context/TranslationContext'

export const ReportsManagement = () => {
  const { t, formatCurrency, formatNumber } = useTranslation()

  const stats = [
    {
      label: t('Total Bookings'),
      value: formatNumber(1245),
      sub: `+18.6% ${t('vs last week')}`,
      icon: ShoppingCart,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
    },
    {
      label: t('Total Revenue'),
      value: formatCurrency(1245000),
      sub: `+22.4% ${t('vs last week')}`,
      icon: IndianRupee,
      color: 'text-info-foreground',
      bg: 'bg-info',
    },
    {
      label: t('Total Users'),
      value: formatNumber(2580),
      sub: `+12.8% ${t('vs last week')}`,
      icon: Users,
      color: 'text-purple-500',
      bg: 'bg-purple-50',
    },
    {
      label: t('Total Listings'),
      value: formatNumber(1850),
      sub: `+15.3% ${t('vs last week')}`,
      icon: Package,
      color: 'text-orange-500',
      bg: 'bg-orange-50',
    },
    {
      label: t('Total Reviews'),
      value: formatNumber(890),
      sub: `+9.5% ${t('vs last week')}`,
      icon: Star,
      color: 'text-danger-foreground',
      bg: 'bg-danger',
    },
  ]

  const categories = [
    {
      name: t('Home Decor'),
      orders: 320,
      revenue: 320000,
      growth: '+24.5%',
      color: 'emerald',
    },
    {
      name: t('Electronics'),
      orders: 280,
      revenue: 280000,
      growth: '+18.2%',
      color: 'blue',
    },
    {
      name: t('Vehicles'),
      orders: 210,
      revenue: 210000,
      growth: '+15.7%',
      color: 'amber',
    },
    {
      name: t('Fashion'),
      orders: 180,
      revenue: 180000,
      growth: '+10.3%',
      color: 'emerald',
    },
    {
      name: t('Event Essentials'),
      orders: 150,
      revenue: 155000,
      growth: '- 5.6%',
      color: 'rose',
    },
  ]

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Breadcrumbs */}
      <motion.div variants={fadeUp} className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-dark">
          <span>{t('Dashboard')}</span>
          <ChevronRight size={10} className="text-muted-dark" />
          <span className="text-dash-brand font-extrabold uppercase tracking-widest">
            {t('Platform Analytics')}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black text-foreground">{t('Platform Analytics')}</h1>
          <div className="flex items-center gap-2 bg-card p-1 rounded-xl border border-border/30 shadow-sm">
            <div className="flex items-center gap-2 px-4 py-1.5 border-r border-border/30">
              <Calendar size={14} className="text-dash-brand" />
              <span className="text-[11px] font-bold text-muted-foreground">
                May 12 - May 18, 2024
              </span>
              <ChevronRight size={12} className="rotate-90 text-muted-dark" />
            </div>
            <div className="p-1.5 px-2">
              <div className="w-6 h-6 rounded-lg bg-dash-brand/5 flex items-center justify-center text-dash-brand">
                <BarChart3 size={14} />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Overview Stats */}
      <motion.div
        variants={fadeUp}
        className="bg-card p-8 rounded-[2.5rem] border border-border/30 shadow-sm overflow-x-auto scrollbar-hide"
      >
        <div className="mb-8">
          <h3 className="text-[15px] font-black text-foreground">{t('Overview')}</h3>
        </div>
        <div className="flex gap-6 min-w-max pb-2">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="flex-1 min-w-[200px] flex items-center gap-4 p-5 rounded-3xl border border-border/30 bg-card shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)] transition-all hover:shadow-md cursor-default group"
            >
              <div
                className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center transition-transform group-hover:scale-110`}
              >
                <stat.icon size={22} strokeWidth={2.5} />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-black text-muted-dark uppercase tracking-widest">
                  {stat.label}
                </p>
                <p className="text-lg font-black text-foreground">
                  {stat.value}
                </p>
                <p className={`text-[9px] font-bold ${stat.color}`}>
                  {stat.sub}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <motion.div
        variants={fadeUp}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Left Column: Chart & Table */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue Overview Chart */}
          <div className="bg-card p-8 rounded-[2.5rem] border border-border/30 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[15px] font-black text-foreground">
                Revenue Overview
              </h3>
              <div className="relative">
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 bg-muted-light px-4 py-2 rounded-xl text-[11px] font-black text-foreground/80 h-auto active:scale-[0.98] transition-all cursor-pointer hover:bg-muted/50"
                >
                  This Week <ChevronDown size={14} />
                </Button>
              </div>
            </div>

            {/* Mock Chart SVG */}
            <div className="h-64 w-full relative pt-8">
              <div className="absolute inset-0 flex flex-col justify-between py-2">
                {[200000, 150000, 100000, 50000, 0].map((val) => (
                  <div key={val} className="flex items-center gap-4">
                    <span className="text-[10px] font-bold text-muted-dark w-12">
                      ₹{val.toLocaleString()}
                    </span>
                    <div className="flex-1 h-px bg-muted-light"></div>
                  </div>
                ))}
              </div>
              <svg
                className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
                viewBox="0 0 700 200"
                preserveAspectRatio="none"
              >
                <path
                  d="M 50,150 L 150,120 L 250,120 L 350,70 L 450,110 L 550,120 L 650,160"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M 50,150 L 150,120 L 250,120 L 350,70 L 450,110 L 550,120 L 650,160 L 650,200 L 50,200 Z"
                  fill="url(#gradient)"
                  opacity="0.1"
                />
                <defs>
                  <linearGradient
                    id="gradient"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[50, 150, 250, 350, 450, 550, 650].map((x, i) => (
                  <circle
                    key={i}
                    cx={x}
                    cy={[150, 120, 120, 70, 110, 120, 160][i]}
                    r="4"
                    fill="#10b981"
                  />
                ))}
              </svg>

              {/* Tooltip Mock */}
              <div className="absolute top-[30px] left-[320px] bg-foreground p-3 rounded-2xl shadow-xl z-10 pointer-events-none animate-in fade-in zoom-in duration-300">
                <p className="text-[8px] font-bold text-muted-dark mb-1">
                  15 May 2024
                </p>
                <p className="text-[14px] font-black text-primary-foreground">
                  ₹1,85,000
                </p>
                <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-foreground rotate-45"></div>
              </div>

              {/* X-Axis Labels */}
              <div className="absolute bottom-[-30px] left-0 right-0 flex justify-between px-10">
                {[
                  '12 May',
                  '13 May',
                  '14 May',
                  '15 May',
                  '16 May',
                  '17 May',
                  '18 May',
                ].map((day) => (
                  <span
                    key={day}
                    className="text-[10px] font-bold text-muted-dark"
                  >
                    {day}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Top Performing Categories */}
          <div className="bg-card p-8 rounded-[2.5rem] border border-border/30 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-[15px] font-black text-foreground">
                  Top Performing Categories
                </h3>
              </div>
              <Button
                variant="link"
                className="text-[11px] font-extrabold text-primary hover:text-primary-hover hover:underline p-0 h-auto active:scale-[0.98] transition-all cursor-pointer font-sans"
              >
                View Full Report
              </Button>
            </div>
            <div className="overflow-x-auto -mx-2">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/30 hover:bg-transparent">
                    <TableHead className="text-left px-4 py-3 text-[9px] font-black text-muted-dark uppercase tracking-widest h-auto">
                      Category
                    </TableHead>
                    <TableHead className="text-left px-4 py-3 text-[9px] font-black text-muted-dark uppercase tracking-widest h-auto">
                      Total Orders
                    </TableHead>
                    <TableHead className="text-left px-4 py-3 text-[9px] font-black text-muted-dark uppercase tracking-widest h-auto">
                      Revenue
                    </TableHead>
                    <TableHead className="text-left px-4 py-3 text-[9px] font-black text-muted-dark uppercase tracking-widest h-auto">
                      Growth
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border/30">
                  {categories.map((cat, i) => (
                    <TableRow
                      key={i}
                      className="group hover:bg-muted-light/50 transition-all border-b-0"
                    >
                      <TableCell className="px-4 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-muted/50 overflow-hidden flex-shrink-0">
                            {/* Placeholder for category image */}
                            <Layout
                              size={16}
                              className="w-full h-full p-2.5 text-muted-dark"
                            />
                          </div>
                          <p className="text-[12px] font-black text-foreground">
                            {cat.name}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-5 font-bold text-foreground/80 text-[12px]">
                        {formatNumber(cat.orders)}
                      </TableCell>
                      <TableCell className="px-4 py-5 font-black text-foreground text-[12px]">
                        {formatCurrency(cat.revenue)}
                      </TableCell>
                      <TableCell className="px-4 py-5">
                        <Badge
                          className={`px-2 py-0.5 rounded-lg border-none text-[8px] font-black ${
                            cat.growth.includes('+')
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-danger text-danger-foreground'
                          }`}
                        >
                          {cat.growth.includes('+') ? '↑' : '↓'}{' '}
                          {cat.growth.replace('+', '').replace('-', '')}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Button
              variant="ghost"
              className="w-full mt-6 h-12 bg-muted-light rounded-2xl text-[11px] font-black text-foreground/80 flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
            >
              <FileText size={16} /> View Category Report
            </Button>
          </div>
        </div>

        {/* Right Column: Reports Summary & Downloads */}
        <div className="space-y-6">
          {/* Reports Summary */}
          <div className="bg-card p-8 rounded-[2.5rem] border border-border/30 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[15px] font-black text-foreground">
                Reports Summary
              </h3>
              <Button
                variant="link"
                className="text-[11px] font-extrabold text-primary hover:text-primary-hover hover:underline p-0 h-auto active:scale-[0.98] transition-all cursor-pointer font-sans"
              >
                View All
              </Button>
            </div>
            <div className="space-y-2">
              {[
                {
                  label: 'Sales Report',
                  desc: 'Overview of sales and revenue',
                  icon: ShoppingCart,
                  color: 'bg-emerald-50 text-emerald-600',
                },
                {
                  label: 'User Report',
                  desc: 'Summary of user registrations and activity',
                  icon: Users,
                  color: 'bg-info text-info-foreground',
                },
                {
                  label: 'Order Report',
                  desc: 'Detailed report of all orders',
                  icon: Package,
                  color: 'bg-purple-50 text-purple-600',
                },
                {
                  label: 'Listing Report',
                  desc: 'Overview of all listings and performance',
                  icon: Layout,
                  color: 'bg-orange-50 text-orange-600',
                },
                {
                  label: 'Review Report',
                  desc: 'Summary of reviews and ratings',
                  icon: Star,
                  color: 'bg-danger text-danger-foreground',
                },
                {
                  label: 'Payout Report',
                  desc: 'Overview of payouts and transactions',
                  icon: IndianRupee,
                  color: 'bg-indigo-50 text-indigo-600',
                },
              ].map((report, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 rounded-2xl hover:bg-muted-light transition-all cursor-pointer group border border-transparent hover:border-border/30"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl ${report.color} flex items-center justify-center`}
                    >
                      <report.icon size={16} strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-foreground">
                        {report.label}
                      </p>
                      <p className="text-[9px] font-bold text-muted-dark">
                        {report.desc}
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    size={14}
                    className="text-muted-dark group-hover:text-dash-brand"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Download Reports */}
          <div className="bg-card p-8 rounded-[2.5rem] border border-border/30 shadow-sm">
            <h3 className="text-[15px] font-black text-foreground mb-2">
              Download Reports
            </h3>
            <p className="text-[11px] font-bold text-muted-dark mb-8">
              Download and export reports in your preferred format.
            </p>

            <div className="space-y-4">
              {[
                {
                  label: 'Sales Report (This Week)',
                  type: 'PDF • Generated on 18 May 2024',
                },
                {
                  label: 'User Report (This Week)',
                  type: 'Excel • Generated on 18 May 2024',
                },
                {
                  label: 'Order Report (This Week)',
                  type: 'PDF • Generated on 18 May 2024',
                },
                {
                  label: 'Revenue Report (This Week)',
                  type: 'Excel • Generated on 18 May 2024',
                },
              ].map((dl, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 rounded-2xl bg-muted-light/50 group hover:bg-muted-light transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-card flex items-center justify-center text-muted-dark group-hover:text-emerald-600 border border-border/30 shadow-sm">
                      <Download size={14} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-foreground">
                        {dl.label}
                      </p>
                      <p className="text-[8px] font-bold text-muted-dark uppercase tracking-tight">
                        {dl.type}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 rounded-lg bg-card flex items-center justify-center text-muted-dark hover:text-primary border border-border/30 shadow-sm active:scale-[0.98] transition-all p-0 min-w-0"
                  >
                    <Download size={14} />
                  </Button>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              className="w-full mt-8 h-12 rounded-2xl border-primary-border text-primary font-black text-[11px] flex items-center justify-center gap-2 hover:bg-primary-soft shadow-sm transition-all active:scale-[0.98] cursor-pointer"
            >
              <Layout size={16} /> View All Reports
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
