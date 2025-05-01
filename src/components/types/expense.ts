export interface ExpenseItem {
    id: string;
    category: string;
    category_id: string;
    expense: number;
    date: string;
    note?: string;
    breakdownItems?: BreakdownItem[];
  }
  
export interface BreakdownItem {
    id: string;
    name: string;
    price: number;
    quantity: number | string;
  }