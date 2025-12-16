export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  VENDOR = 'VENDOR'
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  bio?: string;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  category: string;
  vendor: string;
  currentStock: number;
  reorderLevel: number;
  unitPrice: number;
  lastRestocked?: string;
}

export interface Transaction {
  id: number;
  productId: number;
  productName: string;
  type: 'IN' | 'OUT';
  quantity: number;
  timestamp: string;
  handledBy: string;
}

export interface ForecastData {
  sku: string;
  productName: string;
  currentStock: number;
  predictedDemand: number; // For next 7 days
  confidence: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface RestockSuggestion {
  sku: string;
  productName: string;
  currentStock: number;
  suggestedQuantity: number;
  vendor: string;
  reason: string;
}

export type OrderStatus = 'PENDING' | 'APPROVED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface PurchaseOrder {
  id: string;
  sku: string;
  productName: string;
  quantity: number;
  vendor: string;
  status: OrderStatus;
  createdAt: string;
  totalCost: number;
}