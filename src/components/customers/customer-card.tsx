import {
    Button,
    Card,
    CardActions,
    CardContent,
    CardMedia,
    Typography,
  } from "@mui/material";
  import { Link } from "react-router-dom";
  
  interface CustomerCardProps {
    customerData: { id: number; name: string; base64Image: string };
  }
  
  const CustomerCard = ({ customerData }: CustomerCardProps) => {
    return (
      <Card key={customerData.id} sx={{ paddingTop: "1rem" }}>
        <CardMedia
          component="img"
          sx={{ height: 200, objectFit: "contain" }}
          src={customerData.base64Image}
          title={`Logo ${customerData.name}`}
        />
        <CardContent>
          <Typography variant="h6">{customerData.name}</Typography>
        </CardContent>
        <CardActions>
          <Button component={Link} to={`/customers/${customerData.id}/dashboard/esg-check`}>
            Wählen
          </Button>
        </CardActions>
      </Card>
    );
  };
  export default CustomerCard;
  