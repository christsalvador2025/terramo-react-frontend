import { Container, Grid2 as Grid, Pagination, Stack } from "@mui/material";
import { useState } from "react";
import TitleBar from "../title-bar/title-bar"; 
import CustomerCard from "./customer-card";

interface CustomersClientComponentProps {
  customers: { id: number; name: string; base64Image: string }[];
}

const CustomersClientComponent = ({ customers }: CustomersClientComponentProps) => {
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
  console.log("customers=>", customers)
  const filteredCustomers = customers.filter((customer: { name: string }) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedCustomers = filteredCustomers.slice(startIndex, endIndex);
  const paginationCount = Math.ceil(customers.length / itemsPerPage);

  return (
    <Container>
      <TitleBar
        title="Kunden"
        search={true}
        onSearchChange={handleSearchChange}
      />
      <Grid container spacing={2} height="400px">
        {displayedCustomers.map(
          (customer: { id: number; name: string; base64Image: string }) => (
            <Grid size={3} key={customer.id}>
              <CustomerCard customerData={customer} />
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
export default CustomersClientComponent;
