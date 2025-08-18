import { Box, Typography, Alert } from "@mui/material";
import { useYear } from "../../../components/year/YearContext";

export default function Stakeholder() {
  const { year } = useYear();
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Stakeholder-Analyse – {year}
      </Typography>
      <Alert severity="info" sx={{ mb: 2 }}>
        Diese Ansicht ist noch in Arbeit. Hier werden künftig Ihre Stakeholder-Analysen erfasst und ausgewertet.
      </Alert>

      <Typography variant="body1" color="text.secondary">
        Geplante Module:
        <ul>
          <li>Stakeholder-Liste &amp; Segmentierung</li>
          <li>Einfluss/Interesse-Matrix</li>
          <li>Feedback/Befragungen</li>
          <li>Priorisierte Maßnahmen</li>
        </ul>
      </Typography>
    </Box>
  );
}
