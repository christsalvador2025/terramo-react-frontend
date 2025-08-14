import { Box } from "@mui/material";
import {
  CheckboxEditorModule,
  ClientSideRowModelModule,
  ColDef,
  ModuleRegistry,
  ValidationModule,
} from "ag-grid-community";
import { useContext, useEffect, useMemo, useState } from "react";
import ScatterChart from "../../../components/scatter-chart/scatter-chart";
import Table from "../../../components/table/table";
import { CustomerContext } from "../../../context/customer-context";
import useFetchMeasures from "../../../hooks/use-fetch-measures";
import { IroAssessment, IroSelection } from "../../../types/customer";
import { calculateWeightedMeasureAverage } from "../../../utils/calculation-utils";

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  CheckboxEditorModule,
  ValidationModule /* Development Only */,
]);

interface IroSelectionRow {
  internalPoints: number;
  externalPoints: number;
  index: string;
  topic: string;
  relevant: boolean | null;
  justification: string | null;
}

const IroAssessmentSelection = () => {
  const { customerData, updateCustomerData } =
    useContext(CustomerContext) || {};
  const { measures } = useFetchMeasures();
  const [rows, setRows] = useState<IroSelectionRow[]>([]);
  const [xCoordinates, setXCoordinates] = useState<any[]>([]);
  const [yCoordinates, setYCoordinates] = useState<any[]>([]);
  const [scatterText, setScatterText] = useState<any[]>([]);

  const containerStyle = useMemo(() => ({ width: "100%", height: "100%" }), []);
  const gridStyle = useMemo(() => ({ height: "100%", width: "100%" }), []);

  const colDefs: ColDef[] = [
    { field: "internalPoints", headerName: "Punkte GL", flex: 1 },
    { field: "externalPoints", headerName: "Punkte SH", flex: 1 },
    { field: "index", headerName: "Index", flex: 1 },
    { field: "topic", headerName: "Thema", flex: 3 },
    {
      field: "relevant",
      headerName: "Relevant",
      flex: 1,
      editable: true,
      cellRenderer: "agCheckboxCellRenderer",
      cellEditor: "agCheckboxCellEditor",
    },
    {
      field: "justification",
      headerName: "Begründung",
      flex: 2,
      editable: true,
    },
  ];

  const getStakeholderMeasureGrading = (
    stakeholder: any,
    measure: any,
    customerData: any
  ) => {
    const stakeholderGrading = customerData.stakeholderMeasureGradings.find(
      (grading: any) => Number(grading.stakeholder) === Number(stakeholder.id)
    );

    if (stakeholderGrading) {
      const measureGrading = stakeholderGrading.gradings.find(
        (grading: any) => grading.key === measure.key
      );

      return measureGrading?.prio ?? 0;
    }
    return 0;
  };

  const calculateExternalPoints = (measure: any, customerData: any) => {
    const chosenStakeholders = customerData.chosenStakeholders || [];
    const weights = chosenStakeholders.map(
      (stakeholder: any) => stakeholder.weight
    );
    const values = chosenStakeholders.map((stakeholder: any) =>
      getStakeholderMeasureGrading(stakeholder, measure, customerData)
    );

    return calculateWeightedMeasureAverage(values, weights);
  };

  const generateRowsData = (measures: any[], customerData: any) => {
    let defaultIroSelections: IroSelection[] = [];
    const hasIroSelections = customerData.iroSelection.length !== 0;

    const rowsData = measures.map((measure: any) => {
      const internalPoints = getInternalPoints(measure, customerData);
      const externalPoints = calculateExternalPoints(measure, customerData);
      const chosenIroSelection = getChosenIroSelection(
        measure,
        customerData,
        hasIroSelections,
        defaultIroSelections
      );

      return {
        internalPoints,
        externalPoints,
        index: measure.key,
        topic: measure.name,
        relevant: chosenIroSelection?.relevant ?? false,
        justification: chosenIroSelection?.justification ?? "",
      };
    });

    return { rowsData, defaultIroSelections, hasIroSelections };
  };

  const getChosenIroSelection = (
    measure: any,
    customerData: any,
    hasIroSelections: boolean,
    defaultIroSelections: IroSelection[]
  ) => {
    if (hasIroSelections) {
      return customerData.iroSelection.find(
        (selection: any) => selection.key === measure.key
      );
    } else {
      const internalPoints = getInternalPoints(measure, customerData);
      const externalPoints = calculateExternalPoints(measure, customerData);
      const calculatedPrio = (externalPoints + (internalPoints ?? 0)) / 2;
      const chosenIroSelection = {
        relevant: true,
        justification: "",
        key: measure.key,
        prio: calculatedPrio,
      };
      defaultIroSelections.push(chosenIroSelection);
      return chosenIroSelection;
    }
  };

  const getInternalPoints = (measure: any, customerData: any) => {
    return (
      customerData.measureGradings.find(
        (grading: any) => grading.key === measure.key
      )?.prio ?? 0
    );
  };

  useEffect(() => {
    if (customerData && measures.length > 0) {
      const { rowsData, defaultIroSelections, hasIroSelections } =
        generateRowsData(measures, customerData);

      setRows(rowsData);
      if (!hasIroSelections && customerData && updateCustomerData) {
        customerData.iroSelection = defaultIroSelections;
        updateCustomerData({ ...customerData });
      }

      const relevantRows = rowsData.filter(
        (row: { relevant: boolean }) => row.relevant
      );
      setXCoordinates(
        relevantRows.map(
          (row: { internalPoints: number }) => row.internalPoints
        )
      );
      setYCoordinates(
        relevantRows.map(
          (row: { externalPoints: number }) => row.externalPoints
        )
      );
      setScatterText(relevantRows.map((row: { index: string }) => row.index));
    }
  }, [customerData, measures]);

  const updateCustomerTableData = async (updatedRow: IroSelectionRow) => {
    const updatedIroSelection: IroSelection = {
      key: updatedRow.index,
      prio: (updatedRow.externalPoints + updatedRow.internalPoints) / 2,
      relevant: updatedRow.relevant,
      justification: updatedRow.justification,
    };

    try {
      if (!customerData || !updateCustomerData) return;

      if (!updatedRow.relevant) {
        // remove iroSelection from customerData
        customerData.iroSelection = customerData.iroSelection.filter(
          (selection: IroSelection) => selection.key !== updatedRow.index
        );
        // remove iroAssessment from customerData
        customerData.iroAssessment = customerData.iroAssessment.filter(
          (assessment: IroAssessment) => assessment.key !== updatedRow.index
        );
      } else {
        // check if iroSelection already exists, if so update it
        const existingIroSelectionIndex = customerData.iroSelection.findIndex(
          (selection: IroSelection) => selection.key === updatedRow.index
        );
        if (existingIroSelectionIndex !== -1) {
          customerData.iroSelection[existingIroSelectionIndex] =
            updatedIroSelection;
        } else {
          // if not, add it
          customerData.iroSelection.push(updatedIroSelection);
        }
      }
      updateCustomerData({ ...customerData });

      const relevantRows = rows.filter((row) => row.relevant);
      setXCoordinates(relevantRows.map((row) => row.internalPoints));
      setYCoordinates(relevantRows.map((row) => row.externalPoints));
      setScatterText(relevantRows.map((row) => row.index));
    } catch (error) {
      console.error("Error updating customer data:", error);
    }
  };

  const onCellValueChanged = (e: any) => {
    const updatedData = e.data as IroSelectionRow;
    updateCustomerTableData(updatedData);
  };

  return (
    <div style={containerStyle}>
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

export default IroAssessmentSelection;
