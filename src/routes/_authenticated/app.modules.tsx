import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { toast } from 'sonner';

import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Blocks, Package } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useModules } from '@/hooks/useModules';
import { moduleService } from '@/services/module.service';
import { MODULE_CATEGORIES } from '@/config/modules';
import type { ModuleRegistry } from '@/types/module';

export const Route = createFileRoute('/_authenticated/app.modules')({
  head: () => ({ meta: [{ title: 'Modules' }] }),
  component: TenantModulesPage,
});

interface ModuleCardProps {
  module: ModuleRegistry;
  isEnabled: boolean;
  isLoading: boolean;
  onToggle: () => Promise<void>;
}

function ModuleCard({ module, isEnabled, isLoading, onToggle }: ModuleCardProps) {
  const categoryInfo = MODULE_CATEGORIES[module.category as keyof typeof MODULE_CATEGORIES];
  
  return (
    <Card className="panel flex flex-col justify-between p-6">
      <div>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{module.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{module.description}</p>
          </div>
          <div className="ml-2 flex shrink-0 gap-1">
            {isEnabled && <Badge>Enabled</Badge>}
            {!isEnabled && <Badge variant="secondary">Available</Badge>}
            {module.is_system && <Badge variant="outline">System</Badge>}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
          {categoryInfo && <span>{categoryInfo.label}</span>}
          <span>•</span>
          <span>v{module.version}</span>
        </div>
      </div>
      
      {!module.is_system && !isEnabled && (
        <div className="mt-4">
          <p className="mb-3 text-xs text-muted-foreground">This module will be available soon.</p>
          <Button disabled variant="outline" className="w-full" size="sm">
            Coming Soon
          </Button>
        </div>
      )}
      
      {isEnabled && (
        <div className="mt-4">
          <Button
            onClick={onToggle}
            disabled={isLoading || module.is_system}
            variant="outline"
            className="w-full"
            size="sm"
          >
            {isLoading ? 'Disabling...' : 'Disable'}
          </Button>
        </div>
      )}
    </Card>
  );
}

function TenantModulesPage() {
  const { workspace } = useAuth();
  const { modules, enabledModuleKeys, isLoading, isModuleEnabled, refreshModules } = useModules();
  const [disablingModule, setDisablingModule] = useState<string | null>(null);

  if (!workspace?.tenant.id) {
    return (
      <PageHeader title="Modules" description="Manage your workspace modules." />
    );
  }

  const handleDisableModule = async (moduleKey: string) => {
    setDisablingModule(moduleKey);
    const result = await moduleService.disableModule(workspace.tenant.id, moduleKey);
    setDisablingModule(null);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(`Module disabled`);
    refreshModules();
  };

  const enabledModules = modules.filter((m) => isModuleEnabled(m.key));
  const availableModules = modules.filter((m) => !isModuleEnabled(m.key));

  return (
    <>
      <PageHeader
        title="Modules"
        description="Manage the modules available in your workspace. Enable new features as you grow."
      />

      <Tabs defaultValue="installed" className="w-full">
        <TabsList>
          <TabsTrigger value="installed" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Installed ({enabledModules.length})
          </TabsTrigger>
          <TabsTrigger value="available" className="flex items-center gap-2">
            <Blocks className="h-4 w-4" />
            Available ({availableModules.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="installed" className="space-y-4">
          {isLoading ? (
            <Card className="panel flex items-center justify-center p-12">
              <p className="text-muted-foreground">Loading modules...</p>
            </Card>
          ) : enabledModules.length === 0 ? (
            <Card className="panel">
              <EmptyState
                icon={Package}
                title="No modules enabled"
                description="Your workspace has no active modules. Check the Available tab to enable modules."
              />
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {enabledModules.map((module) => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  isEnabled={true}
                  isLoading={disablingModule === module.key}
                  onToggle={() => handleDisableModule(module.key)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="available" className="space-y-4">
          {isLoading ? (
            <Card className="panel flex items-center justify-center p-12">
              <p className="text-muted-foreground">Loading modules...</p>
            </Card>
          ) : availableModules.length === 0 ? (
            <Card className="panel">
              <EmptyState
                icon={Blocks}
                title="All modules enabled"
                description="You have all available modules enabled in your workspace."
              />
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {availableModules.map((module) => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  isEnabled={false}
                  isLoading={false}
                  onToggle={async () => {}}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}
