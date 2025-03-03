// lib/store.ts
import { create } from "zustand";
import { Product } from "./types";

interface FilterState {
  name: string;
  minPrice: string;
  maxPrice: string;
  discount: "all" | "yes" | "no";
  saleStatus: "all" | "active" | "ended" | "upcoming";
}

interface AppState {
  isAuthenticated: boolean;
  userEmail: string | null;
  products: Product[];
  filters: FilterState;
  isSidebarOpen: boolean;
  setAuth: (isAuthenticated: boolean, userEmail?: string) => void;
  logout: () => void;
  setProducts: (products: Product[]) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void; // Added for explicit control
}

export const useAppStore = create<AppState>((set) => ({
  isAuthenticated: false,
  userEmail: null,
  products: [],
  filters: {
    name: "",
    minPrice: "",
    maxPrice: "",
    discount: "all",
    saleStatus: "all",
  },
  isSidebarOpen: typeof window !== "undefined" && window.innerWidth >= 768, // md: breakpoint (768px)
  setAuth: (isAuthenticated, userEmail) =>
    set({ isAuthenticated, userEmail: userEmail || null }),
  logout: () => set({ isAuthenticated: false, userEmail: null, products: [] }),
  setProducts: (products) => set({ products }),
  updateProduct: (id, updates) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),
  deleteProduct: (id) =>
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    })),
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
  resetFilters: () =>
    set({
      filters: {
        name: "",
        minPrice: "",
        maxPrice: "",
        discount: "all",
        saleStatus: "all",
      },
    }),
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
}));
