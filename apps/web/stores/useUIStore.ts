import { create } from "zustand";

export interface UIState {
  isSidebarCollapsed: boolean;
  isMobileMenuOpen: boolean;
  activeModal: string | null;
  modalData: unknown;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleMobileMenu: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  openModal: <T = unknown>(modalId: string, data?: T) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarCollapsed: false,
  isMobileMenuOpen: false,
  activeModal: null,
  modalData: null,

  toggleSidebar: () =>
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),

  setSidebarCollapsed: (collapsed: boolean) =>
    set({ isSidebarCollapsed: collapsed }),

  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),

  setMobileMenuOpen: (open: boolean) =>
    set({ isMobileMenuOpen: open }),

  openModal: <T = unknown>(modalId: string, data?: T) =>
    set({ activeModal: modalId, modalData: data ?? null }),

  closeModal: () =>
    set({ activeModal: null, modalData: null }),
}));
