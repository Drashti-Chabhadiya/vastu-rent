import { signupSchema } from '#/schema'
import type { SignupSchema } from '#/schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Link, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Mail, Lock, EyeOff, User, Eye } from 'lucide-react'
import { authClient } from '#/lib/auth/auth-client'
import { getDeviceFingerprint } from '#/utils/fingerprint'
import { SocialAuth } from './social-auth'
import { toast } from 'sonner'
import { authApi } from '../api/auth'
import { useTranslation } from '#/context/TranslationContext'
import { LanguageSelector } from '@/components/ui/language-selector'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Route as SignupRoute } from '../../../routes/signup'

export function SignupForm() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const searchParams = SignupRoute.useSearch()
  const [serverError, setServerError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<SignupSchema>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
    defaultValues: {
      name: searchParams?.name || '',
      email: searchParams?.email || '',
      password: '',
      confirmPassword: '',
    },
  })
  const {
    formState: { isSubmitting },
  } = form

  const onSubmit = async (values: SignupSchema) => {
    setServerError(null)

    // Check if device has already used the free trial
    const hasUsedTrial = localStorage.getItem('vasturent_free_trial_used')
    if (hasUsedTrial === 'true') {
      const errMsg =
        t(
          'An account has already been created on this device. Please log in using your existing account.',
        ) ||
        'An account has already been created on this device. Please log in using your existing account.'
      setServerError(errMsg)
      toast.error(errMsg)
      return
    }

    let visitorId = ''
    try {
      visitorId = await getDeviceFingerprint()
      localStorage.setItem('vasturent_device_fp', visitorId)
    } catch (e) {
      console.error('Failed to get fingerprint', e)
    }

    // Check if email is already registered (backend DB check)
    try {
      const emailExists = await authApi.checkEmailExists(values.email)
      if (emailExists) {
        const errMsg =
          t(
            'This email is already registered. Please use a different email or log in.',
          ) ||
          'This email is already registered. Please use a different email or log in.'
        form.setError('email', { type: 'manual', message: errMsg })
        return
      }
    } catch (e) {
      // If check fails, proceed – the backend will reject it anyway
      console.error('Email check failed:', e)
    }

    const { error } = await authClient.signUp.email({
      email: values.email,
      password: values.password,
      name: values.name,
      deviceFingerprint: visitorId || undefined,
      callbackURL: '/',
    } as Parameters<typeof authClient.signUp.email>[0] & {
      deviceFingerprint?: string
    })

    if (error) {
      let errMsg = error.message ?? 'Registration failed. Please try again.'

      // Provide a clean, user-friendly error message for duplicate devices
      if (errMsg.includes('Device already registered')) {
        errMsg =
          'This device has already been used to register an account. Multiple accounts from the same device are not permitted.'
        setServerError(errMsg)
        toast.error(errMsg)
      } else if (
        errMsg.toLowerCase().includes('already exists') ||
        errMsg.toLowerCase().includes('already registered')
      ) {
        errMsg =
          t(
            'This email is already registered. Please use a different email or log in.',
          ) ||
          'This email is already registered. Please use a different email or log in.'
        form.setError('email', { type: 'manual', message: errMsg })
      } else {
        setServerError(errMsg)
        toast.error(errMsg)
      }

      return
    }

    // Mark trial as used upon successful signup
    localStorage.setItem('vasturent_free_trial_used', 'true')

    // Call /api/auth/send-otp
    try {
      await authApi.sendOtp(values.email, values.name)
    } catch (err) {
      console.error('Failed to send initial OTP:', err)
    }

    // Redirect to Verify Email page
    navigate({ to: '/verify-email', search: { email: values.email } })
  }

  // The resend UI is now inside verify-email route

  return (
    <div className="w-full relative">
      {/* Mobile Mockup Hero Card */}
      <div className="relative h-[160px] rounded-[24px] overflow-hidden mb-6 block lg:hidden border border-border/20 shadow-sm">
        <img
          src="/assets/hero-rental.png"
          alt="Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
        <div className="absolute left-5 bottom-4 text-white">
          <div className="font-display text-xl font-bold">
            {t('Rent anything.')}
          </div>
          <div className="font-display text-xl font-bold italic opacity-95">
            {t('Live in harmony.')}
          </div>
        </div>
      </div>

      {/* Top Bar with Language Selector & Switch Link */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
          <span className="opacity-80">{t('Already have account?')}</span>
          <Link
            to="/login"
            className="text-primary font-black hover:underline transition-colors"
          >
            {t('Sign in')}
          </Link>
        </div>
        <LanguageSelector />
      </div>

      <div className="mb-6 hidden lg:block">
        <h1 className="text-[32px] font-bold text-text-dark tracking-tight">
          {t('Create Account')}
        </h1>
        <p className="mt-2 text-[15px] text-muted-foreground/85 font-medium">
          {t('Join thousands of users renting smarter everyday.')}
        </p>
      </div>

      {/* Mockup Pill Tab Switcher */}
      <div className="flex bg-brand-beige dark:bg-muted/40 rounded-full p-1 mb-6">
        <Link
          to="/login"
          className="flex-1 py-2.5 text-xs font-black text-muted-foreground text-center rounded-full hover:text-foreground transition-all flex items-center justify-center"
        >
          {t('Sign in')}
        </Link>
        <Button
          variant="ghost"
          className="flex-1 py-2.5 h-auto text-xs font-black bg-primary text-primary-foreground rounded-full hover:bg-primary hover:text-primary-foreground transition-all active:scale-100 shadow-sm border-none"
        >
          {t('Create account')}
        </Button>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, (formErrors) => {
            const firstError = Object.values(formErrors)[0]?.message
            toast.error(
              typeof firstError === 'string'
                ? firstError
                : 'Please fill in all required fields.',
            )
          })}
        >
          <div className="space-y-4">
            {/* Full Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1">
                    {t('Full Name')}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                        <User
                          className="h-[16px] w-[16px] text-muted-foreground/60"
                          strokeWidth={2}
                        />
                      </div>
                      <Input
                        placeholder={t('Enter your name')}
                        className="w-full h-11 pl-11 pr-4 rounded-[14px] border border-border/80 bg-card text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-brand-light focus:ring-1 focus:ring-brand-light transition-shadow"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1">
                    {t('Email Address')}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                        <Mail
                          className="h-[16px] w-[16px] text-muted-foreground/60"
                          strokeWidth={2}
                        />
                      </div>
                      <Input
                        type="email"
                        placeholder={t('Enter your email')}
                        className="w-full h-11 pl-11 pr-4 rounded-[14px] border border-border/80 bg-card text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-brand-light focus:ring-1 focus:ring-brand-light transition-shadow"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1">
                    {t('Password')}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                        <Lock
                          className="h-[16px] w-[16px] text-muted-foreground/60"
                          strokeWidth={2}
                        />
                      </div>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder={t('Create password')}
                        className="w-full h-11 pl-11 pr-12 rounded-[14px] border border-border/80 bg-card text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-brand-light focus:ring-1 focus:ring-brand-light transition-shadow"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute inset-y-0 right-0 h-full w-12 px-3 flex items-center justify-center hover:bg-transparent z-10"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <Eye
                            className="h-[16px] w-[16px] text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                            strokeWidth={2}
                          />
                        ) : (
                          <EyeOff
                            className="h-[16px] w-[16px] text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                            strokeWidth={2}
                          />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirm Password */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1">
                    {t('Confirm Password')}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                        <Lock
                          className="h-[16px] w-[16px] text-muted-foreground/60"
                          strokeWidth={2}
                        />
                      </div>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder={t('Confirm Password')}
                        className="w-full h-11 pl-11 pr-4 rounded-[14px] border border-border/80 bg-card text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-brand-light focus:ring-1 focus:ring-brand-light transition-shadow"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {serverError && (
              <p className="text-center text-xs text-destructive font-medium">
                {serverError}
              </p>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-full bg-primary hover:bg-primary-hover text-white font-black text-xs shadow-md border-none flex items-center justify-center gap-1.5 cursor-pointer mt-3 active:scale-[0.98] transition-all"
            >
              {isSubmitting ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{t('Create Account')}</span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#fff"
                    strokeWidth={3}
                  >
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>

      {/* Or continue with */}
      <div className="mt-8 mb-6 flex items-center">
        <div className="h-[1px] flex-1 bg-muted"></div>
        <span className="px-4 text-[13px] font-medium text-muted-foreground/70">
          {t('or continue with')}
        </span>
        <div className="h-[1px] flex-1 bg-muted"></div>
      </div>

      {/* Social Buttons */}
      <SocialAuth />

      <p className="text-center text-[12px] text-muted-foreground/85 max-w-[340px] mx-auto leading-relaxed">
        {t('By continuing, you agree to our')}{' '}
        <Link to="/terms" className="font-bold text-primary hover:underline">
          {t('Terms & Conditions')}
        </Link>{' '}
        {t('and')}{' '}
        <Link to="/privacy" className="font-bold text-primary hover:underline">
          {t('Privacy Policy')}
        </Link>
        .
      </p>
    </div>
  )
}
