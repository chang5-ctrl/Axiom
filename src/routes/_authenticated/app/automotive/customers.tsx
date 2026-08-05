import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { Table } from "@/components/ui/table";
import { useWorkspace } from "@/hooks/useAuth";
import { useVehicles } from "@/hooks/useAutomotive";

export const Route = createFileRoute("/_authenticated/app/automotive/customers")({ component: CustomersPage });

function CustomersPage() {
  const { tenant } = useWorkspace();
  const { data: customers = [], isLoading } = useVehicles(tenant?.id ?? "") as any; // reuse vehicles query placeholder

  return (
    <>
      <PageHeader title="Customers" description="Customer profiles and leads" />
      <div className="panel p-4">
        <Table columns={[{ Header: "Name", accessor: "first_name" }, { Header: "Phone", accessor: "phone" }, { Header: "Email", accessor: "email" } ] as any} data={customers as any} loading={isLoading} />
      </div>
    </>
  );
}
