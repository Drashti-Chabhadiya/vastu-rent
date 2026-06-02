import { Link, useNavigate } from '@tanstack/react-router'
import { Star, Calendar, MessageCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Badge } from '#/components/ui/badge'
import { apiClient } from '#/lib/api'
import { authClient } from '#/lib/auth/auth-client'
import { toast } from 'sonner'
import { useState } from 'react'

interface ProductOwnerCardProps {
  owner: any
}

export const ProductOwnerCard = ({ owner }: ProductOwnerCardProps) => {
  const { data: session } = authClient.useSession()
  const navigate = useNavigate()
  const [isStartingChat, setIsStartingChat] = useState(false)

  if (!owner) return null

  const handleContactHost = async () => {
    if (!session?.user) {
      toast.error('Please sign in to contact the host.')
      navigate({ to: '/login' })
      return
    }

    if (session.user.id === owner.id) {
      toast.info('This is your own listing.')
      return
    }

    setIsStartingChat(true)
    try {
      await apiClient.post('/chat/conversations', { targetUserId: owner.id })
      toast.success(`Chat started with ${owner.name}!`)
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
      <h3 className="text-base font-bold text-foreground">Listed by</h3>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-muted/50 overflow-hidden shrink-0">
          {owner.image ? (
            <img
              src={owner.image}
              alt={owner.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary text-primary-foreground font-bold text-lg">
              {owner.name?.[0] || 'U'}
            </div>
          )}
        </div>
        <div>
          <p className="font-bold text-foreground text-sm">
            {owner.name || 'Verified Owner'}
          </p>
          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
            <Star size={12} className="text-primary fill-brand" />
            <span className="text-xs font-bold text-foreground">
              {owner.rating || '0.0'}
            </span>
            <span className="text-xs text-muted-foreground/85">
              ({owner.listingsCount || 0} Listings)
            </span>
            <Badge className="bg-primary-soft text-primary-hover border-none px-1 py-0 rounded flex items-center gap-0.5 font-bold text-[8px] uppercase ml-1">
              <CheckCircle2 size={8} /> Verified
            </Badge>
          </div>
        </div>
      </div>
      <div className="space-y-2.5">
        <div className="flex items-center gap-2 text-muted-foreground/85 text-xs">
          <Calendar size={14} className="shrink-0" />
          Member since{' '}
          {owner.createdAt
            ? new Date(owner.createdAt).toLocaleDateString('en-IN', {
                month: 'long',
                year: 'numeric',
              })
            : 'May 2022'}
        </div>
        <div className="flex items-center gap-2 text-muted-foreground/85 text-xs">
          <MessageCircle size={14} className="shrink-0" />
          Usually responds in a few hours
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Link to="/users/$id" params={{ id: owner.id || '' }}>
          <Button
            variant="outline"
            className="w-full h-10 rounded-xl border-border font-bold text-primary hover:bg-primary/5 hover:border-brand transition-colors"
          >
            View Profile
          </Button>
        </Link>

        <Button
          onClick={handleContactHost}
          disabled={isStartingChat}
          className="w-full h-10 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <MessageCircle size={15} />
          {isStartingChat ? 'Opening Chat...' : 'Contact Host'}
        </Button>
      </div>
    </div>
  )
}
