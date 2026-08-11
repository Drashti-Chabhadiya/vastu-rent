import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { AuthLayout } from '#/features/auth/components/auth-layout'
import { AuthLeftSection } from '#/features/auth/components/auth-left-section'
import { CheckCircle2, AlertTriangle } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '#/components/ui/input-otp'
import { REGEXP_ONLY_DIGITS } from 'input-otp'
import fpPromise from '@fingerprintjs/fingerprintjs'
import { authApi } from '#/features/auth/api/auth'
import { useTranslation } from '#/context/TranslationContext'

type SearchParams = {
  email?: string
}

export const Route = createFileRoute('/verify-email')({
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    return {
      email: typeof search.email === 'string' ? search.email : undefined,
    }
  },
  component: VerifyEmailPage,
})

function VerifyEmailPage() {
  const { email: initialEmail } = Route.useSearch()
  const navigate = useNavigate()

  const [email, setEmail] = useState(initialEmail || '')
  const [name, setName] = useState('')
  const [otp, setOtp] = useState('')
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isFreeTrialEligible, setIsFreeTrialEligible] = useState(true)

  const { t } = useTranslation()

  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail)
      setStatus('idle')
      setOtp('')
      setErrorMessage(null)
    }
  }, [initialEmail])

  useEffect(() => {
    async function loadPending() {
      const data = await authApi.getPendingVerification()
      if (data?.pending) {
        if (!initialEmail && !email) setEmail(data.email)
        setName(data.name || '')
      }
    }
    loadPending()
  }, [initialEmail])

  // Countdown timer for resending verification email
  useEffect(() => {
    if (resendCooldown === 0) return
    const interval = setInterval(() => {
      setResendCooldown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [resendCooldown])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !otp || otp.length !== 6) return

    setStatus('loading')
    setErrorMessage(null)

    try {
      // Get device fingerprint
      const fp = await fpPromise.load()
      const result = await fp.get()
      const visitorId = result.visitorId

      const data = await authApi.verifyOtp(email, otp, visitorId)

      setIsFreeTrialEligible(data.freeTrialEligible !== false)
      setSuccessMessage(data.message || null)
      setStatus('success')
    } catch (err: any) {
      console.error('Verification error:', err)
      setStatus('error')
      setErrorMessage(err.message)
    }
  }

  const handleResend = async () => {
    if (!email || resendCooldown > 0) return

    setResendLoading(true)
    setErrorMessage(null)

    try {
      await authApi.sendOtp(email)

      setResendSuccess(true)
      setResendCooldown(60)
      setTimeout(() => setResendSuccess(false), 5000)
    } catch (err: any) {
      setErrorMessage(err.message)
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <AuthLayout>
      <AuthLeftSection />

      <div className="flex flex-1 items-center justify-center p-4 sm:p-8 lg:p-20">
        <div className="w-full max-w-[520px]">
          {status === 'success' ? (
            <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8 text-center sm:text-left">
                <h1 className="text-[32px] font-bold text-text-dark tracking-tight font-display">
                  {t('Email Verified!')}
                </h1>
                <p className="mt-2 text-[15px] text-muted-foreground/85 font-medium">
                  {isFreeTrialEligible
                    ? t('Your free trial is active and ready to go.')
                    : t('Account verified.')}
                </p>
              </div>

              <div className="bg-primary-soft/50 border border-primary/20 rounded-2xl p-4 sm:p-8 mb-6 flex flex-col items-center text-center shadow-soft">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-5 animate-bounce">
                  <CheckCircle2
                    className="h-9 w-9 text-primary"
                    strokeWidth={2}
                  />
                </div>

                <h3 className="text-lg font-bold text-foreground mb-2">
                  {t('Verification Successful')}
                </h3>

                {isFreeTrialEligible ? (
                  <p className="text-[14px] text-muted-foreground max-w-[340px] leading-relaxed mb-6">
                    {t(
                      'Thank you! Your email address has been successfully verified. You can now log in and start renting.',
                    )}
                  </p>
                ) : (
                  <div className="bg-warning/20 border border-warning/30 rounded-xl p-4 mb-6">
                    <p className="text-[14px] text-warning-foreground font-medium leading-relaxed">
                      {successMessage
                        ? t(successMessage)
                        : t(
                            'An account has already been created on this device. Please log in using your existing account.',
                          )}
                    </p>
                  </div>
                )}

                <Button
                  asChild
                  className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-[15px] font-bold transition-colors flex items-center justify-center cursor-pointer"
                >
                  <Link to="/login">{t('Go to Login')}</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8 text-center sm:text-left">
                <h1 className="text-[32px] font-bold text-text-dark tracking-tight font-display">
                  Verify Your Email
                </h1>
                <p className="mt-2 text-[15px] text-muted-foreground/85 font-medium">
                  Enter the 6-digit OTP sent to your email.
                </p>
              </div>

              <div className="w-full relative">
                <form
                  onSubmit={handleVerify}
                  className="w-full text-left space-y-4"
                >
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Email
                      </label>
                      <Input
                        type="email"
                        required
                        disabled
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full h-12 rounded-xl opacity-70 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        6-Digit OTP
                      </label>
                      <InputOTP
                        maxLength={6}
                        pattern={REGEXP_ONLY_DIGITS}
                        value={otp}
                        onChange={(val) => setOtp(val)}
                        autoFocus
                      >
                        <InputOTPGroup className="gap-1.5 sm:gap-3 justify-center w-full p-1">
                          <InputOTPSlot
                            index={0}
                            className="w-9 h-11 sm:w-14 sm:h-14 text-lg sm:text-xl font-bold rounded-md sm:rounded-xl first:rounded-md first:sm:rounded-xl last:rounded-md last:sm:rounded-xl shrink-0 border border-border bg-background"
                          />
                          <InputOTPSlot
                            index={1}
                            className="w-9 h-11 sm:w-14 sm:h-14 text-lg sm:text-xl font-bold rounded-md sm:rounded-xl first:rounded-md first:sm:rounded-xl last:rounded-md last:sm:rounded-xl shrink-0 border border-border bg-background"
                          />
                          <InputOTPSlot
                            index={2}
                            className="w-9 h-11 sm:w-14 sm:h-14 text-lg sm:text-xl font-bold rounded-md sm:rounded-xl first:rounded-md first:sm:rounded-xl last:rounded-md last:sm:rounded-xl shrink-0 border border-border bg-background"
                          />
                          <InputOTPSlot
                            index={3}
                            className="w-9 h-11 sm:w-14 sm:h-14 text-lg sm:text-xl font-bold rounded-md sm:rounded-xl first:rounded-md first:sm:rounded-xl last:rounded-md last:sm:rounded-xl shrink-0 border border-border bg-background"
                          />
                          <InputOTPSlot
                            index={4}
                            className="w-9 h-11 sm:w-14 sm:h-14 text-lg sm:text-xl font-bold rounded-md sm:rounded-xl first:rounded-md first:sm:rounded-xl last:rounded-md last:sm:rounded-xl shrink-0 border border-border bg-background"
                          />
                          <InputOTPSlot
                            index={5}
                            className="w-9 h-11 sm:w-14 sm:h-14 text-lg sm:text-xl font-bold rounded-md sm:rounded-xl first:rounded-md first:sm:rounded-xl last:rounded-md last:sm:rounded-xl shrink-0 border border-border bg-background"
                          />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/20 text-warning-foreground text-sm font-medium">
                      <AlertTriangle className="h-4 w-4" />
                      {errorMessage}
                    </div>
                  )}

                  {resendSuccess && (
                    <p className="text-sm text-primary font-bold bg-primary/10 px-3 py-1.5 rounded-lg text-center animate-in fade-in duration-200">
                      OTP resent successfully!
                    </p>
                  )}

                  <Button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full h-12 rounded-xl bg-primary text-primary-foreground text-[15px] font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {status === 'loading' ? (
                      <span className="flex items-center gap-1.5">
                        <span className="w-4 h-4 border-2 border-card border-t-transparent rounded-full animate-spin"></span>
                        Verifying...
                      </span>
                    ) : (
                      'Verify & Activate Trial'
                    )}
                  </Button>
                </form>

                <div className="mt-6 flex flex-col gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleResend}
                    disabled={resendLoading || resendCooldown > 0}
                    className="text-sm font-medium"
                  >
                    {resendLoading
                      ? 'Sending...'
                      : resendCooldown > 0
                        ? `Resend OTP in ${resendCooldown}s`
                        : 'Resend OTP'}
                  </Button>

                  <Button
                    type="button"
                    variant="link"
                    onClick={async () => {
                      await authApi.cancelPendingVerification()
                      localStorage.removeItem('vasturent_free_trial_used')
                      navigate({ to: '/signup', search: { email, name } })
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Cancel & change email address
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthLayout>
  )
}
