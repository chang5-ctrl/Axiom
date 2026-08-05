import { Card } from "@/components/ui/card";
import { Carousel } from "@/components/ui/carousel";

export function VehicleCard({ vehicle }: { vehicle: any }) {
  return (
    <Card className="p-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1">
          <Carousel>
            {(vehicle?.images ?? []).map((img: any, i: number) => (
              <img key={i} src={img.path} alt={img.name} className="w-full h-32 object-cover" />
            ))}
          </Carousel>
        </div>
        <div className="col-span-2">
          <h3 className="font-semibold">{vehicle?.make} {vehicle?.model}</h3>
          <p className="text-sm text-muted-foreground">VIN: {vehicle?.vin}</p>
          <p className="mt-2 text-sm">{vehicle?.description}</p>
        </div>
      </div>
    </Card>
  );
}
