import { ChevronRight, Grid3x3 } from "lucide-react"
import { useCategories } from "#/hook"
import { CategoryIcon } from "#/components/common/CategoryIcon"
import { Link } from "@tanstack/react-router"
import { CategoryIconSkeleton } from "#/components/skeletons"

export function BrowseByCategory() {
  const { data: categories, isLoading } = useCategories()

  // Display top 8 categories + "More"
  const displayCategories = categories?.slice(0, 8) || []

  return (
    <section className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Browse by Categories</h2>
          <Link 
            to={"/categories" as any} 
            className="text-sm font-semibold bg-primary-accent hover:bg-primary flex items-center gap-1 group w-fit"
          >
            View all categories 
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:flex lg:flex-wrap lg:justify-between gap-4 sm:gap-6">
          {isLoading ? (
            // Skeleton loader
            Array.from({ length: 9 }).map((_, i) => (
              <CategoryIconSkeleton key={i} />
            ))
          ) : (
            <>
              {displayCategories.map((category: any) => (
                <Link 
                  key={category.id} 
                  to={`/categories/${category.id}` as any}
                  className="flex flex-col items-center gap-3 sm:gap-4 cursor-pointer group"
                >
                  <CategoryIcon 
                    category={category} 
                    size="xl" 
                    className="group-hover:-translate-y-2 group-hover:shadow-md" 
                  />
                  <span className="text-[11px] sm:text-xs font-semibold text-gray-800 text-center">{category.name}</span>
                </Link>
              ))}
              
              {/* More button */}
              <Link 
                to={"/categories" as any}
                className="flex flex-col items-center gap-3 sm:gap-4 cursor-pointer group"
              >
                <div className="w-20 h-20 sm:w-[100px] sm:h-[100px] rounded-2xl sm:rounded-3xl bg-gray-100 flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-md">
                  <Grid3x3 className="w-6 h-6 sm:w-8 sm:h-8 text-gray-800" />
                </div>
                <span className="text-[11px] sm:text-xs font-semibold text-gray-800 text-center">More</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
