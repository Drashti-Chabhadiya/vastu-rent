import { AuthLayout } from '../components/auth-layout'
import { AuthLeftSection } from '../components/auth-left-section'
import { LoginForm } from '../components/login-form'

export function LoginFormPage() {
  return (
    <AuthLayout>
      <AuthLeftSection />

      <div className="flex flex-1 items-center justify-center p-8 lg:p-20">
        <div className="w-full max-w-[520px]">
          <LoginForm />
        </div>
      </div>
    </AuthLayout>
  )
}
