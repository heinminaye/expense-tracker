export interface ExpenseItem {
    id: number;
    category: string;
    expense: number;
    date: string;
    detail: string;
    breakdownItems?: BreakdownItem[];
  }
  
  export interface BreakdownItem {
    name: string;
    price: number;
    quantity: number | string;
  }