import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getPlatformEmployees,
  getPlatformLoginHistory,
  getPlatformRoleMatrix,
  invitePlatformEmployee,
  resetPlatformEmployeePassword,
  updatePlatformEmployee,
} from "@/lib/platform-auth.functions";
import type { PlatformEmployeeStatus, PlatformRoleKey } from "@/types/platform-auth";

const KEY = ["platform-staff"] as const;

export function usePlatformEmployees() {
  return useQuery({
    queryKey: [...KEY, "employees"],
    queryFn: () => getPlatformEmployees(),
    staleTime: 30_000,
  });
}

export function usePlatformRoleMatrix() {
  return useQuery({
    queryKey: [...KEY, "role-matrix"],
    queryFn: () => getPlatformRoleMatrix(),
    staleTime: 5 * 60_000,
  });
}

export function usePlatformLoginHistory(enabled = true) {
  return useQuery({
    queryKey: [...KEY, "login-history"],
    queryFn: () => getPlatformLoginHistory(),
    staleTime: 30_000,
    enabled,
  });
}

function useInvalidateStaff() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: KEY });
}

export function useInviteEmployee() {
  const invalidate = useInvalidateStaff();
  return useMutation({
    mutationFn: (input: {
      email: string;
      fullName: string;
      department?: string;
      roleKey: PlatformRoleKey;
    }) => invitePlatformEmployee({ data: input }),
    onSuccess: invalidate,
  });
}

export function useUpdateEmployee() {
  const invalidate = useInvalidateStaff();
  return useMutation({
    mutationFn: (input: {
      employeeId: string;
      roleKey?: PlatformRoleKey;
      status?: PlatformEmployeeStatus;
      department?: string;
      fullName?: string;
    }) => updatePlatformEmployee({ data: input }),
    onSuccess: invalidate,
  });
}

export function useResetEmployeePassword() {
  const invalidate = useInvalidateStaff();
  return useMutation({
    mutationFn: (input: { employeeId: string }) => resetPlatformEmployeePassword({ data: input }),
    onSuccess: invalidate,
  });
}
