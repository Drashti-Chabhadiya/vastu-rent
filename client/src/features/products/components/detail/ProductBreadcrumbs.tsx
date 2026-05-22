import { Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'

interface ProductBreadcrumbsProps {
  title: string
}

export const ProductBreadcrumbs = ({ title }: ProductBreadcrumbsProps) => {
  return (
    <nav className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-6 uppercase tracking-wider">
      <Link to="/" className="hover:text-primary transition-colors">
        Home
      </Link>
      <ChevronRight size={12} className="opacity-50" />
      <Link to="/products" className="hover:text-primary transition-colors">
        Marketplace
      </Link>
      <ChevronRight size={12} className="opacity-50" />
      <span className="text-gray-900 truncate">{title}</span>
    </nav>
  )
}
