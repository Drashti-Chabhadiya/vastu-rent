import { Link } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '#/lib/utils'
import { Button } from '#/components/ui/button'

interface ExploreLinkProps {
  to?: string
  onClick?: () => void
  children: React.ReactNode
  className?: string
}

export function ExploreLink({
  to,
  onClick,
  children,
  className,
}: ExploreLinkProps) {
  const baseClasses = cn(
    'group inline-flex w-fit items-center gap-1.5 text-[13px] font-semibold text-primary underline decoration-primary/20 decoration-2 underline-offset-[6px] transition-all hover:decoration-primary cursor-pointer border-none bg-transparent p-0 h-auto leading-none shadow-none hover:bg-transparent',
    className,
  )

  const content = (
    <>
      {children}
      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0" />
    </>
  )

  if (onClick) {
    return (
      <Button variant="ghost" onClick={onClick} className={baseClasses}>
        {content}
      </Button>
    )
  }

  if (to) {
    return (
      <Link to={to} className={baseClasses}>
        {content}
      </Link>
    )
  }

  return <span className={baseClasses}>{content}</span>
}
