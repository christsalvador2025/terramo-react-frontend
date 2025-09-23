// import useFetchCustomers from "../hooks/use-fetch-customers";
// import CustomersClientComponent from "../components/customers/customers-client-component";
import ClientComponent from "../components/customers/client-component";
import { useGetAllClientsQuery } from "../lib/redux/features/clients/clientupdatedApiSlice";
import { useAppSelector } from "../lib/redux/hooks/typedHooks";

// import { useGetCustomersQuery } from '../api/customerApi';
// import LoadingSpinner from '../components/LoadingSpinner';
import Spinner from "../utils/spinner";
import { useNavigate } from "react-router-dom";
import { Container, Box, Alert, Button, CircularProgress } from "@mui/material";
interface ClientInvitationStatus {
  status: string;
  status_display: string;
  expires_at: string;
  is_expired: boolean;
}

interface Client {
  id: string;
  company_name: string;
  contact_person_first_name: string;
  contact_person_last_name: string;
  email: string;
  city: string;
  land: string;
  is_active: boolean;
  products_count: number;
  
  invitation_status?: ClientInvitationStatus | null;
  created_at: string;
  company_photo?: string | null | undefined;
}
const ClientsPage = () => {
  const navigate = useNavigate();
  // const customers = useFetchCustomers();
  // const { data: customers , isLoading, error } = useGetCustomersQuery();
  const { data, isLoading, error } = useGetAllClientsQuery();
  const { user } = useAppSelector((state) => state.auth);

  console.log( "user-------", user)
   if (isLoading) {
    return (
      <div className="grid items-center pt-32">
        <CircularProgress />
      </div>
    );
  }
 
  
  if (error || !data) {
    console.error('Error fetching clients:', error);
    let error_msg = "An error occurred while fetching clients"
    if (error?.status === 403 ){
      error_msg = error?.data?.detail || "Unauthorized Access, Only for Terramo Admin."
      return (
        <Container maxWidth="sm" sx={{height: "80vh"}}>
          <Box sx={{ mt: 4 }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error_msg}
            </Alert>
            <Button 
              variant="contained" 
              onClick={() => navigate('/')}
              sx={{ background: "#026770" }}
            >
              Go to Home
            </Button>
            <Button 
              variant="contained" 
              onClick={() => navigate('/client/dashboard/stakeholder')}
              sx={{ background: "#026770" }}
            >
              Stakeholder Analysis
            </Button>
          </Box>
        </Container>
      )
    }
    
  }
  const allClients: Client[] = data?.results || [];
  return <ClientComponent clients={allClients ?? []} />;
};

export default ClientsPage;
