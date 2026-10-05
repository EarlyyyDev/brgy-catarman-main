import { Hero } from "@/components/public/sections/hero"
import { Stats } from "@/components/public/sections/stats"
import { AboutPlatform } from "@/components/public/sections/about-platform"
import { MissionVisionGoals } from "@/components/public/sections/mission-vision"
import { Services } from "@/components/public/sections/services"
import { AnnouncementsSection } from "@/components/public/sections/announcements"
import { Officials } from "@/components/public/sections/officials"
import { About } from "@/components/public/sections/about"
import { EmergencyContactsSection } from "@/components/public/sections/emergency-contacts"
import { FAQ } from "@/components/public/sections/faq"

export default function HomePage() {
  return (
    <>
      <Hero />
      <Stats />
      <AboutPlatform />
      <MissionVisionGoals />
      <Services />
      <AnnouncementsSection />
      <Officials />
      <About />
      <EmergencyContactsSection />
      <FAQ />
    </>
  )
}
