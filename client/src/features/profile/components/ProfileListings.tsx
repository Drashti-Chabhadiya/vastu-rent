import { authClient } from '#/lib/auth/auth-client'
import { useState, useEffect } from 'react'
import {
  Plus,
  MapPin,
  IndianRupee,
  Star,
  Eye,
  Calendar,
  MoreVertical,
  SlidersHorizontal,
  TrendingUp,
  Coins,
  Package,
  Trash2,
  Search,
} from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { ListingDialog } from '#/features/dashboard/components/listing/ListingDialog'
import { ReusableAlertDialog } from '#/components/common/ReusableAlertDialog'
import {
  useMyListings,
  useDeleteProduct,
  useCreateProduct,
  useUpdateProduct,
  useAdminCategories,
} from '#/hook'
import { cn } from '#/lib/utils'
import { toast } from 'sonner'

export function ProfileListings() {
  const [session, setSession] = useState<any>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const { data: listings, isLoading: isListingsLoading } = useMyListings()
  const deleteProduct = useDeleteProduct()
  const createMutation = useCreateProduct()
  const updateMutation = useUpdateProduct()
  const { data: categories } = useAdminCategories()

  const [activeTab, setActiveTab] = useState<
    'all' | 'active' | 'inactive' | 'draft'
  >('all')
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)

  // Filter States
  const [showFilters, setShowFilters] = useState(false)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  // Dialog States
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [productToEdit, setProductToEdit] = useState<any>(null)
  const [productToDelete, setProductToDelete] = useState<any>(null)

  useEffect(() => {
    authClient.getSession().then((res) => {
      setSession(res.data)
      setIsAuthLoading(false)
    })
  }, [])

  if (isAuthLoading || isListingsLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 bg-muted rounded-full w-48" />
            <div className="h-4 bg-muted/50 rounded-full w-80" />
          </div>
          <div className="flex gap-3">
            <div className="h-10 bg-muted rounded-full w-32" />
            <div className="h-10 bg-muted rounded-full w-24" />
          </div>
        </div>
        {/* Tabs Skeleton */}
        <div className="flex gap-6 border-b border-border/30 pb-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-5 bg-muted rounded-full w-20" />
          ))}
        </div>
        {/* List Skeleton */}
        <div className="grid gap-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-card p-6 rounded-[2.5rem] border border-border/30 shadow-sm flex flex-col md:flex-row gap-6"
            >
              <div className="w-28 h-28 rounded-2xl bg-muted/50 shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-5 bg-muted rounded-full w-48" />
                <div className="h-4 bg-muted-light/80 rounded-full w-32" />
                <div className="h-4 bg-muted/50 rounded-full w-56 mt-4" />
              </div>
              <div className="w-48 flex flex-col items-end gap-2 shrink-0">
                <div className="h-5 bg-muted rounded-full w-32" />
                <div className="h-9 bg-muted-light/80 rounded-full w-28 mt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Calculate counts dynamically
  const counts = {
    all: listings?.length || 0,
    active: listings?.filter((item: any) => item.isAvailable).length || 0,
    inactive: listings?.filter((item: any) => !item.isAvailable).length || 0,
    draft: 0,
  }

  // Filter listings based on active tab & dynamic filter settings
  const filteredListings =
    listings?.filter((item: any) => {
      // Filter by tab selection (all / active / inactive)
      if (activeTab === 'active' && !item.isAvailable) return false
      if (activeTab === 'inactive' && item.isAvailable) return false
      if (activeTab === 'draft') return false

      // Filter by search string
      const matchesSearch =
        !search.trim() ||
        item.title?.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase())

      // Filter by category selection
      const matchesCategory =
        categoryFilter === 'all' || item.categoryId === categoryFilter

      // Filter by custom status selection
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'available'
          ? item.isAvailable === true
          : item.isAvailable === false)

      return matchesSearch && matchesCategory && matchesStatus
    }) || []

  // Mocked/Dynamically aggregated total performance stats matching the designs
  const totalViews =
    listings?.reduce(
      (sum: number, item: any) => sum + (item.views || 103),
      0,
    ) || 413
  const totalBookings =
    listings?.reduce(
      (sum: number, item: any) => sum + (item.bookingsCount || 20),
      0,
    ) || 80
  const totalEarnings =
    listings?.reduce(
      (sum: number, item: any) => sum + (item.bookingsCount || 20) * item.price,
      0,
    ) || 55640
  const avgRatingValue = listings?.length
    ? (
        listings.reduce(
          (sum: number, item: any) => sum + (parseFloat(item.rating) || 4.8),
          0,
        ) / listings.length
      ).toFixed(1)
    : '4.8'

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Title Header Block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-foreground tracking-tight">
            My Listings
          </h1>
          <p className="text-sm text-muted-foreground/70 font-bold">
            Manage your listed items and track their performance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsAddOpen(true)}
            className="bg-primary hover:bg-primary-hover text-primary-foreground font-black text-xs px-5 h-10 rounded-full flex items-center gap-1.5 active:scale-95 shadow-sm cursor-pointer border-none shadow-primary/15"
          >
            <Plus size={15} strokeWidth={3} />
            Add New Listing
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'rounded-full border-border font-black h-10 px-5 flex items-center gap-2 shadow-sm shrink-0 transition-colors',
              showFilters
                ? 'bg-muted/50 text-primary border-border/120'
                : 'text-foreground/80 hover:bg-muted-light',
            )}
          >
            <SlidersHorizontal size={14} className="text-muted-dark" />
            Filter
          </Button>
        </div>
      </div>

      {/* Slide down Filter Panel */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted-light/50 rounded-3xl border border-border/30 animate-in slide-in-from-top-3 duration-200">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-dark"
            />
            <Input
              placeholder="Search listings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 pl-10 pr-4 bg-card border-border rounded-full text-xs font-semibold placeholder:text-muted-dark focus-visible:ring-1 focus-visible:ring-primary/20"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-10 border-border bg-card rounded-full font-bold text-xs text-muted-foreground focus:ring-1 focus:ring-primary/20 px-4 shadow-sm">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-card rounded-2xl shadow-xl border-none p-1.5 animate-in fade-in zoom-in-95 duration-200">
              <SelectItem
                value="all"
                className="rounded-xl font-bold py-2.5 px-3 focus:bg-muted-light cursor-pointer text-xs text-muted-foreground"
              >
                All Categories
              </SelectItem>
              {categories?.map((cat: any) => (
                <SelectItem
                  key={cat.id}
                  value={cat.id}
                  className="rounded-xl font-bold py-2.5 px-3 focus:bg-muted-light cursor-pointer text-xs text-muted-foreground"
                >
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 border-border bg-card rounded-full font-bold text-xs text-muted-foreground focus:ring-1 focus:ring-primary/20 px-4 shadow-sm">
              <SelectValue placeholder="Availability" />
            </SelectTrigger>
            <SelectContent className="bg-card rounded-2xl shadow-xl border-none p-1.5 animate-in fade-in zoom-in-95 duration-200">
              <SelectItem
                value="all"
                className="rounded-xl font-bold py-2.5 px-3 focus:bg-muted-light cursor-pointer text-xs text-muted-foreground"
              >
                Any Availability
              </SelectItem>
              <SelectItem
                value="available"
                className="rounded-xl font-bold py-2.5 px-3 focus:bg-muted-light cursor-pointer text-xs text-muted-foreground"
              >
                Active Listings
              </SelectItem>
              <SelectItem
                value="unavailable"
                className="rounded-xl font-bold py-2.5 px-3 focus:bg-muted-light cursor-pointer text-xs text-muted-foreground"
              >
                Inactive Listings
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Tabs Filter Navigation */}
      <div className="flex gap-6 border-b border-border/30 pb-px overflow-x-auto custom-scrollbar">
        {(
          [
            { id: 'all', label: 'All Listings' },
            { id: 'active', label: 'Active' },
            { id: 'inactive', label: 'Inactive' },
            { id: 'draft', label: 'Draft' },
          ] as const
        ).map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <Button
              key={tab.id}
              variant="ghost"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'pb-3 font-extrabold text-[13px] transition-all relative shrink-0 rounded-none h-auto px-0 hover:bg-transparent',
                isActive
                  ? 'text-primary'
                  : 'text-muted-dark hover:text-muted-foreground',
              )}
            >
              <span>
                {tab.label} ({counts[tab.id]})
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </Button>
          )
        })}
      </div>

      {/* Listings Card List */}
      {filteredListings.length === 0 ? (
        <div className="bg-background border border-dashed border-border rounded-[2.5rem] p-12 text-center">
          <div className="w-16 h-16 bg-muted-light rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-muted-dark" />
          </div>
          <h3 className="text-lg font-extrabold text-foreground/90">
            No {activeTab} listings yet
          </h3>
          <p className="text-muted-dark text-xs max-w-xs mx-auto mt-1.5 font-bold">
            Start earning by listing your unused items today. It's quick, easy,
            and secure.
          </p>
          <Button
            onClick={() => setIsAddOpen(true)}
            className="bg-primary hover:bg-primary-hover text-primary-foreground font-black text-xs px-6 h-10 rounded-full active:scale-95 transition-all mt-5 border-none shadow-sm cursor-pointer"
          >
            Create First Listing
          </Button>
        </div>
      ) : (
        <div className="grid gap-5">
          {filteredListings.map((item: any) => (
            <div
              key={item.id}
              className="group bg-card p-6 rounded-[2.5rem] border border-border/30 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row gap-6 items-start md:items-center relative"
            >
              {/* Left Side Image */}
              <div className="w-28 h-28 rounded-2xl overflow-hidden shrink-0 bg-muted-light shadow-inner relative">
                <img
                  src={
                    item.images?.[0] || 'https://placehold.co/128?text=Vastu'
                  }
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Middle details column */}
              <div className="flex-1 space-y-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {item.isAvailable ? (
                      <span className="bg-primary-soft/50 text-primary px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider">
                        Active
                      </span>
                    ) : (
                      <span className="bg-muted/50 text-muted-foreground/85 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider">
                        Inactive
                      </span>
                    )}
                    <h3 className="text-[17px] font-black text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-muted-dark">
                    <MapPin size={12} className="text-primary" />
                    <span>{item.location}</span>
                  </div>
                </div>

                {/* Performance Stats inline */}
                <div className="flex flex-wrap items-center gap-4 text-[11px] font-extrabold text-muted-dark mt-4">
                  <div className="flex items-center gap-1.5">
                    <Eye size={13} className="text-muted-dark stroke-[2.5]" />
                    <span>{item.views || 120} Views</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar
                      size={13}
                      className="text-muted-dark stroke-[2.5]"
                    />
                    <span>{item.bookingsCount || 24} Bookings</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Star size={13} className="text-muted-dark stroke-[2.5]" />
                    <span>
                      {parseFloat(item.rating || '4.8').toFixed(1)} Rating
                    </span>
                  </div>
                </div>
              </div>

              {/* Pricing Column */}
              <div className="flex flex-col items-start md:items-end min-w-[90px] self-stretch justify-between py-1 shrink-0 border-t md:border-t-0 border-border/30 pt-4 md:pt-0 w-full md:w-auto">
                <div className="flex items-baseline gap-0.5">
                  <span className="text-lg font-black text-foreground flex items-center">
                    <IndianRupee size={15} className="stroke-[3] mt-0.5" />
                    {item.price}
                  </span>
                  <span className="text-muted-dark text-[10px] font-bold">
                    / day
                  </span>
                </div>

                <div className="flex items-center gap-2.5 w-full md:w-auto mt-4 md:mt-0 relative">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setProductToEdit(item)
                      setIsEditOpen(true)
                    }}
                    className="rounded-full border-border text-foreground/80 font-black text-xs px-5 h-9 w-full md:w-auto flex items-center justify-center hover:bg-muted-light cursor-pointer shadow-sm active:scale-95"
                  >
                    Edit
                  </Button>

                  {/* Dropdown container */}
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full border border-border text-muted-dark hover:text-muted-foreground h-9 w-9 flex items-center justify-center shadow-sm cursor-pointer"
                      onClick={() =>
                        setOpenDropdownId(
                          openDropdownId === item.id ? null : item.id,
                        )
                      }
                    >
                      <MoreVertical size={16} />
                    </Button>

                    {/* Simple Custom React Dropdown */}
                    {openDropdownId === item.id && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setOpenDropdownId(null)}
                        />
                        <div className="absolute right-0 bottom-11 md:bottom-auto md:top-11 bg-card rounded-2xl shadow-xl border border-border/30 p-1.5 z-50 min-w-[130px] animate-in fade-in slide-in-from-top-2 duration-200">
                          <Button
                            variant="ghost"
                            onClick={() => {
                              setOpenDropdownId(null)
                              setProductToDelete(item)
                            }}
                            className="w-full text-left px-3.5 py-2 text-xs font-bold text-destructive hover:bg-danger hover:text-destructive rounded-xl flex items-center gap-2 cursor-pointer transition-colors justify-start h-auto"
                          >
                            <Trash2 size={12} /> Delete Listing
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Aggregate Statistics Footer Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
        <div className="bg-background rounded-[1.8rem] border border-border/30 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-11 h-11 rounded-full bg-primary-soft flex items-center justify-center text-primary shrink-0 border border-primary-border">
            <Eye size={18} className="stroke-[2.5]" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-dark">
              Total Views
            </p>
            <h4 className="text-xl font-black text-foreground mt-0.5">
              {totalViews}
            </h4>
            <p className="text-[9px] font-extrabold text-primary flex items-center gap-0.5 mt-0.5">
              <TrendingUp size={10} className="stroke-[2.5]" /> +12% vs last
              month
            </p>
          </div>
        </div>

        <div className="bg-background rounded-[1.8rem] border border-border/30 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-11 h-11 rounded-full bg-primary-soft flex items-center justify-center text-primary shrink-0 border border-primary-border">
            <Calendar size={18} className="stroke-[2.5]" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-dark">
              Total Bookings
            </p>
            <h4 className="text-xl font-black text-foreground mt-0.5">
              {totalBookings}
            </h4>
            <p className="text-[9px] font-extrabold text-primary flex items-center gap-0.5 mt-0.5">
              <TrendingUp size={10} className="stroke-[2.5]" /> +8% vs last
              month
            </p>
          </div>
        </div>

        <div className="bg-background rounded-[1.8rem] border border-border/30 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-11 h-11 rounded-full bg-primary-soft flex items-center justify-center text-primary shrink-0 border border-primary-border">
            <Coins size={18} className="stroke-[2.5]" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-dark">
              Total Earnings
            </p>
            <h4 className="text-xl font-black text-foreground mt-0.5 flex items-center">
              <IndianRupee size={15} className="stroke-[3]" />
              {totalEarnings.toLocaleString()}
            </h4>
            <p className="text-[9px] font-extrabold text-primary flex items-center gap-0.5 mt-0.5">
              <TrendingUp size={10} className="stroke-[2.5]" /> +18% vs last
              month
            </p>
          </div>
        </div>

        <div className="bg-background rounded-[1.8rem] border border-border/30 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-11 h-11 rounded-full bg-primary-soft flex items-center justify-center text-primary shrink-0 border border-primary-border">
            <Star size={18} className="stroke-[2.5]" fill="currentColor" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-dark">
              Average Rating
            </p>
            <h4 className="text-xl font-black text-foreground mt-0.5">
              {avgRatingValue}
            </h4>
            <p className="text-[9px] font-extrabold text-muted-dark flex items-center gap-0.5 mt-0.5">
              Excellent performance
            </p>
          </div>
        </div>
      </div>

      {/* Listing Form Dialog: Create new Listing */}
      <ListingDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onSubmit={(data) => {
          createMutation.mutate(data, {
            onSuccess: () => {
              setIsAddOpen(false)
              toast.success('Listing created successfully!')
            },
            onError: (err: any) => {
              toast.error(
                err.response?.data?.message || 'Failed to create listing',
              )
            },
          })
        }}
        isLoading={createMutation.isPending}
        categories={categories || []}
        users={[]}
        currentUser={session?.user}
      />

      {/* Listing Form Dialog: Edit existing Listing */}
      <ListingDialog
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open)
          if (!open) setProductToEdit(null)
        }}
        product={productToEdit}
        onSubmit={(data) => {
          if (!productToEdit) return
          updateMutation.mutate(
            { id: productToEdit.id, data },
            {
              onSuccess: () => {
                setIsEditOpen(false)
                setProductToEdit(null)
                toast.success('Listing updated successfully!')
              },
              onError: (err: any) => {
                toast.error(
                  err.response?.data?.message || 'Failed to update listing',
                )
              },
            },
          )
        }}
        isLoading={updateMutation.isPending}
        categories={categories || []}
        users={[]}
        currentUser={session?.user}
      />

      {/* Delete Confirmation Alert Dialog */}
      <ReusableAlertDialog
        isOpen={!!productToDelete}
        onOpenChange={(open) => !open && setProductToDelete(null)}
        onConfirm={() => {
          if (!productToDelete) return
          deleteProduct.mutate(productToDelete.id, {
            onSuccess: () => {
              toast.success('Listing deleted successfully')
              setProductToDelete(null)
            },
            onError: (err: any) => {
              toast.error(
                err.response?.data?.message || 'Failed to delete listing',
              )
            },
          })
        }}
        onCancel={() => setProductToDelete(null)}
        title="Delete Listing permanently?"
        description={
          productToDelete
            ? `Are you sure you want to permanently delete "${productToDelete.title}"? This listing will be removed from the marketplace, and all associated rental history will be archived. This action cannot be undone.`
            : ''
        }
        confirmText="Delete"
        variant="danger"
        isPending={deleteProduct.isPending}
      />
    </div>
  )
}
