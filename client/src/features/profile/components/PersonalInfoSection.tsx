import type { UseFormReturn } from 'react-hook-form'
import type { ProfileSchema } from '#/schema'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '#/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { cn } from '#/lib/utils'
import { Instagram, Facebook } from 'lucide-react'
import { useTranslation } from '#/context/TranslationContext'

interface Props {
  form: UseFormReturn<ProfileSchema>
  email: string
  isEditing: boolean
}

export function PersonalInfoSection({ form, email, isEditing }: Props) {
  const { t } = useTranslation()
  const errors = form.formState.errors

  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-xs font-bold text-muted-foreground/70">
              {t('Full Name')}
            </FormLabel>
            <FormControl>
              <Input
                placeholder={t('Not specified')}
                {...field}
                disabled={!isEditing}
                className={cn(
                  'h-11 rounded-xl border-border font-semibold text-sm transition-all focus:ring-primary/20',
                  isEditing
                    ? errors.name
                      ? 'bg-card text-foreground border-destructive ring-2 ring-destructive/10 focus-visible:ring-destructive'
                      : 'bg-card text-foreground border-primary ring-2 ring-primary/5'
                    : 'bg-muted-light/50 text-foreground disabled:opacity-100 disabled:cursor-default',
                )}
              />
            </FormControl>
            <FormMessage className="text-[11px] font-bold mt-1" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="gender"
        render={({ field }) => {
          const normalizedValue = field.value?.trim()
            ? field.value.trim().charAt(0).toUpperCase() +
              field.value.trim().slice(1).toLowerCase()
            : ''
          return (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-xs font-bold text-muted-foreground/70">
                {t('Gender')}
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                value={normalizedValue || undefined}
                disabled={!isEditing}
              >
                <FormControl>
                  <SelectTrigger
                    className={cn(
                      'w-full h-11 px-4 rounded-xl border border-border font-semibold text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-100 disabled:bg-muted-light/50 disabled:cursor-default transition-all shadow-none cursor-pointer',
                      isEditing
                        ? 'bg-card border-primary ring-2 ring-primary/5'
                        : 'bg-muted-light/50',
                    )}
                  >
                    <SelectValue placeholder={t('Select Gender')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Female">{t('Female')}</SelectItem>
                  <SelectItem value="Male">{t('Male')}</SelectItem>
                  <SelectItem value="Other">{t('Other')}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage className="text-[11px] font-bold mt-1" />
            </FormItem>
          )
        }}
      />

      <div className="space-y-1.5">
        <Label
          htmlFor="email"
          className="text-xs font-bold text-muted-foreground/70"
        >
          {t('Email Address')}
        </Label>
        <Input
          id="email"
          value={email}
          disabled
          className="h-11 rounded-xl border-border bg-muted-light/50 text-foreground font-semibold text-sm disabled:opacity-100 disabled:cursor-default"
        />
      </div>

      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-xs font-bold text-muted-foreground/70">
              {t('Phone Number')}
            </FormLabel>
            <FormControl>
              <Input
                placeholder={t('Not specified')}
                {...field}
                disabled={!isEditing}
                className={cn(
                  'h-11 rounded-xl border-border font-semibold text-sm transition-all focus:ring-primary/20',
                  isEditing
                    ? errors.phone
                      ? 'bg-card text-foreground border-destructive ring-2 ring-destructive/10 focus-visible:ring-destructive'
                      : 'bg-card text-foreground border-primary ring-2 ring-primary/5'
                    : 'bg-muted-light/50 text-foreground disabled:opacity-100 disabled:cursor-default',
                )}
              />
            </FormControl>
            <FormMessage className="text-[11px] font-bold mt-1" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="language"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-xs font-bold text-muted-foreground/70">
              {t('Preferred Language')}
            </FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value || undefined}
              disabled={!isEditing}
            >
              <FormControl>
                <SelectTrigger
                  className={cn(
                    'w-full h-11 px-4 rounded-xl border border-border font-semibold text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-100 disabled:bg-muted-light/50 disabled:cursor-default transition-all shadow-none cursor-pointer',
                    isEditing
                      ? 'bg-card border-primary ring-2 ring-primary/5'
                      : 'bg-muted-light/50',
                  )}
                >
                  <SelectValue placeholder={t('Select Language')} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="en">English (English)</SelectItem>
                <SelectItem value="hi">Hindi (हिंदी)</SelectItem>
                <SelectItem value="gu">Gujarati (ગુજરાતી)</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage className="text-[11px] font-bold mt-1" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="dob"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-xs font-bold text-muted-foreground/70">
              {t('Date of Birth')}
            </FormLabel>
            <FormControl>
              <Input
                type="date"
                {...field}
                value={field.value || ''}
                disabled={!isEditing}
                className={cn(
                  'w-full h-11 rounded-xl border-border font-semibold text-sm transition-all focus:ring-primary/20 relative',
                  isEditing
                    ? errors.dob
                      ? 'bg-card text-foreground border-destructive ring-2 ring-destructive/10 focus-visible:ring-destructive'
                      : 'bg-card text-foreground border-primary ring-2 ring-primary/5'
                    : 'bg-muted-light/50 text-foreground disabled:opacity-100 disabled:cursor-default',
                )}
              />
            </FormControl>
            <FormMessage className="text-[11px] font-bold mt-1" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="instagramUrl"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-xs font-bold text-muted-foreground/70 flex items-center gap-2">
              <Instagram size={14} className="text-pink-600" />
              {t('Instagram Link (Optional)')}
            </FormLabel>
            <FormControl>
              <Input
                placeholder="https://instagram.com/yourusername"
                {...field}
                value={field.value || ''}
                disabled={!isEditing}
                className={cn(
                  'w-full h-11 rounded-xl border-border font-semibold text-sm transition-all focus:ring-primary/20',
                  isEditing
                    ? errors.instagramUrl
                      ? 'bg-card text-foreground border-destructive ring-2 ring-destructive/10 focus-visible:ring-destructive'
                      : 'bg-card text-foreground border-primary ring-2 ring-primary/5'
                    : 'bg-muted-light/50 text-foreground disabled:opacity-100 disabled:cursor-default',
                )}
              />
            </FormControl>
            <FormMessage className="text-[11px] font-bold mt-1" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="facebookUrl"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-xs font-bold text-muted-foreground/70 flex items-center gap-2">
              <Facebook size={14} className="text-blue-600" />
              {t('Facebook Link (Optional)')}
            </FormLabel>
            <FormControl>
              <Input
                placeholder="https://facebook.com/yourusername"
                {...field}
                value={field.value || ''}
                disabled={!isEditing}
                className={cn(
                  'w-full h-11 rounded-xl border-border font-semibold text-sm transition-all focus:ring-primary/20',
                  isEditing
                    ? errors.facebookUrl
                      ? 'bg-card text-foreground border-destructive ring-2 ring-destructive/10 focus-visible:ring-destructive'
                      : 'bg-card text-foreground border-primary ring-2 ring-primary/5'
                    : 'bg-muted-light/50 text-foreground disabled:opacity-100 disabled:cursor-default',
                )}
              />
            </FormControl>
            <FormMessage className="text-[11px] font-bold mt-1" />
          </FormItem>
        )}
      />
    </>
  )
}
