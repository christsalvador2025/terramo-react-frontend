import React from 'react';
import { ColDef } from "ag-grid-community";
import { Select, MenuItem, Button } from "@mui/material";
import Table from "../../../table/table";
import { PRIORITY_MAP, STATUS_MAP, displayOrSelect } from '../../../../hooks/client-admin/useEsg';

interface TableRowData {
  question_id: string;
  index_code: string;
  measure: string;
  priority: number | null;
  status_quo: number | null;
  comment: string | null;
  priority_display: string | null;
  status_quo_display: string | null;
  is_answered: boolean;
  response_id: string | null;
}

interface EsgTableProps {
  data: TableRowData[];
  onResponseChange: (questionId: string, field: string, value: any) => void;
  onCommentClick: (questionId: string, indexCode: string, comment: string) => void;
  editable?: boolean;
}

const EsgTable: React.FC<EsgTableProps> = ({
  data,
  onResponseChange,
  onCommentClick,
  editable = true,
}) => {
  const getColDefs = (): ColDef[] => {
    const baseColDefs: ColDef[] = [
      { field: "index_code", headerName: "Index", flex: 1 },
      { field: "measure", headerName: "Maßnahme", flex: 4 },
    ];

    if (editable) {
      return [
        ...baseColDefs,
        {
          field: "priority",
          headerName: "Priorität",
          flex: 2,
          cellRenderer: (params: any) => (
            <Select
              value={params.value === 0 || params.value ? params.value : ""}
              size="small"
              fullWidth
              displayEmpty
              renderValue={(v) => (v === "" ? "Bitte auswählen" : displayOrSelect(PRIORITY_MAP, Number(v)))}
              onChange={(e) =>
                onResponseChange(
                  params.data.question_id,
                  "priority",
                  e.target.value === "" ? null : e.target.value
                )
              }
            >
              <MenuItem value="">
                <em>Bitte auswählen</em>
              </MenuItem>
              {[0, 1, 2, 3, 4].map((v) => (
                <MenuItem key={v} value={v}>
                  {v} - {PRIORITY_MAP.get(v)}
                </MenuItem>
              ))}
            </Select>
          ),
        },
        {
          field: "status_quo",
          headerName: "Status Quo",
          flex: 2,
          cellRenderer: (params: any) => (
            <Select
              value={params.value === 0 || params.value ? params.value : ""}
              size="small"
              fullWidth
              displayEmpty
              renderValue={(v) => (v === "" ? "Bitte auswählen" : displayOrSelect(STATUS_MAP, Number(v)))}
              onChange={(e) =>
                onResponseChange(
                  params.data.question_id,
                  "status_quo",
                  e.target.value === "" ? null : e.target.value
                )
              }
            >
              <MenuItem value="">
                <em>Bitte auswählen</em>
              </MenuItem>
              {[0, 1, 2, 3, 4].map((v) => (
                <MenuItem key={v} value={v}>
                  {v} - {STATUS_MAP.get(v)}
                </MenuItem>
              ))}
            </Select>
          ),
        },
        {
          field: "comment",
          headerName: "Kommentar (optional)",
          flex: 2,
          cellRenderer: (params: any) => (
            <Button
              size="small"
              onClick={() =>
                onCommentClick(
                  params.data.question_id,
                  params.data.index_code,
                  params.value || ""
                )
              }
              sx={{ textTransform: "none" }}
            >
              {params.value ? "Kommentare anzeigen" : "Hinzufügen"}
            </Button>
          ),
        },
      ];
    } else {
      return [
        ...baseColDefs,
        { field: "priority_display", headerName: "Priorität", flex: 2 },
        { field: "status_quo_display", headerName: "Status Quo", flex: 2 },
        {
          field: "comment",
          headerName: "Kommentar",
          flex: 2,
          cellRenderer: (params: any) => params.value || "kein Kommentar",
        },
      ];
    }
  };

  return <Table rowData={data} colDefs={getColDefs()} />;
};

export default EsgTable;