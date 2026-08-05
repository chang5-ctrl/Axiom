import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/app/automotive/reports")({ component: ReportsPage });

function ReportsPage() {
  return (
    <>
      <PageHeader title="Reports" description="Automotive reports and CSV exports" />
      <div className="panel p-4">
        <div className="flex gap-2">
          <Button>Export vehicles in stock</Button>
          <Button>Export vehicles sold</Button>
          <Button>Export customers</Button>
        </div>
      </div>
    </>
  );
}
