import React, { useState } from 'react'
import { cn } from '#/lib/utils'
import {
  Mail,
  Calendar,
  Camera,
  Phone,
  Pencil,
  Sparkles,
  Check,
} from 'lucide-react'
import { useTranslation } from '#/context/TranslationContext'

interface UserProfileSummaryCardProps {
  session: any
  imagePreview: string | null
  isEditing: boolean
  handleImageClick: () => void
  fileInputRef: React.RefObject<HTMLInputElement | null>
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  completenessPercent: number
  missingFields: Array<{ key: string; label: string }>
  phone: string
  joinDate: string
}

export function UserProfileSummaryCard({
  session,
  imagePreview,
  isEditing,
  handleImageClick,
  fileInputRef,
  handleFileChange,
  completenessPercent,
  missingFields,
  phone,
  joinDate,
}: UserProfileSummaryCardProps) {
  const { t } = useTranslation()
  const [imageError, setImageError] = useState(false)

  return (
    <div className="w-full lg:border-r lg:border-border/30 lg:pr-8 border-b lg:border-b-0 border-border/30 pb-6 lg:pb-0 flex flex-col items-center text-center">
      {/* Profile Photo Avatar */}
      <div className="relative group shrink-0">
        <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full bg-primary/5 border border-border/30 shadow-sm flex items-center justify-center text-3xl sm:text-4xl font-extrabold text-primary overflow-hidden relative">
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-full object-cover animate-fade-in"
            />
          ) : (session?.user?.image && !imageError) ? (
            <img
              src={session.user.image}
              alt="Profile"
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            session?.user?.name?.charAt(0).toUpperCase() || 'U'
          )}
          {isEditing && (
            <div
              onClick={handleImageClick}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-primary-foreground cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Camera size={22} className="mb-1 animate-scale-in" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-center">
                {t('Edit Profile')}
              </span>
            </div>
          )}
        </div>

        {/* Edit Pencil Icon Button */}
        {isEditing && (
          <div
            onClick={handleImageClick}
            className="absolute bottom-0 right-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-card border border-border shadow-sm flex items-center justify-center cursor-pointer text-primary hover:scale-105 active:scale-95 transition-all animate-scale-in"
          >
            <Pencil size={12} className="text-primary" />
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>

      {/* User Name & Verified Badge */}
      <h4 className="font-extrabold text-foreground text-lg sm:text-xl mt-3 sm:mt-4 font-display">
        {session?.user?.name}
      </h4>
      <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft text-primary text-[10px] font-bold px-3 py-0.5 mt-1.5 border border-primary-border/40">
        <Check className="h-3 w-3 text-primary shrink-0" />
        {t('Verified Member')}
      </span>

      {/* Profile Completeness Widget */}
      <div className="w-full max-w-md lg:max-w-none mt-5 bg-muted-light/30 border border-border/20 rounded-2xl p-3.5 sm:p-4 text-left">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[10px] font-black text-muted-dark uppercase tracking-widest">
            {t('Completeness')}
          </span>
          <span
            className={cn(
              'text-xs font-black',
              completenessPercent === 100 ? 'text-primary' : 'text-amber-500',
            )}
          >
            {completenessPercent}%
          </span>
        </div>
        {/* Progress Bar */}
        <div className="w-full h-2 bg-muted-light rounded-full overflow-hidden mb-3">
          <div
            className={cn(
              'h-full transition-all duration-500 rounded-full',
              completenessPercent === 100 ? 'bg-primary' : 'bg-amber-500',
            )}
            style={{ width: `${completenessPercent}%` }}
          />
        </div>

        {/* Missing fields list */}
        {missingFields.length > 0 ? (
          <div className="space-y-1.5">
            <p className="text-[9px] font-bold text-muted-dark uppercase tracking-wider">
              {t('Pending Details:')}
            </p>
            <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-1 pl-1">
              {missingFields.map((f) => (
                <li
                  key={f.key}
                  className="text-[10px] font-semibold text-amber-600 flex items-center gap-1.5"
                >
                  <span className="w-1 h-1 rounded-full bg-amber-500 shrink-0" />
                  {t(f.label)}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[10px] font-black text-primary">
            <Sparkles
              size={11}
              className="fill-primary-soft shrink-0 animate-bounce"
            />
            {t('Profile fully complete!')}
          </div>
        )}
      </div>

      {/* Dynamic Contact & Account Details */}
      <div className="mt-5 space-y-3.5 text-left w-full max-w-md lg:max-w-[240px]">
        <div className="flex items-center gap-3 text-xs text-muted-foreground font-semibold">
          <Mail size={15} className="text-muted-foreground/70 shrink-0" />
          <span className="truncate">{session?.user?.email}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground font-semibold">
          <Phone size={15} className="text-muted-foreground/70 shrink-0" />
          <span className={cn(!phone && 'italic text-muted-foreground/50')}>
            {phone || t('Not specified')}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground font-semibold">
          <Calendar size={15} className="text-muted-foreground/70 shrink-0" />
          <span>
            {t('Member since')} {joinDate}
          </span>
        </div>
      </div>
    </div>
  )
}
