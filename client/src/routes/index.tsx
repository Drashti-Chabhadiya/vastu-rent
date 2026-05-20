import { createFileRoute } from '@tanstack/react-router'
import {
  Categories,
  Editorial,
  HeroSection,
  HowItWorks,
  Journal,
  OwnerCTA,
} from '#/features/home'

export const Route = createFileRoute('/')({
  component: HomePage
})

function HomePage() {
  return (
    <main className="bg-background">
      <HeroSection />
      <Categories />
      <Editorial />
      <HowItWorks />
      <Journal />
      <OwnerCTA />
    </main>
  )
}
