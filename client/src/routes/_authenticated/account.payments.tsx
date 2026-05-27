import { createFileRoute } from '@tanstack/react-router'
import { PaymentsManagement } from '#/features/dashboard'

export const Route = createFileRoute('/_authenticated/account/payments')({
  component: () => (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-black text-foreground mb-2">
        Earnings & Payout Invoices
      </h1>
      <p className="text-sm text-muted-foreground/85 mb-8">
        View transaction logs, received rental funds, platform adjustments, and
        payouts.
      </p>
      <PaymentsManagement />
    </div>
  ),
})
