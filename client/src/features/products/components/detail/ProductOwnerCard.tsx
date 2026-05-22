import { Link } from '@tanstack/react-router'
import { Star, Calendar, MessageCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Badge } from '#/components/ui/badge'

interface ProductOwnerCardProps {
  owner: any
}

export const ProductOwnerCard = ({ owner }: ProductOwnerCardProps) => {
  if (!owner) return null

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5">
      <h3 className="text-base font-bold text-gray-900">Listed by</h3>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden shrink-0">
          {owner.image ? (
            <img
              src={owner.image}
              alt={owner.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary text-white font-bold text-lg">
              {owner.name?.[0] || 'U'}
            </div>
          )}
        </div>
        <div>
          <p className="font-bold text-gray-900 text-sm">
            {owner.name || 'Verified Owner'}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Star size={12} className="text-primary fill-brand" />
            <span className="text-xs font-bold text-gray-900">
              {owner.rating || '0.0'}
            </span>
            <span className="text-xs text-gray-500">
              ({owner.listingsCount || 0} Listings)
            </span>
            <Badge className="bg-green-50 text-green-700 border-none px-1 py-0 rounded flex items-center gap-0.5 font-bold text-[8px] uppercase ml-1">
              <CheckCircle2 size={8} /> Verified
            </Badge>
          </div>
        </div>
      </div>
      <div className="space-y-2.5">
        <div className="flex items-center gap-2 text-gray-500 text-xs">
          <Calendar size={14} className="shrink-0" />
          Member since{' '}
          {owner.createdAt
            ? new Date(owner.createdAt).toLocaleDateString('en-IN', {
                month: 'long',
                year: 'numeric',
              })
            : 'May 2022'}
        </div>
        <div className="flex items-center gap-2 text-gray-500 text-xs">
          <MessageCircle size={14} className="shrink-0" /> Usually responds in a
          few hours
        </div>
      </div>
      <Link to="/users/$id" params={{ id: owner.id || '' }}>
        <Button
          variant="outline"
          className="w-full h-10 rounded-xl border-gray-200 font-bold text-primary hover:bg-primary/5 hover:border-brand transition-colors"
        >
          View Profile
        </Button>
      </Link>
    </div>
  )
}
