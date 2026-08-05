import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ReservationForm({ onSubmit, defaultValues }: any) {
  const { register, handleSubmit } = useForm({ defaultValues });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-2">
      <Input placeholder="Customer ID" {...register("customer_id")} />
      <Input placeholder="Vehicle ID" {...register("vehicle_id")} />
      <Input placeholder="Expiry date" type="datetime-local" {...register("expiry_date")} />
      <Button type="submit">Reserve</Button>
    </form>
  );
}
