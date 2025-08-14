import { useEffect, useState } from "react";
import { fetchStakeholders as fetchStakeholdersService } from "../services/api-service";

const useFetchStakeholders = () => {
  const [stakeholders, setStakeholders] = useState([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStakeholders = async () => {
      try {
        const stakeholders = await fetchStakeholdersService();
        setStakeholders(stakeholders);
      } catch (error: any) {
        setError(error.message);
        setStakeholders([]);
      }
    };

    fetchStakeholders();
  }, []);

  return { stakeholders, error };
};

export default useFetchStakeholders;
