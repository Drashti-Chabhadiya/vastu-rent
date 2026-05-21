import React, { useState, useRef, useEffect } from 'react'
import * as LucideIcons from 'lucide-react'
import {
  Plus,
  Tag,
  Check,
  Image as ImageIcon,
  Type,
  Upload,
  Layers,
  ArrowRight,
  Folder,
} from 'lucide-react'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '#/components/ui/dialog'
import { IconSelector } from './IconSelector'
import { cn } from '#/lib/utils'
import { useUploadProductImage } from '#/hook'

interface CategoryFormDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  editingCategory: any
  onSubmit: (data: any) => void
  isPending: boolean
  isRequest?: boolean
}

export const CategoryFormDialog = ({
  isOpen,
  onOpenChange,
  editingCategory,
  onSubmit,
  isPending,
  isRequest = false,
}: CategoryFormDialogProps) => {
  const [categoryName, setCategoryName] = useState('')
  const [selectedIcon, setSelectedIcon] = useState<string>('Folder')
  const [selectedColor, setSelectedColor] = useState<string>('#166534')
  const [categoryImage, setCategoryImage] = useState<string>('')
  const [useImage, setUseImage] = useState(false)
  const [description, setDescription] = useState('')
  const [requestReason, setRequestReason] = useState('')

  const COLORS = [
    '#166534',
    '#15803d',
    '#1e40af',
    '#1d4ed8',
    '#7c3aed',
    '#9333ea',
    '#c026d3',
    '#db2777',
    '#e11d48',
    '#ea580c',
    '#d97706',
    '#65a30d',
    '#4b5563',
    '#000000',
  ]

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      if (editingCategory) {
        setCategoryName(editingCategory.name)
        setSelectedIcon(editingCategory.icon || 'Folder')
        setSelectedColor(editingCategory.color || '#166534')
        setCategoryImage(editingCategory.image || '')
        setUseImage(!!editingCategory.image)
        setDescription(editingCategory.description || '')
        setRequestReason(editingCategory.requestReason || '')
      } else {
        setCategoryName('')
        setSelectedIcon('Folder')
        setSelectedColor('#166534')
        setCategoryImage('')
        setUseImage(false)
        setDescription('')
        setRequestReason('')
      }
    }
  }, [isOpen, editingCategory])

  const { mutateAsync: uploadImage, isPending: isUploading } =
    useUploadProductImage()

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const url = await uploadImage(file)
        setCategoryImage(url)
      } catch (error) {
        console.error('Upload Error:', error)
        alert('Failed to upload image. Please try again.')
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoryName.trim()) return

    const payload: any = {
      name: categoryName.trim(),
    }

    if (useImage) {
      payload.image = categoryImage || ''
      payload.icon = null
      payload.color = null
    } else {
      payload.icon = selectedIcon || 'Folder'
      payload.color = selectedColor || '#166534'
      payload.image = null
    }

    if (isRequest) {
      payload.description = description.trim()
      payload.requestReason = requestReason.trim()
    }

    onSubmit(payload)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl rounded-2xl border-none shadow-2xl p-0 overflow-hidden bg-white">
        <div className="bg-gradient-to-br from-[#166534] to-[#2f6a4a] p-8 text-white relative">
          <DialogHeader>
            <DialogTitle className="text-2xl font-extrabold tracking-tight">
              {isRequest
                ? 'Propose Category'
                : editingCategory
                  ? 'Update Category'
                  : 'New Category'}
            </DialogTitle>
            <p className="text-white/70 text-sm font-medium mt-1">
              {isRequest
                ? 'Propose a new collection. Admins will review and approve your suggestion.'
                : editingCategory
                  ? 'Modify the category name and properties.'
                  : 'Create a new collection for your rentals.'}
            </p>
          </DialogHeader>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar text-gray-900"
        >
          <div className="space-y-2.5">
            <label className="text-[13px] font-bold text-gray-900 ml-1 flex items-center gap-2">
              <Tag size={14} className="text-dash-brand" />
              Category Name
            </label>
            <Input
              placeholder="e.g. Electronics, Furniture..."
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="h-12 bg-white border-gray-200 rounded-xl text-[15px] text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-dash-brand/30 transition-all font-medium shadow-sm"
              autoFocus
            />
          </div>

          {isRequest && (
            <>
              <div className="space-y-2.5">
                <label className="text-[13px] font-bold text-gray-900 ml-1 flex items-center gap-2">
                  <LucideIcons.FileText size={14} className="text-dash-brand" />
                  Description
                </label>
                <textarea
                  required
                  placeholder="Briefly describe what items belong in this category..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full min-h-[80px] bg-white border border-gray-200 rounded-xl p-3 text-[15px] text-gray-900 placeholder:text-gray-400 focus:ring-1 focus:ring-dash-brand/30 focus:border-dash-brand transition-all font-medium shadow-sm"
                />
              </div>

              <div className="space-y-2.5">
                <label className="text-[13px] font-bold text-gray-900 ml-1 flex items-center gap-2">
                  <LucideIcons.HelpCircle
                    size={14}
                    className="text-dash-brand"
                  />
                  Request Reason
                </label>
                <textarea
                  required
                  placeholder="Why is this category needed? (e.g., I have 10 cameras to list)"
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  className="w-full min-h-[80px] bg-white border border-gray-200 rounded-xl p-3 text-[15px] text-gray-900 placeholder:text-gray-400 focus:ring-1 focus:ring-dash-brand/30 focus:border-dash-brand transition-all font-medium shadow-sm"
                />
              </div>
            </>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <label className="text-[13px] font-bold text-gray-900 flex items-center gap-2">
                {useImage ? (
                  <ImageIcon size={14} className="text-dash-brand" />
                ) : (
                  <Type size={14} className="text-dash-brand" />
                )}
                {useImage ? 'Category Image' : 'Category Icon'}
              </label>
              <button
                type="button"
                onClick={() => setUseImage(!useImage)}
                className="text-[12px] font-bold text-dash-brand hover:underline"
              >
                {useImage ? 'Use Icon instead' : 'Upload Image instead'}
              </button>
            </div>

            {useImage ? (
              <div className="space-y-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-video rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-dash-brand/30 hover:bg-gray-100 transition-all overflow-hidden relative group"
                >
                  {categoryImage ? (
                    <>
                      <img
                        src={categoryImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Upload className="text-white" size={24} />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                        <Upload className="text-gray-400" size={20} />
                      </div>
                      <div className="text-center text-gray-900">
                        <p className="text-sm font-bold">
                          Click to upload image
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG or SVG (max. 2MB)
                        </p>
                      </div>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Color Picker */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[12px] font-bold text-gray-500">
                      Brand Color & Shades
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">
                        {selectedColor}
                      </span>
                      <div
                        className="w-4 h-4 rounded-full border border-gray-200"
                        style={{ backgroundColor: selectedColor }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                    <div className="flex flex-wrap gap-2">
                      {COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setSelectedColor(color)}
                          className={cn(
                            'w-8 h-8 rounded-full border-2 transition-all hover:scale-110 active:scale-95 shadow-sm',
                            selectedColor === color
                              ? 'border-gray-900 scale-110'
                              : 'border-white',
                          )}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                      {/* Custom Color Trigger */}
                      <div className="relative group">
                        <Input
                          type="color"
                          value={selectedColor}
                          onChange={(e) => setSelectedColor(e.target.value)}
                          className="w-8 h-8 rounded-full border-2 border-white p-0 overflow-hidden cursor-pointer shadow-sm transition-all hover:scale-110"
                        />
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          Custom Shade
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Input
                        type="text"
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        placeholder="#000000"
                        className="h-10 bg-white border-gray-200 rounded-xl text-xs font-mono uppercase text-center w-28 text-gray-900"
                      />
                      <div className="flex-1 h-2 rounded-full overflow-hidden flex">
                        {/* Visual shade representation */}
                        {[0.1, 0.3, 0.5, 0.7, 0.9].map((op) => (
                          <div
                            key={op}
                            className="flex-1 h-full"
                            style={{
                              backgroundColor: selectedColor,
                              opacity: op,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Icon Selector */}
                <div className="space-y-3">
                  <span className="text-[12px] font-bold text-gray-500 ml-1">
                    Select Icon
                  </span>
                  <IconSelector
                    selectedIcon={selectedIcon}
                    onSelect={setSelectedIcon}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Live Preview Section */}
          <div className="pt-6 border-t border-gray-100">
            <label className="text-[13px] font-bold text-gray-900 mb-4 block flex items-center gap-2">
              <Check size={14} className="text-dash-brand" />
              Card Preview
            </label>

            <div className="max-w-xs mx-auto">
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden group">
                {/* Background Accent */}
                {!useImage && (
                  <div
                    className="absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 opacity-[0.03]"
                    style={{ backgroundColor: selectedColor }}
                  />
                )}

                <div className="flex items-start justify-between relative z-10">
                  <div className="space-y-4">
                    {useImage ? (
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100">
                        {categoryImage ? (
                          <img
                            src={categoryImage}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
                            <ImageIcon size={20} />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
                        style={{
                          backgroundColor: `${selectedColor}15`,
                          color: selectedColor,
                        }}
                      >
                        {(() => {
                          const IconComp = (LucideIcons as any)[
                            selectedIcon || 'Folder'
                          ]
                          return IconComp ? (
                            <IconComp size={24} />
                          ) : (
                            <Folder size={24} />
                          )
                        })()}
                      </div>
                    )}

                    <div>
                      <h3 className="text-lg font-extrabold text-gray-900">
                        {categoryName || 'Category Name'}
                      </h3>
                      <div className="flex items-center gap-2 mt-2">
                        <div
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                          style={{
                            backgroundColor: !useImage
                              ? `${selectedColor}15`
                              : '#f3f4f6',
                          }}
                        >
                          <Layers
                            size={12}
                            style={{
                              color: !useImage ? selectedColor : '#9ca3af',
                            }}
                          />
                          <span
                            className="text-[11px] font-extrabold uppercase tracking-wider"
                            style={{
                              color: !useImage ? selectedColor : '#4b5563',
                            }}
                          >
                            0 Items
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Manage Collection
                  </span>
                  <ArrowRight size={16} className="text-gray-300" />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-3 sm:gap-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-xl font-bold h-12 flex-1 bg-gray-200 text-gray-600 hover:bg-gray-300 transition-all border-none"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || isUploading}
              className="bg-dash-brand hover:bg-dash-brand/90 text-white rounded-xl h-12 font-extrabold px-8 shadow-lg shadow-dash-brand/20 flex-1 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isRequest ? (
                <>
                  <Check size={18} strokeWidth={3} />
                  Submit Proposal
                </>
              ) : editingCategory ? (
                <>
                  <Check size={18} strokeWidth={3} />
                  Save Changes
                </>
              ) : (
                <>
                  <Plus size={18} strokeWidth={3} />
                  Create Category
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
