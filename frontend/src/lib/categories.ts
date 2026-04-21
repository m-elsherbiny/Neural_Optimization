import {
  Home, Car, Utensils, Gamepad2, Zap, CreditCard, Heart, ShoppingBag,
  GraduationCap, Package, Briefcase, Laptop, TrendingUp, Store, Coins,
  type LucideIcon
} from 'lucide-react';

export interface CategoryConfig {
  icon: LucideIcon;
  color: string;       // Main color for badges, icons
  bgColor: string;     // Light background
  borderColor: string; // Border color
  chartColor: string;  // Chart fill color
}

export const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  Housing: {
    icon: Home,
    color: '#8b5cf6',
    bgColor: '#f5f3ff',
    borderColor: '#ddd6fe',
    chartColor: '#8b5cf6',
  },
  Transport: {
    icon: Car,
    color: '#3b82f6',
    bgColor: '#eff6ff',
    borderColor: '#bfdbfe',
    chartColor: '#3b82f6',
  },
  Food: {
    icon: Utensils,
    color: '#f97316',
    bgColor: '#fff7ed',
    borderColor: '#fed7aa',
    chartColor: '#f97316',
  },
  Entertainment: {
    icon: Gamepad2,
    color: '#ec4899',
    bgColor: '#fdf2f8',
    borderColor: '#fbcfe8',
    chartColor: '#ec4899',
  },
  Utilities: {
    icon: Zap,
    color: '#eab308',
    bgColor: '#fefce8',
    borderColor: '#fde68a',
    chartColor: '#eab308',
  },
  Subscription: {
    icon: CreditCard,
    color: '#06b6d4',
    bgColor: '#ecfeff',
    borderColor: '#a5f3fc',
    chartColor: '#06b6d4',
  },
  Healthcare: {
    icon: Heart,
    color: '#ef4444',
    bgColor: '#fef2f2',
    borderColor: '#fecaca',
    chartColor: '#ef4444',
  },
  Shopping: {
    icon: ShoppingBag,
    color: '#a855f7',
    bgColor: '#faf5ff',
    borderColor: '#e9d5ff',
    chartColor: '#a855f7',
  },
  Education: {
    icon: GraduationCap,
    color: '#14b8a6',
    bgColor: '#f0fdfa',
    borderColor: '#99f6e4',
    chartColor: '#14b8a6',
  },
  Other: {
    icon: Package,
    color: '#6b7280',
    bgColor: '#f9fafb',
    borderColor: '#e5e7eb',
    chartColor: '#6b7280',
  },
};

export const ALL_CATEGORIES = Object.keys(CATEGORY_CONFIG);

export function getCategoryConfig(category: string): CategoryConfig {
  return CATEGORY_CONFIG[category] || CATEGORY_CONFIG['Other'];
}

// Income source icon mapping
export interface IncomeTypeConfig {
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

export const INCOME_TYPE_CONFIG: Record<string, IncomeTypeConfig> = {
  Salary: { icon: Briefcase, color: '#059669', bgColor: '#ecfdf5' },
  Freelance: { icon: Laptop, color: '#8b5cf6', bgColor: '#f5f3ff' },
  Dividends: { icon: TrendingUp, color: '#3b82f6', bgColor: '#eff6ff' },
  Rental: { icon: Home, color: '#f97316', bgColor: '#fff7ed' },
  'Side Business': { icon: Store, color: '#ec4899', bgColor: '#fdf2f8' },
  Other: { icon: Coins, color: '#6b7280', bgColor: '#f9fafb' },
};

export function getIncomeTypeConfig(type: string): IncomeTypeConfig {
  return INCOME_TYPE_CONFIG[type] || INCOME_TYPE_CONFIG['Other'];
}

// Goal icon options for user selection
export const GOAL_ICONS = [
  { id: 'target', label: 'Target' },
  { id: 'home', label: 'Home' },
  { id: 'car', label: 'Car' },
  { id: 'plane', label: 'Vacation' },
  { id: 'graduation-cap', label: 'Education' },
  { id: 'piggy-bank', label: 'Savings' },
  { id: 'heart', label: 'Wedding' },
  { id: 'smartphone', label: 'Phone' },
  { id: 'laptop', label: 'Tech' },
  { id: 'dumbbell', label: 'Fitness' },
  { id: 'baby', label: 'Baby' },
  { id: 'briefcase', label: 'Business' },
];
