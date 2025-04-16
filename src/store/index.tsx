import { create } from 'zustand';

export const applyThemeToDOM = (theme) => {
    document.documentElement.classList.toggle("dark", theme === "dark");
};

const initialTheme = localStorage.getItem("theme") ?? "light";
applyThemeToDOM(initialTheme);

const useStore = create((set)=>({
    theme: initialTheme,
    user: JSON.parse(localStorage.getItem("user")) ?? null,
    isSidebarOpen: JSON.parse(localStorage.getItem("isSidebarOpen")) ?? true, 

    setTheme: (theme) => {
        localStorage.setItem("theme", theme);
        applyThemeToDOM(theme);
        set({ theme });
    },
    setCredentails: (user) => set({user}),
    signOut: () => set({ user: null }),
    toggleSidebar: () => set((state) => {
        const newState = !state.isSidebarOpen;
        localStorage.setItem("isSidebarOpen", JSON.stringify(newState)); // Persist the new state to localStorage
        return { isSidebarOpen: newState };
    }),
    setSidebarState: (value) => {
        localStorage.setItem("isSidebarOpen", JSON.stringify(value)); // Persist the sidebar state directly
        set({ isSidebarOpen: value });
    }
}))
export default useStore
