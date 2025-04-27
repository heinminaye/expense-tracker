import { create } from 'zustand';
import { setAuthToken } from '../libs/api';

export const applyThemeToDOM = (theme) => {
  document.documentElement.classList.toggle("dark", theme === "dark");
};

const initialTheme = localStorage.getItem("theme") ?? "light";
applyThemeToDOM(initialTheme);

const useStore = create((set) => ({
  theme: initialTheme,
  user: localStorage.getItem("user") ?? null,
  token: localStorage.getItem("token") ?? null,
  isSidebarOpen: JSON.parse(localStorage.getItem("isSidebarOpen")) ?? true,

  setTheme: (theme) => {
    localStorage.setItem("theme", theme);
    applyThemeToDOM(theme);
    set({ theme });
  },

  setCredentials: (user, token) => {
    localStorage.setItem("user", user);
    localStorage.setItem("token", token);
    setAuthToken(token);
    set({ user, token });
  },

  // Added clearToken function
  clearToken: () => {
    localStorage.removeItem("token");
    setAuthToken(null);
    set({ token: null });
  },

  // Updated signOut to use clearToken
  signOut: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setAuthToken(null);
    set({ user: null, token:null });
  },

  toggleSidebar: () =>
    set((state) => {
      const newState = !state.isSidebarOpen;
      localStorage.setItem("isSidebarOpen", JSON.stringify(newState));
      return { isSidebarOpen: newState };
    }),

  setSidebarState: (value) => {
    localStorage.setItem("isSidebarOpen", JSON.stringify(value));
    set({ isSidebarOpen: value });
  },
}));

export default useStore;