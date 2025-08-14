import { Link } from "react-router-dom";
import { theme } from "../../theme";
import Logo from "../../assets/logo.svg";
import LogoWhite from "../../assets/logo-white.svg";

const HeaderLogo = () => {
  return (
    <Link to="/">
      {theme.palette.mode === "dark" ? (
        <img src={LogoWhite} alt="Logo" style={{ width: "210px", marginRight: "2rem" }} />
      ) : (
        <img src={Logo} alt="Logo" style={{ width: "210px", marginRight: "2rem" }} />
      )}
    </Link>
  );
};
export default HeaderLogo;
