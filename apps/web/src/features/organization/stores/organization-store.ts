import { create } from 'zustand'

interface OrgStore {
  selectedOrgId: string | null
  setSelectedOrg: (id: string | null) => void
}

export const useOrgStore = create<OrgStore>((set) => ({
  selectedOrgId: null,
  setSelectedOrg: (id) => set({ selectedOrgId: id }),
}))
