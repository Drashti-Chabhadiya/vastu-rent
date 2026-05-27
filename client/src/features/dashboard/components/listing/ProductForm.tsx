import type { UseFormReturn } from 'react-hook-form'
import type { ListingSchema } from '../../../../schema/listing-schema'
import { ImageGalleryManager } from './ImageGalleryManager'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '#/components/ui/form'
import { Input } from '#/components/ui/input'
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
  const isOwner = currentUser?.role === 'owner'
  return (
    <div className="space-y-6">
      {/* Hero Preview Section */}
      <div className="relative group overflow-hidden rounded-xl bg-gray-50 border border-gray-100 min-h-[220px] flex items-center justify-center shadow-inner">
        {form.watch('images').length > 0 ? (
          <img
            src={form.watch('images')[0]}
            className="w-full h-[260px] object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
            alt="Cover Preview"
          />
        ) : (
          <div className="text-center p-8">
            <PackagePlus size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
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
              <FormLabel className="text-[13px] font-bold text-gray-900 ml-1 flex items-center gap-2">
                <Type size={14} className="text-dash-brand" />
                Product Title
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Canon EOS R5 Camera"
                  {...field}
                  className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-[15px] text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-dash-brand/30 transition-all font-medium shadow-sm"
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
              <FormLabel className="text-[13px] font-bold text-gray-900 ml-1 flex items-center gap-2">
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
              <FormLabel className="text-[13px] font-bold text-gray-900 ml-1 flex items-center gap-2">
                <AlignLeft size={14} className="text-dash-brand" />
                Description
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the item, features, and condition..."
                  {...field}
                  className="min-h-[120px] w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-[15px] text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-dash-brand/30 transition-all font-medium shadow-sm"
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
              <FormLabel className="text-[13px] font-bold text-gray-900 ml-1 flex items-center gap-2">
                <IndianRupee size={14} className="text-dash-brand" />
                Price / Day
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-[15px] text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-dash-brand/30 transition-all font-medium shadow-sm"
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
              <FormLabel className="text-[13px] font-bold text-gray-900 ml-1 flex items-center gap-2">
                <ShieldCheck size={14} className="text-dash-brand" />
                Security Deposit (Refundable)
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="2000"
                  {...field}
                  className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-[15px] text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-dash-brand/30 transition-all font-medium shadow-sm"
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
              <FormLabel className="text-[13px] font-bold text-gray-900 ml-1 flex items-center gap-2">
                <MapPin size={14} className="text-dash-brand" />
                City
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Mumbai, MH"
                  {...field}
                  className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-[15px] text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-dash-brand/30 transition-all font-medium shadow-sm"
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
              <FormLabel className="text-[13px] font-bold text-gray-900 ml-1 flex items-center gap-2">
                <MapPin size={14} className="text-dash-brand" />
                Location
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Mumbai, MH"
                  {...field}
                  className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-[15px] text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-dash-brand/30 transition-all font-medium shadow-sm"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField<ListingSchema>
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[13px] font-bold text-gray-900 ml-1 flex items-center gap-2">
                <Tag size={14} className="text-dash-brand" />
                Category
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value as string}
              >
                <FormControl>
                  <SelectTrigger className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-[15px] text-gray-900 focus:ring-1 focus:ring-dash-brand/30 font-medium shadow-sm hover:bg-gray-50/50 transition-all">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white rounded-2xl shadow-2xl border-none p-2 animate-in fade-in zoom-in-95 duration-200">
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
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField<ListingSchema>
          control={form.control}
          name="ownerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[13px] font-bold text-gray-900 ml-1 flex items-center gap-2">
                <User size={14} className="text-dash-brand" />
                Provider
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value as string}
                disabled={isOwner}
              >
                <FormControl>
                  <SelectTrigger className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-[15px] text-gray-900 focus:ring-1 focus:ring-dash-brand/30 font-medium shadow-sm hover:bg-gray-50/50 transition-all disabled:opacity-100 disabled:bg-gray-50">
                    <SelectValue
                      placeholder={isOwner ? currentUser.name : 'Select Owner'}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white rounded-2xl shadow-2xl border-none p-2 animate-in fade-in zoom-in-95 duration-200">
                  {isOwner ? (
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
      </div>
    </div>
  )
}
