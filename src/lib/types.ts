export type BillingUnit = "day" | "week" | "month" | "year";
export type VehicleStatus = "available" | "reserved" | "rented" | "maintenance" | "unavailable";
export type InquiryStatus = "new" | "reviewing" | "contacted" | "contracting" | "closed";
export type InsuranceStatus = "not_set" | "proposal" | "active";
export type HandoverCategory = "documents" | "equipment" | "keys";
export type HandoverCheckStatus = "unchecked" | "provided" | "not_provided";

export interface VehiclePhoto {
  id: string;
  vehicle_id: string;
  storage_path: string;
  alt: string | null;
  sort_order: number;
  is_cover: boolean;
  is_reference: boolean;
  created_at: string;
}

export interface VehicleSpec {
  label: string;
  value: string;
}

export interface Vehicle {
  id: string;
  slug: string;
  name: string;
  brand: string | null;
  variant: string | null;
  specs: VehicleSpec[];
  spec_note: string | null;
  model_year: number | null;
  mileage_km: number | null;
  base_price: number;
  iva_applies: boolean;
  iva_rate: number;
  iva_amount: number;
  total_price: number;
  billing_unit: BillingUnit;
  status: VehicleStatus;
  description: string | null;
  is_published: boolean;
  is_archived: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  vehicle_photos?: VehiclePhoto[];
}

export interface Settings {
  id: number;
  business_name: string;
  logo_path: string | null;
  whatsapp_number: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  instagram_url: string | null;
  site_domain: string | null;
  currency: string;
  default_iva_rate: number;
  default_iva_applies: boolean;
  iva_verified: boolean;
  inquiry_notice: string | null;
  support_hours: string | null;
  insurance_status: InsuranceStatus;
  insurance_provider: string | null;
  insurance_note: string | null;
  updated_at: string;
}

export interface Inquiry {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  vehicle_id: string | null;
  vehicle_name: string | null;
  pickup_date: string | null;
  return_date: string | null;
  message: string | null;
  status: InquiryStatus;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface HandoverItem {
  id: string;
  category: HandoverCategory;
  label: string;
  original_term: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface HandoverCheck {
  vehicle_id: string;
  item_id: string;
  status: HandoverCheckStatus;
  note: string | null;
  checked_at: string | null;
}
