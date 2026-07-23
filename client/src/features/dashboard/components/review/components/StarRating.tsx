import { Star } from 'lucide-react'

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const starValue = i + 1
        if (rating >= starValue) {
          return (
            <Star
              key={i}
              size={15}
              className="text-primary fill-primary stroke-primary shrink-0"
            />
          )
        } else if (rating > i && rating < starValue) {
          return (
            <div key={i} className="relative w-[15px] h-[15px] shrink-0">
              <Star
                size={15}
                className="text-muted-foreground/30 fill-slate-200 stroke-slate-200 absolute top-0 left-0"
              />
              <div className="absolute top-0 left-0 overflow-hidden w-[50%] h-full">
                <Star
                  size={15}
                  className="text-primary fill-primary stroke-primary max-w-none"
                />
              </div>
            </div>
          )
        } else {
          return (
            <Star
              key={i}
              size={15}
              className="text-muted-foreground/30 fill-slate-200 stroke-slate-200 shrink-0"
            />
          )
        }
      })}
    </div>
  )
}

export default StarRating
