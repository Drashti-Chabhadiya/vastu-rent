import { createFileRoute } from '@tanstack/react-router'
import { OrdersManagement } from '#/features/dashboard'

export const Route = createFileRoute('/_authenticated/account/orders')({
  component: () => (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-black text-foreground mb-2">Rental Orders</h1>
      <p className="text-sm text-muted-foreground/85 mb-8">
        Manage rental requests submitted by renters for your published product
        listings.
      </p>
      <OrdersManagement />
    </div>
  ),
})
