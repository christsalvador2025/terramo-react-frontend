import { ReactNode } from "react";
import Header from "../header/header";

const Layout = ({
  children,
  currentPath,
  isAuthenticated,
  setIsAuthenticated,
}: {
  children: ReactNode;
  currentPath: string;
  isAuthenticated: boolean;
  // setIsAuthenticated: (value: boolean) => void;
}) => {
  return (
    <>
      <Header
        currentPath={currentPath}
        isAuthenticated={isAuthenticated}
        // setIsAuthenticated={setIsAuthenticated}
      />
      {children}
    </>
  );
};

export default Layout;
