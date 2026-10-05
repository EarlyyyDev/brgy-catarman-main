export interface Official {
  id: string
  name: string
  position: string
  committee?: string
  photoUrl: string
  order: number
  termStart: string
  termEnd: string
  contactNumber?: string
  email?: string
}

export interface EmergencyContact {
  id: string
  name: string
  category: "Police" | "Fire" | "Medical" | "Disaster Response" | "Barangay Hotline" | "Other"
  contactNumber: string
  address?: string
  availability: string
}
