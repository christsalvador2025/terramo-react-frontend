import { Container } from "@mui/material";
import { ColDef } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";

interface TableProps {
  rowData: any[];
  colDefs: ColDef[];
  onCellValueChanged?: (e: any) => void;
}

const Table = (props: TableProps) => {
  const calculateRatio = (rowCount: number): number => {
    // Exact values for rowCount <= 25
    const exactValues = [
      93, 67.5, 59, 54.8, 52.2, 50.5, 49.3, 48.4, 47.7, 47.1, 46.6, 46.25, 45.9,
      45.65, 45.4, 45.2, 45, 44.85, 44.7, 44.55, 44.45, 44.3, 44.2, 44.12,
      44.05,
    ];

    if (rowCount <= 25) {
      return exactValues[Math.max(0, rowCount - 1)];
    }

    // Refined decay for rowCount > 25
    const a = 0.5; // Small amplitude for subtle decay
    const b = 0.2; // Slower decay rate
    const c = 44.05; // Start point for decay (value at rowCount = 25)

    return c - a * Math.exp(-b * (rowCount - 25));
  };

  const rowCount = props.rowData.length;
  const rowHeight = calculateRatio(rowCount);
  const gridHeight = rowCount * rowHeight;

  return (
    <Container
      style={{ maxWidth: "100%", height: gridHeight }} // Ensure height is set correctly
    >
      <AgGridReact
        rowData={props.rowData}
        columnDefs={props.colDefs}
        onCellValueChanged={props.onCellValueChanged}
      />
    </Container>
  );
};

export default Table;
