import { supabase, unwrap } from "./service-utils";
import type { AutomotiveVehicle, AutomotiveCustomer, AutomotiveReservation, AutomotiveSale } from "@/types/automotive";
import { tenantService } from "./tenant.service";

const BUCKET = "automotive-vehicles";

export const automotiveService = {
  /* Vehicles */
  async listVehicles(tenantId: string, params: { q?: string; filters?: any; page?: number; perPage?: number } = {}) {
    const { q, filters = {}, page = 1, perPage = 25 } = params;
    let query = supabase.from("automotive_vehicles").select("*").eq("tenant_id", tenantId).order("created_at", { ascending: false });

    if (q) {
      // Search across VIN, stock_number, make, model
      query = query.or(`vin.ilike.%${q}%,stock_number.ilike.%${q}%,make.ilike.%${q}%,model.ilike.%${q}%`);
    }

    if (filters.status) query = query.eq("status", filters.status);
    if (filters.make) query = query.ilike("make", `%${filters.make}%`);
    if (filters.year) query = query.eq("year", filters.year);

    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    const rows = unwrap(await query.range(from, to));
    return rows ?? [];
  },

  async getVehicle(id: string) {
    const row = unwrap(await supabase.from("automotive_vehicles").select("*").eq("id", id).maybeSingle());
    return row ?? null;
  },

  async createVehicle(payload: Partial<AutomotiveVehicle>) {
    const res = await supabase.from("automotive_vehicles").insert(payload).select().maybeSingle();
    const row = unwrap(res);
    if (row) {
      await tenantService.recordAudit({ tenantId: row.tenant_id, actorId: payload.tenant_id ?? null, action: "automotive.vehicle.create", entityType: "vehicle", entityId: row.id });
    }
    return row;
  },

  async updateVehicle(id: string, update: Partial<AutomotiveVehicle>) {
    const res = await supabase.from("automotive_vehicles").update(update).eq("id", id).select().maybeSingle();
    const row = unwrap(res);
    if (row) {
      await tenantService.recordAudit({ tenantId: row.tenant_id, actorId: update.tenant_id ?? null, action: "automotive.vehicle.update", entityType: "vehicle", entityId: id });
    }
    return row;
  },

  async deleteVehicle(id: string) {
    const res = await supabase.from("automotive_vehicles").delete().eq("id", id).select().maybeSingle();
    const row = unwrap(res);
    if (row) {
      await tenantService.recordAudit({ tenantId: row.tenant_id, actorId: row.tenant_id ?? null, action: "automotive.vehicle.delete", entityType: "vehicle", entityId: id });
    }
    return row;
  },

  /* Customers */
  async listCustomers(tenantId: string, q?: string) {
    let query = supabase.from("automotive_customers").select("*").eq("tenant_id", tenantId).order("created_at", { ascending: false });
    if (q) query = query.or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,phone.ilike.%${q}%,email.ilike.%${q}%`);
    const rows = unwrap(await query.limit(200));
    return rows ?? [];
  },

  async getCustomer(id: string) {
    const row = unwrap(await supabase.from("automotive_customers").select("*").eq("id", id).maybeSingle());
    return row ?? null;
  },

  async createCustomer(payload: Partial<AutomotiveCustomer>) {
    const res = await supabase.from("automotive_customers").insert(payload).select().maybeSingle();
    const row = unwrap(res);
    if (row) await tenantService.recordAudit({ tenantId: row.tenant_id, actorId: payload.tenant_id ?? null, action: "automotive.customer.create", entityType: "customer", entityId: row.id });
    return row;
  },

  async updateCustomer(id: string, update: Partial<AutomotiveCustomer>) {
    const res = await supabase.from("automotive_customers").update(update).eq("id", id).select().maybeSingle();
    const row = unwrap(res);
    if (row) await tenantService.recordAudit({ tenantId: row.tenant_id, actorId: update.tenant_id ?? null, action: "automotive.customer.update", entityType: "customer", entityId: id });
    return row;
  },

  /* Reservations */
  async createReservation(payload: Partial<AutomotiveReservation>) {
    if (!payload.tenant_id || !payload.vehicle_id) throw new Error("tenant_id and vehicle_id required");
    // prevent double reservation for same vehicle with active status
    const existing = unwrap(
      await supabase
        .from("automotive_reservations")
        .select("*")
        .eq("tenant_id", payload.tenant_id)
        .eq("vehicle_id", payload.vehicle_id)
        .eq("status", "active")
        .limit(1)
        .maybeSingle(),
    );
    if (existing) throw new Error("Vehicle already has an active reservation");

    const res = await supabase.from("automotive_reservations").insert(payload).select().maybeSingle();
    const row = unwrap(res);
    if (row) await tenantService.recordAudit({ tenantId: row.tenant_id, actorId: payload.reserved_by ?? null, action: "automotive.reservation.create", entityType: "reservation", entityId: row.id });
    return row;
  },

  async listReservations(tenantId: string) {
    const rows = unwrap(await supabase.from("automotive_reservations").select("*").eq("tenant_id", tenantId).order("reservation_date", { ascending: false }).limit(500));
    return rows ?? [];
  },

  /* Sales */
  async createSale(payload: Partial<AutomotiveSale>) {
    const res = await supabase.from("automotive_sales").insert(payload).select().maybeSingle();
    const row = unwrap(res);
    if (row) {
      // mark vehicle sold
      if (row.vehicle_id) {
        await supabase.from("automotive_vehicles").update({ status: "sold" }).eq("id", row.vehicle_id);
        // expire active reservations
        await supabase.from("automotive_reservations").update({ status: "expired" }).eq("vehicle_id", row.vehicle_id).eq("status", "active");
      }
      await tenantService.recordAudit({ tenantId: row.tenant_id, actorId: payload.sales_person_id ?? null, action: "automotive.sale.create", entityType: "sale", entityId: row.id });
    }
    return row;
  },

  /* Storage */
  async uploadVehicleImage(path: string, file: File) {
    const { data, error } = await supabase.storage.from(BUCKET).upload(path, file, { cacheControl: "3600", upsert: false });
    if (error) throw error;
    return data;
  },

  async getVehicleImageUrl(path: string) {
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60);
    if (error) throw error;
    return data?.signedURL ?? null;
  },
};
