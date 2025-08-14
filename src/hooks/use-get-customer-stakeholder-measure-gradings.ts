import { useEffect, useState } from "react";
import useFetchStakeholders from "./use-fetch-stakeholders";

interface Row {
  stakeholderId: number;
  stakeholderName: string;
  dataAvailable: boolean;
  chosen: boolean;
}

const useGetCustomerStakeholderMeasureGradings = (customerData: any) => {
  const [rows, setRows] = useState<Row[]>([]);
  const { stakeholders } = useFetchStakeholders();

  useEffect(() => {
    if (customerData && stakeholders.length > 0) {
      const stakeholderMeasureGradings = customerData.stakeholderMeasureGradings || [];

      const rows = stakeholders.map((stakeholder: { id: number; label: string }) => {
        const isDataAvailable = stakeholderMeasureGradings.some(
          (stakeholderGrading: { stakeholder: number; gradings: any }) => {
            return Number(stakeholderGrading.stakeholder) === Number(stakeholder.id);
          }
        );

        return {
          stakeholderId: stakeholder.id,
          stakeholderName: stakeholder.label,
          dataAvailable: !!isDataAvailable,
          chosen: false,
        };
      });
      setRows(rows);
    }
  }, [customerData, stakeholders]);

  return rows;
};

export default useGetCustomerStakeholderMeasureGradings;
