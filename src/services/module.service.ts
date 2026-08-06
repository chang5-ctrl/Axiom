import { supabase, unwrap, guard, unwrapOne } from './service-utils';
import type {
  ModuleRegistry,
  ModuleRegistryInsert,
  TenantModuleRegistry,
  TenantModuleRegistryUpdate,
  ModuleMetadata,
  ServiceResult,
} from '@/types/core';

/**
 * Module Service
 * 
 * Handles all module registry operations:
 * - Listing available modules
 * - Managing tenant module configuration
 * - Checking module enablement
 * 
 * This service is the single source of truth for module management.
 * All module state changes flow through here.
 */
export const moduleService = {
  /**
   * Get all available modules in the platform registry.
   * Non-admins only see active modules.
   */
  async getAvailableModules(): Promise<ModuleRegistry[]> {
    return (
      unwrap(await supabase.from('module_registry').select('*').eq('is_active', true).order('display_order', { ascending: true })) ??
      []
    );
  },

  /**
   * Get a specific module by key.
   */
  async getModule(key: string): Promise<ModuleRegistry | null> {
    return unwrapOne(
      await supabase.from('module_registry').select('*').eq('key', key).maybeSingle(),
    );
  },

  /**
   * Get all modules for a tenant, including enabled status.
   */
  async getTenantModules(tenantId: string): Promise<TenantModuleRegistry[]> {
    return (
      unwrap(
        await supabase
          .from('tenant_module_registry')
          .select('*')
          .eq('tenant_id', tenantId)
          .order('created_at', { ascending: true }),
      ) ?? []
    );
  },

  /**
   * Get enabled modules for a tenant.
   */
  async getTenantEnabledModules(
    tenantId: string,
  ): Promise<(TenantModuleRegistry & { module?: ModuleRegistry | null })[]> {
    const rows = unwrap(
      await supabase
        .from('tenant_module_registry')
        .select(
          `
          *,
          module_registry!inner(
            id,
            key,
            name,
            description,
            icon,
            category,
            version,
            is_system,
            metadata
          )
        `,
        )
        .eq('tenant_id', tenantId)
        .eq('is_enabled', true)
        .order('created_at', { ascending: true }),
    );

    return (rows ?? []) as (TenantModuleRegistry & { module?: ModuleRegistry | null })[];
  },

  /**
   * Check if a module is enabled for a tenant.
   */
  async isModuleEnabled(tenantId: string, moduleKey: string): Promise<boolean> {
    const result = unwrap(
      await supabase
        .from('tenant_module_registry')
        .select('is_enabled')
        .eq('tenant_id', tenantId)
        .eq('module_key', moduleKey)
        .maybeSingle(),
    );
    return result?.is_enabled ?? false;
  },

  /**
   * Enable a module for a tenant.
   */
  async enableModule(
    tenantId: string,
    moduleKey: string,
    userId: string,
  ): Promise<ServiceResult<TenantModuleRegistry>> {
    return guard(async () => {
      const existing = unwrap(
        await supabase
          .from('tenant_module_registry')
          .select('*')
          .eq('tenant_id', tenantId)
          .eq('module_key', moduleKey)
          .maybeSingle(),
      );

      if (existing) {
        return unwrapOne(
          await supabase
            .from('tenant_module_registry')
            .update({
              is_enabled: true,
              enabled_at: new Date().toISOString(),
              enabled_by: userId,
            } as TenantModuleRegistryUpdate)
            .eq('tenant_id', tenantId)
            .eq('module_key', moduleKey)
            .select()
            .single(),
        );
      }

      return unwrapOne(
        await supabase
          .from('tenant_module_registry')
          .insert({
            tenant_id: tenantId,
            module_key: moduleKey,
            is_enabled: true,
            enabled_at: new Date().toISOString(),
            enabled_by: userId,
          })
          .select()
          .single(),
      );
    }, 'Unable to enable module');
  },

  /**
   * Disable a module for a tenant.
   */
  async disableModule(
    tenantId: string,
    moduleKey: string,
  ): Promise<ServiceResult<TenantModuleRegistry>> {
    return guard(async () => {
      return unwrapOne(
        await supabase
          .from('tenant_module_registry')
          .update({ is_enabled: false } as TenantModuleRegistryUpdate)
          .eq('tenant_id', tenantId)
          .eq('module_key', moduleKey)
          .select()
          .single(),
      );
    }, 'Unable to disable module');
  },

  /**
   * Update module configuration for a tenant.
   */
  async updateModuleConfiguration(
    tenantId: string,
    moduleKey: string,
    configuration: Record<string, unknown>,
  ): Promise<ServiceResult<TenantModuleRegistry>> {
    return guard(async () => {
      return unwrapOne(
        await supabase
          .from('tenant_module_registry')
          .update({ configuration } as TenantModuleRegistryUpdate)
          .eq('tenant_id', tenantId)
          .eq('module_key', moduleKey)
          .select()
          .single(),
      );
    }, 'Unable to update module configuration');
  },

  /**
   * Create or update a module in the registry (admin only via RLS).
   */
  async upsertModule(data: ModuleRegistryInsert): Promise<ServiceResult<ModuleRegistry>> {
    return guard(async () => {
      const key = (data as Record<string, unknown>)['key'] as string;
      const existing = await moduleService.getModule(key);

      if (existing) {
        return unwrapOne(
          await supabase
            .from('module_registry')
            .update(data)
            .eq('key', key)
            .select()
            .single(),
        );
      }

      return unwrapOne(
        await supabase
          .from('module_registry')
          .insert(data as any)
          .select()
          .single(),
      );
    }, 'Unable to create or update module');
  },
};
