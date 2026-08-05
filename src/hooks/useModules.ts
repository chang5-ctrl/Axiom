import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { moduleService } from '@/services/module.service';
import type { TenantModuleRegistry, ModuleRegistry } from '@/types/module';

interface UseModulesReturn {
  modules: ModuleRegistry[];
  tenantModules: TenantModuleRegistry[];
  enabledModuleKeys: Set<string>;
  isLoading: boolean;
  error: string | null;
  isModuleEnabled: (key: string) => boolean;
  refreshModules: () => Promise<void>;
}

/**
 * Hook to access module registry and tenant module configuration.
 * 
 * Manages loading state and provides convenient access methods.
 * Use this in any component that needs module information.
 */
export function useModules(): UseModulesReturn {
  const { workspace } = useAuth();
  const [modules, setModules] = useState<ModuleRegistry[]>([]);
  const [tenantModules, setTenantModules] = useState<TenantModuleRegistry[]>([]);
  const [enabledModuleKeys, setEnabledModuleKeys] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadModules = async () => {
    if (!workspace?.tenant.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const [available, tenant] = await Promise.all([
        moduleService.getAvailableModules(),
        moduleService.getTenantModules(workspace.tenant.id),
      ]);

      setModules(available);
      setTenantModules(tenant);

      const enabledKeys = new Set(
        tenant.filter((tm) => tm.is_enabled).map((tm) => tm.module_key),
      );
      setEnabledModuleKeys(enabledKeys);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load modules');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadModules();
  }, [workspace?.tenant.id]);

  return {
    modules,
    tenantModules,
    enabledModuleKeys,
    isLoading,
    error,
    isModuleEnabled: (key: string) => enabledModuleKeys.has(key),
    refreshModules: loadModules,
  };
}
