import {
  Home, Car, Utensils, Gamepad2, Zap, CreditCard, Heart, ShoppingBag,
  GraduationCap, Package, Briefcase, Laptop, TrendingUp, Store, Coins,
  type LucideIcon
} from 'lucide-react';

export interface CategoryConfig {
  icon: LucideIcon;
  color: string;       // Main color for badges, icons
  bgClass: string;     // Tailwind background class
  borderColor: string; // Border color
  chartColor: string;  // Chart fill color
}

export const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  Housing: {
    icon: Home,
    color: '#8b5cf6',
    bgClass: 'bg-purple-100 dark:bg-purple-900/30',
    borderColor: '#ddd6fe',
    chartColor: '#8b5cf6',
  },
  Transport: {
    icon: Car,
    color: '#3b82f6',
    bgClass: 'bg-blue-100 dark:bg-blue-900/30',
    borderColor: '#bfdbfe',
    chartColor: '#3b82f6',
  },
  Food: {
    icon: Utensils,
    color: '#f97316',
    bgClass: 'bg-orange-100 dark:bg-orange-900/30',
    borderColor: '#fed7aa',
    chartColor: '#f97316',
  },
  Entertainment: {
    icon: Gamepad2,
    color: '#ec4899',
    bgClass: 'bg-pink-100 dark:bg-pink-900/30',
    borderColor: '#fbcfe8',
    chartColor: '#ec4899',
  },
  Utilities: {
    icon: Zap,
    color: '#eab308',
    bgClass: 'bg-yellow-100 dark:bg-yellow-900/30',
    borderColor: '#fde68a',
    chartColor: '#eab308',
  },
  Subscription: {
    icon: CreditCard,
    color: '#06b6d4',
    bgClass: 'bg-cyan-100 dark:bg-cyan-900/30',
    borderColor: '#a5f3fc',
    chartColor: '#06b6d4',
  },
  Healthcare: {
    icon: Heart,
    color: '#ef4444',
    bgClass: 'bg-red-100 dark:bg-red-900/30',
    borderColor: '#fecaca',
    chartColor: '#ef4444',
  },
  Shopping: {
    icon: ShoppingBag,
    color: '#a855f7',
    bgClass: 'bg-fuchsia-100 dark:bg-fuchsia-900/30',
    borderColor: '#e9d5ff',
    chartColor: '#a855f7',
  },
  Education: {
    icon: GraduationCap,
    color: '#14b8a6',
    bgClass: 'bg-teal-100 dark:bg-teal-900/30',
    borderColor: '#99f6e4',
    chartColor: '#14b8a6',
  },
  Charity: {
    icon: Heart,
    color: '#10b981',
    bgClass: 'bg-emerald-100 dark:bg-emerald-900/30',
    borderColor: '#a7f3d0',
    chartColor: '#10b981',
  },
  Other: {
    icon: Package,
    color: '#6b7280',
    bgClass: 'bg-gray-100 dark:bg-gray-800/50',
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
  bgClass: string;
}

export const INCOME_TYPE_CONFIG: Record<string, IncomeTypeConfig> = {
  Salary: { icon: Briefcase, color: '#059669', bgClass: 'bg-emerald-100 dark:bg-emerald-900/30' },
  Freelance: { icon: Laptop, color: '#8b5cf6', bgClass: 'bg-purple-100 dark:bg-purple-900/30' },
  Dividends: { icon: TrendingUp, color: '#3b82f6', bgClass: 'bg-blue-100 dark:bg-blue-900/30' },
  Rental: { icon: Home, color: '#f97316', bgClass: 'bg-orange-100 dark:bg-orange-900/30' },
  'Side Business': { icon: Store, color: '#ec4899', bgClass: 'bg-pink-100 dark:bg-pink-900/30' },
  Other: { icon: Coins, color: '#6b7280', bgClass: 'bg-gray-100 dark:bg-gray-800/50' },
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

export const GOAL_COLORS = [
  { name: 'Emerald', hex: '#059669', light: '#ecfdf5', darkLight: '#022c22', border: '#a7f3d0' },
  { name: 'Blue', hex: '#2563eb', light: '#eff6ff', darkLight: '#172554', border: '#bfdbfe' },
  { name: 'Purple', hex: '#9333ea', light: '#faf5ff', darkLight: '#3b0764', border: '#d8b4fe' },
  { name: 'Orange', hex: '#f97316', light: '#fff7ed', darkLight: '#431407', border: '#fed7aa' },
  { name: 'Rose', hex: '#f43f5e', light: '#fff1f2', darkLight: '#4c0519', border: '#fecdd3' },
  { name: 'Teal', hex: '#14b8a6', light: '#f0fdfa', darkLight: '#042f2e', border: '#99f6e4' },
  { name: 'Amber', hex: '#f59e0b', light: '#fffbeb', darkLight: '#451a03', border: '#fde68a' },
  { name: 'Indigo', hex: '#4f46e5', light: '#eef2ff', darkLight: '#1e1b4b', border: '#c7d2fe' },
];

export function getGoalColor(id: number, isDark: boolean = false) {
  const stored = localStorage.getItem(`goal_color_${id}`);
  let found = GOAL_COLORS[id % GOAL_COLORS.length];
  if (stored) {
    const c = GOAL_COLORS.find(c => c.name === stored);
    if (c) found = c;
  }
  return {
    ...found,
    bg: isDark ? found.darkLight : found.light
  };
}
