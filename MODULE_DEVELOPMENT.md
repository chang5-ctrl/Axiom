# Module Development Guide

This guide explains how to develop new modules within the Axiom platform using the Module Registry system.

## Directory Structure

Each module lives in its own directory under `src/modules/`:

```
src/modules/
├── [module-key]/
│   ├── index.ts                    # Public API
│   ├── types.ts                    # Module-specific types
│   ├── services/
│   │   ├── [feature].service.ts
│   │   └── index.ts
│   ├── components/
│   │   ├── [Feature]Page.tsx
│   │   ├── [Feature]List.tsx
│   │   └── index.ts
│   ├── routes/
│   │   ├── [module-key].[route].tsx
│   │   └── index.ts
│   ├── hooks/
│   │   ├── use[Feature].ts
│   │   └── index.ts
│   └── README.md
```

## Module Registration

### 1. Register in Database

Create a migration file `supabase/migrations/[timestamp]_register_[module_key].sql`:

```sql
insert into public.module_registry (
  key,
  name,
  description,
  icon,
  category,
  version,
  is_active,
  display_order,
  metadata
) values (
  'inventory',
  'Inventory',
  'Manage stock, warehouses, and movements',
  'Package',
  'operations',
  '1.0.0',
  true,
  11,
  '{"status": "production", "permissions": ["inventory.view", "inventory.manage"]}'
);
```

### 2. Add to Configuration

Update `src/config/modules.ts`:

```typescript
export const MODULE_REGISTRY: Record<string, ModuleMetadata> = {
  // ... existing modules
  inventory: {
    key: 'inventory',
    name: 'Inventory',
    description: 'Manage stock, warehouses, and movements',
    icon: 'Package',
    category: 'operations',
    version: '1.0.0',
    isActive: true,
    displayOrder: 11,
  },
};
```

### 3. Add Navigation (if needed)

Update `src/config/navigation.ts`:

```typescript
export const TENANT_NAV: NavSection[] = [
  // ... existing sections
  {
    id: 'operations',
    label: 'Operations',
    items: [
      // ... other items
      {
        to: '/app/inventory',
        label: 'Inventory',
        icon: Package,
        module: 'inventory',
        permission: 'inventory.view',
      },
    ],
  },
];
```

## Module Structure

### types.ts

Define all module-specific types:

```typescript
import type { Row, Insert, Update } from '@/types/core';

// Database types (if using database tables)
export type Warehouse = Row<'warehouses'>; // example
export type WarehouseInsert = Insert<'warehouses'>;
export type WarehouseUpdate = Update<'warehouses'>;

// Domain types
export interface InventoryItem {
  id: string;
  warehouseId: string;
  sku: string;
  name: string;
  quantity: number;
  reorderLevel: number;
  lastUpdated: Date;
}

export interface InventoryFilter {
  warehouseId?: string;
  searchText?: string;
  lowStockOnly?: boolean;
}
```

### services/[feature].service.ts

Implement business logic following the existing service pattern:

```typescript
import { supabase, unwrap, guard } from '@/services/service-utils';
import type { ServiceResult } from '@/types/core';
import type { Warehouse, WarehouseInsert } from '../types';

export const warehouseService = {
  async listWarehouses(tenantId: string): Promise<Warehouse[]> {
    return (
      unwrap(
        await supabase
          .from('warehouses')
          .select('*')
          .eq('tenant_id', tenantId)
          .order('name', { ascending: true })
      ) ?? []
    );
  },

  async createWarehouse(
    tenantId: string,
    data: WarehouseInsert,
  ): Promise<ServiceResult<Warehouse>> {
    return guard(async () => {
      return unwrap(
        await supabase
          .from('warehouses')
          .insert({ ...data, tenant_id: tenantId })
          .select()
          .single(),
      );
    }, 'Unable to create warehouse');
  },

  // ... more methods
};
```

**Key Principles**:
- All methods follow the `async` pattern
- Return `ServiceResult<T>` for all operations (never throw)
- Use `supabase`, `unwrap`, `guard` from service-utils
- Respect tenant isolation via `tenant_id` filter
- Include audit logging where appropriate

### hooks/use[Feature].ts

Create React hooks for UI integration:

```typescript
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { warehouseService } from '../services/warehouse.service';
import type { Warehouse } from '../types';

interface UseWarehousesReturn {
  warehouses: Warehouse[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useWarehouses(): UseWarehousesReturn {
  const { workspace } = useAuth();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWarehouses = async () => {
    if (!workspace?.tenant.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await warehouseService.listWarehouses(workspace.tenant.id);
      setWarehouses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load warehouses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWarehouses();
  }, [workspace?.tenant.id]);

  return { warehouses, isLoading, error, refresh: loadWarehouses };
}
```

### components/[Feature]Page.tsx

Page components using TanStack Router:

```typescript
import { createFileRoute } from '@tanstack/react-router';
import { PageHeader } from '@/components/common/PageHeader';
import { useWarehouses } from '../hooks/useWarehouses';

export const Route = createFileRoute('/_authenticated/app.inventory')({
  head: () => ({ meta: [{ title: 'Inventory' }] }),
  component: InventoryPage,
});

function InventoryPage() {
  const { warehouses, isLoading } = useWarehouses();

  return (
    <>
      <PageHeader
        title="Inventory"
        description="Manage stock across all warehouses"
      />
      {/* Page content */}
    </>
  );
}
```

### index.ts

