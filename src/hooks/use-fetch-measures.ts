import { useEffect, useState } from "react";

const useFetchMeasures = () => {
  const [measures, setMeasures] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMeasures = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/measures`);
        const measures = await response.json();
        setMeasures(measures);
      } catch (error: any) {
        setError(error.message);
        setMeasures([]);
      }
    };

    fetchMeasures();
  }, []);

  return { measures, error };
};

export default useFetchMeasures;