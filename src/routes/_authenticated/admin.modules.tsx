import { createFileRoute } from '@tanstack/react-router';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { moduleService } from '@/services/module.service';
import { MODULE_REGISTRY, MODULE_CATEGORIES } from '@/config/modules';
import { useEffect } from 'react';
import type { ModuleRegistry } from '@/types/module';

export const Route = createFileRoute('/_authenticated/admin/modules')({
  head: () => ({ meta: [{ title: 'Module Registry — Admin' }] }),
  component: AdminModulesPage,
});

function AdminModulesPage() {
  const [modules, setModules] = useState<ModuleRegistry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingModule, setIsCreatingModule] = useState(false);
  const [formData, setFormData] = useState({
    key: '',
    name: '',
    description: '',
    icon: '',
    category: 'other',
    version: '1.0.0',
    isActive: true,
  });

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    setIsLoading(true);
    try {
      const available = await moduleService.getAvailableModules();
      setModules(available);
    } catch (error) {
      toast.error('Failed to load modules');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateModule = async () => {
    if (!formData.key || !formData.name) {
      toast.error('Module key and name are required');
      return;
    }

    setIsCreatingModule(true);
    const result = await moduleService.upsertModule({
      key: formData.key,
      name: formData.name,
      description: formData.description || null,
      icon: formData.icon || null,
      category: formData.category,
      version: formData.version,
      is_active: formData.isActive,
    } as any);

    setIsCreatingModule(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success('Module created successfully');
    setFormData({
      key: '',
      name: '',
      description: '',
      icon: '',
      category: 'other',
      version: '1.0.0',
      isActive: true,
    });
    loadModules();
  };

  return (
    <>
      <PageHeader
        title="Module Registry"
        description="Manage available modules in the platform. Create new modules or modify existing registry entries."
        actions={
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Module
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Module</DialogTitle>
                <DialogDescription>
                  Add a new module to the platform registry. This creates the metadata entry only.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="key">Module Key</Label>
                  <Input
                    id="key"
                    placeholder="e.g., inventory-v2"
                    value={formData.key}
                    onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Module Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Inventory Management"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Module description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="icon">Icon</Label>
                  <Input
                    id="icon"
                    placeholder="e.g., Package"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {Object.entries(MODULE_CATEGORIES).map(([key, { label }]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <Button onClick={handleCreateModule} disabled={isCreatingModule} className="w-full">
                  {isCreatingModule ? 'Creating...' : 'Create Module'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading ? (
        <Card className="panel flex items-center justify-center p-8">
          <p className="text-muted-foreground">Loading modules...</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {modules.map((module) => {
            const categoryInfo = MODULE_CATEGORIES[module.category as keyof typeof MODULE_CATEGORIES];
            return (
              <Card key={module.id} className="panel p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{module.name}</h3>
                      <Badge variant={module.is_active ? 'default' : 'secondary'}>
                        {module.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      {module.is_system && <Badge variant="outline">System</Badge>}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{module.description}</p>
                    <div className="mt-3 flex gap-2 text-xs text-muted-foreground">
                      <span>Key: {module.key}</span>
                      <span>•</span>
                      <span>Version: {module.version}</span>
                      <span>•</span>
                      <span>Category: {categoryInfo?.label || module.category}</span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
