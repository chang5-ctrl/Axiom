import { useAuth } from '@/hooks/useAuth';
import { useModules } from '@/hooks/useModules';
import type { NavSection, NavItem } from '@/config/navigation';
import { TENANT_NAV } from '@/config/navigation';

/**
 * Dynamic Navigation Builder
 * 
 * Builds navigation sections based on enabled modules.
 * Only shows navigation items for:
 * 1. Modules that are enabled for the tenant
 * 2. Items the user has permission to see
 * 
 * Core modules (Dashboard, Settings) are always available.
 */
export function useDynamicNavigation(): NavSection[] {
  const { can, isModuleEnabled } = useAuth();
  const { modules, enabledModuleKeys } = useModules();

  return TENANT_NAV.map((section) => ({
    ...section,
    items: section.items.filter(
      (item) =>
        // Check permission
        (!item.permission || can(item.permission)) &&
        // Check module enablement (undefined module = always show)
        (!item.module || enabledModuleKeys.has(item.module))
    ),
  })).filter((section) => section.items.length > 0);
}
