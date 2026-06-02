import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { authClient } from '#/lib/auth/auth-client'
import { AuthLayout } from '#/features/auth/components/auth-layout'
import { AuthLeftSection } from '#/features/auth/components/auth-left-section'
import { CheckCircle2, AlertTriangle, Loader2, Lock, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

type SearchParams = {
  token?: string
}

export const Route = createFileRoute('/reset-password')({
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    return {
      token: typeof search.token === 'string' ? search.token : undefined,
    }
  },
  component: ResetPasswordPage,
})

function ResetPasswordPage() {
  const { token } = Route.useSearch()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'form' | 'success' | 'error'>('form')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) {
      setErrorMessage('The reset password link is invalid or has expired.')
      setStatus('error')
      return
    }

    if (newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.')
      return
    }

    setIsLoading(true)
    setErrorMessage(null)

    try {
      const { error } = await authClient.resetPassword({
        newPassword: newPassword,
        token: token,
      })

      if (error) {
        setErrorMessage(error.message ?? 'Failed to reset password. Please try again.')
        setStatus('error')
      } else {
        setStatus('success')
        toast.success('Password reset successfully!')
      }
    } catch (err: any) {
      setErrorMessage('An unexpected error occurred. Please try again.')
      setStatus('error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <AuthLeftSection />

      <div className="flex flex-1 items-center justify-center p-8 lg:p-20">
        <div className="w-full max-w-[520px]">
          {status === 'form' && (
            <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8 text-center sm:text-left">
                <h1 className="text-[32px] font-bold text-text-dark tracking-tight font-display">
                  Reset Password
                </h1>
                <p className="mt-2 text-[15px] text-muted-foreground/85 font-medium">
                  Create a new secure password for your VastuRent account.
                </p>
              </div>

              {!token ? (
                <div className="bg-warning/30 border border-warning-foreground/20 rounded-2xl p-6 sm:p-8 text-center shadow-soft">
                  <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mb-5 mx-auto">
                    <AlertTriangle className="h-8 w-8 text-warning-foreground" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    Missing Reset Token
                  </h3>
                  <p className="text-[14px] text-muted-foreground max-w-[340px] leading-relaxed mb-6 mx-auto">
                    You cannot reset your password without a valid link token. Please request a new password reset email.
                  </p>
                  <Link
                    to="/login"
                    className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-[15px] font-bold transition-colors flex items-center justify-center cursor-pointer"
                  >
                    Back to Login
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {errorMessage && (
                    <div className="bg-destructive-soft border border-destructive/20 rounded-xl p-4 text-center">
                      <p className="text-sm text-destructive font-semibold">
                        {errorMessage}
                      </p>
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* New Password */}
                    <div className="space-y-2">
                      <label className="text-[14px] font-bold text-foreground/90">
                        New Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Lock className="h-[18px] w-[18px] text-muted-foreground/70" strokeWidth={2} />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder="At least 8 characters"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full h-12 pl-11 pr-11 rounded-xl border border-border bg-card text-[15px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-brand-light focus:ring-1 focus:ring-brand-light transition-shadow"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground/70 hover:text-foreground transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="h-[18px] w-[18px]" strokeWidth={2} />
                          ) : (
                            <Eye className="h-[18px] w-[18px]" strokeWidth={2} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <label className="text-[14px] font-bold text-foreground/90">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Lock className="h-[18px] w-[18px] text-muted-foreground/70" strokeWidth={2} />
                        </div>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          placeholder="Re-enter your new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full h-12 pl-11 pr-11 rounded-xl border border-border bg-card text-[15px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-brand-light focus:ring-1 focus:ring-brand-light transition-shadow"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground/70 hover:text-foreground transition-colors"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-[18px] w-[18px]" strokeWidth={2} />
                          ) : (
                            <Eye className="h-[18px] w-[18px]" strokeWidth={2} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 rounded-xl bg-primary text-primary-foreground text-[15px] font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving Password...
                      </span>
                    ) : (
                      'Update Password'
                    )}
                  </Button>

                  <div className="text-center pt-2">
                    <Link
                      to="/login"
                      className="text-sm font-semibold text-primary hover:underline"
                    >
                      Back to Login
                    </Link>
                  </div>
                </form>
              )}
            </div>
          )}

          {status === 'success' && (
            <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8 text-center sm:text-left">
                <h1 className="text-[32px] font-bold text-text-dark tracking-tight font-display">
                  Password Updated!
                </h1>
                <p className="mt-2 text-[15px] text-muted-foreground/85 font-medium">
                  Your new password has been set successfully.
                </p>
              </div>

              <div className="bg-primary-soft/50 border border-primary/20 rounded-2xl p-6 sm:p-8 mb-6 flex flex-col items-center text-center shadow-soft">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-5 animate-bounce">
                  <CheckCircle2 className="h-9 w-9 text-primary" strokeWidth={2} />
                </div>

                <h3 className="text-lg font-bold text-foreground mb-2">
                  Password Changed
                </h3>
                <p className="text-[14px] text-muted-foreground max-w-[340px] leading-relaxed mb-6">
                  Your password has been securely updated. You can now use your new password to sign into your account.
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
                  Reset Failed
                </h1>
                <p className="mt-2 text-[15px] text-muted-foreground/85 font-medium">
                  Something went wrong during the update.
                </p>
              </div>

              <div className="bg-warning/30 border border-warning-foreground/20 rounded-2xl p-6 sm:p-8 mb-6 flex flex-col items-center text-center shadow-soft">
                <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mb-5">
                  <AlertTriangle className="h-8 w-8 text-warning-foreground" strokeWidth={1.5} />
                </div>

                <h3 className="text-lg font-bold text-foreground mb-2">
                  Update Unsuccessful
                </h3>
                <p className="text-[14px] text-muted-foreground max-w-[340px] leading-relaxed mb-6">
                  {errorMessage ?? 'The link is invalid or expired. Please request a new password reset email.'}
                </p>

                <Button
                  onClick={() => setStatus('form')}
                  className="w-full h-12 rounded-xl bg-primary text-primary-foreground text-[15px] font-bold hover:bg-primary/90 transition-colors cursor-pointer"
                >
                  Try Again
                </Button>
              </div>

              <div className="flex flex-col gap-3">
                <Link
                  to="/login"
                  className="w-full h-11 rounded-xl border border-border bg-card text-foreground/80 text-[14px] font-bold hover:bg-muted-light transition-colors flex items-center justify-center cursor-pointer"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthLayout>
  )
}
