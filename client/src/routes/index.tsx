import { createFileRoute } from '@tanstack/react-router'
import {
  Categories,
  Editorial,
  HeroSection,
  HowItWorks,
  Journal,
  OwnerCTA,
  // PopularItems,
  RecentProducts,
} from '#/features/home'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <main className="bg-background">
      <HeroSection />
      <Categories />
      {/* <PopularItems /> */}
      <RecentProducts />
      <Editorial />
      <HowItWorks />
      <Journal />
      <OwnerCTA />
    </main>
  )
}
