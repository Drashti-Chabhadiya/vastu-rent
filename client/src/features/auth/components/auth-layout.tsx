import type { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-auth-bg p-4 lg:p-6 safe-area-top">
      <div className="mx-auto flex min-h-[calc(100vh-32px)] max-w-[1600px] overflow-hidden rounded-[36px] border border-auth-border bg-card shadow-[0_20px_80px_rgba(0,0,0,0.06)]">
        {children}
      </div>
    </div>
  )
}
