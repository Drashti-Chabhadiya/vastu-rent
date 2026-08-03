import { useState } from 'react'
import { useTranslation } from '#/context/TranslationContext'
import {
  Plus,
  Search,
  SlidersHorizontal,
  Package,
  ArrowLeft,
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
  useAdminUsers,
} from '#/hook'
import { useSessionContext } from '#/context/SessionContext'
import { cn } from '#/lib/utils'
import { toast } from 'sonner'
import { motion } from 'motion/react'
import { fadeUp, stagger } from '#/lib/animations'
import { useListingDraftStore } from '#/store/useListingDraftStore'
import { ListingCard } from './ListingCard'
import { ListingsStatsRow } from './ListingsStatsRow'
import { ProfileListingsSkeleton } from '#/components/skeletons'
import { Link } from '@tanstack/react-router'

function EmptyListingsState({
  label,
  onAdd,
}: {
  label: string
  onAdd: () => void
}) {
  const { t } = useTranslation()
  return (
    <motion.div
      variants={fadeUp}
      className="bg-background border border-dashed border-border rounded-[2.5rem] p-12 text-center"
    >
      <div className="w-16 h-16 bg-muted-light rounded-full flex items-center justify-center mx-auto mb-4">
        <Package className="w-8 h-8 text-muted-dark" />
      </div>
      <h3 className="text-lg font-extrabold text-foreground/90">
        {t(`No ${label} listings yet`)}
      </h3>
      <p className="text-muted-dark text-xs max-w-xs mx-auto mt-1.5 font-bold">
        {t(
          "Start earning by listing your unused items today. It's quick, easy, and secure.",
        )}
      </p>
      <Button
        onClick={onAdd}
        className="bg-primary hover:bg-primary-hover text-primary-foreground font-black text-xs px-6 h-10 rounded-full active:scale-95 transition-all mt-5 border-none shadow-sm cursor-pointer"
      >
        {t('Create First Listing')}
      </Button>
    </motion.div>
  )
}

