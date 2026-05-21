import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { Link, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { authClient } from '#/lib/auth/auth-client'
import { useState } from 'react'
import { Mail, Lock, EyeOff, Check, Eye } from 'lucide-react'
import { loginSchema } from '#/schema'
import type { LoginSchema } from '#/schema'

export function LoginForm() {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (values: LoginSchema) => {
    setServerError(null)

    const { data, error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
      callbackURL: '/',
    })

    if (error) {
      setServerError(error.message ?? 'Login failed. Please try again.')
      return
    }

    navigate({ to: '/' })
  }

  return (
    <div className="w-full relative">
      {/* Top Right "New here? Sign up" */}
      <div className="absolute -top-6 right-0 sm:-top-16 flex items-center gap-1.5 text-sm font-medium">
        <span className="text-gray-500">New here?</span>
        <Link
          to="/signup"
          className="text-primary font-bold hover:bg-primary-light transition-colors"
        >
          Sign up
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-[32px] font-bold text-text-dark tracking-tight">
          Welcome Back!
        </h1>
        <p className="mt-2 text-[15px] text-gray-500 font-medium">
          Login to your account and continue renting.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex w-full mb-8">
        <div className="flex-1 flex flex-col">
          <button className="py-3 text-[15px] font-bold bg-primary-light text-center w-full">
            Login
          </button>
          <div className="h-0.5 w-full bg-primary-light rounded-t-full"></div>
        </div>
        <div className="flex-1 flex flex-col">
          <Link
            to="/signup"
            className="py-3 text-[15px] font-semibold text-gray-400 text-center w-full hover:text-gray-600"
          >
            Sign Up
          </Link>
          <div className="h-[1px] w-full bg-gray-200"></div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-5">
          {/* Email Field */}
          <Field>
            <FieldLabel className="text-[13px] font-bold text-gray-900 mb-1.5">
              Email Address
            </FieldLabel>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail
                  className="h-[18px] w-[18px] text-gray-400"
                  strokeWidth={2}
                />
              </div>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full h-12 pl-11 pr-4 rounded-xl border border-gray-200 bg-white text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand-light focus:ring-1 focus:ring-brand-light transition-shadow"
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-500 mt-1 font-medium">
                {errors.email.message}
              </p>
            )}
          </Field>

          {/* Password Field */}
          <Field>
            <div className="flex items-center justify-between mb-1.5">
              <FieldLabel className="text-[13px] font-bold text-gray-900">
                Password
              </FieldLabel>
              <button
                type="button"
                className="text-[13px] font-bold bg-primary-light hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock
                  className="h-[18px] w-[18px] text-gray-400"
                  strokeWidth={2}
                />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                className="w-full h-12 pl-11 pr-12 rounded-xl border border-gray-200 bg-white text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand-light focus:ring-1 focus:ring-brand-light transition-shadow"
                {...register('password')}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <Eye
                    className="h-[18px] w-[18px] text-gray-400 hover:text-gray-600"
                    strokeWidth={2}
                  />
                ) : (
                  <EyeOff
                    className="h-[18px] w-[18px] text-gray-400 hover:text-gray-600"
                    strokeWidth={2}
                  />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 mt-1 font-medium">
                {errors.password.message}
              </p>
            )}
          </Field>

          {/* Remember Me */}
          <div className="flex items-center pt-1 pb-1">
            <button
              type="button"
              className="flex items-center gap-2.5"
              onClick={() => setRememberMe(!rememberMe)}
            >
              <div
                className={`w-4 h-4 rounded-[4px] flex items-center justify-center border transition-colors ${rememberMe ? 'bg-primary border-primary' : 'bg-white border-gray-300'}`}
              >
                {rememberMe && (
                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                )}
              </div>
              <span className="text-[13px] font-bold text-gray-900">
                Remember me
              </span>
            </button>
          </div>

          {serverError && (
            <p className="text-center text-sm text-red-500 font-medium">
              {serverError}
            </p>
          )}

          {/* Login Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-xl bg-primary text-white text-[15px] font-bold hover:bg-primary/90 transition-colors"
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </Button>
        </div>
      </form>

      {/* Or continue with */}
      <div className="mt-8 mb-6 flex items-center">
        <div className="h-[1px] flex-1 bg-gray-200"></div>
        <span className="px-4 text-[13px] font-medium text-gray-400">
          or continue with
        </span>
        <div className="h-[1px] flex-1 bg-gray-200"></div>
      </div>

      {/* Social Buttons */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <button className="flex items-center justify-center h-11 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors gap-2">
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span className="text-[13px] font-bold text-gray-700 hidden sm:inline">
            Google
          </span>
        </button>
        <button className="flex items-center justify-center h-11 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors gap-2">
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
              fill="#1877F2"
            />
          </svg>
          <span className="text-[13px] font-bold text-gray-700 hidden sm:inline">
            Facebook
          </span>
        </button>
        <button className="flex items-center justify-center h-11 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors gap-2">
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16.636 12.193c-.015-2.794 2.278-4.12 2.383-4.185-1.302-1.905-3.327-2.164-4.048-2.197-1.722-.174-3.364 1.013-4.248 1.013-.883 0-2.247-1.002-3.66-1.002-1.848.016-3.551 1.074-4.502 2.721-1.921 3.328-.49 8.243 1.385 10.955.918 1.328 2.012 2.805 3.433 2.753 1.365-.052 1.884-.881 3.535-.881 1.636 0 2.115.881 3.551.854 1.481-.027 2.423-1.332 3.328-2.656 1.045-1.528 1.474-3.007 1.494-3.085-.034-.016-2.64-1.013-2.651-4.29zm-2.42-6.529c.758-.918 1.267-2.194 1.127-3.464-1.082.044-2.417.721-3.197 1.632-.697.809-1.309 2.106-1.144 3.359 1.205.093 2.456-.607 3.214-1.527z"
              fill="#000000"
            />
          </svg>
          <span className="text-[13px] font-bold text-gray-700 hidden sm:inline">
            Apple
          </span>
        </button>
      </div>

      <p className="text-center text-[12px] text-gray-500 max-w-[340px] mx-auto leading-relaxed">
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
