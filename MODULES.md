# Module Registry System Documentation

## Overview

The Module Registry is a production-grade system that enables unlimited modules to be added to Axiom without changing the core application. Every tenant can have a completely different combination of enabled modules.

## Architecture

### Database Layer

Two main tables manage the module system:

#### `module_registry`
The global registry of all available modules in the platform.

```sql
- id (uuid, pk)
- key (text, unique) - Identifier used in code (e.g., 'inventory', 'crm')
- name (text) - Display name
- description (text) - What the module does
- icon (text) - Lucide icon name
- category (text) - Business domain (core, operations, finance, people, etc.)
- version (text) - Semantic version
- is_system (boolean) - System modules cannot be disabled
- is_active (boolean) - Only active modules show to users
- display_order (int) - Sort order in UI
- metadata (jsonb) - Extensible metadata (status, permissions, etc.)
- created_at, updated_at
```

#### `tenant_module_registry`
Per-tenant module configuration.

```sql
- id (uuid, pk)
- tenant_id (uuid, fk) - Which tenant
- module_key (text, fk) - Which module
- is_enabled (boolean) - Is it active for this tenant?
- enabled_at (timestamptz) - When was it enabled?
- enabled_by (uuid, fk) - Who enabled it?
- configuration (jsonb) - Module-specific settings
- created_at, updated_at
- unique(tenant_id, module_key)
```

### Service Layer (`moduleService`)

All module operations flow through a single service:

```typescript
const result = await moduleService.getAvailableModules();
const result = await moduleService.getTenantModules(tenantId);
const result = await moduleService.getTenantEnabledModules(tenantId);
const result = await moduleService.isModuleEnabled(tenantId, 'inventory');
const result = await moduleService.enableModule(tenantId, 'inventory', userId);
const result = await moduleService.disableModule(tenantId, 'inventory');
const result = await moduleService.updateModuleConfiguration(tenantId, 'inventory', config);
```

All operations:
- Return `ServiceResult<T>` (never throw)
- Respect Row Level Security (RLS)
- Are audited through existing audit log system

### React Hooks

#### `useModules()`
Load and manage module state for the current workspace.

```typescript
const { 
  modules,              // All available modules
  tenantModules,        // Tenant's module config
  enabledModuleKeys,    // Set<string> for fast lookup
  isLoading,
  error,
  isModuleEnabled,      // (key: string) => boolean
  refreshModules        // () => Promise<void>
} = useModules();
```

#### `useDynamicNavigation()`
Build navigation based on enabled modules and permissions.

```typescript
const sections: NavSection[] = useDynamicNavigation();
// Returns filtered navigation where:
// - Only items from enabled modules show
// - User permissions are respected
// - Core sections always visible
```

### Configuration

#### `MODULE_REGISTRY` (src/config/modules.ts)
Metadata for all modules. Update this when adding new modules.

```typescript
export const MODULE_REGISTRY: Record<string, ModuleMetadata> = {
  inventory: {
    key: 'inventory',
    name: 'Inventory',
    description: 'Stock and warehouse management',
    icon: 'Package',
    category: 'operations',
    version: '1.0.0',
  },
  // ... more modules
};
```

#### `MODULE_CATEGORIES`
Organize modules by business domain for UI display.

```typescript
export const MODULE_CATEGORIES = {
  core: { label: 'Core', description: 'Essential features' },
  operations: { label: 'Operations', description: 'Business ops' },
  finance: { label: 'Finance & Admin', description: 'Accounting' },
  people: { label: 'People', description: 'HR management' },
  // ... more categories
};
```

## UI Layer

### Admin Pages

#### `/admin/modules`
**Purpose**: Platform owner manages the global module registry.

**Features**:
- View all modules with metadata
- Create new module registry entries
- Toggle modules active/inactive
- Edit module metadata
- No module deletion (audit trail preserved)

**Permissions**: Platform admin only (via RLS)

### Tenant Pages

#### `/app/modules`
**Purpose**: Business owner manages modules for their workspace.

**Features**:
- Installed tab: Enabled modules (can disable)
- Available tab: Disabled modules (coming soon)
- Module cards show: name, description, version, category
- System modules (core) cannot be disabled

**Permissions**: Owner and Admin roles (via RLS)

## Dynamic Navigation

### How It Works

1. **Static Configuration**: `TENANT_NAV` in `src/config/navigation.ts` defines all possible navigation items
2. **Dynamic Filtering**: `useDynamicNavigation()` filters based on:
   - User permissions ("core.members.view", etc.)
   - Enabled modules (item.module = "inventory")
3. **AppShell Update**: `AppShell` uses dynamic navigation instead of hardcoded sections

### Navigation Item Structure

```typescript
export interface NavItem {
  to: string;                    // Route path
  label: string;                 // Display name
  icon: LucideIcon;             // Lucide icon
  permission?: string;           // Required permission
  module?: string;               // Required module key
  badge?: string;                // Optional badge
}
```

**Examples**:

```typescript
// Always visible (no module, no permission)
{ to: '/app', label: 'Dashboard', icon: LayoutDashboard, module: 'dashboard' }

// Only if user is admin
{ to: '/app/team', label: 'Team', icon: Users, permission: 'core.members.view' }

// Only if inventory module is enabled
{ to: '/app/inventory', label: 'Inventory', icon: Package, module: 'inventory' }

// Only if both conditions met
{ to: '/app/accounting', label: 'Accounting', icon: Calculator, 
  module: 'accounting', permission: 'accounting.view' }
```

## Database Seeding

The migration includes seeded modules:

**Core (Always System)**:
- Dashboard
- Settings

**Operations**:
- CRM, Inventory, Sales, Projects

**Finance**:
- Accounting, Payroll

