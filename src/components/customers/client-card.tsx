import {
    Button,
    Card,
    CardActions,
    CardContent,
    CardMedia,
    Typography,
  } from "@mui/material";
  import { Link } from "react-router-dom";
  // import SampleImgCard from "../../assets/sample-company-logo.jpg"
import NoImgCard from "../../assets/no-img.jpg"
  interface ClientCardProps {
    clientData: { id: number; company_name: string; company_photo?: string | null  };
  }
  
  const ClientCard = ({ clientData }: ClientCardProps) => {
    // const cloudinary_api_url =
    const cloudinary_img = `${import.meta.env.VITE_CLOUDINARY_API_URL}/${import.meta.env.VITE_CLOUDINARY_NAME}`
    return (
      <Card key={clientData.id} sx={{ paddingTop: "1rem", display: "flex", flexDirection: "column", height: "100%"}}>
        <CardMedia
          component="img"
          sx={{ height: 200, objectFit: "contain" }}
          src={ clientData.company_photo 
                ? `${cloudinary_img}/${clientData.company_photo}` 
                : NoImgCard}
          // src={SampleImgCard}
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
  