import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Link, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { authClient } from '#/lib/auth/auth-client'
import { authApi } from '../api/auth'
import { useState, useEffect } from 'react'
import { Mail, Lock, EyeOff, Check, Eye, ArrowRight } from 'lucide-react'
import { loginSchema } from '#/schema'
import type { LoginSchema } from '#/schema'
import { toast } from 'sonner'
import { SocialAuth } from './social-auth'
import { Capacitor } from '@capacitor/core'
import { useTranslation } from '#/context/TranslationContext'
import { LanguageSelector } from '@/components/ui/language-selector'
import {
  checkBiometry,
  getBiometryType,
  setBiometricCredentials,
  getBiometricCredentials,
  authenticateBiometric,
} from '#/lib/biometrics'
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
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  // Biometrics state
  const [isBiometryAvailable, setIsBiometryAvailable] = useState(false)
  const [biometryType, setBiometryType] = useState<string | null>(null)
  const [hasStoredCredentials, setHasStoredCredentials] = useState(false)
  const [biometricLoading, setBiometricLoading] = useState(false)

  // Verification-related states
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

  // Initialize Biometrics
  useEffect(() => {
    const initBiometrics = async () => {
      if (Capacitor.isNativePlatform()) {
        const available = await checkBiometry()
        setIsBiometryAvailable(available)
        if (available) {
          const type = await getBiometryType()
          setBiometryType(type)

          // Check if we have credentials stored
          const creds = await getBiometricCredentials()
          if (creds && creds.username && creds.password) {
            setHasStoredCredentials(true)
          }
        }
      }
    }
    initBiometrics()
  }, [])

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
        // Send a new OTP and navigate to the verify-email page step-by-step flow
        try {
          await authApi.sendOtp(values.email)
        } catch (err) {
          console.error('Failed to send OTP:', err)
        }
        navigate({ to: '/verify-email', search: { email: values.email } })
      } else {
        const errMsg = error.message ?? 'Login failed. Please try again.'
        setServerError(errMsg)
        toast.error(errMsg)
      }
      return
    }

    if (rememberMe && isBiometryAvailable) {
      await setBiometricCredentials(values.email, values.password)
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

  const handleBiometricLogin = async () => {
    setServerError(null)
    setBiometricLoading(true)

    const isAuthenticated = await authenticateBiometric(
      `Log in with ${biometryType || 'Biometrics'}`,
    )
    if (isAuthenticated) {
      const creds = await getBiometricCredentials()
      if (creds && creds.username && creds.password) {
        const { error } = await authClient.signIn.email({
          email: creds.username,
          password: creds.password,
        })

        if (error) {
          setServerError(error.message ?? 'Biometric login failed.')
          setBiometricLoading(false)
        } else {
          // Success
          const searchParams = new URLSearchParams(window.location.search)
          const targetRedirect = searchParams.get('redirect') || '/'
          window.location.replace(targetRedirect)
        }
      } else {
        setServerError('No stored credentials found.')
        setBiometricLoading(false)
      }
    } else {
      setBiometricLoading(false)
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
                className="group w-full h-12 bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-xl shadow-md transition-all active:scale-[0.98] border-none flex items-center justify-center gap-1.5"
              >
                {resetLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-foreground/20 transition-transform group-hover:translate-x-1">
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </>
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
                  {isBiometryAvailable && biometryType
                    ? t(`Remember me with ${biometryType}`)
                    : t('Remember me')}
                </span>
              </Button>
            </div>

            {serverError && (
              <p className="text-center text-xs text-destructive font-medium">
                {serverError}
              </p>
            )}

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="group w-full h-11 rounded-full bg-primary hover:bg-primary/95 text-white font-black text-xs shadow-md border-none flex items-center justify-center gap-1.5 cursor-pointer mt-3 active:scale-[0.98] transition-all"
            >
              {isSubmitting ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{t('Sign in')}</span>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-foreground/20 transition-transform group-hover:translate-x-1">
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </>
              )}
            </Button>

            {/* Biometric Login Button */}
            {isBiometryAvailable && hasStoredCredentials && (
              <Button
                type="button"
                variant="outline"
                disabled={biometricLoading}
                onClick={handleBiometricLogin}
                className="w-full h-11 rounded-full text-xs font-black shadow-sm border border-border/80 flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98] transition-all"
              >
                {biometricLoading ? (
                  <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      className="opacity-70"
                    >
                      {/* Fingerprint icon simple representation */}
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                      <path d="M12 6c-3.31 0-6 2.69-6 6 0 1.66.67 3.16 1.76 4.24l1.41-1.41C8.45 14.07 8 13.09 8 12c0-2.21 1.79-4 4-4s4 1.79 4 4c0 1.09-.45 2.07-1.17 2.83l1.41 1.41C17.33 15.16 18 13.66 18 12c0-3.31-2.69-6-6-6z" />
                    </svg>
                    <span>
                      {t(`Login with ${biometryType || 'Biometrics'}`)}
                    </span>
                  </>
                )}
              </Button>
            )}
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
