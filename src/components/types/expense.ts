export interface ExpenseItem {
    id: number;
    category: string;
    expense: number;
    date: string;
    note?: string;
    breakdownItems?: BreakdownItem[];
  }
  
  export interface BreakdownItem {
    name: string;
    price: number;
    quantity: number | string;
  }