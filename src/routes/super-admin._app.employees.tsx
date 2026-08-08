import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PlatformPermissionGate } from "@/components/layout/PlatformShell";
import { SectionCard } from "@/components/platform/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePlatformAuth } from "@/hooks/usePlatformAuth";
import {
  useInviteEmployee,
  usePlatformEmployees,
  usePlatformLoginHistory,
  usePlatformRoleMatrix,
  useResetEmployeePassword,
  useUpdateEmployee,
} from "@/hooks/usePlatformEmployees";
import { formatDateTime } from "@/lib/format";
import type { PlatformEmployee, PlatformRoleKey } from "@/types/platform-auth";

export const Route = createFileRoute("/super-admin/_app/employees")({
  component: EmployeesPage,
});

const ROLE_KEYS: PlatformRoleKey[] = [
  "platform_owner",
  "super_admin",
  "operations_manager",
  "finance_admin",
  "support_engineer",
  "developer",
  "security_auditor",
];

function EmployeesPage() {
  const { can } = usePlatformAuth();
  const employees = usePlatformEmployees();
  const matrix = usePlatformRoleMatrix();
  const history = usePlatformLoginHistory();
  const invite = useInviteEmployee();
  const update = useUpdateEmployee();
  const reset = useResetEmployeePassword();
  const canManage = can("platform.employees.manage");

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState("");
  const [roleKey, setRoleKey] = useState<PlatformRoleKey>("support_engineer");

  const roleName = (key: string) =>
    matrix.data?.roles.find((role) => role.key === key)?.name ?? key;

  const handleInvite = (event: React.FormEvent) => {
    event.preventDefault();
    invite.mutate(
      { email, fullName, roleKey, ...(department ? { department } : {}) },
      {
        onSuccess: (result) => {
          setEmail("");
          setFullName("");
          setDepartment("");
          toast.success(`Invited ${result.employee.email}`, {
            description: `Temporary password: ${result.temporaryPassword}`,
            duration: 30_000,
          });
        },
        onError: (error) => toast.error(error instanceof Error ? error.message : "Invite failed"),
      },
    );
  };

  const columns: DataTableColumn<PlatformEmployee>[] = [
    { header: "Name", accessor: "fullName", render: (row) => row.fullName ?? "—" },
    { header: "Email", accessor: "email" },
    { header: "Department", accessor: "department", render: (row) => row.department ?? "—" },
    {
      header: "Role",
      accessor: "roleKey",
      render: (row) =>
        canManage ? (
          <Select
            value={row.roleKey}
            onValueChange={(value) =>
              update.mutate(
                { employeeId: row.id, roleKey: value as PlatformRoleKey },
                {
                  onSuccess: () => toast.success("Role updated"),
                  onError: (error) =>
                    toast.error(error instanceof Error ? error.message : "Update failed"),
                },
              )
            }
          >
            <SelectTrigger className="h-8 w-[190px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLE_KEYS.map((key) => (
                <SelectItem key={key} value={key}>
                  {roleName(key)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          roleName(row.roleKey)
        ),
    },
    { header: "Status", accessor: "status", render: (row) => <StatusBadge status={row.status} /> },
    {
      header: "Last sign-in",
      accessor: "lastLoginAt",
      render: (row) => (row.lastLoginAt ? formatDateTime(row.lastLoginAt) : "Never"),
    },
    {
      header: "Actions",
      accessor: "id",
      render: (row) =>
        canManage ? (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={update.isPending}
              onClick={() =>
                update.mutate(
                  { employeeId: row.id, status: row.status === "suspended" ? "active" : "suspended" },
                  {
                    onSuccess: () => toast.success("Status updated"),
                    onError: (error) =>
                      toast.error(error instanceof Error ? error.message : "Update failed"),
                  },
                )
              }
            >
              {row.status === "suspended" ? "Reactivate" : "Suspend"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={reset.isPending}
              onClick={() =>
                reset.mutate(
                  { employeeId: row.id },
                  {
                    onSuccess: (result) =>
                      toast.success("Temporary password issued", {
                        description: result.temporaryPassword,
                        duration: 30_000,
                      }),
                    onError: (error) =>
                      toast.error(error instanceof Error ? error.message : "Reset failed"),
                  },
                )
              }
            >
              Reset password
            </Button>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Organisation"
        title="Platform employees"
        description="Internal staff accounts, their platform role and access status. Staff cannot self-register."
      />

      <PlatformPermissionGate permission="platform.employees.view">
        {canManage && (
          <SectionCard
            title="Invite an employee"
            description="An account is created immediately with a one-time password that must be changed at first sign-in."
          >
            <form className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" onSubmit={handleInvite}>
              <div className="space-y-2">
                <Label htmlFor="employee-name">Full name</Label>
                <Input
                  id="employee-name"
                  required
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Jordan Blake"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employee-email">Work email</Label>
                <Input
                  id="employee-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="jordan@axiom.local"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employee-department">Department</Label>
                <Input
                  id="employee-department"
                  value={department}
                  onChange={(event) => setDepartment(event.target.value)}
                  placeholder="Operations"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employee-role">Platform role</Label>
                <Select value={roleKey} onValueChange={(value) => setRoleKey(value as PlatformRoleKey)}>
                  <SelectTrigger id="employee-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_KEYS.map((key) => (
                      <SelectItem key={key} value={key}>
                        {roleName(key)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2 lg:col-span-4">
                <Button type="submit" disabled={invite.isPending}>
                  {invite.isPending ? "Creating…" : "Create employee account"}
                </Button>
              </div>
            </form>
          </SectionCard>
        )}

        <SectionCard title="Directory" bodyClassName="p-0">
          <DataTable
            columns={columns}
            data={employees.data ?? []}
            loading={employees.isPending}
            emptyMessage="No platform employees yet."
          />
        </SectionCard>

        <SectionCard title="Sign-in history" description="Recent platform authentication events.">
          {(history.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No sign-in activity recorded yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {(history.data ?? []).slice(0, 20).map((event) => (
                <li key={event.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                  <span className="text-sm">{event.email ?? "Unknown account"}</span>
                  <span className="text-xs text-muted-foreground">{event.event}</span>
                  <span className="text-xs text-muted-foreground">{formatDateTime(event.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </PlatformPermissionGate>
    </>
  );
}
