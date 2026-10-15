import type { Metadata } from "next"
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

export const metadata: Metadata = {
  title: "eCatarman",
  description:
    "Learn about the history of Barangay Catarman, current barangay officials, emergency hotlines, public services, announcements, and community updates.",
  keywords: [
    "Barangay Catarman official website",
    "history of Catarman",
    "Barangay Catarman officials",
    "Barangay Catarman emergency hotlines",
    "Barangay Catarman services",
    "Barangay community announcements",
  ],
}

export default function HomePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "GovernmentOffice",
    name: "Barangay Catarman",
    alternateName: "Barangay Catarman Official Website",
    description:
      "Official community information portal for Barangay Catarman, including history, officials, public services, announcements, and emergency hotlines.",
    areaServed: "Barangay Catarman",
    governmentBenefitsInfo: "Public services, official announcements, emergency contacts, and barangay records.",
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
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
