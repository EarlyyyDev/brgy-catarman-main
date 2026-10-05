export type BlotterTemplateStatus = "Active" | "Inactive"

export interface BlotterTemplate {
  id: string
  name: string
  status: BlotterTemplateStatus
  showBarangayLogo: boolean
  showMunicipalLogo: boolean
  showBarangayDrySeal: boolean
  logoSize: number
  bodyHtml: string
  createdAt: string
  updatedAt: string
}

export interface BlotterTemplateFormValues {
  name: string
  status: BlotterTemplateStatus
  showBarangayLogo: boolean
  showMunicipalLogo: boolean
  showBarangayDrySeal: boolean
  logoSize: number
  bodyHtml: string
}
