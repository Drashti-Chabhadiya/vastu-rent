import { createFileRoute } from '@tanstack/react-router'
import { SettingsPage } from '#/features/profile'

export const Route = createFileRoute('/_authenticated/account/profile')({
  component: () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SettingsPage />
    </div>
  ),
})
