import { createFileRoute } from '@tanstack/react-router'
import { CouponsManagement } from '#/features/dashboard'

export const Route = createFileRoute('/_authenticated/account/coupons')({
  component: () => (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-black text-foreground mb-2">
        Available Coupons
      </h1>
      <p className="text-sm text-muted-foreground/85 mb-8">
        View active marketplace promo codes and copy them to apply discounts
        during checkout.
      </p>
      <CouponsManagement />
    </div>
  ),
})