**People**:
- HR, Staff

**Knowledge**:
- Documents, Calendar, Notifications

**Analytics**:
- Reports, Analytics

**Sales**:
- Customers

**Vertical Solutions**:
- Vehicle Management, Restaurant POS, Education, Healthcare, Construction, Legal

All non-core modules are marked `is_active: true` and `is_system: false`.

## Adding New Modules

### Step 1: Register in Database

Create a migration:

```sql
insert into public.module_registry (
  key, name, description, icon, category, version, is_active
) values (
  'my-new-module',
  'My New Module',
  'Description of what it does',
  'IconName',
  'category',
  '1.0.0',
  true
);
```

### Step 2: Add to CONFIG

Update `src/config/modules.ts`:

```typescript
export const MODULE_REGISTRY = {
  // ... existing modules
  'my-new-module': {
    key: 'my-new-module',
    name: 'My New Module',
    description: '...',
    icon: 'IconName',
    category: 'operations',
    version: '1.0.0',
  },
};
```

### Step 3: Add to Navigation (Optional)

Update `src/config/navigation.ts` if the module needs navigation:

```typescript
{
  to: '/app/my-feature',
  label: 'My Feature',
  icon: FeatureIcon,
  module: 'my-new-module',
  permission: 'myfeature.view',
}
```

### Step 4: Implement Module

Create module files under `src/modules/my-new-module/`:

```
src/
└── modules/
    └── my-new-module/
        ├── index.ts
        ├── services/
        ├── components/
        ├── routes/
        └── types.ts
```

**That's it!** No core application changes needed.

## Row Level Security (RLS)

All module tables have RLS policies:

### `module_registry`
- **Read**: Active modules visible to all; inactive only to admins
- **Write**: Admins only (platform admins)

### `tenant_module_registry`
- **Read**: Tenant members can see their module config
- **Write**: Only owner/admin roles can enable/disable

Policies are enforced by Supabase before data leaves the database.

## Type Safety

All module types are derived from database schema:

```typescript
// Generated from database
export type ModuleRegistry = Row<'module_registry'>;
export type TenantModuleRegistry = Row<'tenant_module_registry'>;

// Application types
export interface ModuleMetadata { ... }
export type ModuleCategory = 'core' | 'operations' | ...;
export type ModuleStatus = 'production' | 'beta' | 'coming_soon';
```

Schema changes automatically surface as TypeScript errors.

## Error Handling

All operations return `ServiceResult<T>`:

```typescript
const result = await moduleService.enableModule(tenantId, 'inventory', userId);

if (result.error) {
  toast.error(result.error);
  return;
}

const enabledModule = result.data;
```

No try/catch needed. Errors are always handled consistently.

## Future Extensibility

### Module Configuration
Each module can store custom configuration:

```typescript
await moduleService.updateModuleConfiguration(
  tenantId,
  'inventory',
  {
    defaultWarehouse: 'main',
    trackCost: true,
    warehouseLocations: ['A', 'B', 'C'],
  }
);
```

### Module Metadata
Modules can expose arbitrary metadata:

```typescript
metadata: {
  status: 'production',
  version: '2.1.0',
  permissions: ['inventory.view', 'inventory.manage'],
  features: ['warehouses', 'barcodes', 'kits'],
  dependencies: ['core', 'customers'],
}
```

### Module Lifecycle Hooks
Future: Modules could expose hooks for:
- `onEnable(tenantId, config)` - Initialize when enabled
- `onDisable(tenantId)` - Cleanup when disabled
- `onUpdate(tenantId, config)` - Update configuration

## Performance Considerations

1. **Module List Caching**: `useModules()` caches results. Call `refreshModules()` when changes occur
2. **Navigation Caching**: `useDynamicNavigation()` uses `useMemo` to avoid recalculation
3. **Database Indexes**: `module_registry(category)`, `module_registry(is_active)`, `tenant_module_registry(is_enabled)` optimize common queries
4. **Lazy Loading**: Modules are only fetched when needed via route-level queries

## Monitoring & Audit

All module state changes are automatically audited:

```sql
insert into public.audit_logs (
  tenant_id, actor_id, action, entity_type, entity_id
) values (
  tenant_id,
  current_user_id,
  'module.enabled',
  'module',
  'inventory'
);
```

View audit logs at `/app/activity`.

## Testing

### Test Module Enable/Disable

```typescript
const result = await moduleService.enableModule(tenantId, 'inventory', userId);
assert(result.error === null);
assert(result.data.is_enabled === true);
```

### Test Navigation Filtering

```typescript
const sections = useDynamicNavigation();
const hasInventory = sections
  .flatMap(s => s.items)
  .some(item => item.to === '/app/inventory');
assert(hasInventory === true);
```

## Troubleshooting

### Module not appearing in list
1. Check `is_active = true` in `module_registry`
2. Verify user has appropriate role
3. Check `module_registry` seeding completed

### Navigation item not showing
1. Verify module is enabled for tenant (`tenant_module_registry.is_enabled = true`)
2. Check user has required permission
3. Verify item has correct `module` key matching `module_registry.key`

### Module enable failing silently
1. Check user role (must be owner/admin)
2. Verify module exists in `module_registry`
3. Check browser console for service errors
4. Verify RLS policies allow the operation

## Summary

The Module Registry system provides:

✅ **Unlimited modules** without core changes
✅ **Per-tenant configuration** for different business needs
✅ **Strong type safety** via database schema
✅ **Row-level security** for data isolation
✅ **Dynamic navigation** that adapts to enabled modules
✅ **Production-grade error handling**
✅ **Audit trail** for compliance
✅ **Zero breaking changes** as the platform grows

This is the foundation upon which all Axiom business modules will build.
