import { useParams, useNavigate } from '@tanstack/react-router'
import { useUserProfile } from '#/hook/use-users'
import { useCreateConversation } from '#/hook/use-chat'
import { ProductCard } from '#/components/common/ProductCard'
import { UserProfilePageSkeleton } from '#/components/skeletons'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { authClient } from '#/lib/auth/auth-client'
import { toast } from 'sonner'
import {
  Star,
  MapPin,
  Calendar,
  CheckCircle2,
  MessageCircle,
  Share2,
  Package,
  Languages,
  Phone,
} from 'lucide-react'

export function UserProfilePage() {
  const { id } = useParams({ from: '/users/$id' })
  const { data: profile, isLoading } = useUserProfile(id)
  const { data: session } = authClient.useSession()
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
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <p className="text-muted-foreground/85 font-bold">
          User profile not found
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-base pt-24 pb-16">
      <div className="mx-auto max-w-[1200px] px-4">
        {/* Profile Header */}
        <div className="bg-card rounded-[40px] p-8 md:p-12 shadow-sm border border-border/30 mb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
            <div className="relative">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-muted/50 overflow-hidden border-4 border-card shadow-lg">
                {profile.image ? (
                  <img
                    src={profile.image}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary text-primary-foreground text-4xl font-black">
                    {profile.name?.[0] || 'U'}
                  </div>
                )}
              </div>
              {/* Online/active green dot */}
              <span
                className="absolute bottom-3 right-3 w-5 h-5 bg-primary border-[3px] border-card rounded-full shadow-md"
                title="Online"
              />
              {profile.emailVerified ? (
                <Badge className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground border-2 border-card px-2 py-1 rounded-lg whitespace-nowrap">
                  <CheckCircle2 size={12} className="mr-1" />
                  Verified
                </Badge>
              ) : (
                <Badge className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-500 text-amber-950 border-2 border-card px-2 py-1 rounded-lg whitespace-nowrap hover:bg-amber-500">
                  Unverified
                </Badge>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
                  {profile.name}
                </h1>
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <Badge
                    variant="outline"
                    className="rounded-xl px-3 py-1 font-bold text-muted-foreground border-border"
                  >
                    {profile.listingsCount} Listings
                  </Badge>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-50 rounded-xl">
                    <Star
                      size={14}
                      className="text-yellow-500 fill-yellow-500"
                    />
                    <span className="text-sm font-black text-yellow-700">
                      {profile.averageRating}
                    </span>
                    <span className="text-xs font-bold text-yellow-600/60">
                      ({profile.reviewCount})
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-y-3 gap-x-6 mb-8 text-muted-foreground/85 font-medium">
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-primary" />
                  <span>{profile.location || 'Ahmedabad, Gujarat'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-primary" />
                  <span>
                    Member since{' '}
                    {new Date(profile.createdAt).toLocaleDateString('en-IN', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle
                    size={18}
                    className={
                      profile.emailVerified
                        ? 'text-primary'
                        : 'text-muted-foreground/50'
                    }
                  />
                  <span>
                    {profile.emailVerified
                      ? 'Verified Identity'
                      : 'Unverified Identity'}
                  </span>
                </div>
                {profile.language && (
                  <div className="flex items-center gap-2">
                    <Languages size={18} className="text-primary" />
                    <span>Speaks {profile.language}</span>
                  </div>
                )}
                {profile.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={18} className="text-primary" />
                    <span>{profile.phone}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <Button
                  onClick={handleMessageUser}
                  disabled={createConversation.isPending}
                  className="h-12 px-8 rounded-2xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold shadow-lg shadow-brand/20 transition-all active:scale-95 flex items-center gap-2"
                >
                  <MessageCircle size={18} />
                  {createConversation.isPending
                    ? 'Connecting...'
                    : 'Message User'}
                </Button>
                <Button
                  onClick={handleShareProfile}
                  variant="outline"
                  className="h-12 px-6 rounded-2xl border-border font-bold text-foreground/80 gap-2 hover:bg-muted-light"
                >
                  <Share2 size={18} />
                  Share Profile
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* User Listings */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-3">
              <Package className="text-primary" />
              Active Listings
            </h2>
            <p className="text-sm font-bold text-muted-foreground/70 uppercase tracking-widest">
              Total {profile.listingsCount} Items
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {profile.listings.length > 0 ? (
              profile.listings.map((item: any) => (
                <ProductCard key={item.id} product={item} />
              ))
            ) : (
              <div className="col-span-full py-20 bg-card rounded-3xl border border-dashed border-border text-center">
                <Package
                  size={48}
                  className="mx-auto text-muted-foreground/30 mb-4"
                />
                <h3 className="text-lg font-bold text-foreground">
                  No active listings
                </h3>
                <p className="text-muted-foreground/85">
                  This user hasn't listed any items for rent yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
