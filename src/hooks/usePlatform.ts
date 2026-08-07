import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  checkPlatformAccess,
  getAiUsage,
  getAnnouncements,
  getDatabaseUsage,
  getFeatureFlags,
  getPlatformAuditLogs,
  getPlatformNotifications,
  getPlatformPayments,
  getPlatformSnapshot,
  getPlatformSubscriptions,
  getPlatformTenantDetail,
  getPlatformTenants,
  getStorageUsage,
  getSupportRequests,
  publishAnnouncement,
  reviewPlatformPayment,
  saveFeatureFlag,
  saveTenantFeatureFlag,
  updateSupportStatus,
} from "@/lib/platform.functions";
import type { PaymentDecision } from "@/types/platform";

const KEY = ["platform"] as const;

export const platformAccessOptions = queryOptions({
  queryKey: [...KEY, "access"],
  queryFn: () => checkPlatformAccess(),
  staleTime: 5 * 60_000,
});

export const platformSnapshotOptions = queryOptions({
  queryKey: [...KEY, "snapshot"],
  queryFn: () => getPlatformSnapshot(),
  staleTime: 60_000,
});

export function usePlatformAccess() {
  return useQuery(platformAccessOptions);
}

export function usePlatformSnapshot() {
  return useQuery(platformSnapshotOptions);
}

export interface TenantFilters {
  search?: string;
  status?: string;
  industry?: string;
  plan?: string;
}

export function usePlatformTenants(filters: TenantFilters) {
  return useQuery({
    queryKey: [...KEY, "tenants", filters],
    queryFn: () => getPlatformTenants({ data: filters }),
    staleTime: 30_000,
  });
}

export function usePlatformTenant(tenantId: string) {
  return useQuery({
    queryKey: [...KEY, "tenant", tenantId],
    queryFn: () => getPlatformTenantDetail({ data: { tenantId } }),
    enabled: Boolean(tenantId),
  });
}

export function usePlatformSubscriptions() {
  return useQuery({
    queryKey: [...KEY, "subscriptions"],
    queryFn: () => getPlatformSubscriptions(),
    staleTime: 60_000,
  });
}

export function usePlatformPayments(status?: string) {
  return useQuery({
    queryKey: [...KEY, "payments", status ?? "all"],
    queryFn: () => getPlatformPayments({ data: { ...(status ? { status } : {}) } }),
    staleTime: 15_000,
  });
}

export function usePlatformAudit(filters: { action?: string; limit?: number } = {}) {
  return useQuery({
    queryKey: [...KEY, "audit", filters],
    queryFn: () => getPlatformAuditLogs({ data: filters }),
    staleTime: 30_000,
  });
}

export function useFeatureFlags() {
  return useQuery({
    queryKey: [...KEY, "feature-flags"],
    queryFn: () => getFeatureFlags(),
    staleTime: 30_000,
  });
}

export function useAnnouncements() {
  return useQuery({
    queryKey: [...KEY, "announcements"],
    queryFn: () => getAnnouncements(),
    staleTime: 30_000,
  });
}

export function useSupportRequests(status?: string) {
  return useQuery({
    queryKey: [...KEY, "support", status ?? "all"],
    queryFn: () => getSupportRequests({ data: { ...(status ? { status } : {}) } }),
    staleTime: 30_000,
  });
}

export function useDatabaseUsage() {
  return useQuery({
    queryKey: [...KEY, "database"],
    queryFn: () => getDatabaseUsage(),
    staleTime: 60_000,
  });
}

export function useStorageUsage() {
  return useQuery({
    queryKey: [...KEY, "storage"],
    queryFn: () => getStorageUsage(),
    staleTime: 60_000,
  });
}

export function useAiUsage() {
  return useQuery({
    queryKey: [...KEY, "ai-usage"],
    queryFn: () => getAiUsage(),
    staleTime: 60_000,
  });
}

export function usePlatformNotifications() {
  return useQuery({
    queryKey: [...KEY, "notifications"],
    queryFn: () => getPlatformNotifications(),
    staleTime: 30_000,
  });
}

/* ------------------------------------------------------------------ actions */

function useInvalidate() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: KEY });
}

export function useReviewPayment() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: { paymentId: string; decision: PaymentDecision; notes?: string }) =>
      reviewPlatformPayment({ data: input }),
    onSuccess: invalidate,
  });
}

export function useSaveFeatureFlag() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: { key: string; label: string; description?: string; isEnabled: boolean }) =>
      saveFeatureFlag({ data: input }),
    onSuccess: invalidate,
  });
}

export function useSaveTenantFeatureFlag() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: { tenantId: string; flagKey: string; isEnabled: boolean }) =>
      saveTenantFeatureFlag({ data: input }),
    onSuccess: invalidate,
  });
}

export function usePublishAnnouncement() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: {
      title: string;
      body: string;
      audience: "all" | "owners" | "admins";
      publish: boolean;
    }) => publishAnnouncement({ data: input }),
    onSuccess: invalidate,
  });
}

export function useUpdateSupportStatus() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: { id: string; status: "open" | "pending" | "resolved" }) =>
      updateSupportStatus({ data: input }),
    onSuccess: invalidate,
  });
}
