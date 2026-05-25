import { createFileRoute } from '@tanstack/react-router'
import { MessagesManagement } from '#/features/dashboard'

export const Route = createFileRoute('/_authenticated/account/messages')({
  component: () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <MessagesManagement />
    </div>
  ),
})
