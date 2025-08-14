import { Button } from "@mui/material";
import { Link } from "react-router-dom";

interface NavLinkProps {
  href: string;
  label: string;
  currentPath: string;
}

const NavLink = ({ href, label, currentPath }: NavLinkProps) => {
  return (
    <Button component={Link} to={href} color="inherit" sx={currentPath === href ? {fontWeight: "bold"} : {}}>
      {label}
    </Button>
  );
};
export default NavLink;
