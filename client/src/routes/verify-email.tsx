import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { authClient } from '#/lib/auth/auth-client'
import { AuthLayout } from '#/features/auth/components/auth-layout'
import { AuthLeftSection } from '#/features/auth/components/auth-left-section'
import { CheckCircle2, AlertTriangle, Loader2, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

type SearchParams = {
  token?: string
}

export const Route = createFileRoute('/verify-email')({
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    return {
      token: typeof search.token === 'string' ? search.token : undefined,
    }
  },
  component: VerifyEmailPage,
})

function VerifyEmailPage() {
  const { token } = Route.useSearch()

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading',
  )
  const [emailInput, setEmailInput] = useState('')
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

  useEffect(() => {
    if (!token) {
      setStatus('error')
      return
    }

    const verify = async () => {
      try {
        const { error } = await authClient.verifyEmail({
          query: {
            token: token,
          },
        })

        if (error) {
          console.error('Verification error:', error)
          setStatus('error')
        } else {
          setStatus('success')
        }
      } catch (err) {
        console.error('Unexpected verification error:', err)
        setStatus('error')
      }
    }

    verify()
  }, [token])

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailInput || resendCooldown > 0) return

    setResendLoading(true)
    setResendError(null)

    const { error } = await authClient.sendVerificationEmail({
      email: emailInput,
      callbackURL: '/',
    })

    setResendLoading(false)

    if (error) {
      setResendError(error.message ?? 'Failed to send verification link.')
    } else {
      setResendSuccess(true)
      setResendCooldown(60)
      setTimeout(() => setResendSuccess(false), 5000)
    }
  }

  return (
    <AuthLayout>
      <AuthLeftSection />

      <div className="flex flex-1 items-center justify-center p-8 lg:p-20">
        <div className="w-full max-w-[520px]">
          {status === 'loading' && (
            <div className="text-center py-12 animate-in fade-in duration-300">
              <div className="flex justify-center mb-6">
                <Loader2
                  className="h-12 w-12 text-primary animate-spin"
                  strokeWidth={1.5}
                />
              </div>
              <h1 className="text-[28px] font-bold text-foreground mb-2 font-display">
                Verifying Email
              </h1>
              <p className="text-muted-foreground/85 text-[15px] font-medium max-w-[320px] mx-auto">
                Please wait a moment while we verify your email address and
                activate your account.
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8 text-center sm:text-left">
                <h1 className="text-[32px] font-bold text-text-dark tracking-tight font-display">
                  Email Verified!
                </h1>
                <p className="mt-2 text-[15px] text-muted-foreground/85 font-medium">
                  Your account is active and ready to go.
                </p>
              </div>

              <div className="bg-primary-soft/50 border border-primary/20 rounded-2xl p-6 sm:p-8 mb-6 flex flex-col items-center text-center shadow-soft">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-5 animate-bounce">
                  <CheckCircle2
                    className="h-9 w-9 text-primary"
                    strokeWidth={2}
                  />
                </div>

                <h3 className="text-lg font-bold text-foreground mb-2">
                  Verification Successful
                </h3>
                <p className="text-[14px] text-muted-foreground max-w-[340px] leading-relaxed mb-6">
                  Thank you! Your email address has been successfully verified.
                  You can now log in and start renting.
                </p>

                <Link
                  to="/login"
                  className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-[15px] font-bold transition-colors flex items-center justify-center cursor-pointer"
                >
                  Go to Login
                </Link>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8 text-center sm:text-left">
                <h1 className="text-[32px] font-bold text-text-dark tracking-tight font-display">
                  Verification Failed
                </h1>
                <p className="mt-2 text-[15px] text-muted-foreground/85 font-medium">
                  The link is invalid or has expired.
                </p>
              </div>

              <div className="bg-warning/30 border border-warning-foreground/20 rounded-2xl p-6 sm:p-8 mb-6 flex flex-col items-center text-center shadow-soft">
                <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mb-5">
                  <AlertTriangle
                    className="h-8 w-8 text-warning-foreground"
                    strokeWidth={1.5}
                  />
                </div>

                <h3 className="text-lg font-bold text-foreground mb-2">
                  Invalid or Expired Link
                </h3>
                <p className="text-[14px] text-muted-foreground max-w-[340px] leading-relaxed mb-6">
                  This email verification link is invalid, has expired, or has
                  already been used. Enter your email below to request a new
                  link.
                </p>

                <form
                  onSubmit={handleResend}
                  className="w-full text-left space-y-4"
                >
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail
                        className="h-[18px] w-[18px] text-muted-foreground/70"
                        strokeWidth={2}
                      />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="Enter your email address"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full h-12 pl-11 pr-4 rounded-xl border border-border bg-card text-[15px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-brand-light focus:ring-1 focus:ring-brand-light transition-shadow"
                    />
                  </div>

                  {resendSuccess && (
                    <p className="text-sm text-primary font-bold bg-primary/10 px-3 py-1.5 rounded-lg text-center animate-in fade-in duration-200">
                      Verification link resent successfully!
                    </p>
                  )}

                  {resendError && (
                    <p className="text-sm text-destructive font-semibold bg-danger px-3 py-1.5 rounded-lg text-center">
                      {resendError}
                    </p>
                  )}

                  <Button
                    type="submit"
                    disabled={resendLoading || resendCooldown > 0}
                    className="w-full h-12 rounded-xl bg-primary text-primary-foreground text-[15px] font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resendLoading ? (
                      <span className="flex items-center gap-1.5">
                        <span className="w-4 h-4 border-2 border-card border-t-transparent rounded-full animate-spin"></span>
                        Sending...
                      </span>
                    ) : resendCooldown > 0 ? (
                      `Resend email in ${resendCooldown}s`
                    ) : (
                      'Request New Link'
                    )}
                  </Button>
                </form>
              </div>

              <div className="flex flex-col gap-3">
                <Link
                  to="/signup"
                  className="w-full h-11 rounded-xl border border-border bg-card text-foreground/80 text-[14px] font-bold hover:bg-muted-light transition-colors flex items-center justify-center cursor-pointer"
                >
                  Back to Sign Up
                </Link>

                <Link
                  to="/login"
                  className="w-full h-11 rounded-xl bg-muted/50 hover:bg-muted text-foreground/90 text-[14px] font-bold transition-colors flex items-center justify-center cursor-pointer"
                >
                  Go to Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthLayout>
  )
}
