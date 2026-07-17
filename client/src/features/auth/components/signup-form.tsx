import { signupSchema } from '#/schema'
import type { SignupSchema } from '#/schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel } from '@/components/ui/field'
import { Link } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect } from 'react'
import { Mail, Lock, EyeOff, User, Eye } from 'lucide-react'
import { authClient } from '#/lib/auth/auth-client'
import { SocialAuth } from './social-auth'

export function SignupForm() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupSchema>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
  })

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
      setServerError(error.message ?? 'Registration failed. Please try again.')
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
      {/* Top Right "Already have account? Sign in" */}
      <div className="absolute -top-6 right-0 sm:-top-16 flex items-center gap-1.5 text-sm font-medium">
        <span className="text-muted-foreground/85">Already have account?</span>
        <Link
          to="/login"
          className="text-primary font-bold hover:bg-primary-light transition-colors"
        >
          Sign in
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-[32px] font-bold text-text-dark tracking-tight">
          Create Account
        </h1>
        <p className="mt-2 text-[15px] text-muted-foreground/85 font-medium">
          Join thousands of users renting smarter everyday.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex w-full mb-8">
        <div className="flex-1 flex flex-col">
          <Link
            to="/login"
            className="py-3 text-[15px] font-semibold text-muted-foreground/70 text-center w-full hover:text-muted-foreground"
          >
            Login
          </Link>
          <div className="h-[1px] w-full bg-muted"></div>
        </div>
        <div className="flex-1 flex flex-col">
          <Button
            variant="ghost"
            className="py-3 h-auto text-[15px] font-bold bg-primary-light text-center w-full rounded-none hover:bg-primary-light hover:text-primary active:scale-100"
          >
            Sign Up
          </Button>
          <div className="h-0.5 w-full bg-primary-light rounded-t-full"></div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-5">
          {/* Full Name */}
          <Field>
            <FieldLabel className="text-[13px] font-bold text-foreground mb-1.5">
              Full Name
            </FieldLabel>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User
                  className="h-[18px] w-[18px] text-muted-foreground/70"
                  strokeWidth={2}
                />
              </div>
              <Input
                placeholder="Enter your name"
                className="w-full h-12 pl-11 pr-4 rounded-xl border border-border bg-card text-[15px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-brand-light focus:ring-1 focus:ring-brand-light transition-shadow"
                {...register('name')}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-destructive mt-1 font-medium">
                {errors.name.message}
              </p>
            )}
          </Field>

          {/* Email */}
          <Field>
            <FieldLabel className="text-[13px] font-bold text-foreground mb-1.5">
              Email Address
            </FieldLabel>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail
                  className="h-[18px] w-[18px] text-muted-foreground/70"
                  strokeWidth={2}
                />
              </div>
              <Input
                type="email"
                placeholder="Enter your email"
                className="w-full h-12 pl-11 pr-4 rounded-xl border border-border bg-card text-[15px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-brand-light focus:ring-1 focus:ring-brand-light transition-shadow"
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-destructive mt-1 font-medium">
                {errors.email.message}
              </p>
            )}
          </Field>

          {/* Password */}
          <Field>
            <FieldLabel className="text-[13px] font-bold text-foreground mb-1.5">
              Password
            </FieldLabel>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock
                  className="h-[18px] w-[18px] text-muted-foreground/70"
                  strokeWidth={2}
                />
              </div>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Create password"
                className="w-full h-12 pl-11 pr-12 rounded-xl border border-border bg-card text-[15px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-brand-light focus:ring-1 focus:ring-brand-light transition-shadow"
                {...register('password')}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute inset-y-0 right-0 h-full w-12 px-3 flex items-center justify-center hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <Eye
                    className="h-[18px] w-[18px] text-muted-foreground/70 hover:text-muted-foreground transition-colors"
                    strokeWidth={2}
                  />
                ) : (
                  <EyeOff
                    className="h-[18px] w-[18px] text-muted-foreground/70 hover:text-muted-foreground transition-colors"
                    strokeWidth={2}
                  />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive mt-1 font-medium">
                {errors.password.message}
              </p>
            )}
          </Field>

          {/* Confirm Password */}
          <Field>
            <FieldLabel className="text-[13px] font-bold text-foreground mb-1.5">
              Confirm Password
            </FieldLabel>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock
                  className="h-[18px] w-[18px] text-muted-foreground/70"
                  strokeWidth={2}
                />
              </div>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm password"
                className="w-full h-12 pl-11 pr-4 rounded-xl border border-border bg-card text-[15px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-brand-light focus:ring-1 focus:ring-brand-light transition-shadow"
                {...register('confirmPassword')}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-destructive mt-1 font-medium">
                {errors.confirmPassword.message}
              </p>
            )}
          </Field>

          {serverError && (
            <p className="text-center text-sm text-destructive font-medium">
              {serverError}
            </p>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full mt-2">
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </Button>
        </div>
      </form>

      {/* Or continue with */}
      <div className="mt-8 mb-6 flex items-center">
        <div className="h-[1px] flex-1 bg-muted"></div>
        <span className="px-4 text-[13px] font-medium text-muted-foreground/70">
          or continue with
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
