// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: any;
      userId?: string;
    }
  }
}

// API Response interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: {
    items: T[];
    pagination: PaginationInfo;
  };
}

// Authentication interfaces
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
  };
}

// Expense interfaces
export interface ExpenseRequest {
  title: string;
  amount: number;
  date: Date;
  category: string;
  notes?: string;
}

export interface ExpenseUpdateRequest {
  title?: string;
  amount?: number;
  date?: Date;
  category?: string;
  notes?: string;
}

export interface ExpenseQuery {
  page?: number;
  limit?: number;
  category?: string;
  startDate?: Date;
  endDate?: Date;
}

// Report interfaces
export interface CategoryReportItem {
  category: string;
  totalAmount: number;
  count: number;
  avgAmount: number;
  percentage: number;
}

export interface CategoryReportResponse {
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  summary: {
    grandTotal: number;
    totalCount: number;
    avgExpense: number;
    categoriesCount: number;
  };
  categoryBreakdown: CategoryReportItem[];
}

export interface MonthlyReportItem {
  month: number;
  monthName: string;
  totalAmount: number;
  count: number;
  avgAmount: number;
}

export interface MonthlyReportResponse {
  year: number;
  summary: {
    yearlyTotal: number;
    yearlyCount: number;
    monthlyAverage: number;
    activeMonths: number;
  };
  monthlyBreakdown: MonthlyReportItem[];
}

// Database connection options
export interface DatabaseConfig {
  uri: string;
  options?: {
    maxPoolSize?: number;
    serverSelectionTimeoutMS?: number;
    socketTimeoutMS?: number;
  };
}

// Environment variables
export interface EnvConfig {
  PORT: number;
  NODE_ENV: string;
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  AWS_REGION?: string;
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
}
