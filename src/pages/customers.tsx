// import useFetchCustomers from "../hooks/use-fetch-customers";
import CustomersClientComponent from "../components/customers/customers-client-component";
import { useGetCustomersQuery } from '../api/customerApi';
import LoadingSpinner from '../components/LoadingSpinner';

const CustomersPage = () => {
  // const customers = useFetchCustomers();
  const { data: customers , isLoading, error } = useGetCustomersQuery();

   if (isLoading) return <LoadingSpinner fullScreen />;
  if (error) return <div>Error loading customers</div>;
  
  return <CustomersClientComponent customers={customers ?? []} />;
};

export default CustomersPage;
