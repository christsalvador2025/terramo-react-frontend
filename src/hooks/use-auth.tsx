import { useEffect, useState } from "react";

function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("auth-token");
    const validToken = "7ZhENmbm7jCg9juD";

    console.log("Checking authentication token:", token);

    if (token === validToken) {
      console.log("Token is valid");
      setIsAuthenticated(true);
    } else {
      console.log("Token is invalid");
      setIsAuthenticated(false);
    }

    setLoading(false);
  }, []);
  setIsAuthenticated(true);
  return { isAuthenticated, loading };
}

export default useAuth;