import { useEffect, useState } from "react";

const useCalculateCoordinates = (rows: any[], customerData: any) => {
  const [xCoordinates, setXCoordinates] = useState<any[]>([]);
  const [yCoordinates, setYCoordinates] = useState<any[]>([]);
  const [scatterText, setScatterText] = useState<any[]>([]);

  useEffect(() => {
    const calculateCoordinates = (
      rows: any[],
      customerData: any
    ) => {
      const chosenStakeholders = rows.filter((row) => row.chosen);
      const yCoords: number[] = [];
      const xCoords: number[] = [];
      const scatterTexts: string[] = [];

      const gradingKeys = customerData.measureGradings.map(
        (grading: any) => grading.key
      );

      gradingKeys.forEach((key: any) => {
        const yValues: number[] = [];
        chosenStakeholders.forEach((stakeholder) => {
          if (stakeholder.stakeholderId !== 1) {
            // Exclude the stakeholder with id=1
            const stakeholderGrading =
              customerData.stakeholderMeasureGradings.find(
                (grading: any) =>
                  Number(grading.stakeholder) ===
                  Number(stakeholder.stakeholderId)
              );
            if (stakeholderGrading) {
              const grading = stakeholderGrading.gradings.find(
                (g: any) => g.key === key
              );
              if (grading) {
                yValues.push(grading.prio);
              }
            }
          }
        });
        if (yValues.length > 0) {
          const meanY = yValues.reduce((a, b) => a + b, 0) / yValues.length;
          yCoords.push(meanY);
          const xGrading = customerData.measureGradings.find(
            (grading: any) => grading.key === key
          );
          if (xGrading) {
            xCoords.push(xGrading.prio);
          }
          scatterTexts.push(key);
        }
      });

      setYCoordinates(yCoords);
      setXCoordinates(xCoords);
      setScatterText(scatterTexts);
    };

    if (rows.length > 0 && customerData) {
      calculateCoordinates(rows, customerData);
    }
  }, [rows, customerData]);

  return { xCoordinates, yCoordinates, scatterText };
};

export default useCalculateCoordinates;
