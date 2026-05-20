import { createFileRoute, useParams } from '@tanstack/react-router'
import { StoryDetail } from '#/features/journal'

export const Route = createFileRoute('/journal/$id')({
  component: StoryDetailPage
})

function StoryDetailPage() {
  const { id } = useParams({ from: '/journal/$id' })
  console.log('story id from params ', id)
  return <StoryDetail id={id} />
}
