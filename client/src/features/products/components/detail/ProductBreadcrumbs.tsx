import { Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { useTranslation } from '#/context/TranslationContext'

interface ProductBreadcrumbsProps {
  title: string
}

export const ProductBreadcrumbs = ({ title }: ProductBreadcrumbsProps) => {
  const { t } = useTranslation()
  return (
    <nav className="flex flex-wrap items-center gap-2 text-xs font-bold text-muted-foreground/70 mb-6 uppercase tracking-wider min-w-0 overflow-hidden">
      <Link to="/" className="hover:text-primary transition-colors shrink-0">
        {t('Home')}
      </Link>
      <ChevronRight size={12} className="opacity-50 shrink-0" />
      <Link
        to="/products"
        className="hover:text-primary transition-colors shrink-0"
      >
        {t('Marketplace')}
      </Link>
      <ChevronRight size={12} className="opacity-50 shrink-0" />
      <span className="text-foreground truncate min-w-0">{title}</span>
    </nav>
  )
}
