import { useState } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { useUserProfile } from '#/hook/use-users'
import { useCreateConversation } from '#/hook/use-chat'
import { ProductCard } from '#/components/common/ProductCard'
import { UserProfilePageSkeleton } from '#/components/skeletons'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { authClient } from '#/lib/auth/auth-client'
import { cn } from '#/lib/utils'
import { toast } from 'sonner'
import {
  Star,
  MapPin,
  Calendar,
  Check,
  MessageSquare,
  Share2,
  Package,
  Leaf,
  ChevronDown,
  Clock,
  BadgeCheck,
} from 'lucide-react'

import { UserAvatar } from '#/features/dashboard/components/messages/components/UserAvatar'
import { MobileBackButton } from '#/components/common/MobileBackHeader'
import { ProfileOptionsMenu } from './ProfileOptionsMenu'
import { ProfileStatsGrid } from './ProfileStatsGrid'
import { ProfileWhyRentBanner } from './ProfileWhyRentBanner'
import { ExploreLink } from '#/components/common/ExploreLink'
import { useTranslation } from '#/context/TranslationContext'

export function UserProfilePage() {
  const { id } = useParams({ from: '/users/$id' })
  const { data: profile, isLoading } = useUserProfile(id)
  const { data: session } = authClient.useSession()
  const { t } = useTranslation()
  const [isBioExpanded, setIsBioExpanded] = useState(false)
  const navigate = useNavigate()
  const createConversation = useCreateConversation()

  const handleMessageUser = async () => {
    if (!profile) return

    if (!session?.user) {
      toast.error('Please sign in to contact this user.')
      navigate({ to: '/login' })
      return
    }

    if (session.user.id === profile.id) {
      toast.info('This is your own profile.')
      return
    }

    createConversation.mutate(profile.id, {
      onSuccess: () => {
        toast.success(`Chat started with ${profile.name}!`)
        navigate({ to: '/account/messages' })
      },
      onError: (err: any) => {
        toast.error(
          err?.response?.data?.message ||
            'Could not start conversation. Try again.',
        )
      },
    })
  }

  const handleShareProfile = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `${profile?.name}'s Profile - Vastu Rent`,
          text: `Check out ${profile?.name}'s rental profile on Vastu Rent!`,
          url: window.location.href,
        })
        .catch(() => {
          navigator.clipboard.writeText(window.location.href)
          toast.success('Profile link copied to clipboard!')
        })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Profile link copied to clipboard!')
    }
  }

  if (isLoading) {
    return <UserProfilePageSkeleton />
  }

  if (!profile) {
    return (
      <div className="min-h-full bg-background flex items-center justify-center">
        <p className="text-muted-foreground font-bold">
          User profile not found
        </p>
      </div>
    )
  }

  const firstName = profile.name ? profile.name.split(' ')[0] : 'User'
  const userLocation = profile.location
    ? profile.location.split(',')[0]
    : 'Surat'

  return (
    <div className="min-h-full bg-background md:bg-surface pt-0 md:pt-20 md:pb-16 relative w-full font-sans">
      {/* Mobile Banner Background Image */}
      <div className="md:hidden absolute top-0 left-0 right-0 h-56 z-0 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80"
          className="w-full h-full object-cover"
          alt="Banner"
        />
        <div className="absolute inset-0 bg-black/15" />
      </div>

      {/* Mobile Custom Header Nav */}
      <div className="md:hidden absolute top-4 left-4 right-4 flex justify-between items-center z-20">
        <MobileBackButton />

        {/* Reusable Profile Options Menu */}
        <ProfileOptionsMenu
          userName={profile.name}
          onShare={handleShareProfile}
        />
      </div>

      <div className="mx-auto max-w-[1240px] px-0 md:px-6 relative z-10 pt-32 md:pt-4">
        {/* Desktop Cover Banner Header */}
        <div className="hidden md:block h-64 lg:h-72 w-full rounded-[32px] overflow-hidden relative mb-[-72px] z-0 shadow-xs border border-border/40">
          <img
            src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1600&q=80"
            className="w-full h-full object-cover"
            alt="Desktop Cover Banner"
          />
          <div className="absolute inset-0 bg-black/10" />
        </div>

        {/* Profile Main Card */}
        <div className="bg-card rounded-t-[36px] md:rounded-[36px] px-5 pb-6 pt-5 md:p-10 shadow-sm border-t md:border border-border/40 mb-6 md:mb-8 relative z-10">
          <div className="hidden md:block absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

          {/* Avatar + Info Header Block */}
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 relative z-10">
            <div className="flex flex-row items-start md:items-center gap-4 sm:gap-6 md:gap-8 min-w-0 flex-1">
              {/* Avatar Circle protruding above card top */}
              <div className="relative -mt-14 md:-mt-20 shrink-0">
                <UserAvatar
                  image={profile.image}
                  name={profile.name}
                  size="lg"
                  className="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36"
                  avatarClassName="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 border-4 border-card shadow-md object-cover"
                  fallbackClassName="bg-primary text-primary-foreground text-3xl md:text-5xl font-black"
                />
                {(profile.isOnline || profile.isOnline === undefined) && (
                  <span className="absolute bottom-1 right-1 md:bottom-2 md:right-2 w-4.5 h-4.5 md:w-5 md:h-5 rounded-full bg-brand-green-mid border-2 border-card shadow-xs z-10" />
                )}
              </div>

              {/* Name + Badges + Rating Column */}
              <div className="flex-1 min-w-0 text-left pt-1 md:pt-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight font-display truncate">
                    {profile.name}
                  </h1>
                  {profile.emailVerified !== false && (
                    <BadgeCheck className="w-5 h-5 md:w-6 md:h-6 fill-primary text-primary-foreground shrink-0 ml-0.5" />
                  )}
                </div>

                {/* Badges Row */}
                <div className="flex flex-wrap items-center gap-2 mt-1.5 md:mt-2">
                  {profile.emailVerified !== false && (
                    <Badge className="bg-primary-soft hover:bg-primary-soft text-primary border-0 gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold shrink-0">
                      <Check size={11} strokeWidth={3} />
                      Verified
                    </Badge>
                  )}
                  {(profile.isGreenMember ||
                    profile.isGreenMember === undefined) && (
                    <Badge className="bg-primary-soft hover:bg-primary-soft text-primary border-0 gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold shrink-0">
                      <Leaf className="w-3 h-3 fill-current" />
                      Green Member
                    </Badge>
                  )}
                </div>

                {/* Rating & Location Line */}
                <div className="flex items-center gap-1.5 mt-2 text-xs md:text-sm font-semibold text-muted-foreground">
                  <Star size={15} className="fill-amber-500 text-amber-500" />
                  <span className="font-extrabold text-foreground">
                    {profile.averageRating
                      ? Number(profile.averageRating).toFixed(1)
                      : '5.0'}
                  </span>
                  <span>({profile.reviewCount || 25} reviews)</span>
                  <span className="text-muted-foreground/60">•</span>
                  <span>{userLocation}, Gujarat, India</span>
                </div>
              </div>
            </div>

            {/* Desktop Action Buttons Row */}
            <div className="hidden md:flex items-center gap-3 shrink-0 self-center md:self-end mt-2 md:mt-0">
              <Button
                onClick={handleMessageUser}
                disabled={createConversation.isPending}
                className="h-12 px-7 rounded-full bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-sm shadow-md transition-all active:scale-95 flex items-center gap-2"
              >
                <MessageSquare size={18} />
                {createConversation.isPending
                  ? 'Connecting...'
                  : `Message ${firstName}`}
              </Button>
              <Button
                onClick={handleShareProfile}
                variant="outline"
                className="h-12 px-5 rounded-full border border-border bg-card hover:bg-muted font-bold text-foreground text-sm flex items-center gap-2"
              >
                <Share2 size={18} />
                Share Profile
              </Button>
              {/* Reusable Profile Options Menu */}
              <ProfileOptionsMenu
                userName={profile.name}
                onShare={handleShareProfile}
                triggerClassName="w-12 h-12 rounded-full border border-border bg-card hover:bg-muted text-foreground flex items-center justify-center cursor-pointer"
              />
            </div>
          </div>

          {/* 3-Column Metadata Card */}
          <div className="grid grid-cols-3 border border-border rounded-[20px] p-3.5 bg-surface/50 mt-6 divide-x divide-border">
            <div className="flex items-center gap-2 px-1 sm:px-2 md:px-4">
              <MapPin size={18} className="text-foreground shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] sm:text-xs md:text-sm font-black text-foreground truncate">
                  {profile.location || 'Surat, Gujarat'}
                </span>
                <span className="text-[9px] md:text-xs text-muted-foreground font-bold">
                  India
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 px-2 sm:px-3 md:px-4">
              <Calendar size={18} className="text-foreground shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] md:text-xs text-muted-foreground font-bold">
                  Member since
                </span>
                <span className="text-[11px] sm:text-xs md:text-sm font-black text-foreground truncate">
                  {new Date(
                    profile.createdAt || '2026-07-01',
                  ).toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 px-2 sm:px-3 md:px-4">
              <Clock size={18} className="text-foreground shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] md:text-xs text-muted-foreground font-bold">
                  Responds in
                </span>
                <span className="text-[11px] sm:text-xs md:text-sm font-black text-foreground truncate">
                  &lt;1hr
                </span>
              </div>
            </div>
          </div>

          {/* About Card & Highlight Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 md:gap-6 mt-4 md:mt-6">
            {/* About Card Box */}
            <div className="border border-border rounded-[20px] p-4 md:p-5 bg-surface/50 flex flex-col justify-between">
              <div>
                <h3 className="text-sm md:text-base font-black text-foreground mb-1.5 font-display">
                  About {firstName}
                </h3>
                {(() => {
                  const bioText =
                    profile.bio ||
                    `Lends camera gear from home in ${userLocation} — usually replies within the hour and keeps every item freshly checked between rentals.`
                  const isLongBio = bioText.length > 100

                  return (
                    <>
                      <p
                        className={cn(
                          'text-xs md:text-sm text-muted-foreground leading-relaxed',
                          !isBioExpanded && isLongBio && 'line-clamp-2',
                        )}
                      >
                        {bioText}
                      </p>

                      {isLongBio && (
                        <div className="flex justify-end mt-2">
                          <button
                            onClick={() => setIsBioExpanded(!isBioExpanded)}
                            className="text-[11px] md:text-xs font-black text-primary flex items-center gap-0.5 hover:underline cursor-pointer"
                          >
                            {isBioExpanded ? 'Read less' : 'Read more'}
                            <ChevronDown
                              size={12}
                              className={cn(
                                'transition-transform',
                                isBioExpanded && 'rotate-180',
                              )}
                            />
                          </button>
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>
            </div>

            {/* Reusable Highlight/Stats Grid Component */}
            <ProfileStatsGrid
              listingsCount={
                profile.listingsCount ?? profile.listings?.length ?? 12
              }
              createdAt={profile.createdAt}
            />
          </div>
        </div>

        {/* User Active Listings Section */}
        <div className="px-5 md:px-0 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-2xl font-black text-foreground tracking-tight flex items-center gap-2 font-display">
              Active listings
            </h2>
            <ExploreLink to="/products">{t('View all listings')}</ExploreLink>
          </div>

          {/* Listings Container */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {profile.listings && profile.listings.length > 0 ? (
              profile.listings.map((item: any) => (
                <div key={item.id} className="w-full h-full">
                  {/* Mobile Common Grid Card */}
                  <div className="md:hidden h-full">
                    <ProductCard product={item} variant="mini" />
                  </div>

                  {/* Desktop Standard Card Layout */}
                  <div className="hidden md:block bg-card rounded-3xl overflow-hidden shadow-sm border border-border h-full">
                    <ProductCard product={item} />
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-16 bg-card rounded-3xl border border-dashed border-border text-center">
                <Package
                  size={44}
                  className="mx-auto text-muted-foreground/30 mb-3"
                />
                <h3 className="text-base font-bold text-foreground">
                  No active listings
                </h3>
                <p className="text-xs text-muted-foreground/85">
                  This user hasn't listed any items for rent yet.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Reusable Why Rent From Banner Component */}
        <ProfileWhyRentBanner firstName={firstName} />

        {/* Extra spacer for mobile floating bottom bar */}
        <div className="h-48 md:hidden" />
      </div>

      {/* Mobile Sticky Floating bottom Action Bar */}
      <div className="md:hidden fixed bottom-[calc(72px+max(env(safe-area-inset-bottom),8px)+12px)] left-4 right-4 flex gap-3 z-50">
        <Button
          onClick={handleMessageUser}
          disabled={createConversation.isPending}
          className="flex-1 h-14 rounded-full bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-base flex items-center justify-center gap-2 shadow-xl"
        >
          <MessageSquare size={20} />
          {createConversation.isPending
            ? 'Connecting...'
            : `Message ${firstName}`}
        </Button>
        <Button
          onClick={handleShareProfile}
          variant="outline"
          className="w-14 h-14 rounded-full border border-border bg-card shadow-xl flex items-center justify-center shrink-0 hover:bg-muted"
        >
          <Share2 size={20} className="text-primary" />
        </Button>
      </div>
    </div>
  )
}
