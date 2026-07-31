import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Link } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { authClient } from '#/lib/auth/auth-client'
import { useState, useEffect } from 'react'
import { Mail, Lock, EyeOff, Check, Eye } from 'lucide-react'
import { loginSchema } from '#/schema'
import type { LoginSchema } from '#/schema'
import { toast } from 'sonner'
import { SocialAuth } from './social-auth'
import { Capacitor } from '@capacitor/core'
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

export function LoginForm() {
  const { t } = useTranslation()
  const [serverError, setServerError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  // Verification-related states
  const [isUnverified, setIsUnverified] = useState(false)
  const [unverifiedEmail, setUnverifiedEmail] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [resendError, setResendError] = useState<string | null>(null)
  const [resendCooldown, setResendCooldown] = useState(0)

  // Forgot password states
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSuccess, setResetSuccess] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError] = useState<string | null>(null)

  // Countdown timer for resending verification email
  useEffect(() => {
    if (resendCooldown === 0) return
    const interval = setInterval(() => {
      setResendCooldown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [resendCooldown])

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetEmail.trim() || resetLoading) return

    setResetLoading(true)
    setResetError(null)
    setResetSuccess(false)

    try {
      const { error } = await authClient.requestPasswordReset({
        email: resetEmail.trim(),
        redirectTo: '/reset-password',
      })

      if (error) {
        setResetError(
          error.message ?? 'Failed to send reset link. Please try again.',
        )
      } else {
        setResetSuccess(true)
        toast.success('Reset email sent!')
      }
    } catch (err: any) {
      setResetError('An unexpected error occurred. Please try again.')
    } finally {
      setResetLoading(false)
    }
  }

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  })
  const {
    formState: { isSubmitting },
  } = form

  const onSubmit = async (values: LoginSchema) => {
    setServerError(null)
    setIsUnverified(false)
    setResendError(null)

    const { error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
      // No callbackURL — would cause a redirect response instead of JSON on the server
    })

    if (error) {
      if (
        error.code === 'EMAIL_NOT_VERIFIED' ||
        error.message?.toLowerCase().includes('verify')
      ) {
        setIsUnverified(true)
        setUnverifiedEmail(values.email)
      } else {
        const errMsg = error.message ?? 'Login failed. Please try again.'
        setServerError(errMsg)
        toast.error(errMsg)
      }
      return
    }

    if (Capacitor.isNativePlatform()) {
      const searchParams = new URLSearchParams(window.location.search)
      const targetRedirect = searchParams.get('redirect') || '/'
      window.location.replace(targetRedirect)
    } else {
      const searchParams = new URLSearchParams(window.location.search)
      const targetRedirect = searchParams.get('redirect') || '/'
      window.location.href = targetRedirect
    }
  }

  const handleResend = async () => {
    if (!unverifiedEmail || resendCooldown > 0) return

    setResendLoading(true)
    setResendError(null)

    const { error } = await authClient.sendVerificationEmail({
      email: unverifiedEmail,
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

  if (isForgotPassword) {
    return (
      <div className="w-full relative">
        <div className="mb-8">
          <h1 className="text-[32px] font-bold text-text-dark tracking-tight">
            Forgot Password?
          </h1>
          <p className="mt-2 text-[15px] text-muted-foreground/85 font-medium">
            Enter your email address to receive a password reset link.
          </p>
        </div>

        {resetSuccess ? (
          <div className="bg-primary-soft/50 border border-primary/20 rounded-xl p-5 mb-6 text-center animate-in fade-in duration-300">
            <p className="text-sm font-bold text-primary">
              Reset link sent successfully!
            </p>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              We have sent a password reset link to{' '}
              <strong className="text-foreground">{resetEmail}</strong>. Please
              check your inbox.
            </p>
          </div>
        ) : (
          <form onSubmit={handleForgotPasswordSubmit}>
            <div className="space-y-5">
              <div>
                <label className="block text-[13px] font-bold text-foreground mb-1.5">
                  {t('Email Address')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail
                      className="h-[18px] w-[18px] text-muted-foreground/70"
                      strokeWidth={2}
                    />
                  </div>
                  <Input
                    type="email"
                    required
                    placeholder={t('Enter your email')}
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full h-12 pl-11 pr-4 rounded-xl border border-border bg-card text-[15px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-brand-light focus:ring-1 focus:ring-brand-light transition-shadow"
                  />
                </div>
              </div>

              {resetError && (
                <p className="text-xs text-destructive mt-1 font-medium text-center">
                  {resetError}
                </p>
              )}

              <Button
                type="submit"
                disabled={resetLoading}
                className="w-full h-12 bg-primary hover:bg-primary-hover text-primary-foreground font-bold rounded-xl shadow-md transition-all active:scale-[0.98] border-none flex items-center justify-center gap-2"
              >
                {resetLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setIsForgotPassword(false)
              setResetSuccess(false)
              setResetError(null)
              setResetEmail('')
            }}
            className="text-sm font-bold text-primary hover:underline hover:bg-transparent"
          >
            Back to Login
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
          src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=700&q=80&auto=format&fit=crop"
          alt="Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
        <div className="absolute left-5 bottom-4 text-white">
          <div className="font-display text-xl font-bold">{t('Rent anything.')}</div>
          <div className="font-display text-xl font-bold italic opacity-95">
            {t('Live in harmony.')}
          </div>
        </div>
      </div>

      {/* Top Bar with Language Selector & Switch Link */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
          <span className="opacity-80">{t('New here?')}</span>
          <Link
            to="/signup"
            className="text-primary font-black hover:underline transition-colors"
          >
            {t('Sign Up')}
          </Link>
        </div>
        <LanguageSelector />
      </div>

      <div className="mb-6 hidden lg:block">
        <h1 className="text-[32px] font-bold text-text-dark tracking-tight">
          {t('Welcome Back!')}
        </h1>
        <p className="mt-2 text-[15px] text-muted-foreground/85 font-medium">
          {t('Login to your account and continue renting.')}
        </p>
      </div>

      {/* Mockup Pill Tab Switcher */}
      <div className="flex bg-brand-beige dark:bg-muted/40 rounded-full p-1 mb-6">
        <Button
          variant="ghost"
          className="flex-1 py-2.5 h-auto text-xs font-black bg-primary text-primary-foreground rounded-full hover:bg-primary hover:text-primary-foreground transition-all active:scale-100 shadow-sm border-none"
        >
          {t('Sign in')}
        </Button>
        <Link
          to="/signup"
          className="flex-1 py-2.5 text-xs font-black text-muted-foreground text-center rounded-full hover:text-foreground transition-all flex items-center justify-center"
        >
          {t('Create account')}
        </Link>
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
            {/* Email Field */}
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

            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between mb-1">
                    <FormLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">
                      {t('Password')}
                    </FormLabel>
                    <Button
                      type="button"
                      variant="link"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-[10px] font-bold text-primary p-0 h-auto hover:underline"
                    >
                      {t('Forgot Password?')}
                    </Button>
                  </div>
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
                        placeholder={t('Enter your password')}
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

            {/* Remember Me */}
            <div className="flex items-center pt-1 pb-1">
              <Button
                type="button"
                variant="ghost"
                className="flex items-center gap-2 p-0 h-auto hover:bg-transparent active:scale-100"
                onClick={() => setRememberMe(!rememberMe)}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-[4px] flex items-center justify-center border transition-colors ${rememberMe ? 'bg-primary border-primary' : 'bg-card border-border/120'}`}
                >
                  {rememberMe && (
                    <Check
                      className="h-2.5 w-2.5 text-primary-foreground"
                      strokeWidth={3}
                    />
                  )}
                </div>
                <span className="text-[11px] font-bold text-foreground">
                  {t('Remember me')}
                </span>
              </Button>
            </div>

            {serverError && (
              <p className="text-center text-xs text-destructive font-medium">
                {serverError}
              </p>
            )}

            {isUnverified && (
              <div className="bg-warning/30 border border-warning-foreground/20 rounded-xl p-4 text-center sm:text-left animate-in fade-in duration-300">
                <div className="flex gap-2.5 items-start">
                  <div className="text-warning-foreground mt-0.5 shrink-0">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="text-[14px] font-bold text-warning-foreground font-sans">
                      Verification Required
                    </h4>
                    <p className="mt-1 text-[13px] text-warning-foreground/90 leading-relaxed font-medium">
                      Your email is not verified yet. Please check your inbox
                      for the verification link sent to{' '}
                      <strong className="text-foreground break-all">
                        {unverifiedEmail}
                      </strong>
                      .
                    </p>

                    {resendSuccess && (
                      <p className="mt-2 text-xs text-primary font-bold bg-primary/10 px-2 py-1 rounded inline-block animate-in fade-in duration-200">
                        Verification link resent successfully!
                      </p>
                    )}
                    {resendError && (
                      <p className="mt-2 text-xs text-destructive font-semibold bg-danger px-2 py-1 rounded inline-block">
                        {resendError}
                      </p>
                    )}

                    <Button
                      type="button"
                      variant="link"
                      disabled={resendLoading || resendCooldown > 0}
                      onClick={handleResend}
                      className="mt-3 text-[13px] font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1 p-0 h-auto disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {resendLoading ? (
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                          Resending...
                        </span>
                      ) : resendCooldown > 0 ? (
                        `Resend email in ${resendCooldown}s`
                      ) : (
                        'Resend verification email'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-full bg-primary hover:bg-primary-hover text-white font-black text-xs shadow-md border-none flex items-center justify-center gap-1.5 cursor-pointer mt-3 active:scale-[0.98] transition-all"
            >
              {isSubmitting ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{t('Sign in')}</span>
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
        By continuing, you agree to our{' '}
        <a href="#" className="font-bold bg-primary-light hover:underline">
          Terms & Conditions
        </a>{' '}
        and{' '}
        <a href="#" className="font-bold bg-primary-light hover:underline">
          Privacy Policy
        </a>
        .
      </p>
    </div>
  )
}
