import { createFileRoute } from '@tanstack/react-router'
import {
  Categories,
  Editorial,
  HeroSection,
  HowItWorks,
  Journal,
  HostCTA,
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
      <HostCTA />
    </main>
  )
}
