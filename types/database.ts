export type UserRole = "admin" | "operator";
export type MovementType = "entry" | "exit";

export interface UserProfile {
  id: string;
  full_name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  line: string;
  unit_weight: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Lot {
  id: string;
  product_id: string;
  lot_number: string;
  entry_date: string;
  manufacture_date: string | null;
  expiry_date: string | null;
  initial_boxes: number;
  initial_kg: number;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Movement {
  id: string;
  lot_id: string;
  type: MovementType;
  boxes: number;
  kg: number;
  movement_date: string;
  reason: string | null;
  registered_by: string;
  created_at: string;
}

// View return types
export interface LotBalance {
  lot_id: string;
  lot_number: string;
  product_id: string;
  product_name: string;
  product_line: string;
  entry_date: string;
  manufacture_date: string | null;
  expiry_date: string | null;
  balance_boxes: number;
  balance_kg: number;
  created_at: string;
  notes: string | null;
}

export interface ProductBalance {
  product_id: string;
  product_name: string;
  product_line: string;
  total_boxes: number;
  total_kg: number;
  lot_count: number;
  oldest_lot_date: string;
}

export interface FifoNextLot {
  lot_id: string;
  product_id: string;
  product_name: string;
  lot_number: string;
  entry_date: string;
  expiry_date: string | null;
  balance_boxes: number;
  balance_kg: number;
}

export interface MovementWithDetails extends Movement {
  lot_number: string;
  product_name: string;
  user_name: string;
}
