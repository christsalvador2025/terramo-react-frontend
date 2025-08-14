import {
  CheckboxEditorModule,
  ClientSideRowModelModule,
  ColDef,
  ModuleRegistry,
  NumberEditorModule,
  TextEditorModule,
  ValidationModule,
} from "ag-grid-community";
import { Shape } from "plotly.js";
import { useContext, useEffect, useMemo, useState } from "react";
import ScatterChart from "../../../components/scatter-chart/scatter-chart";
import Table from "../../../components/table/table";
import { CustomerContext } from "../../../context/customer-context";
import useFetchMeasures from "../../../hooks/use-fetch-measures";
import { IroAssessment, IroSelection } from "../../../types/customer";

ModuleRegistry.registerModules([
  NumberEditorModule,
  TextEditorModule,
  CheckboxEditorModule,
  ClientSideRowModelModule,
  ValidationModule /* Development Only */,
]);

interface IroAssessmentRow {
  key: string;
  prio: number;
  topic: string;
  impact: number | null;
  risk: number | null;
  opportunity: number | null;
  justification: string | null;
  chosen: boolean;
}

const IROAssessment = () => {
  const containerStyle = useMemo(() => ({ width: "100%", height: "100%" }), []);
  const gridStyle = useMemo(() => ({ height: "100%", width: "100%" }), []);
  const { customerData, updateCustomerData } =
    useContext(CustomerContext) || {};
  const { measures } = useFetchMeasures();
  const [rows, setRows] = useState<IroAssessmentRow[]>([]);

  const colDefs: ColDef[] = [
    {
      field: "key",
      headerName: "Index",
      flex: 1,
    },
    {
      field: "prio",
      headerName: "Punkte",
      flex: 1,
    },
    { field: "topic", headerName: "Thema", flex: 3 },
    {
      field: "impact",
      headerName: "Impact",
      flex: 1,
      editable: true,
      cellEditor: "agNumberCellEditor",
      cellEditorParams: {
        min: 1,
        max: 10,
      },
    },
    {
      field: "risk",
      headerName: "Risiko",
      flex: 1,
      editable: true,
      cellEditor: "agNumberCellEditor",
      cellEditorParams: {
        min: 1,
        max: 10,
      },
    },
    {
      field: "opportunity",
      headerName: "Chance",
      flex: 1,
      editable: true,
      cellEditor: "agNumberCellEditor",
      cellEditorParams: {
        min: 1,
        max: 10,
      },
    },
    {
      field: "justification",
      headerName: "Begründung",
      flex: 2,
      editable: true,
    },
    {
      field: "chosen",
      headerName: "Berichten",
      flex: 1,
      editable: true,
      cellRenderer: "agCheckboxCellRenderer",
      cellEditor: "agCheckboxCellEditor",
    },
  ];

  const assembleRows = (): IroAssessmentRow[] => {
    if (customerData && measures) {
      const selectedMeasures = customerData.iroSelection || [];

      return selectedMeasures.map((selection: IroSelection) => {
        const iroAssessment = customerData.iroAssessment.find(
          (assessment: any) => assessment.key === selection.key
        );

        const measure = measures.find(
          (measure: any) => measure.key === selection.key
        );

        return {
          key: selection.key,
          prio: selection.prio,
          topic: measure?.name,
          impact: iroAssessment?.impact ?? null,
          risk: iroAssessment?.risk ?? null,
          opportunity: iroAssessment?.opportunity ?? null,
          justification: iroAssessment?.justification ?? "",
          chosen: iroAssessment?.chosen ?? false,
        };
      });
    }
    return [];
  };

  useEffect(() => {
    if (customerData && measures) {
      const rows = assembleRows();
      setRows(rows);
    }
  }, [customerData, measures]);

  const updateCustomerTableData = async (updatedRow: IroAssessmentRow) => {
    const updatedIroAssessment = {
      key: updatedRow.key,
      impact: updatedRow.impact ?? 1,
      risk: updatedRow.risk ?? 1,
      opportunity: updatedRow.opportunity ?? 1,
      justification: updatedRow.justification ?? "",
      chosen: updatedRow.chosen ?? false,
    };

    try {
      if (!customerData || !updateCustomerData) return;

      const existingIroAssessmentIndex = customerData.iroAssessment.findIndex(
        (assessment: IroAssessment) => assessment.key === updatedRow.key
      );

      if (existingIroAssessmentIndex !== -1) {
        customerData.iroAssessment[existingIroAssessmentIndex] =
          updatedIroAssessment;
      } else {
        customerData.iroAssessment.push(updatedIroAssessment);
      }

      if (!customerData.reportings) {
        customerData.reportings = [];
      }

      if (
        updatedIroAssessment.chosen &&
        !customerData.reportings.find(
          (reporting) => reporting.key === updatedRow.key
        )
      ) {
        customerData.reportings.push({
          key: updatedRow.key,
          name: updatedRow.topic,
          impact: "",
          risk: "",
          riskMitigation: "",
          targets: "",
        });
      } else if (
        !updatedIroAssessment.chosen &&
        customerData.reportings.find(
          (reporting) => reporting.key === updatedRow.key
        )
      ) {
        customerData.reportings = customerData.reportings.filter(
          (reporting) => reporting.key !== updatedRow.key
        );
      }
      updateCustomerData({ ...customerData });
    } catch (error) {
      console.error("Error updating iro assessment data:", error);
    }
  };

  const onCellValueChanged = (e: any) => {
    const updatedStakeholder = e.data as IroAssessmentRow;
    updateCustomerTableData(updatedStakeholder);
  };

  const shapes: Partial<Shape>[] = [
    {
      type: "rect",
      xref: "x",
      yref: "y",
      x0: 7,
      y0: 7,
      x1: 10,
      y1: 10,
      fillcolor: "rgba(255, 0, 0, 0.2)",
      line: {
        width: 0,
      },
    },
    {
      type: "rect",
      xref: "x",
      yref: "y",
      x0: 0,
      y0: 7,
      x1: 7,
      y1: 10,
      fillcolor: "rgba(255, 0, 0, 0.2)",
      line: {
        width: 0,
      },
    },
    {
      type: "rect",
      xref: "x",
      yref: "y",
      x0: 7,
      y0: 0,
      x1: 10,
      y1: 7,
      fillcolor: "rgba(255, 0, 0, 0.2)",
      line: {
        width: 0,
      },
    },
  ];

  return (
    <div style={containerStyle}>
      <div style={gridStyle}>
        <Table
          rowData={rows}
          colDefs={colDefs}
          onCellValueChanged={onCellValueChanged}
        ></Table>
        <ScatterChart
          title={"Doppelte Wesentlichkeit"}
          height={600}
          width={1000}
          xRange={[0, 10.5]}
          yRange={[0, 10.5]}
          yAxisLabel={"Finanzielle Auswirkungen"}
          xAxisLabel={"Impact auf Umwelt und Gesellschaft"}
          xCoordinates={rows
            .filter((row) => row.chosen)
            .map((row) => row.impact ?? 0)}
          yCoordinates={rows
            .filter((row) => row.chosen)
            .map((row) => row.risk ?? 0)}
          scatterText={rows.filter((row) => row.chosen).map((row) => row.key)}
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
          shapes={shapes}
        />
      </div>
    </div>
  );
};

export default IROAssessment;
