import React, { createContext, useContext, useState } from "react";
import { Customer } from "../types/customer";

interface CustomerContextProps {
  customerData: Customer | null;
  updateCustomerData: (updatedData: Customer) => void;
}

export const CustomerContext = createContext<CustomerContextProps | undefined>(undefined);

export const CustomerProvider = ({ customer, children }: { customer: Customer; children: React.ReactNode }) => {
  const [customerData, setCustomerData] = useState<Customer | null>(customer);

  const updateCustomerData = async (updatedData: Customer) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/customers/${updatedData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error("Failed to update customer data");
      }

      const updatedCustomer = await response.json();
      setCustomerData({
        ...updatedCustomer,
        reportings: updatedCustomer.reportings || [],
      });
    } catch (error) {
      console.error("Error updating customer data:", error);
    }
  };

  return (
    <CustomerContext.Provider value={{ customerData, updateCustomerData }}>
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomer = () => {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error("useCustomer must be used within a CustomerProvider");
  }
  return context.customerData;
};
