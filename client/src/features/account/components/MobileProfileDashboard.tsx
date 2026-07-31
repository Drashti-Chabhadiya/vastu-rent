import { Link } from '@tanstack/react-router'
import {
  Settings,
  Shield,
  CreditCard,
  LayoutDashboard,
  Calendar,
  Building2,
  Star,
  MessageSquare,
  Bell,
  HelpCircle,
  Check,
  MapPin,
  LogOut,
  ChevronRight,
  User,
  Leaf,
} from 'lucide-react'
import { Button } from '#/components/ui/button'
import { isAdminRole } from '#/lib/auth/roles'
import { useState } from 'react'

interface MobileProfileDashboardProps {
  session: any
  bookingsCount: number
  listingsCount: number
  completenessPercent: number
  joinDate: string
  onLogoutClick: () => void
  t: (key: string) => string
  hasListings: boolean
  unreadMessagesCount: number
  unreadCount: number
}

export function MobileProfileDashboard({
  session,
  bookingsCount,
  listingsCount,
  completenessPercent,
  joinDate,
  onLogoutClick,
  t,
  hasListings,
  unreadMessagesCount,
  unreadCount,
}: MobileProfileDashboardProps) {
  const [imageError, setImageError] = useState(false)
  const user = session?.user


  return (
    <div className="flex flex-col w-full bg-background min-h-screen">
      {/* Dark Green Header Card */}
      <div className="bg-primary text-primary-foreground rounded-b-[30px] px-5 pt-7 pb-6 relative shadow-sm">
        {/* Top Header Row */}
        <div className="flex justify-between items-center">
          <span className="font-display italic text-[15px] opacity-90 font-medium">
            {t('My profile')}
          </span>
          <Link
            to="/account/profile"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center cursor-pointer border-none text-white animate-fade-in"
          >
            <Settings size={16} />
          </Link>
        </div>

        {/* User Avatar + Details Row */}
        <div className="flex items-center gap-3.5 mt-5">
          <div className="relative group shrink-0">
            <div className="w-14 h-14 rounded-full bg-white/10 border-2 border-white/25 shadow-xs flex items-center justify-center text-xl font-extrabold text-white overflow-hidden relative">
              {user?.image && !imageError ? (
                <img
                  src={user.image}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                user?.name?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
          </div>
          <div>
            <h4 className="font-display font-medium text-lg tracking-tight text-white leading-tight">
              {user?.name || 'User'}
            </h4>
            <p className="text-[10px] text-white/60 font-semibold mt-0.5">
              {t('Member since')} {joinDate}
            </p>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 text-white text-[9px] font-extrabold px-2.5 py-0.5 mt-2 border border-white/10">
              <Check size={8} className="text-white stroke-[3] shrink-0" />
              {t('Verified member')}
            </span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-px bg-white/10 border border-white/10 rounded-2xl p-2.5 mt-5 backdrop-blur-xs">
          <Link
            to="/account/bookings"
            className="text-center hover:opacity-85 transition-opacity"
          >
            <div className="font-black text-base leading-tight text-white">
              {bookingsCount}
            </div>
            <div className="text-[8px] text-white/60 font-black tracking-wider uppercase mt-0.5">
              {t('Bookings')}
            </div>
          </Link>
          <Link
            to="/account/listings"
            className="text-center border-x border-white/10 hover:opacity-85 transition-opacity"
          >
            <div className="font-black text-base leading-tight text-white">
              {listingsCount}
            </div>
            <div className="text-[8px] text-white/60 font-black tracking-wider uppercase mt-0.5">
              {t('Listings')}
            </div>
          </Link>
          <Link
            to="/account"
            hash="personal"
            className="text-center hover:opacity-85 transition-opacity"
          >
            <div className="font-black text-base leading-tight text-white">
              {completenessPercent}%
            </div>
            <div className="text-[8px] text-white/60 font-black tracking-wider uppercase mt-0.5">
              {t('Complete')}
            </div>
          </Link>
        </div>
      </div>
      {/* Navigation List Items */}
      <div className="px-5 mt-6 pb-4 space-y-6">
        {/* ADMIN SECTION */}
        {isAdminRole(user?.role) && (
          <div className="space-y-2">
            <h3 className="text-[9px] font-black text-muted-dark uppercase tracking-widest px-0.5">
              {t('Administration')}
            </h3>
            <div className="bg-white border border-border/10 rounded-2xl overflow-hidden shadow-3xs flex flex-col">
              <Link
                to="/dashboard"
                className="flex items-center gap-3 p-3.5 hover:bg-muted-light/20 active:bg-muted-light/30 transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-primary-soft flex items-center justify-center text-primary shrink-0">
                  <LayoutDashboard size={15} className="stroke-[2.5]" />
                </div>
                <span className="text-[12px] font-extrabold text-foreground flex-1">
                  {t('Admin Dashboard')}
                </span>
                <ChevronRight
                  size={13}
                  className="text-muted-dark/60 stroke-[2.5]"
                />
              </Link>
            </div>
          </div>
        )}

        {/* MY ACTIVITY SECTION */}
        <div className="space-y-2">
          <h3 className="text-[9px] font-black text-muted-dark uppercase tracking-widest px-0.5">
            {t('My Activity')}
          </h3>
          <div className="bg-white border border-border/10 rounded-2xl overflow-hidden shadow-3xs flex flex-col">
            {/* My Bookings */}
            <Link
              to="/account/bookings"
              className="flex items-center gap-3 p-3.5 hover:bg-muted-light/20 active:bg-muted-light/30 transition-all border-b border-border/10 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-primary-soft flex items-center justify-center text-primary shrink-0">
                <Calendar size={15} className="stroke-[2.5]" />
              </div>
              <span className="text-[12px] font-extrabold text-foreground flex-1">
                {t('My Bookings')}
              </span>
              <ChevronRight
                size={13}
                className="text-muted-dark/60 stroke-[2.5]"
              />
            </Link>

            {/* My Listings */}
            <Link
              to="/account/listings"
              className="flex items-center gap-3 p-3.5 hover:bg-muted-light/20 active:bg-muted-light/30 transition-all border-b border-border/10 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-primary-soft flex items-center justify-center text-primary shrink-0">
                <Building2 size={15} className="stroke-[2.5]" />
              </div>
              <span className="text-[12px] font-extrabold text-foreground flex-1">
                {t('My Listings')}
              </span>
              <ChevronRight
                size={13}
                className="text-muted-dark/60 stroke-[2.5]"
              />
            </Link>

            {/* Reviews */}
            {hasListings && (
              <Link
                to="/account/reviews"
                className="flex items-center gap-3 p-3.5 hover:bg-muted-light/20 active:bg-muted-light/30 transition-all border-b border-border/10 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-primary-soft flex items-center justify-center text-primary shrink-0">
                  <Star size={15} className="stroke-[2.5]" />
                </div>
                <span className="text-[12px] font-extrabold text-foreground flex-1">
                  {t('Reviews')}
                </span>
                <ChevronRight
                  size={13}
                  className="text-muted-dark/60 stroke-[2.5]"
                />
              </Link>
            )}

            {/* Messages */}
            <Link
              to="/account/messages"
              className="flex items-center gap-3 p-3.5 hover:bg-muted-light/20 active:bg-muted-light/30 transition-all border-b border-border/10 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-primary-soft flex items-center justify-center text-primary shrink-0">
                <MessageSquare size={15} className="stroke-[2.5]" />
              </div>
              <span className="text-[12px] font-extrabold text-foreground flex-1">
                {t('Messages')}
              </span>
              {unreadMessagesCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-warning text-warning-foreground text-[9.5px] font-black flex items-center justify-center shrink-0 border border-warning/20 mr-1 shadow-3xs">
                  {unreadMessagesCount}
                </span>
              )}
              <ChevronRight
                size={13}
                className="text-muted-dark/60 stroke-[2.5]"
              />
            </Link>

            {/* Notifications */}
            <Link
              to="/account/notifications"
              className="flex items-center gap-3 p-3.5 hover:bg-muted-light/20 active:bg-muted-light/30 transition-all cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-primary-soft flex items-center justify-center text-primary shrink-0">
                <Bell size={15} className="stroke-[2.5]" />
              </div>
              <span className="text-[12px] font-extrabold text-foreground flex-1">
                {t('Notifications')}
              </span>
              {unreadCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-warning text-warning-foreground text-[9.5px] font-black flex items-center justify-center shrink-0 border border-warning/20 mr-1 shadow-3xs">
                  {unreadCount}
                </span>
              )}
              <ChevronRight
                size={13}
                className="text-muted-dark/60 stroke-[2.5]"
              />
            </Link>
          </div>
        </div>

        {/* ACCOUNT DETAILS SECTION */}
        <div className="space-y-2">
          <h3 className="text-[9px] font-black text-muted-dark uppercase tracking-widest px-0.5">
            {t('Account Details')}
          </h3>
          <div className="bg-white border border-border/10 rounded-2xl overflow-hidden shadow-3xs flex flex-col">
            {/* Personal details */}
            <Link
              to="/account"
              hash="personal"
              className="flex items-center gap-3 p-3.5 hover:bg-muted-light/20 active:bg-muted-light/30 transition-all border-b border-border/10 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-primary-soft flex items-center justify-center text-primary shrink-0">
                <User size={15} className="stroke-[2.5]" />
              </div>
              <span className="text-[12px] font-extrabold text-foreground flex-1">
                {t('Personal details')}
              </span>
              <ChevronRight
                size={13}
                className="text-muted-dark/60 stroke-[2.5]"
              />
            </Link>

            {/* Rental address */}
            <Link
              to="/account"
              hash="address"
              className="flex items-center gap-3 p-3.5 hover:bg-muted-light/20 active:bg-muted-light/30 transition-all border-b border-border/10 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-primary-soft flex items-center justify-center text-primary shrink-0">
                <MapPin size={15} className="stroke-[2.5]" />
              </div>
              <span className="text-[12px] font-extrabold text-foreground flex-1">
                {t('Rental address')}
              </span>
              <ChevronRight
                size={13}
                className="text-muted-dark/60 stroke-[2.5]"
              />
            </Link>

            {/* Security & preferences */}
            <Link
              to="/account"
              hash="security"
              className="flex items-center gap-3 p-3.5 hover:bg-muted-light/20 active:bg-muted-light/30 transition-all border-b border-border/10 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-primary-soft flex items-center justify-center text-primary shrink-0">
                <Shield size={15} className="stroke-[2.5]" />
              </div>
              <span className="text-[12px] font-extrabold text-foreground flex-1">
                {t('Security & preferences')}
              </span>
              <ChevronRight
                size={13}
                className="text-muted-dark/60 stroke-[2.5]"
              />
            </Link>

            {/* Subscription */}
            <Link
              to="/account"
              hash="subscription"
              className="flex items-center gap-3 p-3.5 hover:bg-muted-light/20 active:bg-muted-light/30 transition-all cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700 shrink-0">
                <CreditCard size={15} className="stroke-[2.5]" />
              </div>
              <span className="text-[12px] font-extrabold text-foreground flex-1">
                {t('Subscription')}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[8.5px] font-black uppercase tracking-wider mr-1 shadow-3xs">
                {t('Pro')}
              </span>
              <ChevronRight
                size={13}
                className="text-muted-dark/60 stroke-[2.5]"
              />
            </Link>
          </div>
        </div>

        {/* GREEN IMPACT SECTION */}
        <div className="space-y-2">
          <h3 className="text-[9px] font-black text-muted-dark uppercase tracking-widest px-0.5">
            {t('Green Impact')}
          </h3>
          <div className="bg-white border border-border/10 rounded-2xl overflow-hidden shadow-3xs flex flex-col">
            <div className="flex items-center gap-3 p-3.5 border-b border-border/10">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700 shrink-0">
                <Leaf size={15} className="stroke-[2.5] fill-emerald-700/10" />
              </div>
              <span className="text-[12px] font-extrabold text-foreground flex-1">
                {t('25kg saved from landfill')}
              </span>
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Check size={10} className="stroke-[3]" />
              </span>
            </div>

            <Link
              to="/about"
              className="flex items-center gap-3 p-3.5 hover:bg-muted-light/20 active:bg-muted-light/30 transition-all cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-primary-soft flex items-center justify-center text-primary shrink-0">
                <Leaf size={15} className="stroke-[2.5]" />
              </div>
              <span className="text-[12px] font-extrabold text-foreground flex-1">
                {t('View my footprint')}
              </span>
              <ChevronRight
                size={13}
                className="text-muted-dark/60 stroke-[2.5]"
              />
            </Link>
          </div>
        </div>

        {/* SUPPORT SECTION */}
        <div className="space-y-2">
          <h3 className="text-[9px] font-black text-muted-dark uppercase tracking-widest px-0.5">
            {t('Support & Settings')}
          </h3>
          <div className="bg-white border border-border/10 rounded-2xl overflow-hidden shadow-3xs flex flex-col">
            {/* Settings */}
            <Link
              to="/account/profile"
              className="flex items-center gap-3 p-3.5 hover:bg-muted-light/20 active:bg-muted-light/30 transition-all border-b border-border/10 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-primary-soft flex items-center justify-center text-primary shrink-0">
                <Settings size={15} className="stroke-[2.5]" />
              </div>
              <span className="text-[12px] font-extrabold text-foreground flex-1">
                {t('Settings')}
              </span>
              <ChevronRight
                size={13}
                className="text-muted-dark/60 stroke-[2.5]"
              />
            </Link>

            <Link
              to="/help"
              className="flex items-center gap-3 p-3.5 hover:bg-muted-light/20 active:bg-muted-light/30 transition-all border-b border-border/10 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-primary-soft flex items-center justify-center text-primary shrink-0">
                <HelpCircle size={15} className="stroke-[2.5]" />
              </div>
              <span className="text-[12px] font-extrabold text-foreground flex-1">
                {t('Help & FAQ')}
              </span>
              <ChevronRight
                size={13}
                className="text-muted-dark/60 stroke-[2.5]"
              />
            </Link>

            <Link
              to="/contact"
              className="flex items-center gap-3 p-3.5 hover:bg-muted-light/20 active:bg-muted-light/30 transition-all cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-primary-soft flex items-center justify-center text-primary shrink-0">
                <User size={15} className="stroke-[2.5]" />
              </div>
              <span className="text-[12px] font-extrabold text-foreground flex-1">
                {t('Contact support')}
              </span>
              <ChevronRight
                size={13}
                className="text-muted-dark/60 stroke-[2.5]"
              />
            </Link>
          </div>
        </div>

        {/* LOG OUT BUTTON */}
        <div className="pt-2">
          <Button
            onClick={onLogoutClick}
            className="w-full h-12 bg-card border border-danger/20 text-danger hover:bg-danger/10 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-3xs"
          >
            <LogOut size={16} />
            {t('Log out')}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Layout ───────────────────────────────────────────────────────────────────
