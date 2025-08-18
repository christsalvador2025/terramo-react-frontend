// EsgCheck (Client Admin)
// Uses client-admin dashboard query (no clientId) and YearContext for display

import {
  Container,
  Typography,
  Box,
  Button,
  Tab,
  Tabs,
  Select,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
} from "@mui/material";
import { ColDef } from "ag-grid-community";
import { useState, useEffect, useMemo } from "react";
import Plot from "react-plotly.js";
import Table from "../../components/table/table";
import Spinner from "../../utils/spinner";
import { useGetClientAdminDashboardQuery } from "../../lib/redux/features/clients/clientupdatedApiSlice";
import { useYear } from "../../components/year/YearContext";

/* ----------------------------- Tab Panel ----------------------------- */
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

/* ------------------------------ Types ------------------------------- */
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
interface CommentDialogData {
  question_id: string;
  index_code: string;
  comment: string;
}

/* --------------------------- Helpers/Maps --------------------------- */
const PRIORITY_MAP = new Map<number, string>([
  [0, "nicht gestartet"],
  [1, "wenig Priorität"],
  [2, "mittlere Priorität"],
  [3, "hohe Priorität"],
  [4, "sehr hohe Priorität"],
]);
const STATUS_MAP = new Map<number, string>([
  [0, "nicht gestartet"],
  [1, "schlecht"],
  [2, "ausreichend"],
  [3, "gut"],
  [4, "ausgezeichnet"],
]);

const displayOrSelect = (map: Map<number, string>, v?: number | null) =>
  (v === 0 || v) ? `${v} - ${map.get(v as number)}` : "Bitte auswählen";

// E-1, E-2, … S-1 … G-1 …
const sortIndexCode = (a: string, b: string) => {
  const pa = a.split("-");
  const pb = b.split("-");
  if (pa[0] !== pb[0]) {
    return ["E", "S", "G"].indexOf(pa[0]) - ["E", "S", "G"].indexOf(pb[0]);
  }
  return Number(pa[1]) - Number(pb[1]);
};

const categoryMap = {
  Environment: "Umwelt",
  Social: "Gesellschaft",
  "Corporate Governance": "Unternehmensführung",
} as const;

