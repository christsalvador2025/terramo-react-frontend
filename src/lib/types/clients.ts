// types/client.d.ts (or types/index.d.ts)

/**
 * Represents a single product.
 */
export interface Products {
  id: string; // UUID format
  name: string;
  description?: string;
  price?: string; // Price as a string, e.g., "300.00"
}


/**
 * Represents a client's purchased product.
 */
export interface ClientProduct {
  id: string; // UUID format
  product: Products;
  purchased_at: string; // ISO 8601 date string
  expires_at: string | null; // ISO 8601 date string or null
  is_active: boolean;
}

/**
 * Represents the latest invitation details for a client.
 */
export interface LatestInvitation {
  id: number;
  token: string; // UUID format
  status: 'accepted' | 'not_accepted' | 'pending' | string; // Use string if other statuses are possible
  status_display: string;
  sent_at: string; // ISO 8601 date string
  accepted_at: string | null; // ISO 8601 date string or null
  expires_at: string; // ISO 8601 date string
  is_expired: boolean;
  is_valid_for_acceptance: boolean;
  invite_url: string; // URL string
}

/**
 * Represents a single detailed client object.
 */
export interface SingleClient {
  id: string; // UUID format
  company_name: string;
  date: string; // Date string (e.g., "YYYY-MM-DD")
  company_photo: string; // URL string
  role: string;
  contact_person_first_name: string;
  contact_person_last_name: string;
  gender: string;
  year_of_birth: number;
  street: string;
  zip_code: string;
  location: string;
  landline_number: string;
  mobile_phone_number: string;
  city: string;
  land: string; // Country code (e.g., "PH", "DE")
  email: string;
  miscellaneous: string;
  is_active: boolean;
  invitation_token: string; // UUID format
  client_products: ClientProduct[]; // Array of ClientProduct objects
  created_by_name: string;
  latest_invitation: LatestInvitation | null; // Can be null based on previous Client interface
  created_at: string; // ISO 8601 date string
  updated_at: string; // ISO 8601 date string
}
