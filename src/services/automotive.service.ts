import { supabase, unwrap } from "./service-utils";
import type {
  AutomotiveVehicle,
  AutomotiveCustomer,
  AutomotiveReservation,
  AutomotiveSale,
} from "@/types/automotive";
import { tenantService } from "./tenant.service";

const BUCKET = "automotive-vehicles";

/**
 * PostgREST `.or()` takes a filter expression, so raw user input must never be
 * interpolated as-is. We strip every character that carries meaning in that
 * grammar (commas, parentheses, quotes, wildcards, backslashes) and cap length.
 */
function sanitizeSearchTerm(input: string): string {
  return input
    .trim()
    .slice(0, 80)
    .replace(/[,()"'\\%*]/g, "")
    .trim();
}

async function currentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

async function audit(input: {
  tenantId: string;
  action: string;
  entityType: string;
  entityId: string;
}): Promise<void> {
  const actorId = await currentUserId();
  if (!actorId) return;
  await tenantService.recordAudit({ ...input, actorId });
}

export const automotiveService = {
  /* Vehicles */
  async listVehicles(
    tenantId: string,
    params: {
      q?: string;
      filters?: { status?: string; make?: string; year?: number };
      page?: number;
      perPage?: number;
    } = {},
  ): Promise<AutomotiveVehicle[]> {
    const { q, filters = {}, page = 1, perPage = 25 } = params;
    let query = supabase
      .from("automotive_vehicles")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });

    const term = q ? sanitizeSearchTerm(q) : "";
    if (term) {
      query = query.or(
        `vin.ilike.%${term}%,stock_number.ilike.%${term}%,make.ilike.%${term}%,model.ilike.%${term}%`,
      );
    }

    if (filters.status) query = query.eq("status", filters.status as never);
    if (filters.make) query = query.ilike("make", `%${sanitizeSearchTerm(filters.make)}%`);
    if (filters.year) query = query.eq("year", filters.year);

    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    const rows = unwrap(await query.range(from, to));
    return (rows ?? []) as unknown as AutomotiveVehicle[];
  },

  async getVehicle(id: string): Promise<AutomotiveVehicle | null> {
    const row = unwrap(
      await supabase.from("automotive_vehicles").select("*").eq("id", id).maybeSingle(),
    );
    return (row ?? null) as unknown as AutomotiveVehicle | null;
  },

  async createVehicle(payload: Partial<AutomotiveVehicle>) {
    const row = unwrap(
      await supabase
        .from("automotive_vehicles")
        .insert(payload as never)
        .select()
        .maybeSingle(),
    );
    if (row) {
      await audit({
        tenantId: row.tenant_id,
        action: "automotive.vehicle.create",
        entityType: "vehicle",
        entityId: row.id,
      });
    }
    return row;
  },

  async updateVehicle(id: string, update: Partial<AutomotiveVehicle>) {
    const row = unwrap(
      await supabase
        .from("automotive_vehicles")
        .update(update as never)
        .eq("id", id)
        .select()
        .maybeSingle(),
    );
    if (row) {
      await audit({
        tenantId: row.tenant_id,
        action: "automotive.vehicle.update",
        entityType: "vehicle",
        entityId: id,
      });
    }
    return row;
  },

  async deleteVehicle(id: string) {
    const row = unwrap(
      await supabase.from("automotive_vehicles").delete().eq("id", id).select().maybeSingle(),
    );
    if (row) {
      await audit({
        tenantId: row.tenant_id,
        action: "automotive.vehicle.delete",
        entityType: "vehicle",
        entityId: id,
      });
    }
    return row;
  },

  /* Customers */
  async listCustomers(tenantId: string, q?: string): Promise<AutomotiveCustomer[]> {
    let query = supabase
      .from("automotive_customers")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });

    const term = q ? sanitizeSearchTerm(q) : "";
    if (term) {
      query = query.or(
        `first_name.ilike.%${term}%,last_name.ilike.%${term}%,phone.ilike.%${term}%,email.ilike.%${term}%`,
      );
    }
    const rows = unwrap(await query.limit(200));
    return (rows ?? []) as unknown as AutomotiveCustomer[];
  },

  async getCustomer(id: string): Promise<AutomotiveCustomer | null> {
    const row = unwrap(
      await supabase.from("automotive_customers").select("*").eq("id", id).maybeSingle(),
    );
    return (row ?? null) as unknown as AutomotiveCustomer | null;
  },

  async createCustomer(payload: Partial<AutomotiveCustomer>) {
    const row = unwrap(
      await supabase
        .from("automotive_customers")
        .insert(payload as never)
        .select()
        .maybeSingle(),
    );
    if (row) {
      await audit({
        tenantId: row.tenant_id,
        action: "automotive.customer.create",
        entityType: "customer",
        entityId: row.id,
      });
    }
    return row;
  },

  async updateCustomer(id: string, update: Partial<AutomotiveCustomer>) {
    const row = unwrap(
      await supabase
        .from("automotive_customers")
        .update(update as never)
        .eq("id", id)
        .select()
        .maybeSingle(),
    );
    if (row) {
      await audit({
        tenantId: row.tenant_id,
        action: "automotive.customer.update",
        entityType: "customer",
        entityId: id,
      });
    }
    return row;
  },

  /* Reservations */
  async createReservation(payload: Partial<AutomotiveReservation>) {
    if (!payload.tenant_id || !payload.vehicle_id) {
      throw new Error("tenant_id and vehicle_id required");
    }

    const existing = unwrap(
      await supabase
        .from("automotive_reservations")
        .select("id")
        .eq("tenant_id", payload.tenant_id)
        .eq("vehicle_id", payload.vehicle_id)
        .eq("status", "active")
        .limit(1)
        .maybeSingle(),
    );
    if (existing) throw new Error("Vehicle already has an active reservation");

    const row = unwrap(
      await supabase
        .from("automotive_reservations")
        .insert(payload as never)
        .select()
        .maybeSingle(),
    );
    if (row) {
      await audit({
        tenantId: row.tenant_id,
        action: "automotive.reservation.create",
        entityType: "reservation",
        entityId: row.id,
      });
    }
    return row;
  },

  async listReservations(tenantId: string): Promise<AutomotiveReservation[]> {
    const rows = unwrap(
      await supabase
        .from("automotive_reservations")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("reservation_date", { ascending: false })
        .limit(500),
    );
    return (rows ?? []) as unknown as AutomotiveReservation[];
  },

  /* Sales */
  async createSale(payload: Partial<AutomotiveSale>) {
    const row = unwrap(
      await supabase
        .from("automotive_sales")
        .insert(payload as never)
        .select()
        .maybeSingle(),
    );
    if (row) {
      if (row.vehicle_id) {
        await supabase
          .from("automotive_vehicles")
          .update({ status: "sold" })
          .eq("id", row.vehicle_id);
        await supabase
          .from("automotive_reservations")
          .update({ status: "expired" })
          .eq("vehicle_id", row.vehicle_id)
          .eq("status", "active");
      }
      await audit({
        tenantId: row.tenant_id,
        action: "automotive.sale.create",
        entityType: "sale",
        entityId: row.id,
      });
    }
    return row;
  },

  /* Storage */
  async uploadVehicleImage(path: string, file: File) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { cacheControl: "3600", upsert: false });
    if (error) throw error;
    return data;
  },

  async getVehicleImageUrl(path: string) {
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60);
    if (error) throw error;
    return data?.signedUrl ?? null;
  },
};
