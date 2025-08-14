import {
  CheckboxEditorModule,
  ClientSideRowModelModule,
  ColDef,
  ModuleRegistry,
  NumberEditorModule,
  TextEditorModule,
  ValidationModule,
} from "ag-grid-community";
import { useContext, useEffect, useMemo, useState } from "react";
import Table from "../../../components/table/table";
import { CustomerContext } from "../../../context/customer-context";
// import useFetchStakeholders from "../../../hooks/use-fetch-stakeholders";
import { useGetStakeholdersQuery } from "../../../api/stakeholderApi"

ModuleRegistry.registerModules([
  NumberEditorModule,
  TextEditorModule,
  CheckboxEditorModule,
  ClientSideRowModelModule,
  ValidationModule /* Development Only */,
]);

interface StakeholderSelectionRow {
  stakeholderId: number;
  stakeholderName: string;
  dataAvailable: boolean;
  chosen: boolean;
  weight: number | null;
  justification: string | null;
}

const StakeholderSelection = () => {
  const containerStyle = useMemo(() => ({ width: "100%", height: "100%" }), []);
  const gridStyle = useMemo(() => ({ height: "100%", width: "100%" }), []);
  const { customerData, updateCustomerData } =
    useContext(CustomerContext) || {};
  // const { stakeholders } = useFetchStakeholders();
  const [rows, setRows] = useState<StakeholderSelectionRow[]>([]);

  // custom data
  const { data: stakeholders, isLoading, error } = useGetStakeholdersQuery();
  
  const colDefs: ColDef[] = [
    { field: "stakeholderName", headerName: "Stakeholder", flex: 2 },
    {
      field: "dataAvailable",
      headerName: "Daten verfügbar",
      flex: 1,
    },
    {
      field: "chosen",
      headerName: "Auswahl",
      flex: 1,
      editable: (params) => params.data.dataAvailable,
    },
    {
      field: "weight",
      headerName: "Gewichtung [1-3]",
      flex: 1,
      editable: (params) => params.data.chosen,
      cellEditor: "agNumberCellEditor",
      cellEditorParams: {
        min: 1,
        max: 3,
      },
    },
    {
      field: "justification",
      headerName: "Begründung",
      flex: 2,
      editable: (params) => params.data.chosen,
    },
  ];

  useEffect(() => {
    if (customerData && stakeholders.length > 0) {
      // check if customerData.stakeholderMeasureGradings is not empty
      const stakeholderMeasureGradings =
        customerData.stakeholderMeasureGradings || [];

      const rows = stakeholders.map(
        (stakeholder: { id: number; label: string }) => {
          // then check which id is in every stakeholderMeasureGradings object.
          // for each id, set the row with the stakeholderId that corresponds to the id to dataAvailable: true, the rest to false
          const isDataAvailable = stakeholderMeasureGradings.some(
            (stakeholderGrading: { stakeholder: number; gradings: any }) => {
              return (
                Number(stakeholderGrading.stakeholder) ===
                Number(stakeholder.id)
              );
            }
          );

          const chosenStakeholder = customerData.chosenStakeholders?.find(
            (chosenStakeholder: { id: number }) =>
              Number(chosenStakeholder.id) === Number(stakeholder.id)
          );

          return {
            stakeholderId: stakeholder.id,
            stakeholderName: stakeholder.label,
            dataAvailable: !!isDataAvailable,
            chosen: Number(chosenStakeholder?.id) === Number(stakeholder.id),
            weight: chosenStakeholder?.weight ?? null,
            justification: chosenStakeholder?.justification ?? null,
          };
        }
      );
      setRows(rows);
    }
  }, [customerData, stakeholders]);

  const updateCustomerTableData = async (updatedRow: StakeholderSelectionRow) => {
    const updatedStakeholder = {
      id: updatedRow.stakeholderId,
      weight: updatedRow.weight ?? 1,
      justification: updatedRow.justification,
    };

    try {
      if (!customerData || !updateCustomerData) return;

      if (!updatedRow.chosen) {
        // remove stakeholder from chosenstakeholders
        customerData.chosenStakeholders =
          customerData.chosenStakeholders.filter(
            (stakeholder) =>
              Number(stakeholder.id) !== Number(updatedRow.stakeholderId)
          );
      } else {
        // check if updatedRow.stakeholderId is already in customerData.chosenStakeholders
        // if so update the chosenStakeholders object that corresponds to the id with the following data:
        // chosen, weight, justification
        // if the updatedRow.stakeholderId is not in customerData.chosenStakeholders, add it
        const existingStakeholderIndex =
          customerData.chosenStakeholders.findIndex(
            (stakeholder) =>
              Number(stakeholder.id) === Number(updatedRow.stakeholderId)
          );

        if (existingStakeholderIndex !== -1) {
          customerData.chosenStakeholders[existingStakeholderIndex] =
            updatedStakeholder;
        } else {
          customerData.chosenStakeholders.push(updatedStakeholder);
        }
      }
      updateCustomerData({ ...customerData });
    } catch (error) {
      console.error("Error updating stakeholder:", error);
    }
  };

  const onCellValueChanged = (e: any) => {
    const updatedStakeholder = e.data as StakeholderSelectionRow;
    updateCustomerTableData(updatedStakeholder);
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

export default StakeholderSelection;
