import { JournalPage } from '#/features/journal'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/journal/')({
  component: JournalPage,
})
