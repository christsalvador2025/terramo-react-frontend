import { TextField, InputAdornment } from "@mui/material";
// import SearchIcon from "@mui/icons-material/Search"; // If using MUI icon
import SearchIcon from "../../assets/search.svg"
// Custom SVG Icon Component (replace with your SVG)
const CustomSearchIcon = () => (
  <img src={SearchIcon} alt="search icon" style={{width: "22px", height: "auto", marginBottom: "8px", marginRight: "12px"}} />
);

interface SearchProps {
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const Search = ({ onSearchChange }: SearchProps) => {
  return (
    <TextField
      id="standard-search"
      label="Kunde suchen"
      type="search"
      variant="standard"
      onChange={onSearchChange}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <CustomSearchIcon />
            {/* Or use MUI icon: <SearchIcon /> */}
          </InputAdornment>
        ),
      }}
    />
  );
};

export default Search;