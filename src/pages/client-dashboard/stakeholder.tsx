import { Box } from "@mui/material";
import {
  ClientSideRowModelModule,
  ColDef,
  ModuleRegistry,
} from "ag-grid-community";
import { useEffect, useState } from "react";
import ScatterChart from "../../components/scatter-chart/scatter-chart";
import Table from "../../components/table/table";
import { useCustomer } from "../../context/customer-context";
import useCalculateCoordinates from "../../hooks/use-calculate-coordinates";
import useGetCustomerStakeholderMeasureGradings from "../../hooks/use-get-customer-stakeholder-measure-gradings";

ModuleRegistry.registerModules([ClientSideRowModelModule]);

interface StakeholderAnalysisRow {
  stakeholderId: number;
  stakeholderName: string;
  dataAvailable: boolean;
  chosen: boolean;
}

const Stakeholders = () => {
  const customerData = useCustomer();
  const fetchedRows = useGetCustomerStakeholderMeasureGradings(customerData);
  const [rows, setRows] = useState<StakeholderAnalysisRow[]>(fetchedRows);
  const { xCoordinates, yCoordinates, scatterText } = useCalculateCoordinates(
    rows,
    customerData
  );

  useEffect(() => {
    setRows(fetchedRows);
  }, [fetchedRows]);

  const colDefs: ColDef[] = [
    { field: "stakeholderName", headerName: "Stakeholder", flex: 2 },
    { field: "dataAvailable", headerName: "Daten verfügbar", flex: 1 },
    {
      field: "chosen",
      headerName: "Auswahl",
      flex: 1,
      editable: (params) => params.data.dataAvailable,
    },
  ];

  const onCellValueChanged = (e: any) => {
    const updatedData = e.data as StakeholderAnalysisRow;
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.stakeholderId === updatedData.stakeholderId ? updatedData : row
      )
    );
  };

  return (
    <>
      <Table
        rowData={rows}
        colDefs={colDefs}
        onCellValueChanged={onCellValueChanged}
      ></Table>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
        <ScatterChart
          xCoordinates={xCoordinates}
          yCoordinates={yCoordinates}
          scatterText={scatterText}
          height={600}
          width={1000}
          title="Wesentlichkeitsmatrix Stakeholder"
          xRange={[0, 3.5]}
          yRange={[0, 3.5]}
          categoriesInfo={[
            {
              categoryName: "Gesellschaft",
              categoryColor: "#005959",
              categoryBorderColor: "#669b9b",
            },
            {
              categoryName: "Umwelt",
              categoryColor: "#7ba042",
              categoryBorderColor: "#afc68d",
            },
            {
              categoryName: "Wirtschaft",
              categoryColor: "#b27300",
              categoryBorderColor: "#d0ab66",
            },
          ]}
        />
      </Box>
    </>
  );
};

export default Stakeholders;
