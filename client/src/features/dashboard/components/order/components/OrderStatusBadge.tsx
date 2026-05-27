import { CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react'
import { Badge } from '#/components/ui/badge'

interface OrderStatusBadgeProps {
  status: string
}

export const OrderStatusBadge = ({ status }: OrderStatusBadgeProps) => {
  switch (status) {
    case 'confirmed':
      return (
        <Badge className="bg-primary-soft text-primary border-none px-3 py-1 rounded-lg font-bold flex items-center gap-1.5">
          <CheckCircle2 size={12} /> Confirmed
        </Badge>
      )
    case 'active':
      return (
        <Badge className="bg-info text-info-foreground border-none px-3 py-1 rounded-lg font-bold flex items-center gap-1.5">
          <Clock size={12} /> Active
        </Badge>
      )
    case 'completed':
      return (
        <Badge className="bg-primary-soft text-primary border-none px-3 py-1 rounded-lg font-bold flex items-center gap-1.5">
          <CheckCircle2 size={12} /> Completed
        </Badge>
      )
    case 'rejected':
      return (
        <Badge className="bg-danger text-destructive border-none px-3 py-1 rounded-lg font-bold flex items-center gap-1.5">
          <XCircle size={12} /> Rejected
        </Badge>
      )
    case 'cancelled':
      return (
        <Badge className="bg-danger text-destructive border-none px-3 py-1 rounded-lg font-bold flex items-center gap-1.5">
          <XCircle size={12} /> Cancelled
        </Badge>
      )
    default:
      return (
        <Badge className="bg-yellow-50 text-yellow-600 border-none px-3 py-1 rounded-lg font-bold flex items-center gap-1.5">
          <AlertCircle size={12} /> Pending
        </Badge>
      )
  }
}
