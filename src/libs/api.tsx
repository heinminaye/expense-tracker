import axios from "axios";

import { IncomeItem } from "../components/types/income";

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

let incomes: IncomeItem[] = [
  {
    id: 1,
    payer: "ABC Company",
    amount: 5000,
    date: "2025-04-01",
    note: "Monthly salary",
  },
  {
    id: 2,
    payer: "XYZ Client",
    amount: 1200,
    date: "2025-04-02",
    note: "Project payment",
  },
];

export const fetchIncomes = async (): Promise<IncomeItem[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...incomes]);
    }, 500);
  });
};

export const addIncome = async (
  income: Omit<IncomeItem, "id">
): Promise<IncomeItem> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newIncome = {
        ...income,
        id: Math.max(0, ...incomes.map((i) => i.id)) + 1,
      };
      incomes.push(newIncome);
      resolve(newIncome);
    }, 500);
  });
};

export const updateIncome = async (income: IncomeItem): Promise<IncomeItem> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      incomes = incomes.map((item) => (item.id === income.id ? income : item));
      resolve(income);
    }, 500);
  });
};

export const deleteIncome = async (id: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      incomes = incomes.filter((item) => item.id !== id);
      resolve();
    }, 500);
  });
};


export default api;
