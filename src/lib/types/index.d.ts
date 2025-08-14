export interface UserState {
	user: {
		searchTerm: string;
		page: number;
	};
}

export interface ClientState {
	client: {
		page: number;
	};
}


export interface EsgData {
	title: string;
	tags: string[];
	body: string;
}





export interface User {
	first_name: string;
	last_name: string;
	email: string;
}

export interface UserResponse {
	id: string;
	email: string;
	first_name: string;
	last_name: string;
	username: string;
	slug: string;
	full_name: string;
	gender: string;
	occupation: string;
	phone_number: string;
	country: string;
	city: string;
	reputation: string;
	avatar: string;
	date_joined: string;
}



/**
 * ---------------------------------------------------------------------------------------------------------------
 * TERRAMO ADMIN
 * ---------------------------------------------------------------------------------------------------------------
 */
export interface LoginTerramoAdminResponse {
	message: string;
    access: string;
    refresh: string;
    user: {
        id: string,
        email: string,
        first_name: string,
        last_name:string,
        is_active: boolean,
        last_login: string
    }
}

export interface LoginAdminData{
    email: string;
    password: string;
    re_password?: string;
}


/**
 * ---------------------------------------------------------------------------------------------------------------
 * CLIENT ADMIN
 * ---------------------------------------------------------------------------------------------------------------
 */
export interface ClientData {
	id: string;
	slug: string;
    company_name: string;
	contact_person_first_name: string;
	contact_person_last_name: string;
    date: string;
	year_of_birth: number;
	full_name?: string;
	gender: "male" | "female" | "other";
	street: string;
	zip_code: string;
    location: string;
    email: string;
    landline_number: string;
    mobile_phone_number: string;
    product_ids: string[];
    send_invitation: boolean;
    raw_token: string;
    invitation_expires_days: number;
    miscellaneous?: string | null;
	company_photo?: string;
	average_rating: number;
}
export interface ClientAdminData {
	// id: string;
    company_name: string;
	contact_person_first_name: string;
	contact_person_last_name: string;
    date: string;
	year_of_birth: number;
	street: string;
	zip_code: string;
    location: string;
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

export interface ClientAdminResponseData {
    id: string;
    company_name: string;
	contact_person_first_name: string;
	contact_person_last_name: string;
    date: string;
	year_of_birth: number;
	street: string;
	zip_code: string;
    location: string;
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
    // stakeholders here [pending]
    // esg's here [pending]
}

 
export interface RegisterClientDataResponse {
	id?: string;
    company_name: string;
	contact_person_first_name: string;
	contact_person_last_name: string;
    date: string;
	year_of_birth: number;
	street: string;
	zip_code: string;
    location: string;
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

export interface RegisterClientData {
	id?: string;
	slug: string;
    company_name: string;
	contact_person_first_name: string;
	contact_person_last_name: string;
    date: string;
	year_of_birth: number;
	street: string;
	zip_code: string;
    location: string;
    email: string;
    landline_number: string;
    mobile_phone_number: string;
    product_ids: string[];
    send_invitation: boolean;
    raw_token: string;
    invitation_expires_days: number;
    miscellaneous?: string | null;
	company_photo?: string;
	average_rating: number;
}

export interface ClientInvitationStatus {
  status: 'accepted' | 'not_accepted' | 'pending' | string; // Use string if other statuses are possible
  status_display: string;
  expires_at: string; // ISO 8601 date string (e.g., "2025-08-20T22:54:49.896510Z")
  is_expired: boolean;
}

/**
 * Represents a single client object.
 */
export interface Client {
  id: string; // UUID format
  company_name: string;
  contact_person_first_name: string;
  contact_person_last_name: string;
  email: string;
  city: string;
  land: string; // Country code (e.g., "PH", "DE")
  is_active: boolean;
  products_count: number;
  // invitation_status can be null, so it's optional and can be ClientInvitationStatus or null
  invitation_status: ClientInvitationStatus | null;
  created_at: string; // ISO 8601 date string
}

/**
 * Represents the paginated response structure for a list of clients.
 */
export interface ClientsResponse {
  count: number;
  next: string | null;     // URL for the next page, or null if no next page
  previous: string | null; // URL for the previous page, or null if no previous page
  results: Client[];       // Array of Client objects
}
// links
export interface NavLink {
	path: string;
	label: string;
	imgLocation: string;
}
export interface QueryParams {
	page?: number;
	searchTerm?: string;
}