import { useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import type { ListingSchema } from '../../../../schema/listing-schema'
import { ImageGalleryManager } from './ImageGalleryManager'
import { CategoryFormDialog } from '../category/components/CategoryFormDialog'
import { useCreateCategoryRequest } from '#/hook/use-category-requests'
import { toast } from 'sonner'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '#/components/ui/form'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Textarea } from '#/components/ui/textarea'
import {
  PackagePlus,
  Tag,
  AlignLeft,
  IndianRupee,
  MapPin,
  User,
  Image as ImageIcon,
  Type,
  ShieldCheck,
  Home,
  Store,
  Instagram,
  Facebook,
} from 'lucide-react'

interface Category {
  id: string
  name: string
}

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface ProductFormProps {
  form: UseFormReturn<ListingSchema, any, any>
  categories: Category[]
  users: User[]
  currentUser?: any
  onUploadStatusChange?: (uploading: boolean) => void
}

export const ProductForm = ({
  form,
  categories,
  users,
  currentUser,
  onUploadStatusChange,
}: ProductFormProps) => {
  const isLister = currentUser?.role !== 'admin'
  const [requestCategoryOpen, setRequestCategoryOpen] = useState(false)
  const createRequestMutation = useCreateCategoryRequest()
  return (
    <div className="space-y-6">
      {/* Hero Preview Section */}
      <div className="relative group overflow-hidden rounded-xl bg-muted-light border border-border/30 min-h-[220px] flex items-center justify-center shadow-inner">
        {form.watch('images').length > 0 ? (
          <img
            src={form.watch('images')[0]}
            className="w-full h-[260px] object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
            alt="Cover Preview"
          />
        ) : (
          <div className="text-center p-8">
            <PackagePlus size={32} className="text-muted-dark mx-auto mb-3" />
            <p className="text-sm font-bold text-muted-foreground/70 uppercase tracking-widest">
              No photos uploaded
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField<ListingSchema>
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="col-span-full">
              <FormLabel className="text-[13px] font-bold text-foreground ml-1 flex items-center gap-2">
                <Type size={14} className="text-dash-brand" />
                Product Title
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Canon EOS R5 Camera"
                  {...field}
                  className="w-full h-12 px-4 rounded-xl border border-border bg-card text-[15px] text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-1 focus-visible:ring-dash-brand/30 transition-all font-medium shadow-sm"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField<ListingSchema>
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem className="col-span-full">
              <FormLabel className="text-[13px] font-bold text-foreground ml-1 flex items-center gap-2">
                <ImageIcon size={14} className="text-dash-brand" />
                Product Photos
              </FormLabel>
              <FormControl>
                <ImageGalleryManager
                  images={field.value as string[]}
                  onChange={field.onChange}
                  onUploadStatusChange={onUploadStatusChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField<ListingSchema>
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="col-span-full">
              <FormLabel className="text-[13px] font-bold text-foreground ml-1 flex items-center gap-2">
                <AlignLeft size={14} className="text-dash-brand" />
                Description
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the item, features, and condition..."
                  {...field}
                  className="min-h-[120px] w-full px-4 py-3 rounded-xl border border-border bg-card text-[15px] text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-1 focus-visible:ring-dash-brand/30 transition-all font-medium shadow-sm"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField<ListingSchema>
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[13px] font-bold text-foreground ml-1 flex items-center gap-2">
                <IndianRupee size={14} className="text-dash-brand" />
                Price / Day
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  className="w-full h-12 px-4 rounded-xl border border-border bg-card text-[15px] text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-1 focus-visible:ring-dash-brand/30 transition-all font-medium shadow-sm"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField<ListingSchema>
          control={form.control}
          name="securityDeposit"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[13px] font-bold text-foreground ml-1 flex items-center gap-2">
                <ShieldCheck size={14} className="text-dash-brand" />
                Security Deposit (Refundable)
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="2000"
                  {...field}
                  className="w-full h-12 px-4 rounded-xl border border-border bg-card text-[15px] text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-1 focus-visible:ring-dash-brand/30 transition-all font-medium shadow-sm"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField<ListingSchema>
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[13px] font-bold text-foreground ml-1 flex items-center gap-2">
                <MapPin size={14} className="text-dash-brand" />
                City
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Mumbai, MH"
                  {...field}
                  className="w-full h-12 px-4 rounded-xl border border-border bg-card text-[15px] text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-1 focus-visible:ring-dash-brand/30 transition-all font-medium shadow-sm"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField<ListingSchema>
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[13px] font-bold text-foreground ml-1 flex items-center gap-2">
                <MapPin size={14} className="text-dash-brand" />
                Location
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Mumbai, MH"
                  {...field}
                  className="w-full h-12 px-4 rounded-xl border border-border bg-card text-[15px] text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-1 focus-visible:ring-dash-brand/30 transition-all font-medium shadow-sm"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Listing Type — Home or Shop */}
        <FormField<ListingSchema>
          control={form.control}
          name="listingType"
          render={({ field }) => (
            <FormItem className="col-span-full">
              <FormLabel className="text-[13px] font-bold text-foreground ml-1 flex items-center gap-2">
                <Store size={14} className="text-dash-brand" />
                Listing Source
              </FormLabel>
              <div className="grid grid-cols-2 gap-3 mt-1">
                {/* Home Option */}
                <button
                  type="button"
                  onClick={() => field.onChange('home')}
                  className={`relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer text-left
                    ${
                      field.value === 'home'
                        ? 'border-dash-brand bg-dash-brand/5 shadow-sm'
                        : 'border-border bg-card hover:border-dash-brand/40 hover:bg-muted-light/50'
                    }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                    ${
                      field.value === 'home'
                        ? 'bg-dash-brand/15 text-dash-brand'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <Home size={20} strokeWidth={2} />
                  </div>
                  <div>
                    <p
                      className={`text-[13px] font-extrabold leading-tight ${
                        field.value === 'home'
                          ? 'text-dash-brand'
                          : 'text-foreground'
                      }`}
                    >
                      From Home
                    </p>
                    <p className="text-[11px] text-muted-foreground/70 font-medium mt-0.5">
                      Individual / Personal rental
                    </p>
                  </div>
                  {field.value === 'home' && (
                    <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-dash-brand flex items-center justify-center">
                      <svg
                        className="w-2.5 h-2.5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </button>

                {/* Shop Option */}
                <button
                  type="button"
                  onClick={() => field.onChange('shop')}
                  className={`relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer text-left
                    ${
                      field.value === 'shop'
                        ? 'border-dash-brand bg-dash-brand/5 shadow-sm'
                        : 'border-border bg-card hover:border-dash-brand/40 hover:bg-muted-light/50'
                    }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                    ${
                      field.value === 'shop'
                        ? 'bg-dash-brand/15 text-dash-brand'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <Store size={20} strokeWidth={2} />
                  </div>
                  <div>
                    <p
                      className={`text-[13px] font-extrabold leading-tight ${
                        field.value === 'shop'
                          ? 'text-dash-brand'
                          : 'text-foreground'
                      }`}
                    >
                      From Shop / Store
                    </p>
                    <p className="text-[11px] text-muted-foreground/70 font-medium mt-0.5">
                      Business / Commercial rental
                    </p>
                  </div>
                  {field.value === 'shop' && (
                    <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-dash-brand flex items-center justify-center">
                      <svg
                        className="w-2.5 h-2.5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.watch('listingType') === 'shop' && (
          <FormField<ListingSchema>
            control={form.control}
            name="shopName"
            render={({ field }) => (
              <FormItem className="col-span-full animate-in fade-in slide-in-from-top-2 duration-200">
                <FormLabel className="text-[13px] font-bold text-foreground ml-1 flex items-center gap-2">
                  <Store size={14} className="text-dash-brand" />
                  Shop / Store Name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your business/shop name"
                    {...field}
                    value={field.value || ''}
                    className="w-full h-12 px-4 rounded-xl border border-border bg-card text-[15px] text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-1 focus-visible:ring-dash-brand/30 transition-all font-medium shadow-sm"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField<ListingSchema>
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[13px] font-bold text-foreground ml-1 flex items-center gap-2">
                <Tag size={14} className="text-dash-brand" />
                Category
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                value={(field.value || undefined) as string | undefined}
              >
                <FormControl>
                  <SelectTrigger className="w-full h-12 px-4 rounded-xl border border-border bg-card text-[15px] text-foreground focus:ring-1 focus:ring-dash-brand/30 font-medium shadow-sm hover:bg-muted-light/50 transition-all">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-card rounded-2xl shadow-2xl border-none p-2 animate-in fade-in zoom-in-95 duration-200">
                  {categories.map((cat) => (
                    <SelectItem
                      key={cat.id}
                      value={cat.id}
                      className="rounded-xl font-bold text-dash-text-soft py-3 px-4 focus:bg-dash-brand/10 focus:text-dash-brand cursor-pointer"
                    >
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex justify-end mt-1">
                <Button
                  variant="link"
                  type="button"
                  onClick={() => setRequestCategoryOpen(true)}
                  className="text-[11px] font-bold text-dash-brand hover:underline cursor-pointer p-0 h-auto"
                >
                  Can't find your category? Request it here.
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <CategoryFormDialog
          isOpen={requestCategoryOpen}
          onOpenChange={setRequestCategoryOpen}
          editingCategory={null}
          isPending={createRequestMutation.isPending}
          isRequest={true}
          onSubmit={(data) => {
            const payload = {
              ...data,
              requestReason:
                data.requestReason?.trim() || 'Requested from Add Listing form',
            }
            createRequestMutation.mutate(payload, {
              onSuccess: () => {
                toast.success('Category request proposed successfully!')
                setRequestCategoryOpen(false)
              },
              onError: (err: any) => {
                toast.error(
                  err.response?.data?.message || 'Failed to send request',
                )
              },
            })
          }}
        />

        <FormField<ListingSchema>
          control={form.control}
          name="userId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[13px] font-bold text-foreground ml-1 flex items-center gap-2">
                <User size={14} className="text-dash-brand" />
                Provider
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                value={(field.value || undefined) as string | undefined}
                disabled={isLister}
              >
                <FormControl>
                  <SelectTrigger className="w-full h-12 px-4 rounded-xl border border-border bg-card text-[15px] text-foreground focus:ring-1 focus:ring-dash-brand/30 font-medium shadow-sm hover:bg-muted-light/50 transition-all disabled:opacity-100 disabled:bg-muted-light">
                    <SelectValue
                      placeholder={
                        isLister ? currentUser.name : 'Select Provider'
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-card rounded-2xl shadow-2xl border-none p-2 animate-in fade-in zoom-in-95 duration-200">
                  {isLister ? (
                    <SelectItem
                      key={currentUser.id}
                      value={currentUser.id}
                      className="rounded-xl py-3 px-4 focus:bg-dash-brand/10 focus:text-dash-brand cursor-pointer"
                    >
                      <div className="flex flex-col">
                        <span className="font-extrabold text-dash-text text-sm">
                          {currentUser.name || currentUser.email}
                        </span>
                        <span className="text-[10px] text-dash-text-soft opacity-60 uppercase tracking-widest font-black mt-0.5">
                          {currentUser.role}
                        </span>
                      </div>
                    </SelectItem>
                  ) : (
                    users.map((user) => (
                      <SelectItem
                        key={user.id}
                        value={user.id}
                        className="rounded-xl py-3 px-4 focus:bg-dash-brand/10 focus:text-dash-brand cursor-pointer"
                      >
                        <div className="flex flex-col">
                          <span className="font-extrabold text-dash-text text-sm">
                            {user.name || user.email}
                          </span>
                          <span className="text-[10px] text-dash-text-soft opacity-60 uppercase tracking-widest font-black mt-0.5">
                            {user.role}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField<ListingSchema>
          control={form.control}
          name="instagramUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[13px] font-bold text-foreground ml-1 flex items-center gap-2">
                <Instagram size={14} className="text-pink-600" />
                Instagram Link (Optional)
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="https://instagram.com/yourusername"
                  {...field}
                  value={field.value || ''}
                  className="w-full h-12 px-4 rounded-xl border border-border bg-card text-[15px] text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-1 focus-visible:ring-dash-brand/30 transition-all font-medium shadow-sm"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField<ListingSchema>
          control={form.control}
          name="facebookUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[13px] font-bold text-foreground ml-1 flex items-center gap-2">
                <Facebook size={14} className="text-blue-600" />
                Facebook Link (Optional)
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="https://facebook.com/yourusername"
                  {...field}
                  value={field.value || ''}
                  className="w-full h-12 px-4 rounded-xl border border-border bg-card text-[15px] text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-1 focus-visible:ring-dash-brand/30 transition-all font-medium shadow-sm"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
