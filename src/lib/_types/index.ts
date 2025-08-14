export interface ClientAdminData {
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
  product_ids: string[];
  send_invitation: boolean;
  raw_token: string;
  invitation_expires_days: number;
  miscellaneous?: string | null;
  company_photo?: string;
  average_rating?: number;
}

export interface ClientAdminResponseData extends ClientAdminData {
  id: string;
  created_at: string;
  updated_at: string;
  status: "active" | "inactive" | "pending";
}

export interface ClientsResponse {
  clients: ClientAdminResponseData[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status: number;
}