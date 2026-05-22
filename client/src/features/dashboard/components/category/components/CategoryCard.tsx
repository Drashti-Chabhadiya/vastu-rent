import * as LucideIcons from 'lucide-react'
import { Folder, Layers, Edit2, Trash2, ArrowRight } from 'lucide-react'
import { Button } from '#/components/ui/button'

interface CategoryCardProps {
  category: any
  isAdmin: boolean
  onManageCategory?: (categoryId: string) => void
  onOpenEdit: (category: any) => void
  onOpenDelete: (category: any) => void
}

export const CategoryCard = ({
  category,
  isAdmin,
  onManageCategory,
  onOpenEdit,
  onOpenDelete,
}: CategoryCardProps) => {
  const renderCategoryIcon = () => {
    if (category.image) {
      return (
        <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 shadow-sm flex-shrink-0">
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              ;(e.target as any).src =
                'https://via.placeholder.com/100?text=Category'
            }}
          />
        </div>
      )
    }

    const iconName = category.icon || 'Folder'
    const IconComponent = (LucideIcons as any)[iconName]
    const iconColor = category.color || '#166534'

    return (
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center transition-all group-hover:scale-110 shadow-sm flex-shrink-0"
        style={{
          backgroundColor: `${iconColor}15`,
          color: iconColor,
        }}
      >
        {IconComponent ? <IconComponent size={24} /> : <Folder size={24} />}
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-dash-brand/20 transition-all group relative overflow-hidden">
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 opacity-[0.03]"
        style={{ backgroundColor: category.color || '#166534' }}
      />

      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-4">
          {renderCategoryIcon()}
          <div>
            <h3 className="text-lg font-extrabold text-gray-900 group-hover:text-dash-brand transition-colors">
              {category.name}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                style={{
                  backgroundColor: `${category.color || '#166534'}15`,
                }}
              >
                <Layers
                  size={12}
                  style={{ color: category.color || '#166534' }}
                />
                <span
                  className="text-[11px] font-extrabold uppercase tracking-wider"
                  style={{ color: category.color || '#166534' }}
                >
                  {category._count?.products || 0} Items
                </span>
              </div>
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenEdit(category)}
              className="h-9 w-9 text-gray-400 hover:text-dash-brand hover:bg-dash-brand/10 rounded-xl cursor-pointer"
            >
              <Edit2 size={18} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenDelete(category)}
              className="h-9 w-9 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl cursor-pointer"
            >
              <Trash2 size={18} />
            </Button>
          </div>
        )}
      </div>

      <div
        onClick={() => onManageCategory?.(category.id)}
        className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between cursor-pointer group/manage"
      >
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover/manage:text-dash-brand transition-colors">
          Manage Collection
        </span>
        <ArrowRight
          size={16}
          className="text-gray-300 group-hover/manage:text-dash-brand group-hover/manage:translate-x-1 transition-all"
        />
      </div>
    </div>
  )
}
