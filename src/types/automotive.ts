export interface VehicleImage {
  path: string;
  name: string;
  size?: number;
  uploaded_at?: string;
}

export interface AutomotiveVehicle {
  id: string;
  tenant_id: string;
  vin: string;
  stock_number?: string;
  make?: string;
  model?: string;
  year?: number;
  trim?: string;
  engine?: string;
  transmission?: string;
  fuel_type?: string;
  mileage?: number;
  exterior_color?: string;
  interior_color?: string;
  price?: string;
  purchase_price?: string;
  status?: "available" | "reserved" | "sold" | "incoming";
  images: VehicleImage[];
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AutomotiveCustomer {
  id: string;
  tenant_id: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  preferred_vehicle?: string;
  notes?: string;
  status?: "lead" | "customer" | "returning";
  created_at?: string;
  updated_at?: string;
}

export interface AutomotiveSale {
  id: string;
  tenant_id: string;
  vehicle_id?: string;
  customer_id?: string;
  sales_person_id?: string;
  sale_price?: string;
  deposit?: string;
  balance?: string;
  payment_status?: string;
  delivery_status?: string;
  sale_date?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AutomotiveReservation {
  id: string;
  tenant_id: string;
  vehicle_id: string;
  customer_id: string;
  reserved_by?: string;
  reservation_date?: string;
  expiry_date?: string | null;
  status?: "active" | "expired" | "completed" | "cancelled";
  notes?: string;
  created_at?: string;
  updated_at?: string;
}
