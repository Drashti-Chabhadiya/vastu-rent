import { useState } from 'react'
import { useTranslation } from '#/context/TranslationContext'
import {
  Plus, Search, SlidersHorizontal, Package,
} from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '#/components/ui/select'
import { ListingDialog } from '#/features/dashboard/components/listing/ListingDialog'
import { ReusableAlertDialog } from '#/components/common/ReusableAlertDialog'
import { useMyListings, useDeleteProduct, useCreateProduct, useUpdateProduct, useAdminCategories, useAdminUsers } from '#/hook'
import { useSessionContext } from '#/context/SessionContext'
import { cn } from '#/lib/utils'
import { toast } from 'sonner'
import { motion } from 'motion/react'
import { fadeUp, stagger } from '#/lib/animations'
import { useListingDraftStore } from '#/store/useListingDraftStore'
import { ListingCard } from './ListingCard'
import { ListingsStatsRow } from './ListingsStatsRow'
import { ProfileListingsSkeleton } from '#/components/skeletons'

function EmptyListingsState({ label, onAdd }: { label: string; onAdd: () => void }) {
  const { t } = useTranslation()
  return (
    <motion.div variants={fadeUp} className="bg-background border border-dashed border-border rounded-[2.5rem] p-12 text-center">
      <div className="w-16 h-16 bg-muted-light rounded-full flex items-center justify-center mx-auto mb-4">
        <Package className="w-8 h-8 text-muted-dark" />
      </div>
      <h3 className="text-lg font-extrabold text-foreground/90">{t(`No ${label} listings yet`)}</h3>
      <p className="text-muted-dark text-xs max-w-xs mx-auto mt-1.5 font-bold">
        {t("Start earning by listing your unused items today. It's quick, easy, and secure.")}
      </p>
      <Button onClick={onAdd}
        className="bg-primary hover:bg-primary-hover text-primary-foreground font-black text-xs px-6 h-10 rounded-full active:scale-95 transition-all mt-5 border-none shadow-sm cursor-pointer">
        {t('Create First Listing')}
      </Button>
    </motion.div>
  )
}

