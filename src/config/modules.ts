/**
 * Module Registry Configuration
 * 
 * Defines all available modules in the system.
 * This is the single source of truth for module metadata.
 * 
 * When adding a new module:
 * 1. Add an entry here with metadata
 * 2. Add a database migration to register it
 * 3. Create the module implementation in its own directory
 * 4. No changes needed anywhere else
 */

import type { ModuleMetadata } from '@/types/module';

export const MODULE_REGISTRY: Record<string, ModuleMetadata> = {
  // Core
  dashboard: {
    key: 'dashboard',
    name: 'Dashboard',
    description: 'Workspace overview and KPIs',
    icon: 'LayoutDashboard',
    category: 'core',
    version: '1.0.0',
    isSystem: true,
    isActive: true,
    displayOrder: 0,
  },
  settings: {
    key: 'settings',
    name: 'Settings',
    description: 'Workspace configuration',
    icon: 'Settings',
    category: 'core',
    version: '1.0.0',
    isSystem: true,
    isActive: true,
    displayOrder: 1,
  },

  // Operations
  crm: {
    key: 'crm',
    name: 'CRM',
    description: 'Leads, contacts, and pipeline management',
    icon: 'Users',
    category: 'operations',
    version: '1.0.0',
    isActive: true,
    displayOrder: 10,
  },
  inventory: {
    key: 'inventory',
    name: 'Inventory',
    description: 'Stock, warehouses, and movements',
    icon: 'Package',
    category: 'operations',
    version: '1.0.0',
    isActive: true,
    displayOrder: 11,
  },
  sales: {
    key: 'sales',
    name: 'Sales',
    description: 'Orders, invoices, and fulfillment',
    icon: 'ShoppingCart',
    category: 'operations',
    version: '1.0.0',
    isActive: true,
    displayOrder: 12,
  },
  projects: {
    key: 'projects',
    name: 'Projects',
    description: 'Tasks, milestones, and time tracking',
    icon: 'KanbanSquare',
    category: 'operations',
    version: '1.0.0',
    isActive: true,
    displayOrder: 13,
  },

  // Finance
  accounting: {
    key: 'accounting',
    name: 'Accounting',
    description: 'Ledger, invoicing, and financial reporting',
    icon: 'Calculator',
    category: 'finance',
    version: '1.0.0',
    isActive: true,
    displayOrder: 20,
  },
  payroll: {
    key: 'payroll',
    name: 'Payroll',
    description: 'Salaries, benefits, and payslips',
    icon: 'Wallet',
    category: 'finance',
    version: '1.0.0',
    isActive: true,
    displayOrder: 21,
  },

  // People
  hr: {
    key: 'hr',
    name: 'HR',
    description: 'Employees, hiring, and performance',
    icon: 'Users2',
    category: 'people',
    version: '1.0.0',
    isActive: true,
    displayOrder: 30,
  },
  staff: {
    key: 'staff',
    name: 'Staff',
    description: 'Team members and permissions',
    icon: 'UserCheck',
    category: 'people',
    version: '1.0.0',
    isActive: true,
    displayOrder: 31,
  },

  // Knowledge
  documents: {
    key: 'documents',
    name: 'Documents',
    description: 'File storage and collaboration',
    icon: 'FileText',
    category: 'knowledge',
    version: '1.0.0',
    isActive: true,
    displayOrder: 40,
  },
  calendar: {
    key: 'calendar',
    name: 'Calendar',
    description: 'Events, meetings, and scheduling',
    icon: 'Calendar',
    category: 'knowledge',
    version: '1.0.0',
    isActive: true,
    displayOrder: 41,
  },
  notifications: {
    key: 'notifications',
    name: 'Notifications',
    description: 'Alerts and system notifications',
    icon: 'Bell',
    category: 'knowledge',
    version: '1.0.0',
    isActive: true,
    displayOrder: 42,
  },

  // Analytics
  reports: {
    key: 'reports',
    name: 'Reports',
    description: 'Custom reports and dashboards',
    icon: 'BarChart3',
    category: 'analytics',
    version: '1.0.0',
    isActive: true,
    displayOrder: 50,
  },
  analytics: {
    key: 'analytics',
    name: 'Analytics',
    description: 'Business intelligence and metrics',
    icon: 'TrendingUp',
    category: 'analytics',
    version: '1.0.0',
    isActive: true,
    displayOrder: 51,
  },

  // Sales
  customers: {
    key: 'customers',
    name: 'Customers',
    description: 'Customer database and profiles',
    icon: 'Users',
    category: 'sales',
    version: '1.0.0',
    isActive: true,
    displayOrder: 60,
  },

  // Vertical Solutions
  'vehicle-management': {
    key: 'vehicle-management',
    name: 'Vehicle Management',
    description: 'Vehicle inventory and dealership operations',
    icon: 'Car',
    category: 'vertical',
    version: '1.0.0',
    isActive: true,
    displayOrder: 70,
  },
  'restaurant-pos': {
    key: 'restaurant-pos',
    name: 'Restaurant POS',
    description: 'Menu, tables, orders, and kitchen management',
    icon: 'UtensilsCrossed',
    category: 'vertical',
    version: '1.0.0',
    isActive: true,
    displayOrder: 71,
  },
  education: {
    key: 'education',
    name: 'Education',
    description: 'Students, classes, and grades',
    icon: 'GraduationCap',
    category: 'vertical',
    version: '1.0.0',
    isActive: true,
    displayOrder: 72,
  },
  healthcare: {
    key: 'healthcare',
    name: 'Healthcare',
    description: 'Patients, appointments, and medical records',
    icon: 'HeartPulse',
    category: 'vertical',
    version: '1.0.0',
    isActive: true,
    displayOrder: 73,
  },
  construction: {
    key: 'construction',
    name: 'Construction',
    description: 'Projects, materials, and crew management',
    icon: 'HardHat',
    category: 'vertical',
    version: '1.0.0',
    isActive: true,
    displayOrder: 74,
  },
  legal: {
    key: 'legal',
    name: 'Legal Practice',
    description: 'Cases, clients, and billable hours',
    icon: 'Scale',
    category: 'vertical',
    version: '1.0.0',
    isActive: true,
    displayOrder: 75,
  },
};

/**
 * Module categories for UI organization.
 */
export const MODULE_CATEGORIES = {
  core: { label: 'Core', description: 'Essential platform features' },
  operations: { label: 'Operations', description: 'Business operations and fulfillment' },
  finance: { label: 'Finance & Admin', description: 'Accounting and financial management' },
  people: { label: 'People', description: 'Team and HR management' },
  knowledge: { label: 'Knowledge', description: 'Documents and collaboration' },
  analytics: { label: 'Analytics', description: 'Reporting and business intelligence' },
  sales: { label: 'Sales', description: 'Customer and sales management' },
  vertical: { label: 'Vertical Solutions', description: 'Industry-specific modules' },
} as const;