function ListingsFilterBar({
  search,
  setSearch,
  categoryFilter,
  setCategoryFilter,
  statusFilter,
  setStatusFilter,
  categories,
}: {
  search: string
  setSearch: (v: string) => void
  categoryFilter: string
  setCategoryFilter: (v: string) => void
  statusFilter: string
  setStatusFilter: (v: string) => void
  categories: any[]
}) {
  const { t } = useTranslation()
  return (
    <motion.div
      variants={fadeUp}
      className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted-light/50 rounded-3xl border border-border/30"
    >
      <div className="relative">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-dark"
        />
        <Input
          placeholder={t('Search listings...')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 pl-10 pr-4 bg-card border-border rounded-full text-xs font-semibold placeholder:text-muted-dark focus-visible:ring-1 focus-visible:ring-primary/20"
        />
      </div>
      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
        <SelectTrigger className="h-10 border-border bg-card rounded-full font-bold text-xs text-muted-foreground focus:ring-1 focus:ring-primary/20 px-4 shadow-sm">
          <SelectValue placeholder={t('Category')} />
        </SelectTrigger>
        <SelectContent className="bg-card rounded-2xl shadow-xl border-none p-1.5">
          <SelectItem
            value="all"
            className="rounded-xl font-bold py-2.5 px-3 focus:bg-muted-light cursor-pointer text-xs"
          >
            {t('All Categories')}
          </SelectItem>
          {categories?.map((cat: any) => (
            <SelectItem
              key={cat.id}
              value={cat.id}
              className="rounded-xl font-bold py-2.5 px-3 focus:bg-muted-light cursor-pointer text-xs"
            >
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="h-10 border-border bg-card rounded-full font-bold text-xs text-muted-foreground focus:ring-1 focus:ring-primary/20 px-4 shadow-sm">
          <SelectValue placeholder={t('Availability')} />
        </SelectTrigger>
        <SelectContent className="bg-card rounded-2xl shadow-xl border-none p-1.5">
          <SelectItem
            value="all"
            className="rounded-xl font-bold py-2.5 px-3 focus:bg-muted-light cursor-pointer text-xs"
          >
            {t('Any Availability')}
          </SelectItem>
          <SelectItem
            value="available"
            className="rounded-xl font-bold py-2.5 px-3 focus:bg-muted-light cursor-pointer text-xs"
          >
            {t('Active Listings')}
          </SelectItem>
          <SelectItem
            value="unavailable"
            className="rounded-xl font-bold py-2.5 px-3 focus:bg-muted-light cursor-pointer text-xs"
          >
            {t('Inactive Listings')}
          </SelectItem>
        </SelectContent>
      </Select>
    </motion.div>
  )
}

export function ProfileListings() {
  const { t } = useTranslation()
  const { data: session } = useSessionContext()
  const { data: listings, isLoading: isListingsLoading } = useMyListings()
  const deleteProduct = useDeleteProduct()
  const createMutation = useCreateProduct()
  const updateMutation = useUpdateProduct()
  const { data: categories } = useAdminCategories()
  const { data: users } = useAdminUsers(undefined, {
    enabled: session?.user?.role === 'admin',
  })

  const [activeTab, setActiveTab] = useState<
    'all' | 'active' | 'inactive' | 'draft'
  >('all')
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [productToEdit, setProductToEdit] = useState<any>(null)
  const [productToDelete, setProductToDelete] = useState<any>(null)

  if (isListingsLoading) return <ProfileListingsSkeleton />

  const counts = {
    all: listings?.length || 0,
    active: listings?.filter((item: any) => item.isAvailable).length || 0,
    inactive: listings?.filter((item: any) => !item.isAvailable).length || 0,
    draft: 0,
  }

  const filteredListings =
    listings?.filter((item: any) => {
      if (activeTab === 'active' && !item.isAvailable) return false
      if (activeTab === 'inactive' && item.isAvailable) return false
      if (activeTab === 'draft') return false
      const matchesSearch =
        !search.trim() ||
        item.title?.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase())
      const matchesCategory =
        categoryFilter === 'all' || item.categoryId === categoryFilter
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'available'
          ? item.isAvailable === true
          : item.isAvailable === false)
      return matchesSearch && matchesCategory && matchesStatus
    }) || []

  const totalViews =
    listings?.reduce((sum: number, item: any) => sum + (item.views || 0), 0) ||
    0
  const totalBookings =
    listings?.reduce(
      (sum: number, item: any) => sum + (item.bookingsCount || 0),
      0,
    ) || 0
  const totalEarnings =
    listings?.reduce(
      (sum: number, item: any) => sum + (item.earnings || 0),
      0,
    ) || 0
  const ratedListings =
    listings?.filter((item: any) => parseFloat(item.rating || '0') > 0) || []
  const avgRatingValue = ratedListings.length
    ? (
        ratedListings.reduce(
          (sum: number, item: any) => sum + parseFloat(item.rating),
          0,
        ) / ratedListings.length
      ).toFixed(1)
    : '0.0'

  const handleAddListing = () => {
    const u = session?.user
    const mainAddr = u?.address || u?.addresses?.[0]
    const hasAddress = Boolean(mainAddr?.addressLine1 && mainAddr?.city)
    if (u && (!u.name || !u.phone || !hasAddress)) {
      toast.error(
        t(
          'Please complete your profile and rental address first before creating a listing.',
        ),
        { duration: 4000 },
      )
      window.location.href = '/account?completeProfile=true#address'
      return
    }
    setIsAddOpen(true)
  }

  const showMobileOnboarding = !isListingsLoading && listings?.length === 0

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* MOBILE ONBOARDING VIEW (Shown only if listings is empty and on mobile) */}
      {showMobileOnboarding && (
        <div className="block md:hidden space-y-6 select-none">
          {/* Onboarding Hero Image Container */}
          <div className="relative h-64 w-full rounded-[24px] overflow-hidden shadow-xs border border-border/10 bg-muted-light">
            <img
              src="/assets/product-placeholder.png"
              alt="Become a Host"
              className="w-full h-full object-cover brightness-[0.82]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex flex-col justify-end p-6 select-none">
              <h1 className="font-display font-medium text-xl leading-tight text-white max-w-[280px]">
                Lend the things you love.
              </h1>
              <p className="font-display italic text-lg leading-tight text-white/90 mt-1">
                Earn while they rest.
              </p>
            </div>
          </div>

          {/* Steps List */}
          <div className="space-y-5 px-1">
            {[
              {
                num: '01',
                title: t('List your item'),
                desc: t(
                  'Add photos, set your price and availability in minutes.',
                ),
              },
              {
                num: '02',
                title: t('Get booked'),
                desc: t(
                  'Verified renters near you send requests, you approve.',
                ),
              },
              {
                num: '03',
                title: t('Earn safely'),
                desc: t('Payouts land in your account after every return.'),
              },
            ].map((step) => (
              <div key={step.num} className="flex gap-4">
                <span className="font-display text-2xl font-black text-primary leading-none shrink-0 mt-0.5">
                  {step.num}
                </span>
                <div className="min-w-0">
                  <h3 className="text-xs font-black text-foreground uppercase tracking-wider leading-none">
                    {step.title}
                  </h3>
                  <p className="text-[10px] font-bold text-muted-foreground mt-1.5 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-3 divide-x divide-border/20 border border-border/15 bg-white dark:bg-card rounded-[20px] p-4 text-center shadow-3xs">
            <div>
              <span className="text-[13px] font-black text-primary block leading-tight">
                5,000+
              </span>
              <span className="text-[8.5px] font-black text-muted-foreground uppercase tracking-widest mt-1 block">
                Hosts
              </span>
            </div>
            <div>
              <span className="text-[13px] font-black text-primary block leading-tight">
                4.9★
              </span>
              <span className="text-[8.5px] font-black text-muted-foreground uppercase tracking-widest mt-1 block">
                Avg Rating
              </span>
            </div>
            <div>
              <span className="text-[13px] font-black text-primary block leading-tight">
                ₹18k
              </span>
              <span className="text-[8.5px] font-black text-muted-foreground uppercase tracking-widest mt-1 block">
                Avg / Mo
              </span>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2 px-1">
            <Button
              onClick={handleAddListing}
              className="w-full h-11 rounded-full bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-black shadow-md border-none flex items-center justify-center cursor-pointer transition-all active:scale-[0.98]"
            >
              List your first item &nbsp;&rsaquo;
            </Button>
          </div>
        </div>
      )}

      {/* STANDARD LISTINGS MANAGER (Desktop, or if user has listings on mobile) */}
      <div
        className={cn(
          'space-y-6',
          showMobileOnboarding ? 'hidden md:block' : 'block',
        )}
      >
        {/* MOBILE PAGE HEADER (Screen 16 mockup style) */}
        <motion.div
          variants={fadeUp}
          className="flex md:hidden items-center justify-between gap-4 select-none pb-1"
        >
          <div className="flex items-center gap-3 flex-1">
            <Link
              to="/account"
              className="w-9 h-9 rounded-full bg-muted/50 dark:bg-muted/40 border border-border/30 flex items-center justify-center cursor-pointer text-foreground hover:bg-muted/75 shrink-0 transition-colors"
            >
              <ArrowLeft size={16} />
            </Link>
            <h1 className="text-2xl font-display font-medium text-foreground tracking-tight">
              {t('My Listings')}
            </h1>
          </div>
          <Button
            onClick={handleAddListing}
            size="icon"
            className="w-9 h-9 rounded-full bg-primary hover:bg-primary-hover text-primary-foreground flex items-center justify-center cursor-pointer shadow-xs shrink-0"
          >
            <Plus size={16} strokeWidth={3} />
          </Button>
        </motion.div>

        {/* MOBILE METRICS STATS CARDS (Screen 16 mockup style) */}
        {listings && listings.length > 0 && (
          <motion.div
            variants={fadeUp}
            className="grid grid-cols-3 gap-3 md:hidden select-none"
          >
            <div className="bg-white dark:bg-card border border-border/15 rounded-[18px] p-3 text-center shadow-3xs">
              <span className="text-[12px] font-black text-foreground block leading-tight">
                {listings.filter((p: any) => p.isAvailable).length}
              </span>
              <span className="text-[8.5px] font-black text-muted-foreground uppercase tracking-widest mt-1.5 block">
                {t('Active')}
              </span>
            </div>
            <div className="bg-white dark:bg-card border border-border/15 rounded-[18px] p-3 text-center shadow-3xs">
              <span className="text-[12px] font-black text-foreground block leading-tight">
                ₹
                {(
                  listings.filter((p: any) => p.isAvailable).length * 8.5
                ).toFixed(0)}
                k
              </span>
              <span className="text-[8.5px] font-black text-muted-foreground uppercase tracking-widest mt-1.5 block">
                {t('Earned')}
              </span>
            </div>
            <div className="bg-white dark:bg-card border border-border/15 rounded-[18px] p-3 text-center shadow-3xs">
              <span className="text-[12px] font-black text-foreground block leading-tight">
                4.9
              </span>
              <span className="text-[8.5px] font-black text-muted-foreground uppercase tracking-widest mt-1.5 block">
                {t('Rating')}
              </span>
            </div>
          </motion.div>
        )}

        {/* DESKTOP PAGE HEADER */}
        <motion.div
          variants={fadeUp}
          className="hidden md:flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-foreground tracking-tight">
              {t('My Listings')}
            </h1>
            <p className="text-sm text-muted-foreground/70 font-bold">
              {t('Manage your listed items and track their performance.')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleAddListing}
              className="bg-primary hover:bg-primary-hover text-primary-foreground font-black text-xs px-5 h-10 rounded-full flex items-center gap-1.5 active:scale-95 shadow-sm cursor-pointer border-none shadow-primary/15"
            >
              <Plus size={15} strokeWidth={3} />
              {t('Add New Listing')}
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
              {t('Filter')}
            </Button>
          </div>
        </motion.div>

        {/* DESKTOP FILTERS & TABS (Hidden on Mobile) */}
        <div className="hidden md:block space-y-6">
          {showFilters && (
            <ListingsFilterBar
              search={search}
              setSearch={setSearch}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              categories={categories || []}
            />
          )}

          <motion.div
            variants={fadeUp}
            className="flex gap-6 border-b border-border/30 pb-px overflow-x-auto custom-scrollbar"
          >
            {(['all', 'active', 'inactive', 'draft'] as const).map((tab) => {
              const isActive = activeTab === tab
              return (
                <Button
                  key={tab}
                  variant="ghost"
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'pb-3 font-extrabold text-[13px] transition-all relative shrink-0 rounded-none h-auto px-0 hover:bg-transparent',
                    isActive
                      ? 'text-primary'
                      : 'text-muted-dark hover:text-muted-foreground',
                  )}
                >
                  <span>
                    {t(tab.charAt(0).toUpperCase() + tab.slice(1))} (
                    {counts[tab]})
                  </span>
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                  )}
                </Button>
              )
            })}
          </motion.div>
        </div>

        {filteredListings.length === 0 ? (
          <EmptyListingsState label={activeTab} onAdd={handleAddListing} />
        ) : (
          <motion.div
            key={activeTab}
            variants={stagger}
            initial="hidden"
            animate="show"
            className="grid gap-5"
          >
            {filteredListings.map((item: any) => (
              <ListingCard
                key={item.id}
                item={item}
                openDropdownId={openDropdownId}
                setOpenDropdownId={setOpenDropdownId}
                onEdit={(listingItem) => {
                  setProductToEdit(listingItem)
                  setIsEditOpen(true)
                }}
                onDelete={(listingItem) => setProductToDelete(listingItem)}
              />
            ))}
          </motion.div>
        )}

        <div className="hidden md:block">
          <ListingsStatsRow
            totalViews={totalViews}
            totalBookings={totalBookings}
            totalEarnings={totalEarnings}
            avgRatingValue={avgRatingValue}
          />
        </div>

        <ListingDialog
          open={isAddOpen}
          onOpenChange={setIsAddOpen}
          onSubmit={(data) =>
            createMutation.mutate(data, {
              onSuccess: () => {
                setIsAddOpen(false)
                toast.success(t('Listing created successfully!'))
                useListingDraftStore.getState().clearDraft()
              },
              onError: (err: any) =>
                toast.error(
                  err.response?.data?.message || t('Failed to create listing'),
                ),
            })
          }
          isLoading={createMutation.isPending}
          categories={categories || []}
          users={users || []}
          currentUser={session?.user}
        />

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
                  toast.success(t('Listing updated successfully!'))
                },
                onError: (err: any) =>
                  toast.error(
                    err.response?.data?.message ||
                      t('Failed to update listing'),
                  ),
              },
            )
          }}
          isLoading={updateMutation.isPending}
          categories={categories || []}
          users={users || []}
          currentUser={session?.user}
        />

        <ReusableAlertDialog
          isOpen={!!productToDelete}
          onOpenChange={(open) => !open && setProductToDelete(null)}
          onConfirm={() => {
            if (!productToDelete) return
            deleteProduct.mutate(productToDelete.id, {
              onSuccess: () => {
                toast.success(t('Listing deleted successfully'))
                setProductToDelete(null)
              },
              onError: (err: any) =>
                toast.error(
                  err.response?.data?.message || t('Failed to delete listing'),
                ),
            })
          }}
          onCancel={() => setProductToDelete(null)}
          title={t('Delete Listing permanently?')}
          description={
            productToDelete
              ? `${t('Are you sure you want to permanently delete')} "${productToDelete.title}"? ${t('This listing will be removed from the marketplace, and all associated rental history will be archived. This action cannot be undone.')}`
              : ''
          }
          confirmText={t('Delete')}
          variant="danger"
          isPending={deleteProduct.isPending}
        />
      </div>
    </motion.div>
  )
}
