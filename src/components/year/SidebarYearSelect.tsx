import { Box, Typography, Select, MenuItem } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useYear } from "./YearContext";

export default function SidebarYearSelect() {
  const { year, setYear, years } = useYear();
  return (
    <Box sx={{ p: 2, pt: 1 }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        Aus welchem Jahr möchten Sie Ihre Daten sehen?
      </Typography>
      <Select
        fullWidth
        size="small"
        value={year}
        IconComponent={ExpandMoreIcon}
        onChange={(e) => setYear(Number(e.target.value))}
      >
        {years.map((y) => (
          <MenuItem key={y} value={y}>{y}</MenuItem>
        ))}
      </Select>
    </Box>
  );
}
