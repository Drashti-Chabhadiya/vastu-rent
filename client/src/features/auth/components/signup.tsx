import { AuthLayout } from '../components/auth-layout'
import { AuthLeftSection } from '../components/auth-left-section'
import { SignupForm } from '../components/signup-form'

export function SignUpFormPage() {
  return (
    <AuthLayout>
      <AuthLeftSection />

      <div className="flex flex-1 items-center justify-center p-8 lg:p-20">
        <div className="w-full max-w-[520px]">
          <SignupForm />
        </div>
      </div>
    </AuthLayout>
  )
}
