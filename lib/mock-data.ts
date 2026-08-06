export type LoanStatus = "active" | "paid" | "overdue";
export type PaymentMethod = "transfer" | "cash_usd" | "cash_local";
export type LoanModality = "daily" | "weekly" | "biweekly" | "monthly";

export interface Client {
  id: string;
  name: string;
  document: string;
  phone: string;
  status: "good" | "warning" | "danger";
}

export interface Loan {
  id: string;
  clientId: string;
  amount: number;
  interestRate: number;
  modality: LoanModality;
  startDate: string;
  endDate: string;
  status: LoanStatus;
  totalPaid: number;
  remainingBalance: number;
  nextDueDate: string;
  daysOverdue: number;
}

export interface Payment {
  id: string;
  loanId: string;
  amount: number;
  method: PaymentMethod;
  date: string;
}

// Mock Data
export const MOCK_CLIENTS: Client[] = [
  { id: "c1", name: "María Gómez", document: "V-12345678", phone: "584141234567", status: "good" },
  { id: "c2", name: "Carlos Pérez", document: "V-87654321", phone: "584249876543", status: "danger" },
  { id: "c3", name: "Ana Silva", document: "V-11223344", phone: "584125556677", status: "warning" },
  { id: "c4", name: "Roberto Torres", document: "V-44556677", phone: "584168889900", status: "good" },
];

export const MOCK_LOANS: Loan[] = [
  {
    id: "l1",
    clientId: "c1",
    amount: 500,
    interestRate: 15,
    modality: "weekly",
    startDate: "2026-07-01",
    endDate: "2026-08-01",
    status: "active",
    totalPaid: 200,
    remainingBalance: 375,
    nextDueDate: "2026-07-28",
    daysOverdue: 0,
  },
  {
    id: "l2",
    clientId: "c2",
    amount: 1000,
    interestRate: 20,
    modality: "monthly",
    startDate: "2026-06-15",
    endDate: "2026-10-15",
    status: "overdue",
    totalPaid: 0,
    remainingBalance: 1200,
    nextDueDate: "2026-07-15",
    daysOverdue: 13,
  },
  {
    id: "l3",
    clientId: "c3",
    amount: 300,
    interestRate: 10,
    modality: "daily",
    startDate: "2026-07-20",
    endDate: "2026-08-20",
    status: "overdue",
    totalPaid: 60,
    remainingBalance: 270,
    nextDueDate: "2026-07-25",
    daysOverdue: 3,
  },
];

export const MOCK_PAYMENTS: Payment[] = [
  { id: "p1", loanId: "l1", amount: 50, method: "cash_usd", date: "2026-07-07" },
  { id: "p2", loanId: "l1", amount: 150, method: "transfer", date: "2026-07-14" },
];

export const MOCK_KPI = {
  initialBalance: 5200.5,
  dailyExpected: 450.0,
  dailyCollected: 210.0,
  totalCapitalStreet: 15500.0,
  totalProfits: 3100.0,
};