/* ----------------------------- Component ---------------------------- */
const EsgCheck = () => {
  const { year } = useYear(); // For display (API currently doesn't take year param)
  const [activeTab, setActiveTab] = useState(0);
  const [summaryTab, setSummaryTab] = useState(0);
  const [commentDialog, setCommentDialog] = useState<CommentDialogData | null>(null);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  // Client Admin data (no id)
  const { data: dashboardData, isLoading, error } = useGetClientAdminDashboardQuery();

  const categories = useMemo(() => {
    if (!dashboardData?.question_response) return [];
    const categoryNames = Object.keys(dashboardData.question_response);
    const desiredOrder = ["Environment", "Social", "Corporate Governance"];
    return desiredOrder.filter((c) => categoryNames.includes(c));
  }, [dashboardData]);

  /* -------------------- Initialize responses on load ------------------- */
  useEffect(() => {
    if (dashboardData?.question_response) {
      const initial: Record<string, any> = {};
      Object.values(dashboardData.question_response).forEach((category: any) => {
        category.questions.forEach((q: any) => {
          initial[q.question_id] = {
            priority: q.priority,
            status_quo: q.status_quo,
            comment: q.comment,
            response_id: q.response_id,
          };
        });
      });
      setResponses(initial);
    }
  }, [dashboardData]);

  const handleResponseChange = (questionId: string, field: string, value: any) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [field]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleCommentSave = (comment: string) => {
    if (commentDialog) {
      handleResponseChange(commentDialog.question_id, "comment", comment);
      setCommentDialog(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updateData = Object.entries(responses).map(([questionId, data]) => ({
        question_id: questionId,
        priority: data.priority,
        status_quo: data.status_quo,
        comment: data.comment,
      }));
      // TODO: call your bulk update API here
      console.log("Saving responses:", updateData);
      await new Promise((r) => setTimeout(r, 800));
      setHasChanges(false);
    } catch (e) {
      console.error("Error saving responses:", e);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="xl" />
      </div>
    );
  }
  if (error) return <Typography color="error">Error loading ESG data</Typography>;
  if (!dashboardData) return <Typography color="error">No data available</Typography>;

  /* -------------------------- Data for tables -------------------------- */
  const getCurrentCategoryData = (): TableRowData[] => {
    if (activeTab === 3) return [];
    const categoryName = categories[activeTab] as keyof typeof categoryMap;
    const categoryData = (dashboardData as any).question_response[categoryName];
    if (!categoryData) return [];
    return categoryData.questions
      .slice()
      .sort((a: any, b: any) => sortIndexCode(a.index_code, b.index_code))
      .map((q: any) => ({
        question_id: q.question_id,
        index_code: q.index_code,
        measure: q.measure,
        priority: responses[q.question_id]?.priority ?? q.priority,
        status_quo: responses[q.question_id]?.status_quo ?? q.status_quo,
        comment: responses[q.question_id]?.comment ?? q.comment,
        priority_display: q.priority_display,
        status_quo_display: q.status_quo_display,
        is_answered: q.is_answered,
        response_id: q.response_id,
      }));
  };

  /* ------------------------ Editable column defs ------------------------ */
  const colDefs: ColDef[] = [
    { field: "index_code", headerName: "Index", flex: 1 },
    { field: "measure", headerName: "Maßnahme", flex: 4 },
    {
      field: "priority",
      headerName: "Priorität",
      flex: 2,
      cellRenderer: (params: any) => (
        <Select
          value={(params.value === 0 || params.value) ? params.value : ""}
          size="small"
          fullWidth
          displayEmpty
          renderValue={(v) => (v === "" ? "Bitte auswählen" : displayOrSelect(PRIORITY_MAP, Number(v)))}
          onChange={(e) =>
            handleResponseChange(
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
          value={(params.value === 0 || params.value) ? params.value : ""}
          size="small"
          fullWidth
          displayEmpty
          renderValue={(v) => (v === "" ? "Bitte auswählen" : displayOrSelect(STATUS_MAP, Number(v)))}
          onChange={(e) =>
            handleResponseChange(
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
            setCommentDialog({
              question_id: params.data.question_id,
              index_code: params.data.index_code,
              comment: params.value || "",
            })
          }
          sx={{ textTransform: "none" }}
        >
          {params.value ? "Kommentare anzeigen" : "Hinzufügen"}
        </Button>
      ),
    },
  ];

  /* ----------------------- Per-category chart data ----------------------- */
  const createCategoryChartData = (categoryName: string) => {
    if (!dashboardData.categories) return [];
    const cat = (dashboardData as any).categories[categoryName];
    if (!cat) return [];

    const ordered = [...cat.questions].sort((a: any, b: any) =>
      sortIndexCode(a.index_code, b.index_code)
    );
    const yLabels = ordered.map((d: any) => d.index_code);

    return [
      {
        type: "bar",
        x: ordered.map((d: any) => -Number(d.avg_priority || 0)),
        y: yLabels,
        orientation: "h",
        name: "Priorität",
        marker: { color: "#026770" },
        hovertemplate: "<b>%{y}</b><br>Priorität: %{x:.1f}<extra></extra>",
      },
      {
        type: "bar",
        x: ordered.map((d: any) => Number(d.avg_status_quo || 0)),
        y: yLabels,
        orientation: "h",
        name: "Status Quo",
        marker: { color: "#7DB6B7" },
        hovertemplate: "<b>%{y}</b><br>Status Quo: %{x:.1f}<extra></extra>",
      },
    ];
  };

  return (
    <Container>
      {/* Header */}
      <Typography variant="h4" gutterBottom>
        ESG-Check – {year}
      </Typography>
      {!!dashboardData.client?.name && (
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {dashboardData.client.name}
        </Typography>
      )}
      <Typography variant="body1" gutterBottom sx={{ mt: 1 }}>
        Um Nachhaltigkeit zu erzielen, werden verschiedene Maßnahmen eingesetzt. Abhängig vom
        Unternehmen sind manche wichtiger, manche weniger. Wie schätzen Sie die Prioritäten der
        jeweiligen Maßnahmen aus Sicht Ihres Unternehmens ein? Schätzen Sie auch ein, wie weit diese
        Maßnahmen fortgeschritten sind.
      </Typography>

      {/* Notice */}
      <Alert severity="info" sx={{ mb: 2 }}>
        Beachten Sie: Der ESG-Check kann pro Jahr nur einmal ausgefüllt werden.
      </Alert>

      {/* Save Button */}
      {hasChanges && (
        <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} /> : null}
          >
            {saving ? "Speichern..." : "Speichern"}
          </Button>
        </Box>
      )}

      {/* Main Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
          <Tab label="1 Umwelt" />
          <Tab label="2 Gesellschaft" />
          <Tab label="3 Unternehmensführung" />
          <Tab label="4 Zusammenfassung" />
        </Tabs>
      </Box>

      {/* Environment Tab */}
      <TabPanel value={activeTab} index={0}>
        <Typography variant="h6" gutterBottom>
          Mögliche Massnahmen im Bereich Umwelt
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Alle Felder sind Pflichtfelder
        </Typography>
        <Table rowData={getCurrentCategoryData()} colDefs={colDefs} />
      </TabPanel>

      {/* Social Tab */}
      <TabPanel value={activeTab} index={1}>
        <Typography variant="h6" gutterBottom>
          Mögliche Massnahmen im Bereich Gesellschaft
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Alle Felder sind Pflichtfelder
        </Typography>
        <Table rowData={getCurrentCategoryData()} colDefs={colDefs} />
      </TabPanel>

      {/* Corporate Governance Tab */}
      <TabPanel value={activeTab} index={2}>
        <Typography variant="h6" gutterBottom>
          Mögliche Massnahmen im Bereich Unternehmensführung
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Alle Felder sind Pflichtfelder
        </Typography>
        <Table rowData={getCurrentCategoryData()} colDefs={colDefs} />
      </TabPanel>

      {/* Summary Tab */}
      <TabPanel value={activeTab} index={3}>
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
          <Tabs value={summaryTab} onChange={(_, v) => setSummaryTab(v)}>
            <Tab label="Tabelle" />
            <Tab label="Chart" />
          </Tabs>
        </Box>

        {/* Summary tables per category */}
        {summaryTab === 0 && (
          <>
            {categories.map((categoryName) => (
              <Box key={categoryName} sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Mögliche Massnahmen im Bereich {categoryMap[categoryName as keyof typeof categoryMap]}
                </Typography>
                <Table
                  rowData={
                    (dashboardData as any).question_response[categoryName]?.questions
                      .slice()
                      .sort((a: any, b: any) => sortIndexCode(a.index_code, b.index_code))
                      .map((q: any) => {
                        const p = responses[q.question_id]?.priority ?? q.priority;
                        const s = responses[q.question_id]?.status_quo ?? q.status_quo;
                        return {
                          question_id: q.question_id,
                          index_code: q.index_code,
                          measure: q.measure,
                          priority: p,
                          status_quo: s,
                          comment: responses[q.question_id]?.comment ?? q.comment,
                          priority_display: displayOrSelect(PRIORITY_MAP, p),
                          status_quo_display: displayOrSelect(STATUS_MAP, s),
                          is_answered: q.is_answered,
                          response_id: q.response_id,
                        } as TableRowData;
                      }) || []
                  }
                  colDefs={[
                    { field: "index_code", headerName: "Index", flex: 1 },
                    { field: "measure", headerName: "Maßnahme", flex: 4 },
                    { field: "priority_display", headerName: "Priorität", flex: 2 },
                    { field: "status_quo_display", headerName: "Status Quo", flex: 2 },
                    {
                      field: "comment",
                      headerName: "Kommentar",
                      flex: 2,
                      cellRenderer: (params: any) => params.value || "kein Kommentar",
                    },
                  ]}
                />
              </Box>
            ))}
          </>
        )}

        {/* Summary charts per category */}
        {summaryTab === 1 && (
          <>
            {categories.map((categoryName) => (
              <Box key={categoryName} sx={{ mt: 1, mb: 5 }}>
                <Typography variant="h6" gutterBottom>
                  Mögliche Massnahmen im Bereich {categoryMap[categoryName as keyof typeof categoryMap]}
                </Typography>
                <Plot
                  data={createCategoryChartData(categoryName) as any}
                  layout={{
                    barmode: "relative",
                    height: 420,
                    bargap: 0.2,
                    margin: { l: 80, r: 30, t: 10, b: 40 },
                    xaxis: {
                      range: [-4, 4],
                      zeroline: true,
                      zerolinewidth: 2,
                      zerolinecolor: "#cccccc",
                      tickvals: [-3, -2, -1, 0, 1, 2, 3, 4],
                    },
                    yaxis: { autorange: "reversed" },
                    showlegend: true,
                  }}
                  config={{ displayModeBar: false }}
                />
              </Box>
            ))}
          </>
        )}
      </TabPanel>

      {/* Comment Dialog */}
      <Dialog open={!!commentDialog} onClose={() => setCommentDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Kommentar für {commentDialog?.index_code}</DialogTitle>
        <DialogContent>
          <TextField
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            value={commentDialog?.comment || ""}
            onChange={(e) => setCommentDialog((prev) => (prev ? { ...prev, comment: e.target.value } : null))}
            placeholder="Fügen Sie hier Ihren Kommentar hinzu..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommentDialog(null)}>Abbrechen</Button>
          <Button onClick={() => handleCommentSave(commentDialog?.comment || "")} variant="contained">
            Speichern
          </Button>
        </DialogActions>
      </Dialog>

      {/* Navigation Buttons */}
      <Box sx={{ mt: 4, display: "flex", justifyContent: "space-between" }}>
        <Button variant="outlined" disabled={activeTab === 0} onClick={() => setActiveTab(activeTab - 1)}>
          Zurück
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            /* TODO: implement interim save */
          }}
        >
          Zwischenspeichern
        </Button>
        <Button variant="contained" disabled={activeTab === 3} onClick={() => setActiveTab(activeTab + 1)}>
          Weiter
        </Button>
        {activeTab === 3 && (
          <Button variant="contained" color="success" onClick={handleSave} disabled={saving}>
            Abschließen
          </Button>
        )}
      </Box>
    </Container>
  );
};

export default EsgCheck;
