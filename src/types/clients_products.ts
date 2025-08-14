export interface Products {
  id: string;
  name: string;
  description?: string;
  price?: number;
  category?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface ClientProduct {
  id: string;
  client_id: string;
  product_id: string;
  product: Products;
  assigned_at: string;
  status: "active" | "inactive";
}

export interface LatestInvitation {
  id: string;
  client_id: string;
  invitation_token: string;
  expires_at: string;
  sent_at: string;
  accepted_at?: string;
  status: "pending" | "accepted" | "expired" | "rejected";
  email_sent: boolean;
}

export interface SingleClient {
  id: string;
  company_name: string;
  contact_person_first_name: string;
  contact_person_last_name: string;
  date: string;
  gender: "male" | "female" | "diverse";
  year_of_birth: number;
  street: string;
  zip_code: string;
  location: string;
  city: string;
  land: string;
  email: string;
  landline_number: string;
  mobile_phone_number: string;
  send_invitation: boolean;
  raw_token: string;
  invitation_expires_days: number;
  miscellaneous?: string | null;
  company_photo?: string;
  average_rating?: number;
  created_at: string;
  updated_at: string;
  status: "active" | "inactive" | "pending";
  products: ClientProduct[];
  latest_invitation?: LatestInvitation;
  total_invitations_sent: number;
}

export interface ClientStats {
  total_clients: number;
  active_clients: number;
  pending_clients: number;
  inactive_clients: number;
  clients_with_invitations: number;
  average_rating: number;
}

export interface ClientFilters {
  status?: "active" | "inactive" | "pending";
  product_id?: string;
  location?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}