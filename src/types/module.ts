import type { Row, Insert, Update, Enums } from '@/types/core';

/**
 * Module Registry Types
 * 
 * These types are derived from the generated database types.
 * Schema changes surface as compile errors instead of runtime surprises.
 */

export type ModuleRegistry = Row<'module_registry'>;
export type ModuleRegistryInsert = Insert<'module_registry'>;
export type ModuleRegistryUpdate = Update<'module_registry'>;

export type TenantModuleRegistry = Row<'tenant_module_registry'>;
export type TenantModuleRegistryInsert = Insert<'tenant_module_registry'>;
export type TenantModuleRegistryUpdate = Update<'tenant_module_registry'>;

/**
 * Module Metadata
 * 
 * Every module exposes this metadata for the UI to render it consistently.
 * Modules should only define metadata, never business logic at this layer.
 */
export interface ModuleMetadata {
  key: string;
  name: string;
  description?: string;
  icon?: string;
  category?: string;
  version?: string;
  isSystem?: boolean;
  isActive?: boolean;
  displayOrder?: number;
  permissions?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Module Status
 * 
 * Used in metadata to indicate module readiness
 */
export type ModuleStatus = 'production' | 'beta' | 'alpha' | 'coming_soon' | 'deprecated';

/**
 * Module Categories
 * 
 * Organize modules by business domain for better UX.
 * New categories should be added as new vertical solutions are created.
 */
export type ModuleCategory =
  | 'core'
  | 'operations'
  | 'finance'
  | 'people'
  | 'knowledge'
  | 'analytics'
  | 'sales'
  | 'vertical';

/**
 * Tenant Module Configuration
 * 
 * Represents a module's configuration for a specific tenant.
 */
export interface TenantModuleConfig {
  isEnabled: boolean;
  enabledAt?: Date;
  enabledBy?: string;
  configuration: Record<string, unknown>;
}
