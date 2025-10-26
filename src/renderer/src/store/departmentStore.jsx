import { create } from "zustand"

export const useDepartmentStore = create((set) => ({
  departments: [],
  fetchDepartments: async () => {
    // later connect to SQLite or Supabase
    const data = [] 
    set({ departments: data })
  },
  addDepartment: (dept) => {
    set((state) => ({
      departments: [...state.departments, { ...dept, id: Date.now() }]
    }))
  },
  updateDepartment: (id, updates) => {
    set((state) => ({
      departments: state.departments.map(d => d.id === id ? { ...d, ...updates } : d)
    }))
  },
  deleteDepartment: (id) => {
    set((state) => ({
      departments: state.departments.filter(d => d.id !== id)
    }))
  }
}))
