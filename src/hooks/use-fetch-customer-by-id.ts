import { useEffect, useState } from "react";
import { Customer } from "../types/customer";

const useFetchCustomerById = (id: string | undefined) => {
  const [customer, setCustomer] = useState<Customer>({} as Customer);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/customers/${id}`);
        const data = await response.json();
        setCustomer(data);
      } catch (error) {
        console.error("Error fetching customer data:", error);
      }
    };

    if (id) {
      fetchCustomer();
    }
  }, [id]);

  return customer;
};

export default useFetchCustomerById;
