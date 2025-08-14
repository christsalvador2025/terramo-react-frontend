import {
  ClientSideRowModelModule,
  ColDef,
  LargeTextEditorModule,
  ModuleRegistry,
  ValidationModule,
} from "ag-grid-community";
import { useContext, useEffect, useMemo, useState } from "react";
import Table from "../../../components/table/table";
import { CustomerContext } from "../../../context/customer-context";

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  LargeTextEditorModule,
  ValidationModule /* Development Only */,
]);

interface ReportingRow {
  key: string;
  topic: string;
  impact: string | null;
  risk: string | null;
  riskMitigation: string | null;
  targets: string | null;
}

const Reporting = () => {
  const containerStyle = useMemo(() => ({ width: "100%", height: "100%" }), []);
  const gridStyle = useMemo(() => ({ height: "100%", width: "100%" }), []);
  const { customerData, updateCustomerData } =
    useContext(CustomerContext) || {};
  const [rows, setRows] = useState<ReportingRow[]>([]);

  const colDefs: ColDef[] = [
    {
      field: "key",
      headerName: "Index",
      flex: 1,
    },
    {
      field: "topic",
      headerName: "Berichtsthema",
      flex: 1,
    },
    {
      field: "impact",
      headerName: "Beschreibung Impact auf Umwelt u. Gesellschaft",
      editable: true,
      cellEditor: "agLargeTextCellEditor",
      cellEditorPopup: true,
      flex: 2,
    },
    {
      field: "risk",
      headerName: "Beschreibung Auswirk. auf die finanzielle Lage",
      editable: true,
      cellEditor: "agLargeTextCellEditor",
      cellEditorPopup: true,
      flex: 2,
    },
    {
      field: "riskMitigation",
      headerName: "Massnahmen zur Reduzierung der Auswirkungen",
      editable: true,
      cellEditor: "agLargeTextCellEditor",
      cellEditorPopup: true,
      flex: 2,
    },
    {
      field: "targets",
      headerName: "Ziele, Messgrössen",
      editable: true,
      cellEditor: "agLargeTextCellEditor",
      cellEditorPopup: true,
      flex: 2,
    },
  ];

  useEffect(() => {
    if (customerData && customerData.reportings) {
      const rows = customerData.reportings.map((reporting) => ({
        key: reporting.key,
        topic: reporting.name,
        impact: reporting.impact,
        risk: reporting.risk,
        riskMitigation: reporting.riskMitigation,
        targets: reporting.targets,
      }));
      setRows(rows);
    } else {
      setRows([]);
    }
  }, [customerData]);

  const updateCustomerTableData = async (updatedRow: ReportingRow) => {
    const updatedReporting = {
      key: updatedRow.key,
      name: updatedRow.topic,
      impact: updatedRow.impact ?? "",
      risk: updatedRow.risk ?? "",
      riskMitigation: updatedRow.riskMitigation ?? "",
      targets: updatedRow.targets ?? "",
    };

    try {
      if (!customerData || !updateCustomerData) return;

      customerData.reportings[
        customerData.reportings.findIndex(
          (reporting) => reporting.key === updatedRow.key
        )
      ] = updatedReporting;
      updateCustomerData({ ...customerData });
    } catch (error) {
      console.error("Error updating iro assessment data:", error);
    }
  };

  const onCellValueChanged = (e: any) => {
    const updatedReporting = e.data as ReportingRow;
    updateCustomerTableData(updatedReporting);
  };

  return (
    <div style={containerStyle}>
      <div style={gridStyle}>
        <Table
          rowData={rows}
          colDefs={colDefs}
          onCellValueChanged={onCellValueChanged}
        ></Table>
      </div>
    </div>
  );
};

export default Reporting;
