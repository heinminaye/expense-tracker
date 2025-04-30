import axios from "axios";
import useStore from "../store";
import { toast } from "sonner";

const API_URL = "http://localhost:3030/api";

const api = axios.create({
  baseURL: API_URL,
});

// Helper function to clear auth data
const clearAuthData = () => {
  delete api.defaults.headers.common["Authorization"];
  useStore.getState().clearToken();
  localStorage.clear();
  window.location.reload();
};

export function setAuthToken(token: string) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}

// Response interceptor to handle 301 and other auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 301 || error.response.status === 401)) {
      clearAuthData();
    }
    return Promise.reject(error);
  }
);

// Date formatting helpers
export const formatDisplayDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatForSubmit = (dateString: string) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
};

export const signIn = async (credentials: { username: string; password: string }) => {
  try {
    const response = await api.post('/auth/signin', credentials);
    return response.data;
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
};

const catgoryPrefix = "categories";
const expensePrefix = "expenses";

// Category API functions

export const fetchCategories = async (body: any) => {
  try {
    const { token } = useStore.getState();
    if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    const response = await api.post(catgoryPrefix, body);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 301) {
      clearAuthData();
      toast.error("Session expired. Please log in again.");
    }
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const addCategory = async (body: any) => {
  try {
    const { token } = useStore.getState();
    if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    const response = await api.post(`${catgoryPrefix}/add`, body);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 301) {
      clearAuthData();
      toast.error("Session expired. Please log in again.");
    }
    console.error('Error adding category:', error);
    throw error;
  }
};
export const updateCategory = async (body: any) => {
  try {
    const { token } = useStore.getState();
    if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    const response = await api.post(`${catgoryPrefix}/add`, body);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 301) {
      clearAuthData();
      toast.error("Session expired. Please log in again.");
    }
    console.error('Error adding category:', error);
    throw error;
  }
};
export const deleteCategory = async (body: any) => {
  try {
    const { token } = useStore.getState();
    if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    const response = await api.post(`${catgoryPrefix}/add`, body);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 301) {
      clearAuthData();
      toast.error("Session expired. Please log in again.");
    }
    console.error('Error adding category:', error);
    throw error;
  }
};

// Expense API functions

export const fetchExpenses = async (body: any) => {
  try {
    const { token } = useStore.getState();
    if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    const response = await api.post(expensePrefix, body);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 301) {
      clearAuthData();
      toast.error("Session expired. Please log in again.");
    }
    console.error('Error fetching expenses:', error);
    throw error;
  }
};

export const addExpenseWithBreakdown = async (expenseData: any) => {
  try {
    const { token } = useStore.getState();
    if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    const response = await api.post(`${expensePrefix}/add`, expenseData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 301) {
      clearAuthData();
    }
    console.error("Error adding expense:", error);
    throw error;
  }
};

export const editExpenseWithBreakdown = async (expenseData: any) => {
  try {
    const { token } = useStore.getState();
    if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    const response = await api.post(`${expensePrefix}/edit`, expenseData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 301) {
      clearAuthData();
      toast.error("Session expired. Please log in again.");
    }
    console.error("Error editing expense:", error);
    throw error;
  }
};

export const softDeleteExpenses = async (expenseData: any) => {
  try {
    const { token } = useStore.getState();
    if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    const response = await api.post(`${expensePrefix}/delete`, expenseData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 301) {
      clearAuthData();
      toast.error("Session expired. Please log in again.");
    }
    console.error('Error soft deleting expenses:', error);
    throw error;
  }
};

export const deleteBreakdownItem = async (data: { user_id: string,breakdown_item_id: string }) => {
  try {
    const { token } = useStore.getState();
    if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    const response = await api.post(`${expensePrefix}/breakdown/delete`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 301) {
      clearAuthData();
      toast.error("Session expired. Please log in again.");
    }
    console.error('Error deleting breakdown item:', error);
    throw error;
  }
};

// Export the axios instance and all functions
export default {
  api,
  signIn,
  setAuthToken,
  formatDisplayDate,
  formatForSubmit,
  fetchExpenses,
  addExpenseWithBreakdown,
  editExpenseWithBreakdown,
  softDeleteExpenses,
  deleteBreakdownItem
};