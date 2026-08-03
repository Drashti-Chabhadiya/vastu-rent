import { signupSchema } from '#/schema'
import type { SignupSchema } from '#/schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Link } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect } from 'react'
import { Mail, Lock, EyeOff, User, Eye } from 'lucide-react'
import { authClient } from '#/lib/auth/auth-client'
import { SocialAuth } from './social-auth'
import { toast } from 'sonner'
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

export function SignupForm() {
  const { t } = useTranslation()
  const [serverError, setServerError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<SignupSchema>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })
  const {
    formState: { isSubmitting },
  } = form

  // Verification-related states
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [resendError, setResendError] = useState<string | null>(null)
  const [resendCooldown, setResendCooldown] = useState(0)

  // Countdown timer for resending verification email
  useEffect(() => {
    if (resendCooldown === 0) return
    const interval = setInterval(() => {
      setResendCooldown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [resendCooldown])

  const onSubmit = async (values: SignupSchema) => {
    setServerError(null)

    const { error } = await authClient.signUp.email({
      email: values.email,
      password: values.password,
      name: values.name,
      callbackURL: '/',
    })

    if (error) {
      const errMsg = error.message ?? 'Registration failed. Please try again.'
      setServerError(errMsg)
      toast.error(errMsg)
      return
    }

    // Set the email to switch to the premium verification success view
    setRegisteredEmail(values.email)
  }

  const handleResend = async () => {
    if (!registeredEmail || resendCooldown > 0) return

    setResendLoading(true)
    setResendError(null)

    const { error } = await authClient.sendVerificationEmail({
      email: registeredEmail,
      callbackURL: '/',
    })

    setResendLoading(false)

    if (error) {
      setResendError(error.message ?? 'Failed to resend. Please try again.')
    } else {
      setResendSuccess(true)
      setResendCooldown(60)
      setTimeout(() => setResendSuccess(false), 5000)
    }
  }

  if (registeredEmail) {
    return (
      <div className="w-full relative py-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="mb-8">
          <h1 className="text-[32px] font-bold text-text-dark tracking-tight font-display">
            Verify Your Email
          </h1>
          <p className="mt-2 text-[15px] text-muted-foreground/85 font-medium">
            We've sent a verification link to your inbox.
          </p>
        </div>

        <div className="bg-primary-soft/50 border border-primary/20 rounded-2xl p-6 sm:p-8 mb-6 flex flex-col items-center text-center shadow-soft">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-5 animate-pulse">
            <Mail className="h-8 w-8 text-primary" strokeWidth={1.5} />
          </div>

          <h3 className="text-lg font-bold text-foreground mb-2">
            Check your inbox
          </h3>
          <p className="text-[14px] text-muted-foreground max-w-[340px] leading-relaxed mb-4">
            A confirmation link was sent to{' '}
            <strong className="text-foreground break-all">
              {registeredEmail}
            </strong>
            . Please click the link to activate your account.
          </p>

          {resendSuccess && (
            <p className="text-sm text-primary font-bold mb-4 bg-primary/10 px-3 py-1.5 rounded-lg animate-in fade-in duration-200">
              Verification email resent successfully!
            </p>
          )}

          {resendError && (
            <p className="text-sm text-destructive font-semibold mb-4 bg-danger px-3 py-1.5 rounded-lg">
              {resendError}
            </p>
          )}

          <Button
            type="button"
            disabled={resendLoading || resendCooldown > 0}
            onClick={handleResend}
            className="w-full h-12 rounded-xl bg-primary text-primary-foreground text-[14px] font-bold hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resendLoading ? (
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 border-2 border-card border-t-transparent rounded-full animate-spin"></span>
                Resending...
              </span>
            ) : resendCooldown > 0 ? (
              `Resend email in ${resendCooldown}s`
            ) : (
              'Resend Verification Email'
            )}
          </Button>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setRegisteredEmail(null)}
            className="w-full"
          >
            Back to Sign Up
          </Button>

          <Button
            asChild
            variant="ghost"
            className="w-full h-11 rounded-xl bg-muted/50 hover:bg-muted text-foreground/90 text-[14px] font-bold transition-colors flex items-center justify-center cursor-pointer"
          >
            <Link to="/login">Go to Login</Link>
          </Button>
        </div>
      </div>
    )
  }

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
