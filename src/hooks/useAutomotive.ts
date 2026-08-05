import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { automotiveService } from "@/services/automotive.service";

export function useVehicles(tenantId: string, params = {}) {
  return useQuery(["automotive", tenantId, "vehicles", params], () => automotiveService.listVehicles(tenantId, params), { enabled: Boolean(tenantId) });
}

export function useVehicle(tenantId: string, id?: string) {
  return useQuery(["automotive", tenantId, "vehicle", id], () => automotiveService.getVehicle(id!), { enabled: Boolean(tenantId && id) });
}

export function useCreateVehicle(tenantId: string) {
  const qc = useQueryClient();
  return useMutation((payload: any) => automotiveService.createVehicle(payload), { onSuccess: () => qc.invalidateQueries(["automotive", tenantId, "vehicles"]) });
}

export function useUpdateVehicle(tenantId: string) {
  const qc = useQueryClient();
  return useMutation(({ id, update }: any) => automotiveService.updateVehicle(id, update), { onSuccess: () => qc.invalidateQueries(["automotive", tenantId, "vehicles"]) });
}

export function useCreateReservation(tenantId: string) {
  const qc = useQueryClient();
  return useMutation((payload: any) => automotiveService.createReservation(payload), { onSuccess: () => qc.invalidateQueries(["automotive", tenantId, "reservations"]) });
}
