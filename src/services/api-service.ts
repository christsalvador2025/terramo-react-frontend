const API_URL = import.meta.env.VITE_BACKEND_URL;

const handleResponse = async (response: Response): Promise<any> => {
  if (!response.ok) {
    let errorMessage = "Something went wrong"; 
    try {
      const error = await response.json();
      errorMessage = error.message || errorMessage;
    } catch (e) {
      console.error("Failed to parse error response", e);
    }
    return Promise.reject(new Error(errorMessage));
  }
  try {
    return await response.json();
  } catch (e) {
    console.error("Failed to parse response", e);
    return Promise.reject(new Error("Failed to parse response"));
  }
};

export const fetchCustomers = async () => {
  const response = await fetch(`${API_URL}/customers`);
  return handleResponse(response);
};

export const fetchStakeholders = async () : Promise<any> => {
  const response = await fetch(`${API_URL}/stakeholders`);
  return handleResponse(response);
};

export const fetchMeasures = async () => {
  const response = await fetch(`${API_URL}/measures`);
  return handleResponse(response);
};

export const fetchCustomerById = async (id: string) => {
  const response = await fetch(`${API_URL}/customers/${id}`);
  return handleResponse(response);
};