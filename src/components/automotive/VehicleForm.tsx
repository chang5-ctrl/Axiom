import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function VehicleForm({ onSubmit, defaultValues }: any) {
  const { register, handleSubmit } = useForm({ defaultValues });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-2">
      <Input placeholder="VIN" {...register("vin")} />
      <Input placeholder="Make" {...register("make")} />
      <Input placeholder="Model" {...register("model")} />
      <div className="flex gap-2">
        <Input placeholder="Year" {...register("year")} />
        <Input placeholder="Price" {...register("price")} />
      </div>
      <Button type="submit">Save</Button>
    </form>
  );
}
