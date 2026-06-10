import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/_admin/admin/dashboard/')(
  {
    beforeLoad: () => {
      throw redirect({
        to: '/admin/dashboard/$tab',
        params: { tab: 'overview' },
      })
    },
  },
)
