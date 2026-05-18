import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/_owner')({
  beforeLoad: ({ context }) => {
    // Read session from parent context
    const session = (context as any).session
    const role = session?.user?.role
    
    if (role !== 'owner' && role !== 'admin' && role !== 'superAdmin') {
      throw redirect({
        to: '/',
      })
    }
  },
  component: () => <Outlet />,
})
