import { createFileRoute } from "@tanstack/react-router";

import { useState } from "react";
import { toast } from "sonner";

import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PlatformPermissionGate } from "@/components/layout/PlatformShell";
import { SectionCard } from "@/components/platform/SectionCard";
import { Button } from "@/components/ui/button";
import { usePlatformAuth } from "@/hooks/usePlatformAuth";
import { usePlatformPayments, useReviewPayment } from "@/hooks/usePlatform";
import { formatCurrency, formatDate, titleCase } from "@/lib/format";
import type { PlatformPaymentRow } from "@/types/platform";

export const Route = createFileRoute("/super-admin/_app/payments")({
  component: PaymentsPage,
});

function PaymentsPage() {
  const [status, setStatus] = useState("pending");
  const { data, isPending } = usePlatformPayments(status);
  const review = useReviewPayment();
  const { can } = usePlatformAuth();

  const decide = (paymentId: string, decision: "approve" | "reject") => {
    review.mutate(
      { paymentId, decision },
      {
        onSuccess: () => toast.success(decision === "approve" ? "Payment approved" : "Payment rejected"),
        onError: (error) => toast.error(error instanceof Error ? error.message : "Review failed"),
      },
    );
  };

  const columns: DataTableColumn<PlatformPaymentRow>[] = [
    { header: "Workspace", accessor: "tenantName" },
    { header: "Plan", accessor: "planName", render: (row) => row.planName ?? "—" },
    { header: "Amount", accessor: "amount", render: (row) => formatCurrency(row.amount, row.currency) },
    { header: "Method", accessor: "method", render: (row) => row.method ?? "—" },
    { header: "Reference", accessor: "reference", render: (row) => row.reference ?? "—" },
    { header: "Status", accessor: "status", render: (row) => <StatusBadge status={row.status} /> },
    { header: "Submitted", accessor: "createdAt", render: (row) => formatDate(row.createdAt) },
    {
      header: "Review",
      accessor: "id",
      render: (row) =>
        can("platform.payments.review") && row.status === "pending" ? (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => decide(row.id, "approve")} disabled={review.isPending}>
              Approve
            </Button>
            <Button size="sm" variant="ghost" onClick={() => decide(row.id, "reject")} disabled={review.isPending}>
              Reject
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
        eyebrow="Finance"
        title="Pending payments"
        description="Manual bank-transfer submissions awaiting verification."
        actions={
          <div className="flex gap-2">
            {["pending", "approved", "rejected"].map((value) => (
              <Button key={value} size="sm" variant={status === value ? "default" : "outline"} onClick={() => setStatus(value)}>
                {titleCase(value)}
              </Button>
            ))}
          </div>
        }
      />
      <PlatformPermissionGate permission="platform.payments.view">
        <SectionCard title="Submissions" bodyClassName="p-0">
          <DataTable columns={columns} data={data ?? []} loading={isPending} emptyMessage="No payments in this state." />
        </SectionCard>
      </PlatformPermissionGate>
    </>
  );
}
