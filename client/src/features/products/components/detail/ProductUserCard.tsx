import { Link, useNavigate } from '@tanstack/react-router'
import {
  Star,
  Calendar,
  MessageCircle,
  CheckCircle2,
  Instagram,
  Facebook,
  MapPin,
  Loader2,
} from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Badge } from '#/components/ui/badge'
import { UserAvatar } from '#/components/common/UserAvatar'
import { useCreateConversation } from '#/hook'
import { toast } from 'sonner'
import { useState } from 'react'
import { useTranslation } from '#/context/TranslationContext'

interface ProductUserCardProps {
  user: any
  session?: any
}

export const ProductUserCard = ({ user, session }: ProductUserCardProps) => {
  const { t, formatDate } = useTranslation()
  const navigate = useNavigate()
  const [isStartingChat, setIsStartingChat] = useState(false)
  const createConversation = useCreateConversation()

  if (!user) return null

  const googleMapLink = session?.user?.address?.googleMapLink

  const { instagramUrl, facebookUrl } = user

  const handleContactHost = async () => {
    if (!session?.user) {
      toast.error('Please sign in to contact the lister.')
      navigate({ to: '/login' })
      return
    }

    if (session?.user?.id === user.id) {
      toast.info('This is your own listing.')
      return
    }

    setIsStartingChat(true)
    try {
      await createConversation.mutateAsync(user.id)
      toast.success(`Chat started with ${user.name}!`)
      navigate({ to: '/account/messages' })
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          'Could not start conversation. Try again.',
      )
    } finally {
      setIsStartingChat(false)
    }
  }

  return (
    <div className="bg-card rounded-2xl p-4 lg:p-4 xl:p-6 border border-border/30 shadow-sm space-y-5">
      <h3 className="text-base font-bold text-foreground">{t('Listed by')}</h3>
      <div className="flex items-center gap-3">
        <UserAvatar
          image={user.image}
          name={user.name}
          size="lg"
          fallbackClassName="text-lg"
        />
        <div>
          <p className="font-bold text-foreground text-sm">
            {user.name || t('Verified Lister')}
          </p>
          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
            <Star size={12} className="text-primary fill-brand" />
            <span className="text-xs font-bold text-foreground">
              {user.rating || '0.0'}
            </span>
            <span className="text-xs text-muted-foreground/85">
              ({user.listingsCount || 0} {t('Listings')})
            </span>
            {user.emailVerified !== false && (
              <Badge className="bg-muted text-primary hover:bg-primary-soft/90 border-0 gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold shrink-0">
                <CheckCircle2 size={9} strokeWidth={2.5} />
                {t('Verified')}
              </Badge>
            )}
          </div>
        </div>
      </div>
      <div className="space-y-2.5">
        <div className="flex items-center gap-2 text-muted-foreground/85 text-xs">
          <Calendar size={14} className="shrink-0" />
          {t('Member since')}{' '}
          {user.createdAt
            ? formatDate(user.createdAt, {
                month: 'long',
                year: 'numeric',
              })
            : '-'}
        </div>
        <div className="flex items-center gap-2 text-muted-foreground/85 text-xs">
          <MessageCircle size={14} className="shrink-0" />
          {t('Usually responds in a few hours')}
        </div>
      </div>

      {(instagramUrl || facebookUrl || googleMapLink) && (
        <div className="pt-3 border-t border-border/30 space-y-2">
          <p className="text-[11px] font-black text-muted-foreground uppercase tracking-wider">
            {t('Social Links')}
          </p>
          <div className="flex flex-wrap gap-2">
            {instagramUrl && (
              <a
                href={
                  instagramUrl.startsWith('http')
                    ? instagramUrl
                    : `https://instagram.com/${instagramUrl}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-pink-200/50 bg-pink-50/40 text-pink-700 text-xs font-bold hover:bg-pink-50 transition-colors"
              >
                <Instagram size={13} className="text-pink-600" /> Instagram
              </a>
            )}
            {facebookUrl && (
              <a
                href={
                  facebookUrl.startsWith('http')
                    ? facebookUrl
                    : `https://facebook.com/${facebookUrl}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200/50 bg-blue-50/40 text-blue-700 text-xs font-bold hover:bg-blue-50 transition-colors"
              >
                <Facebook size={13} className="text-blue-600" /> Facebook
              </a>
            )}
            {googleMapLink && (
              <a
                href={
                  googleMapLink.startsWith('http')
                    ? googleMapLink
                    : `https://${googleMapLink}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-green-200/50 bg-green-50/40 text-green-700 text-xs font-bold hover:bg-green-50 transition-colors"
              >
                <MapPin size={13} className="text-green-600" /> Map
              </a>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Link to="/users/$id" params={{ id: user.id || '' }}>
          <Button
            variant="outline"
            className="w-full h-10 rounded-xl border-border font-bold text-primary hover:bg-primary/5 hover:border-brand transition-colors"
          >
            {t('View Profile')}
          </Button>
        </Link>

        <Button
          onClick={handleContactHost}
          disabled={isStartingChat}
          className="group w-full h-10 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          {isStartingChat ? (
            <>
              {t('Opening Chat...')}
              <Loader2 size={16} className="animate-spin" />
            </>
          ) : (
            <>
              {t('Contact Lister')}
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-foreground/20 transition-transform group-hover:translate-x-1">
                <MessageCircle size={12} className="shrink-0" />
              </span>
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
