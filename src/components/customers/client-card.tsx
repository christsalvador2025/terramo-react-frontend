import {
    Button,
    Card,
    CardActions,
    CardContent,
    CardMedia,
    Typography,
  } from "@mui/material";
  import { Link } from "react-router-dom";
  import SampleImgCard from "../../assets/sample-company-logo.jpg"
  interface ClientCardProps {
    clientData: { id: number; company_name: string; company_photo?: string | null  };
  }
  
  const ClientCard = ({ clientData }: ClientCardProps) => {
    return (
      <Card key={clientData.id} sx={{ paddingTop: "1rem", display: "flex", flexDirection: "column", height: "100%"}}>
        <CardMedia
          component="img"
          sx={{ height: 200, objectFit: "contain" }}
          // src={clientData.company_photo}
          src={SampleImgCard}
          title={`Logo ${clientData.company_name}`}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h6">{clientData.company_name}</Typography>
        </CardContent>
        <CardActions>
          <Button component={Link} to={`/client/${clientData.id}/dashboard/esg-check`}>
            Wählen
          </Button>
        </CardActions>
      </Card>
    );
  };
  export default ClientCard;
  