Export the public API:

```typescript
// Types
export type { Warehouse, WarehouseInsert, InventoryItem } from './types';

// Services
export { warehouseService } from './services/warehouse.service';

// Hooks
export { useWarehouses } from './hooks/useWarehouses';

// Components
export { InventoryPage } from './components/InventoryPage';
```

## Database Tables

Modules can create their own database tables. Create a migration:

```sql
-- Warehouses
create table public.warehouses (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index warehouses_tenant_idx on public.warehouses(tenant_id);

grant select, insert, update, delete on public.warehouses to authenticated;
grant all on public.warehouses to service_role;
alter table public.warehouses enable row level security;

-- RLS Policies
create policy "warehouses read" on public.warehouses 
  for select to authenticated using (
    public.is_tenant_member(tenant_id)
  );

create policy "warehouses write" on public.warehouses 
  for all to authenticated using (
    public.has_tenant_role(tenant_id, array['owner', 'admin'])
  ) with check (
    public.has_tenant_role(tenant_id, array['owner', 'admin'])
  );

create trigger set_updated_at_warehouses before update on public.warehouses
  for each row execute function public.set_updated_at();
```

**Key Points**:
- Always include `tenant_id` for multi-tenancy
- Create indexes on tenant_id for performance
- Use RLS policies to enforce security
- Grant appropriate permissions to authenticated/service_role
- Add updated_at trigger for audit trail

## Permissions

Define module permissions in a migration:

```sql
insert into public.permissions (key, module, action, description) values
  ('inventory.view', 'inventory', 'view', 'View inventory'),
  ('inventory.manage', 'inventory', 'manage', 'Create and update inventory'),
  ('inventory.delete', 'inventory', 'delete', 'Delete inventory items');
```

Then use in components:

```typescript
const { can } = useAuth();

if (!can('inventory.manage')) {
  return <div>You don't have permission to manage inventory</div>;
}
```

## Routes

Create route files for each page:

```typescript
// src/routes/_authenticated/app.inventory.tsx
export const Route = createFileRoute('/_authenticated/app.inventory')({
  head: () => ({ meta: [{ title: 'Inventory' }] }),
  component: InventoryPage,
});

// src/routes/_authenticated/app.inventory.$id.tsx
export const Route = createFileRoute('/_authenticated/app.inventory/$id')({
  component: InventoryDetailPage,
});
```

## Module Configuration

Modules can have per-tenant configuration stored in `tenant_module_registry.configuration`:

```typescript
const config = {
  defaultWarehouse: 'warehouse-1',
  trackCost: true,
  autoReorder: true,
  reorderThreshold: 10,
};

await moduleService.updateModuleConfiguration(
  tenantId,
  'inventory',
  config
);
```

Retrieve configuration:

```typescript
const tenantModules = await moduleService.getTenantModules(tenantId);
const inventoryModule = tenantModules.find(m => m.module_key === 'inventory');
const config = inventoryModule?.configuration;
```

## Best Practices

### 1. Isolation
- Keep module code in `/src/modules/[key]/`
- Don't import across modules (except through public API)
- Module can import from core (components, hooks, services)

### 2. Consistency
- Follow existing naming conventions
- Use established patterns (services, hooks, components)
- Return `ServiceResult<T>` from all business operations
- Use `useAuth()` and `useModules()` for context

### 3. Security
- Always filter by `tenant_id` in queries
- Use RLS policies to enforce access control
- Check permissions in UI: `if (!can('permission')) return null`
- Never trust user input in database queries

### 4. Error Handling
- Use `guard()` wrapper in services
- Show user-friendly error messages via `toast.error()`
- Log errors to browser console for debugging
- Store error state in component: `const [error, setError] = useState(null)`

### 5. Performance
- Load data with `useEffect` only when dependency changes
- Cache results in component state
- Use React Query if data changes frequently
- Implement loading and empty states

### 6. Testing
- Test services independently
- Mock Supabase in tests
- Test hooks with React Testing Library
- Test RLS policies in database tests

## Example: Complete Module

See `src/modules/` directory for complete working examples.

Start with:
1. Create directory: `src/modules/inventory/`
2. Copy structure from another module
3. Update type definitions
4. Implement services
5. Create components
6. Add routes
7. Register in database
8. Add to navigation

## API References

### useAuth()
```typescript
const { can, isModuleEnabled, workspace, membership } = useAuth();
```

### useModules()
```typescript
const { isModuleEnabled, modules, enabledModuleKeys } = useModules();
```

### Service Utils
```typescript
import { supabase, unwrap, guard, toMessage } from '@/services/service-utils';

// supabase: initialized Supabase client
// unwrap: throw if response.error, otherwise return data
// guard: wrap async function to return ServiceResult
// toMessage: convert unknown error to string
```

### Common Components
```typescript
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
```

## Deployment

When a module is ready:

1. Create a database migration
2. Add to MODULE_REGISTRY configuration
3. Add to navigation (optional)
4. Create routes and components
5. Test in development
6. Merge to main branch
7. Deploy to production

Users will see the module in `/app/modules` (Available tab) after deployment.

## Monitoring

All module operations are audited. Check `/app/activity` for:
- Module enable/disable events
- Configuration changes
- Data modifications (if logged by service)

## Support

For questions or issues:
1. Check MODULES.md for registry documentation
2. Review existing module examples
3. Check RLS policies if access denied
4. Review service error handling

This is the foundation—build with confidence!
