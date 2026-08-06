import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { automotiveService } from "@/services/automotive.service";
import type {
  AutomotiveReservation,
  AutomotiveVehicle,
} from "@/types/automotive";

interface VehicleListParams {
  q?: string;
  filters?: { status?: string; make?: string; year?: number };
  page?: number;
  perPage?: number;
}

export function useVehicles(tenantId: string, params: VehicleListParams = {}) {
  return useQuery({
    queryKey: ["automotive", tenantId, "vehicles", params],
    queryFn: () => automotiveService.listVehicles(tenantId, params),
    enabled: Boolean(tenantId),
  });
}

export function useVehicle(tenantId: string, id?: string) {
  return useQuery({
    queryKey: ["automotive", tenantId, "vehicle", id],
    queryFn: () => automotiveService.getVehicle(id!),
    enabled: Boolean(tenantId && id),
  });
}

export function useCreateVehicle(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<AutomotiveVehicle>) => automotiveService.createVehicle(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["automotive", tenantId, "vehicles"] }),
  });
}

export function useUpdateVehicle(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, update }: { id: string; update: Partial<AutomotiveVehicle> }) =>
      automotiveService.updateVehicle(id, update),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["automotive", tenantId, "vehicles"] }),
  });
}

export function useCreateReservation(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<AutomotiveReservation>) =>
      automotiveService.createReservation(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["automotive", tenantId, "reservations"] }),
  });
}
