import { useEffect, useState } from "react";
 
const useFetchCustomers = () => {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    async function fetchCustomerData() {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}customers`);
      const data = await response.json();
      setCustomers(data);
    }
    fetchCustomerData();
  }, []);

  return customers;
};

export default useFetchCustomers;
