import { Container, Grid2 as Grid, Pagination, Stack, CircularProgress } from "@mui/material";
import { useState } from "react";
import TitleBar from "../title-bar/title-bar"; 
// import CustomerCard from "./customer-card";
import ClientCard from "./client-card";

interface CustomersClientComponentProps {
  clients: { id: number; company_name: string; company_photo?: string | null  }[];
}


const ClientComponent = ({ clients }: CustomersClientComponentProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(1);
  };

  const itemsPerPage = 4;

  const handlePageChange = (
    _: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };
  console.log("customers=>", clients)

 
  const filteredClients = clients.filter((client: { company_name: string }) =>
    client.company_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedClients = filteredClients.slice(startIndex, endIndex);
  const paginationCount = Math.ceil(clients.length / itemsPerPage);

  return (
    <Container>
      <TitleBar
        title="Kunden"
        search={true}
        onSearchChange={handleSearchChange}
      />
      <Grid container spacing={2} height="400px" sx={{marginBottom: "48px", marginTop: "40px" }}>
       
        {
        clients?.length === 0 ? 
          <Container sx={{ paddingTop: "1rem", display: "grid", placeItems: "center"}}>
            <h1>No Clients Found</h1>
          </Container>
        :
        displayedClients.map(
          (clients: { id: number; company_name: string; company_photo?: string | null; }) => (
            <Grid size={3} key={clients.id}>
              <ClientCard clientData={clients} />
            </Grid>
          )
        )}
      </Grid>
      <Stack spacing={2} alignItems="center">
        <Pagination
          count={paginationCount}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Stack>
    </Container>
  );
};
export default ClientComponent;
