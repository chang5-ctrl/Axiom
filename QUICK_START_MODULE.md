# Quick Start: Adding a New Module

This checklist helps you add a new module to Axiom in 10 steps.

## Checklist

### 1. Create Module Directory

```bash
mkdir -p src/modules/[my-module]
touch src/modules/[my-module]/{types,index}.ts
mkdir -p src/modules/[my-module]/{services,components,hooks,routes}
```

### 2. Define Types

**src/modules/[my-module]/types.ts**
```typescript
export interface MyEntity {
  id: string;
  tenantId: string;
  name: string;
  createdAt: Date;
}
```

### 3. Create Service

**src/modules/[my-module]/services/my-feature.service.ts**
```typescript
import { supabase, unwrap, guard } from '@/services/service-utils';
import type { ServiceResult } from '@/types/core';

export const myFeatureService = {
  async getItems(tenantId: string) {
    return unwrap(
      await supabase
        .from('my_entities')
        .select('*')
        .eq('tenant_id', tenantId)
    ) ?? [];
  },
};
```

### 4. Create Hook

**src/modules/[my-module]/hooks/useMyFeature.ts**
```typescript
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { myFeatureService } from '../services/my-feature.service';

export function useMyFeature() {
  const { workspace } = useAuth();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!workspace?.tenant.id) return;
    
    setIsLoading(true);
    myFeatureService.getItems(workspace.tenant.id)
      .then(setItems)
      .finally(() => setIsLoading(false));
  }, [workspace?.tenant.id]);

  return { items, isLoading };
}
```

### 5. Create Component

**src/modules/[my-module]/components/MyFeaturePage.tsx**
```typescript
import { PageHeader } from '@/components/common/PageHeader';
import { useMyFeature } from '../hooks/useMyFeature';

export function MyFeaturePage() {
  const { items, isLoading } = useMyFeature();
  
  return (
    <>
      <PageHeader title="My Feature" description="Description here" />
      {/* Content */}
    </>
  );
}
```

### 6. Create Route

**src/routes/_authenticated/app.my-module.tsx**
```typescript
import { createFileRoute } from '@tanstack/react-router';
import { MyFeaturePage } from '@/modules/my-module/components/MyFeaturePage';

export const Route = createFileRoute('/_authenticated/app/my-module')({
  head: () => ({ meta: [{ title: 'My Module' }] }),
  component: MyFeaturePage,
});
```

### 7. Export Public API

**src/modules/[my-module]/index.ts**
```typescript
export type { MyEntity } from './types';
export { myFeatureService } from './services/my-feature.service';
export { useMyFeature } from './hooks/useMyFeature';
export { MyFeaturePage } from './components/MyFeaturePage';
```

### 8. Create Database Migration

**supabase/migrations/[timestamp]_create_my_module.sql**
```sql
create table public.my_entities (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index my_entities_tenant_idx on public.my_entities(tenant_id);

grant select, insert, update, delete on public.my_entities to authenticated;
alter table public.my_entities enable row level security;

create policy "my_entities" on public.my_entities
  for select to authenticated using (public.is_tenant_member(tenant_id));
```

### 9. Register Module

**supabase/migrations/[timestamp]_register_my_module.sql**
```sql
insert into public.module_registry (
  key, name, description, icon, category, version, is_active
) values (
  'my-module',
  'My Module',
  'What it does',
  'IconName',
  'operations',
  '1.0.0',
  true
);
```

And update **src/config/modules.ts**:
```typescript
'my-module': {
  key: 'my-module',
  name: 'My Module',
  description: 'What it does',
  icon: 'IconName',
  category: 'operations',
  version: '1.0.0',
},
```

### 10. Add Navigation (Optional)

**src/config/navigation.ts**
```typescript
{
  to: '/app/my-module',
  label: 'My Module',
  icon: MyIcon,
  module: 'my-module',
  permission: 'my-module.view',
}
```

## Done!

Your module is now:
- ✅ Registered in the platform
- ✅ Visible in Module Registry (`/admin/modules`)
- ✅ Available in tenant modules page (`/app/modules`)
- ✅ Can be enabled/disabled per tenant
- ✅ Has a dedicated route
- ✅ Has a home page
- ✅ Respects multi-tenancy
- ✅ Has proper error handling
- ✅ Is fully typed

## Next Steps

1. Add more routes for features
2. Create CRUD operations in service
3. Add delete confirmation dialogs
4. Implement search/filter
5. Add export functionality
6. Create reports
7. Add integrations with other modules

## Common Patterns

### Loading State
```typescript
if (isLoading) {
  return <Card className="panel flex items-center justify-center p-12"><p>Loading...</p></Card>;
}
```

### Empty State
```typescript
import { EmptyState } from '@/components/common/EmptyState';

if (items.length === 0) {
  return <EmptyState icon={Package} title="No items" description="Create your first item" />;
}
```

### Error Handling
```typescript
const result = await myFeatureService.create(data);
if (result.error) {
  toast.error(result.error);
  return;
}
toast.success('Created successfully');
```

### Permissions
```typescript
const { can } = useAuth();

if (!can('my-module.manage')) {
  return <div>No permission</div>;
}
```

## File Template

Use this template for new service files:

```typescript
import { supabase, unwrap, guard } from '@/services/service-utils';
import type { ServiceResult } from '@/types/core';
import type { MyEntity } from '../types';

/**
 * [Feature] Service
 * 
 * Handles all [feature] operations for the [module] module.
 * All methods return ServiceResult so callers never throw blindly.
 */
export const [feature]Service = {
  async list(tenantId: string): Promise<MyEntity[]> {
    return (
      unwrap(await supabase.from('my_entities').select('*').eq('tenant_id', tenantId)) ??
      []
    );
  },

  async create(
    tenantId: string,
    data: Omit<MyEntity, 'id' | 'tenantId' | 'createdAt'>,
  ): Promise<ServiceResult<MyEntity>> {
    return guard(async () => {
      return unwrap(
        await supabase
          .from('my_entities')
          .insert({ ...data, tenant_id: tenantId })
          .select()
          .single(),
      );
    }, 'Unable to create item');
  },
};
```

---

**That's it!** You now have a fully functional, secure, multi-tenant module ready for users to enable and use.