function ListingsFilterBar({
  search, setSearch, categoryFilter, setCategoryFilter, statusFilter, setStatusFilter, categories,
}: {
  search: string; setSearch: (v: string) => void; categoryFilter: string; setCategoryFilter: (v: string) => void
  statusFilter: string; setStatusFilter: (v: string) => void; categories: any[]
}) {
  const { t } = useTranslation()
  return (
    <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted-light/50 rounded-3xl border border-border/30">
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-dark" />
        <Input placeholder={t('Search listings...')} value={search} onChange={(e) => setSearch(e.target.value)}
          className="h-10 pl-10 pr-4 bg-card border-border rounded-full text-xs font-semibold placeholder:text-muted-dark focus-visible:ring-1 focus-visible:ring-primary/20" />
      </div>
      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
        <SelectTrigger className="h-10 border-border bg-card rounded-full font-bold text-xs text-muted-foreground focus:ring-1 focus:ring-primary/20 px-4 shadow-sm">
          <SelectValue placeholder={t('Category')} />
        </SelectTrigger>
        <SelectContent className="bg-card rounded-2xl shadow-xl border-none p-1.5">
          <SelectItem value="all" className="rounded-xl font-bold py-2.5 px-3 focus:bg-muted-light cursor-pointer text-xs">{t('All Categories')}</SelectItem>
          {categories?.map((cat: any) => (
            <SelectItem key={cat.id} value={cat.id} className="rounded-xl font-bold py-2.5 px-3 focus:bg-muted-light cursor-pointer text-xs">{cat.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="h-10 border-border bg-card rounded-full font-bold text-xs text-muted-foreground focus:ring-1 focus:ring-primary/20 px-4 shadow-sm">
          <SelectValue placeholder={t('Availability')} />
        </SelectTrigger>
        <SelectContent className="bg-card rounded-2xl shadow-xl border-none p-1.5">
          <SelectItem value="all" className="rounded-xl font-bold py-2.5 px-3 focus:bg-muted-light cursor-pointer text-xs">{t('Any Availability')}</SelectItem>
          <SelectItem value="available" className="rounded-xl font-bold py-2.5 px-3 focus:bg-muted-light cursor-pointer text-xs">{t('Active Listings')}</SelectItem>
          <SelectItem value="unavailable" className="rounded-xl font-bold py-2.5 px-3 focus:bg-muted-light cursor-pointer text-xs">{t('Inactive Listings')}</SelectItem>
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
  const { data: users } = useAdminUsers(undefined, { enabled: session?.user?.role === 'admin' })

  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive' | 'draft'>('all')
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

  const filteredListings = listings?.filter((item: any) => {
    if (activeTab === 'active' && !item.isAvailable) return false
    if (activeTab === 'inactive' && item.isAvailable) return false
    if (activeTab === 'draft') return false
    const matchesSearch = !search.trim() || item.title?.toLowerCase().includes(search.toLowerCase()) || item.description?.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || item.categoryId === categoryFilter
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'available' ? item.isAvailable === true : item.isAvailable === false)
    return matchesSearch && matchesCategory && matchesStatus
  }) || []

  const totalViews = listings?.reduce((sum: number, item: any) => sum + (item.views || 0), 0) || 0
  const totalBookings = listings?.reduce((sum: number, item: any) => sum + (item.bookingsCount || 0), 0) || 0
  const totalEarnings = listings?.reduce((sum: number, item: any) => sum + (item.earnings || 0), 0) || 0
  const ratedListings = listings?.filter((item: any) => parseFloat(item.rating || '0') > 0) || []
  const avgRatingValue = ratedListings.length ? (ratedListings.reduce((sum: number, item: any) => sum + parseFloat(item.rating), 0) / ratedListings.length).toFixed(1) : '0.0'

  const handleAddListing = () => {
    const u = session?.user
    if (u && (!u.name || !u.phone || !u.addressLine1 || !u.street || !u.city || !u.state || !u.pincode)) {
      toast.error(t('Please complete your profile and rental address first before creating a listing.'), { duration: 4000 })
      window.location.href = '/account?completeProfile=true#address'
      return
    }
    setIsAddOpen(true)
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-foreground tracking-tight">{t('My Listings')}</h1>
          <p className="text-sm text-muted-foreground/70 font-bold">{t('Manage your listed items and track their performance.')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleAddListing} className="bg-primary hover:bg-primary-hover text-primary-foreground font-black text-xs px-5 h-10 rounded-full flex items-center gap-1.5 active:scale-95 shadow-sm cursor-pointer border-none shadow-primary/15">
            <Plus size={15} strokeWidth={3} />{t('Add New Listing')}
          </Button>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}
            className={cn('rounded-full border-border font-black h-10 px-5 flex items-center gap-2 shadow-sm shrink-0 transition-colors', showFilters ? 'bg-muted/50 text-primary border-border/120' : 'text-foreground/80 hover:bg-muted-light')}>
            <SlidersHorizontal size={14} className="text-muted-dark" />{t('Filter')}
          </Button>
        </div>
      </motion.div>

      {showFilters && (
        <ListingsFilterBar search={search} setSearch={setSearch} categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter} statusFilter={statusFilter} setStatusFilter={setStatusFilter} categories={categories || []} />
      )}

      <motion.div variants={fadeUp} className="flex gap-6 border-b border-border/30 pb-px overflow-x-auto custom-scrollbar">
        {(['all', 'active', 'inactive', 'draft'] as const).map((tab) => {
          const isActive = activeTab === tab
          return (
            <Button key={tab} variant="ghost" onClick={() => setActiveTab(tab)}
              className={cn('pb-3 font-extrabold text-[13px] transition-all relative shrink-0 rounded-none h-auto px-0 hover:bg-transparent', isActive ? 'text-primary' : 'text-muted-dark hover:text-muted-foreground')}>
              <span>{t(tab.charAt(0).toUpperCase() + tab.slice(1))} ({counts[tab]})</span>
              {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
            </Button>
          )
        })}
      </motion.div>

      {filteredListings.length === 0 ? (
        <EmptyListingsState label={activeTab} onAdd={handleAddListing} />
      ) : (
        <motion.div key={activeTab} variants={stagger} initial="hidden" animate="show" className="grid gap-5">
          {filteredListings.map((item: any) => (
            <ListingCard key={item.id} item={item} openDropdownId={openDropdownId} setOpenDropdownId={setOpenDropdownId}
              onEdit={(item) => { setProductToEdit(item); setIsEditOpen(true) }}
              onDelete={(item) => setProductToDelete(item)} />
          ))}
        </motion.div>
      )}

      <ListingsStatsRow totalViews={totalViews} totalBookings={totalBookings} totalEarnings={totalEarnings} avgRatingValue={avgRatingValue} />

      <ListingDialog open={isAddOpen} onOpenChange={setIsAddOpen}
        onSubmit={(data) => createMutation.mutate(data, {
          onSuccess: () => {
            setIsAddOpen(false);
            toast.success(t('Listing created successfully!'));
            useListingDraftStore.getState().clearDraft();
          },
          onError: (err: any) => toast.error(err.response?.data?.message || t('Failed to create listing'))
        })}
        isLoading={createMutation.isPending} categories={categories || []} users={users || []} currentUser={session?.user} />

      <ListingDialog open={isEditOpen} onOpenChange={(open) => { setIsEditOpen(open); if (!open) setProductToEdit(null) }}
        product={productToEdit}
        onSubmit={(data) => { if (!productToEdit) return; updateMutation.mutate({ id: productToEdit.id, data }, { onSuccess: () => { setIsEditOpen(false); setProductToEdit(null); toast.success(t('Listing updated successfully!')) }, onError: (err: any) => toast.error(err.response?.data?.message || t('Failed to update listing')) }) }}
        isLoading={updateMutation.isPending} categories={categories || []} users={users || []} currentUser={session?.user} />

      <ReusableAlertDialog isOpen={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}
        onConfirm={() => { if (!productToDelete) return; deleteProduct.mutate(productToDelete.id, { onSuccess: () => { toast.success(t('Listing deleted successfully')); setProductToDelete(null) }, onError: (err: any) => toast.error(err.response?.data?.message || t('Failed to delete listing')) }) }}
        onCancel={() => setProductToDelete(null)} title={t('Delete Listing permanently?')}
        description={productToDelete ? `${t('Are you sure you want to permanently delete')} "${productToDelete.title}"? ${t('This listing will be removed from the marketplace, and all associated rental history will be archived. This action cannot be undone.')}` : ''}
        confirmText={t('Delete')} variant="danger" isPending={deleteProduct.isPending} />
    </motion.div>
  )
}
