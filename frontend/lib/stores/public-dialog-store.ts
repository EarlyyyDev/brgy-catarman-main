import { create } from "zustand"

export type PublicDialogKey = "request-document" | "track-request" | "report-incident" | null

interface PublicDialogState {
  openDialog: PublicDialogKey
  trackRef: string
  setOpenDialog: (key: PublicDialogKey, trackRef?: string) => void
  closeDialog: () => void
}

/** Ephemeral UI state (not persisted) controlling which public-facing overlay
 * -- Request Document, Track Request, or Report Incident -- is currently open.
 * Lives in a store (rather than local component state) since the buttons that
 * open these overlays are scattered across the navbar, hero, footer, and
 * services section, which aren't siblings of a single shared ancestor. */
export const usePublicDialogStore = create<PublicDialogState>((set) => ({
  openDialog: null,
  trackRef: "",
  setOpenDialog: (key, trackRef = "") => set({ openDialog: key, trackRef }),
  closeDialog: () => set({ openDialog: null }),
}))
