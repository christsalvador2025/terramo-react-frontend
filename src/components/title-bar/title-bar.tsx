import { Grid2 as Grid, Typography, TypographyProps, Stack ,Button} from "@mui/material";
import { ElementType } from "react";
import Search from "../search/search";
import { Link } from "react-router-dom";

interface TitleBarProps {
  title: string;
  search: boolean;
  onSearchChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  titleVariant?: TypographyProps["variant"];
  titleComponent?: ElementType;
  children?: React.ReactNode;
}

const TitleBar = ({
  title,
  search,
  onSearchChange,
  titleVariant = "h1",
  titleComponent = "h1",
  children,
}: TitleBarProps) => {
  return (
    <Grid
      container
      spacing={2}
      mt={4}
      justifyContent={"space-between"}
      alignItems={"center"}
      sx={{ marginBottom: "1rem" }}
    >
      <Typography variant={titleVariant} component={titleComponent} mb={2}>
        {title}
      </Typography>
      {children && children}
 
      <Stack  direction="row" alignItems="center" spacing={3}>
              {search && onSearchChange && <Search onSearchChange={onSearchChange} />}
         
            <Button
              component={Link}
              to="/clients/create"
              sx={{
                display: "flex",                
                alignItems: "center",           
                backgroundColor: "#026770",     
                fontSize: "0.875rem",          
                color: "#fff",                  
                padding: "8px",                  
                borderRadius: "4px",            
                textDecoration: "none",         
                "&:hover": {
                  backgroundColor: "#058591",   
                  textDecoration: "none",       
                },
              }}
            >
              Kunde anlegen
            </Button>

       </Stack>
            
    </Grid>
  );
};
export default TitleBar;
