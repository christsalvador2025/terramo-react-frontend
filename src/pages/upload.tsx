import UploadFileIcon from "@mui/icons-material/UploadFile";
import { Box, Card, CardContent, Container, Link, Typography } from "@mui/material";
import TitleBar from "../components/title-bar/title-bar";

const UploadPage = () => {
  return (
    <Container>
      <TitleBar title="Upload" search={false} />
      <Box>
        <Card
          variant="outlined"
          sx={{ width: "50%", marginTop: "2rem", borderStyle: "dashed", padding: "2rem"}}
        >
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign:"center"
            }}
          >
            <UploadFileIcon />
            <Typography variant="body1"  sx={{ color: "text.primary" }}>
              Datei per Drag & Drop hierher ziehen
            </Typography>
            <Typography variant="body1"  sx={{ color: "text.primary" }}>
              oder
            </Typography>
            <Link href="/upload">
              Dateien durchsuchen
            </Link>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};
export default UploadPage;
