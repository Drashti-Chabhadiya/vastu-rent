import { useState } from 'react'
import {
  Star,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Send,
  Loader2,
} from 'lucide-react'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Textarea } from '#/components/ui/textarea'
import { cn } from '#/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'

const parseCommentAndImages = (comment: string) => {
  if (!comment) return { text: '', images: [] }
  const match = comment.match(/\[Images:\s*([^\]]+)\]/)
  if (match) {
    const imagesStr = match[1]
    const images = imagesStr
      .split(',')
      .map((img: string) => img.trim())
      .filter(Boolean)
    const text = comment.replace(/\[Images:\s*([^\]]+)\]/, '').trim()
    return { text, images }
  }
  return { text: comment, images: [] }
}

interface ProductTabsProps {
  product: any
  reviews: any[]
  activeTab: string
  setActiveTab: (tab: string) => void
  reviewRating: number
  setReviewRating: (rating: number) => void
  reviewComment: string
  setReviewComment: (comment: string) => void
  reviewError: string
  handleSubmitReview: () => void
  createReviewIsPending: boolean
}

export const ProductTabs = ({
  product,
  reviews,
  activeTab,
  setActiveTab,
  reviewRating,
  setReviewRating,
  reviewComment,
  setReviewComment,
  reviewError,
  handleSubmitReview,
  createReviewIsPending,
}: ProductTabsProps) => {
  const [sortBy, setSortBy] = useState<'latest' | 'highest'>('latest')

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === 'highest') {
      return b.rating - a.rating
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const tabs = [
    { id: 'description', label: 'Description' },
    { id: 'details', label: 'Details' },
    { id: 'reviews', label: `Reviews (${reviews.length})` },
    { id: 'faqs', label: 'FAQs' },
  ]

  return (
    <div className="border border-border/30 rounded-2xl bg-card shadow-sm overflow-hidden">
      <div className="flex items-center gap-6 px-6 pt-2 border-b border-border/30 bg-card overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant="ghost"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'py-4 px-0 h-auto rounded-none text-sm font-bold transition-all relative whitespace-nowrap hover:bg-transparent hover:text-foreground active:scale-[0.98]',
              activeTab === tab.id
                ? 'text-primary hover:text-primary'
                : 'text-muted-foreground/85 hover:text-foreground',
            )}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </Button>
        ))}
      </div>

      <div className="p-6 bg-card min-h-[250px]">
        {activeTab === 'description' && (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {product.description || 'No description provided.'}
            </p>
            {product.features && product.features.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-bold text-foreground text-sm uppercase tracking-wider">
                  Features & Specs
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.features.map((item: string, i: number) => (
                    <li
                      key={i}
                      className="flex items-center gap-2.5 text-sm text-foreground/80 font-medium"
                    >
                      <CheckCircle2
                        size={16}
                        className="text-primary shrink-0"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === 'details' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-3">
                <h4 className="font-bold text-foreground text-sm uppercase tracking-wider flex items-center gap-2">
                  <Calendar size={16} className="text-primary" /> Rental Terms
                </h4>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground/85 flex justify-between">
                    <span>Min duration:</span>
                    <span className="font-bold text-foreground/80">
                      {product.minDuration || 1} day(s)
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground/85 flex justify-between">
                    <span>Max duration:</span>
                    <span className="font-bold text-foreground/80">
                      {product.maxDuration
                        ? `${product.maxDuration} days`
                        : 'Flexible'}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground/85 flex justify-between">
                    <span>Security Deposit:</span>
                    <span className="font-bold text-brand">
                      ₹{(product.securityDeposit || 0).toLocaleString()}
                    </span>
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-bold text-foreground text-sm uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck size={16} className="text-primary" /> Delivery &
                  Pickup
                </h4>
                <div className="flex flex-wrap gap-2">
                  {product.deliveryOptions?.map((opt: string) => (
                    <Badge
                      key={opt}
                      variant="secondary"
                      className="bg-muted/50 text-foreground/80 rounded-md"
                    >
                      {opt}
                    </Badge>
                  )) || (
                    <span className="text-sm text-muted-foreground/85 italic">
                      Self-pickup only
                    </span>
                  )}
                </div>
              </div>
            </div>

            {product.pickupReturnDetails && (
              <div className="p-4 rounded-xl bg-muted-light border border-border/30 space-y-2">
                <h4 className="font-bold text-foreground text-xs uppercase tracking-widest">
                  Handover Instructions
                </h4>
                <p className="text-sm text-muted-foreground italic">
                  "{product.pickupReturnDetails}"
                </p>
              </div>
            )}

            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {product.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 bg-muted-light px-2 py-1 rounded"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {reviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Star size={32} className="text-muted-foreground/30 mb-3" />
                <h4 className="text-lg font-bold text-foreground">
                  No reviews yet
                </h4>
                <p className="text-sm text-muted-foreground/85 mt-1">
                  Be the first to review after renting!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Sorting Options Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-border/30">
                  <span className="text-xs text-muted-foreground/70 font-bold">
                    {reviews.length}{' '}
                    {reviews.length === 1 ? 'Review' : 'Reviews'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground/70 font-bold uppercase tracking-wider">
                      Sort by:
                    </span>
                    <Select
                      value={sortBy}
                      onValueChange={(val: any) => setSortBy(val)}
                    >
                      <SelectTrigger className="w-[130px] h-7 text-xs border-border/30 hover:bg-muted-light font-bold rounded-lg text-foreground/80 focus:ring-0">
                        <SelectValue placeholder="Sort order" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border/30/80 rounded-xl shadow-lg">
                        <SelectItem
                          value="latest"
                          className="text-xs font-semibold text-foreground/80 focus:bg-primary/5 focus:text-primary cursor-pointer rounded-lg"
                        >
                          Latest
                        </SelectItem>
                        <SelectItem
                          value="highest"
                          className="text-xs font-semibold text-foreground/80 focus:bg-primary/5 focus:text-primary cursor-pointer rounded-lg"
                        >
                          Highest Rating
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {sortedReviews.map((r: any) => (
                  <div
                    key={r.id}
                    className="flex gap-3 pb-4 border-b border-border/30 last:border-0"
                  >
                    <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0">
                      {r.user?.name?.[0] || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-foreground">
                            {r.user?.name || 'Anonymous'}
                          </p>
                          <Badge className="bg-primary-soft hover:bg-primary-soft text-primary border border-primary-border px-2 py-0.5 rounded-md flex items-center gap-1 font-bold text-[9px] uppercase shrink-0 scale-[0.85] leading-none">
                            <ShieldCheck
                              size={10}
                              className="fill-primary text-primary-soft"
                            />
                            Verified Rental
                          </Badge>
                        </div>
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              className={
                                i < r.rating
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-muted-foreground/30'
                              }
                            />
                          ))}
                        </div>
                      </div>
                      {(() => {
                        const { text, images } = parseCommentAndImages(
                          r.comment,
                        )
                        return (
                          <div className="space-y-2.5 mt-1.5">
                            {text && (
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {text}
                              </p>
                            )}
                            {images.length > 0 && (
                              <div className="flex flex-wrap gap-2.5 pt-1">
                                {images.map((imgUrl, idx) => (
                                  <div
                                    key={idx}
                                    className="relative w-20 h-20 rounded-xl overflow-hidden border border-border/30 bg-muted-light shadow-sm hover:scale-[1.03] transition-all cursor-pointer group/img shrink-0"
                                  >
                                    <img
                                      src={imgUrl}
                                      alt="Review Attachment"
                                      className="w-full h-full object-cover transition-transform duration-300"
                                      onClick={() =>
                                        window.open(imgUrl, '_blank')
                                      }
                                    />
                                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-primary-foreground text-[10px] font-black uppercase tracking-wider">
                                      View
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })()}
                      <p className="text-[10px] text-muted-foreground/70 mt-1">
                        {new Date(r.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-border/30 pt-5 space-y-3">
              <p className="text-sm font-bold text-foreground">
                Write a Review
              </p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Button
                    key={s}
                    variant="ghost"
                    size="icon"
                    onClick={() => setReviewRating(s)}
                    className="h-6 w-6 p-0 hover:bg-transparent active:scale-[0.98]"
                  >
                    <Star
                      size={20}
                      className={
                        s <= reviewRating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-muted-foreground/30'
                      }
                    />
                  </Button>
                ))}
              </div>
              <Textarea
                placeholder="Share your experience..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="text-sm rounded-xl border-border resize-none"
                rows={3}
              />
              {reviewError && (
                <p className="text-xs text-destructive">{reviewError}</p>
              )}
              <Button
                onClick={handleSubmitReview}
                disabled={createReviewIsPending}
                className="w-full h-10 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold gap-2"
              >
                {createReviewIsPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                Submit Review
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'faqs' && (
          <div className="space-y-5">
            {[
              {
                q: 'How do I return the item?',
                a: 'We will arrange a pickup on the last day of your rental.',
              },
              {
                q: 'Is there a security deposit?',
                a: 'Yes, a refundable deposit of ₹2000 is required.',
              },
            ].map((faq, i) => (
              <div key={i} className="space-y-1.5">
                <p className="text-sm font-bold text-foreground">Q: {faq.q}</p>
                <p className="text-sm text-muted-foreground/85">A: {faq.a}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
