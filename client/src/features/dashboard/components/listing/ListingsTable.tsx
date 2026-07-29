import { cn } from '#/lib/utils'
import { Eye, EyeOff, Trash2, ExternalLink, Pencil, Star } from 'lucide-react'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { useTranslation } from '#/context/TranslationContext'

interface ListingsTableProps {
  products: any[]
  isLoading: boolean
  onToggleStatus: (id: string, isAvailable: boolean) => void
  onSetFeatured?: (id: string) => void
  onDelete: (product: any) => void
  onEdit: (product: any) => void
  currentUser: any
}

export const ListingsTable = ({
  products,
  isLoading,
  onToggleStatus,
  onSetFeatured,
  onDelete,
  onEdit,
  currentUser,
}: ListingsTableProps) => {
  const { t, formatCurrency } = useTranslation()
  return (
    <div className="bg-card rounded-3xl border border-border/30 shadow-sm overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/30 bg-muted-light/50 hover:bg-transparent">
              <TableHead className="px-6 py-5 text-[11px] font-extrabold text-dash-text-soft uppercase tracking-[0.2em] h-auto">
                {t('Listing Info')}
              </TableHead>
              <TableHead className="px-6 py-5 text-[11px] font-extrabold text-dash-text-soft uppercase tracking-[0.2em] h-auto">
                {t('Category')}
              </TableHead>
              <TableHead className="px-6 py-5 text-[11px] font-extrabold text-dash-text-soft uppercase tracking-[0.2em] h-auto">
                {t('Provider')}
              </TableHead>
              <TableHead className="px-6 py-5 text-[11px] font-extrabold text-dash-text-soft uppercase tracking-[0.2em] text-center h-auto">
                {t('Price / Day')}
              </TableHead>
              <TableHead className="px-6 py-5 text-[11px] font-extrabold text-dash-text-soft uppercase tracking-[0.2em] text-center h-auto">
                {t('Visibility')}
              </TableHead>
              <TableHead className="px-6 py-5 text-[11px] font-extrabold text-dash-text-soft uppercase tracking-[0.2em] text-right h-auto">
                {t('Management')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/30">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow
                  key={i}
                  className="animate-pulse border-b-0 hover:bg-transparent"
                >
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-muted/50 shrink-0" />
                      <div className="space-y-2">
                        <div className="h-3.5 bg-muted rounded-md w-28" />
                        <div className="h-2.5 bg-muted/50 rounded-md w-16" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="h-6 bg-muted/50 rounded-lg w-20" />
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="space-y-1.5">
                      <div className="h-3 bg-muted rounded-md w-20" />
                      <div className="h-2.5 bg-muted/50 rounded-md w-28" />
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="h-4 bg-muted rounded-md w-12 mx-auto" />
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="h-8 bg-muted/50 rounded-full w-20 mx-auto" />
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <div className="w-8 h-8 rounded-lg bg-muted/40" />
                      <div className="w-8 h-8 rounded-lg bg-muted/40" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="px-6 py-20 text-center text-dash-text-soft font-bold uppercase tracking-widest"
                >
                  {t('No listings available')}
                </TableCell>
              </TableRow>
            ) : (
              products.map((item) => (
                <TableRow
                  key={item.id}
                  className="group hover:bg-muted-light/80 transition-all border-b-0"
                >
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-sm border border-border/30 flex-shrink-0">
                        <img
                          src={
                            item.images?.[0] ||
                            'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=100&q=80'
                          }
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-extrabold text-dash-text group-hover:text-dash-brand transition-colors line-clamp-1 flex items-center gap-1.5">
                          {item.title}
                          {item.isFeatured && (
                            <span
                              title="Featured on Hero Section"
                              className="flex items-center"
                            >
                              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 shrink-0" />
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] text-dash-text-soft font-bold uppercase tracking-wider">
                          {item.location}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge
                      variant="outline"
                      className="rounded-lg bg-card border-border/30 text-dash-text-soft font-bold text-[10px] uppercase tracking-wider h-6"
                    >
                      {item.category?.name || t('Uncategorized')}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-extrabold text-dash-text">
                        {item.user?.name || t('Vastu System')}
                      </span>
                      <span className="text-[10px] text-dash-text-soft font-bold">
                        {item.user?.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <span className="text-sm font-extrabold text-dash-text">
                      {formatCurrency(item.price)}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <Button
                      variant="ghost"
                      onClick={() => onToggleStatus(item.id, !item.isAvailable)}
                      className={cn(
                        'inline-flex h-auto items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest transition-all active:scale-[0.98] cursor-pointer hover:bg-transparent shadow-none',
                        item.isAvailable
                          ? 'bg-dash-brand/10 text-primary hover:bg-dash-brand/20 hover:text-primary'
                          : 'bg-muted/50 text-muted-foreground/70 hover:bg-muted hover:text-muted-foreground/85',
                      )}
                    >
                      {item.isAvailable ? (
                        <>
                          <Eye size={12} strokeWidth={2.5} />
                          <span>{t('Public')}</span>
                        </>
                      ) : (
                        <>
                          <EyeOff size={12} strokeWidth={2.5} />
                          <span>{t('Hidden')}</span>
                        </>
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={`/products/${item.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block"
                        title="View Listing on Marketplace"
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 rounded-lg text-dash-text-soft hover:bg-dash-brand/10 hover:text-dash-brand transition-all active:scale-[0.98] shadow-none"
                        >
                          <ExternalLink size={14} />
                        </Button>
                      </a>
                      {currentUser?.role === 'admin' && onSetFeatured && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onSetFeatured(item.id)}
                          className={cn(
                            'w-8 h-8 rounded-lg transition-all active:scale-[0.98] shadow-none',
                            item.isFeatured
                              ? 'text-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20'
                              : 'text-dash-text-soft hover:bg-dash-brand/10 hover:text-dash-brand',
                          )}
                          title={
                            item.isFeatured
                              ? 'Currently Featured'
                              : 'Set as Featured'
                          }
                        >
                          <Star
                            size={14}
                            className={item.isFeatured ? 'fill-current' : ''}
                          />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(item)}
                        className="w-8 h-8 rounded-lg text-dash-text-soft hover:bg-dash-brand/10 hover:text-dash-brand transition-all active:scale-[0.98] shadow-none"
                        title="Edit Listing"
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(item)}
                        className={cn(
                          'w-8 h-8 rounded-lg transition-all active:scale-[0.98] shadow-none',
                          currentUser?.role === 'admin' ||
                            item.userId === currentUser?.id
                            ? 'text-dash-text-soft hover:bg-danger hover:text-destructive'
                            : 'text-dash-text-soft opacity-30 cursor-not-allowed',
                        )}
                        disabled={
                          currentUser?.role !== 'admin' &&
                          item.userId !== currentUser?.id
                        }
                        title="Delete Listing"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
