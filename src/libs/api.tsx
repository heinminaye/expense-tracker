import axios from "axios";

import { IncomeItem } from "../components/types/income";
import useStore from "../store";

const API_URL = "http://localhost:3030/api";

const api = axios.create({
  baseURL: API_URL,
});

export function setAuthToken(token: string) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
  delete api.defaults.headers.common["Authorization"];
}


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
    const month = String(date.getMonth() + 1).padStart(2, "0"); // months are 0-indexed
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
};

const expenseprefix= "expenses/";

export const fetchExpenses = async (body: any) => {
  try {
    const { token } = useStore.getState();
    if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    const response = await api.post(`${expenseprefix}`, body);
    return response.data;
  } catch (error) {
    console.error('Error fetching expenses:', error);
    throw error;
  }
};

export const addExpenseWithBreakdown = async (expenseData: any) => {
  try {
    const { token } = useStore.getState();
    if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    const response = await api.post(`${expenseprefix}/add`, expenseData );
    return response.data;
  } catch (error) {
    console.error("Error adding expense:", error);
    throw error;
  }
};

export const softDeleteExpenses = async (expenseData: any) => {
  try {
    const { token } = useStore.getState();
    if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    const response = await api.post(`${expenseprefix}/delete`, expenseData);
    return response.data;
  } catch (error) {
    console.error('Error soft deleting expenses:', error);
    throw error;
  }
};

export default api;
